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
from errors import errify, err

user = Blueprint('user', __name__, url_prefix='/user')

@user.route('/ping', methods=['GET'])
def ping_pong():
    return 'pong'

UPLOAD_FOLDER = '/tmp'
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@user.route('/upload', methods=['POST']) 
def upload_file():

    uploaded_files = request.files.getlist("files")
    file_suggestions = []
    file_names = []
    suggestions = ""

    for file in uploaded_files:
        file_names.append(file.filename)
        path = os.path.join(app.config['UPLOAD_FOLDER'], str(uuid4())) + '.cpp'
        file.save(path)

        with tempfile.NamedTemporaryFile('w+') as file:
            CMD = [
                'clang-tidy',
                path,
                f'--export-fixes={file.name}', 
                '-checks=-*,bugprone-*,cppcoreguidelines-*' 
            ]

            subprocess.run(CMD)

            suggestions = file.read()
            file_suggestions.append(suggestions)

        os.remove(path)

    ret_dict = {}
    for s in range(len(file_suggestions)):

        currSuggest = yaml.load(file_suggestions[s], Loader=yaml.FullLoader)
        ret_dict[file_names[s]] = currSuggest

    return ret_dict

@user.route('/test/<test2>', methods=['GET'])
def test(test2):
    f2 = request.args.get('t2')

    return f'{f2} {test2}'

from functools import reduce

@user.route('/analysis/<analysis_id>/get_file', methods=['GET'])
def get_file(analysis_id):

    file_id = request.args.get('file_id')

    print(file_id)

    id_to_source = {
        'd0c395eed8e3fde15b7fe25b4f7d5d89': 'DLList-main.cpp',
        'c67479d36c64fe7c3b6e65d886797bcd': 'DLList.cpp',
        '36f147a9966bab842c1174f4ff3ad497': 'DLList.h',
    }

    if file_id not in id_to_source:
        return errify(err.FILE_ID_NOT_VALID)
    
    path = safe_join('./user/sample_files', id_to_source[file_id])

    return send_file(path)

# Stream with context
@user.route('/analysis/<analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    response = {}
    
    with open('./src/user/sample_files/response.json') as file:
        response = json.load(file)
    
    return jsonify(response)
