from flask import Blueprint, jsonify, Flask
from flask import request, redirect, url_for, render_template
from flask import safe_join, send_file

from collections import defaultdict
from werkzeug.utils import secure_filename
import subprocess
import tempfile
import os
from uuid import uuid4
import yaml
import json
from errors import err

import boto3
import pickle

import smtplib  
import email.utils
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from bson.objectid import ObjectId

from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo

# you can use db.analyses to access the analyses objects
# and db.users to access the users
import db 

# Insert analysis and get unique id:
#
# analysis = db.analyses.insert_one({})
# path_id = str(analysis.inserted_id)

user = Blueprint('user', __name__, url_prefix='/user')

access_key = "AKIAUX7NV5IPOEUTHQ7Z"
secret_access_key = "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"
upload_file_bucket = 'csce315project3files'
client = boto3.client('s3', aws_access_key_id = access_key, aws_secret_access_key = secret_access_key)

@user.route('/ping', methods=['GET'])
def ping_pong():
    
    return 'pong'

UPLOAD_FOLDER = '/tmp'
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config["FILE_EXTENSION"] = ["CPP", "H", "CC", "HPP"]

def allowed_file(filename):
    if not "." in filename:
        return False

    exts = filename.rsplit(".", 1)[1]

    if exts.upper() in app.config["FILE_EXTENSION"]:
        return True
    else:
        return False

from typing import Dict
from collections import namedtuple

Offset = namedtuple('Offset', ['id', 'offset'])
LineChar = namedtuple('LineChar', ['line', 'char'])
LineIndicator = namedtuple('LineIndicator', ['line_char', 'eof'])
LineCharLookup = Dict[str, LineChar]

def add_diagnostic_location(diagnostics : Dict, tmp_dir : str):
    '''
        Turns a "FileOffset" in the form (num) into a line and character "LineChar" tuple (line, char). This
        information will be used by the front-end to position the suggestions within the file. The method is
        called with tmp_dir because it reads the files line by line to determine the line and character position.
        It stores the line and character information in the dict "diagnostics" passed to the function. Roughly:
        {
            "file_id": {
                "Diagnostics": [
                {
                    ...
                    "DiagnosticMessage": {
                        "FileOffset": Z,
                        ...
                        "Location": [X, Y],
                        "EOF": true | false
                    }
                }
            ],
            ...
        }
    '''
    lookup : LineCharLookup = {}

    for file, suggestions in diagnostics.items():
        offsets = [Offset(diagnostic['DiagnosticId'], diagnostic['DiagnosticMessage']['FileOffset']) \
                    for diagnostic in suggestions['Diagnostics']]

        file_path = os.path.join(tmp_dir, suggestions['name'])
        
        offset = 0
        i = 0
        lnum = 1
        with open(file_path) as f:
            for line in f:
                while i < len(offsets) and len(line) + offset > offsets[i].offset:
                    lookup[offsets[i].id] = LineIndicator(LineChar(lnum, offsets[i].offset - offset), False)
                    i += 1
                
                offset += len(line)
                lnum += 1

            # Some suggestions can by located at the EOF symbol
            for j in range(i, len(offsets)):
                lookup[offsets[j].id] = LineIndicator(LineChar(lnum, 0), True)

    for file in diagnostics:
        for diagnostic in diagnostics[file]['Diagnostics']:
            line_indicator = lookup[diagnostic['DiagnosticId']]
            diagnostic['DiagnosticMessage']['Location'] = line_indicator.line_char
            diagnostic['DiagnosticMessage']['EOF'] = line_indicator.eof


def notify(user_email):
    print("notify called.")
    SENDER = "noreply@zyxcv.com"
    SENDERNAME = "AutoCheck! Team"

    RECIPIENT = user_email
    USERNAME_SMTP = "AKIAUX7NV5IPB3ZNQEWN"
    PASSWORD_SMTP = "BMA24YUM6IznIq1YOcTTQiu3ZGkGHAAqn224R7dDyl9A"

    HOST = "email-smtp.us-east-2.amazonaws.com"
    PORT = 587

    SUBJECT = "Code Analysis Confirmation"

    BODY_TEXT = ("Dear User, You have successfuly submitted code to be analyzed. Thank you for using AutoCheck!")

    BODY_HTML = """<html>
    <head></head>
    <body>
    <h1>Code Analysis Confirmation</h1>
    <p>Dear User, You have successfuly submitted code to be analyzed. Thank you for using AutoCheck!</p>
    </body>
    </html>
    """
    msg = MIMEMultipart('alternative')
    msg['Subject'] = SUBJECT
    msg['From'] = email.utils.formataddr((SENDERNAME, SENDER))
    msg['To'] = RECIPIENT

    # Record the MIME types of both parts - text/plain and text/html.
    part1 = MIMEText(BODY_TEXT, 'plain')
    part2 = MIMEText(BODY_HTML, 'html')

    # Attach parts into message container.
    # According to RFC 2046, the last part of a multipart message, in this case
    # the HTML message, is best and preferred.
    msg.attach(part1)
    msg.attach(part2)

    # Try to send the message.
    try:  
        server = smtplib.SMTP(HOST, PORT)
        server.ehlo()
        server.starttls()
        #stmplib docs recommend calling ehlo() before & after starttls()
        server.ehlo()
        server.login(USERNAME_SMTP, PASSWORD_SMTP)
        server.sendmail(SENDER, RECIPIENT, msg.as_string())
        server.close()
    # Display an error message if something goes wrong.
    except Exception as e:
        print ("Email did not send: ", e)
    else:
        print ("Email sent!")

