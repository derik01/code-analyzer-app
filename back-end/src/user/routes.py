from flask import Blueprint, jsonify, Flask
from flask import request, redirect, url_for, render_template
from flask import safe_join, send_file

from werkzeug.utils import secure_filename
import subprocess
import tempfile
import os
from uuid import uuid4
import yaml
import json
from errors import err

user = Blueprint('user', __name__, url_prefix='/user')

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
    file_names = []
    suggestions = ""
    file_paths = []
    
    for file in uploaded_files:
        if not allowed_file(file.filename):
            return {"err" : "One or more of the files are not in the following format: .cpp, .h, .cc, .hpp."}, 400


    with tempfile.TemporaryDirectory() as tmp_dir:
        temp_files_paths = []
        for file in uploaded_files:
            temp_files_paths.append(os.path.join(tmp_dir, file.filename))

            temp_path = os.path.join(tmp_dir, file.filename)
            file.save(temp_path)

            file_names.append(file.filename)
            path = os.path.join(app.config['UPLOAD_FOLDER'], str(uuid4()))
            file.save(path)
            file_paths.append(path)

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

        for path in file_paths:
            os.remove(path)

    ret_dict = {}

    currSuggest = yaml.load(suggestions, Loader=yaml.FullLoader)
    ret_dict["suggestions"] = currSuggest

    # file_dict = ret_dict[]
    return ret_dict

import time

@user.route('/analysis', methods=['POST'])
def upload_analysis():
    # example analysis id
    
    time.sleep(10)

    return jsonify({
        'analysis_id': '0d4496673e920190753a3bfe9853c075'
    })

@user.route('/analysis/<analysis_id>/get_file', methods=['GET'])
def get_file(analysis_id):

    file_id = request.args.get('file_id')

    id_to_source = {
        'd0c395eed8e3fde15b7fe25b4f7d5d89': 'DLList-main.cpp',
        'c67479d36c64fe7c3b6e65d886797bcd': 'DLList.cpp',
        '36f147a9966bab842c1174f4ff3ad497': 'DLList.h',
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
