from flask import Blueprint, jsonify, Flask, request, redirect, url_for, render_template
from werkzeug.utils import secure_filename
import subprocess
import tempfile
import os
from uuid import uuid4
import yaml
import json

user = Blueprint('user', __name__, url_prefix='/user')


@user.route('/ping', methods=['GET'])
def ping_pong():
    return 'pong'


@user.route('/ping', methods=['POST'])
def ping_post():
    data = {
        'hello': 'world'
    }

    return jsonify(data)

# Create sample file for test analysis
with open('/tmp/test.cpp', 'w') as file:
	file.write("""
	int main() {
	  int i = 0, j = 0;
	  while (i < 10) {
		  ++j;
	  }
	}
	""")

@user.route('/tidy', methods=['GET'])
def tidy():

    with tempfile.NamedTemporaryFile('w+') as file:
        CMD = [
			'clang-tidy',
			'/tmp/test.cpp',
			# export to YAML file (the tmpfile above)
			f'--export-fixes={file.name}', 
			# disable all checks except for bugprone and cppcoreguidline
			# we might want to change this in the future
			# see: https://clang.llvm.org/extra/clang-tidy/checks/list.html
			'-checks=-*,bugprone-*,cppcoreguidelines-*' 
		]

        subprocess.run(CMD)

        suggestions = file.read()

        print('suggestions', suggestions)

        return suggestions


UPLOAD_FOLDER = '/tmp'
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@user.route('/upload', methods=['POST']) 
def upload_file():

    uploaded_files = request.files.getlist("file")
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

        currSuggest = yaml.load(file_suggestions[s])
        ret_dict[file_names[s]] = currSuggest

    return ret_dict