@user.route('/upload', methods=['POST']) 
def upload_file():

    print("upload file called.")
    uploaded_files = request.files.getlist("files")
    suggestions = ""
    file_paths = []
    names_dict = {}
    analysis = db.analyses.insert_one({})
    path_id = str(analysis.inserted_id)

    for file in uploaded_files:
        if not allowed_file(file.filename):
            return {"err" : "One or more of the files are not in the following format: .cpp, .h, .cc, .hpp."}, 400

    with tempfile.TemporaryDirectory() as tmp_dir:
        temp_files_paths = []
        for file in uploaded_files:
            temp_files_paths.append(os.path.join(tmp_dir, file.filename))

            temp_path = os.path.join(tmp_dir, file.filename)
            file.save(temp_path)

            uuid_name = str(uuid4())
            names_dict[file.filename] = uuid_name
            
            upload_file_key = path_id + '/' + uuid_name
            client.upload_file(str(temp_path), upload_file_bucket, upload_file_key)

        with tempfile.NamedTemporaryFile('w+') as file:
            CMD = [
                'clang-tidy',
                f'--export-fixes={file.name}', 
                '-checks=-*,bugprone-*,cppcoreguidelines-*,clang-analyzer*,readability-*',
                '--header-filter=./',
                '--extra-arg=-stdlib=libstdc++', 
                *temp_files_paths,
            ]

            subprocess.run(CMD, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            suggestions = file.read()


        currSuggest = yaml.load(suggestions, Loader=yaml.FullLoader)

        ret_dict = defaultdict(list)
        for key, val in names_dict.items():
            ret_dict[val] = {"Diagnostics" : []}
            ret_dict[val]["name"] = key
        errors = currSuggest["Diagnostics"]
        
        for current_error in errors:
            error_message = current_error["DiagnosticMessage"]
            level = current_error["Level"]
            file_path = current_error["DiagnosticMessage"]["FilePath"]
            file_name = file_path.split('/')[-1]
            # Used to create a (id, offset) -> (id, (line, char)) mapping
            # see add_diagnostic_location
            if file_name in names_dict:
                current_error["DiagnosticId"] = str(uuid4())
                ret_dict[names_dict[file_name]]["Diagnostics"].append(current_error)

        add_diagnostic_location(ret_dict, tmp_dir)

    json_dict = json.dumps(ret_dict, indent = 4)

    analysis_id = str(uuid4())
    upload_file_key = path_id + '/response.json'
    client.put_object(Bucket = upload_file_bucket, Key = upload_file_key, Body = json_dict)

    session_id = request.cookies.get('session')

    user = db.users.find_one({"_id" : ObjectId(session_id)})
    db.users.update({"_id" : ObjectId(session_id)}, {'$push' : {'analyses' : path_id}}, upsert = True)

    if not user:
        return err.INVALID_USER.responsify()
    
    email = user['email']

    notify(email)

    return jsonify({
        'analysis_id': path_id
    })

# returns file contents given file id
@user.route('/analysis/<analysis_id>/get_file', methods=['GET'])
def get_file(analysis_id):

    file_id = request.args.get('file_id')

    response = ""

    with tempfile.TemporaryDirectory() as tmp_dir:
        client.download_file(upload_file_bucket, analysis_id + '/' + file_id, tmp_dir + '/' + file_id)
        with open(tmp_dir + '/' + file_id) as file:
            response = file.read()

    return response

# Returns the response json of each analysis request
@user.route('/analysis/<analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    response = {}

    with tempfile.TemporaryDirectory() as tmp_dir:
        client.download_file(upload_file_bucket, analysis_id + '/response.json', tmp_dir + '/response.json')
        with open(tmp_dir + '/response.json') as file:
            response = json.load(file)
    
    return jsonify(response)

# Returns the list of analyses by user_id
@user.route('/get_analyses', methods=['GET'])
def get_analyses():

    session_id = request.cookies.get('session')
    user = db.users.find_one({"_id" : ObjectId(session_id)})

    analyses = user['analyses']

    reversed_analyses = analyses[::-1]

    analysis_dict = {}

    central = timezone(timedelta(hours=-6))

    for analysis in reversed_analyses:
        time = ObjectId(analysis).generation_time
        published_cst = time.astimezone(central)
        actual_time_published = published_cst.strftime('%a, %b %d %Y at %I:%M:%S')
        analysis_dict[analysis] = actual_time_published


    # this is a list of analysis ids as string, it has been reversed so that the latest submission is in the front
    return jsonify(analysis_dict)