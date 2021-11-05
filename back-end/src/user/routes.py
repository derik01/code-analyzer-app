from flask import Blueprint, jsonify
import subprocess
import tempfile

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
