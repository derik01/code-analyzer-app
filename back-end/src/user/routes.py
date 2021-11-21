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

user = Blueprint('user', __name__, url_prefix='/user')

access_key = "AKIAUX7NV5IPOEUTHQ7Z"
secret_access_key = "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"

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


@user.route('/upload', methods=['POST']) 
def upload_file():

    uploaded_files = request.files.getlist("files")
    suggestions = ""
    file_paths = []
    names_dict = {}
    
    client = boto3.client('s3', aws_access_key_id = access_key, aws_secret_access_key = secret_access_key)
    upload_file_bucket = 'csce315project3files'

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
            
            upload_file_key = 'files/' + uuid_name
            client.upload_file(str(temp_path), upload_file_bucket, upload_file_key)

        with tempfile.NamedTemporaryFile('w+') as file:
            CMD = [
                'clang-tidy',
                f'--export-fixes={file.name}', 
                '-checks=-*,bugprone-*,cppcoreguidelines-*',
                '--header-filter=./', 
                *temp_files_paths,
                '--extra-arg=-stdlib=libstdc++',
            ]

            subprocess.run(CMD)

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
        ret_dict[names_dict[file_name]]["Diagnostics"].append(current_error)

    json_dict = json.dumps(ret_dict, indent = 4)

    analysis_id = str(uuid4())
    upload_file_key = 'files/' + analysis_id
    client.put_object(Bucket = upload_file_bucket, Key = upload_file_key, Body = json_dict)

    return jsonify({
        'analysis_id': analysis_id
    })

@user.route('/analysis/<analysis_id>/get_file', methods=['GET'])
def get_file(analysis_id):

    file_id = request.args.get('file_id')

    print(file_id)

    id_to_source = {
        '0': 'hello.cpp',
        '1': 'hello.hpp',
    }

    if file_id not in id_to_source:
        return err.FILE_ID_NOT_VALID.responsify()
    
    path = safe_join('./user/sample_files', id_to_source[file_id])

    return send_file(path)

# Stream with context
@user.route('/analysis/<analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    response = {}
    
    with open('./src/user/sample_files/response.json') as file:
        response = json.load(file)
    
    return jsonify(response)
