from flask import Flask, render_template, request, redirect

auth = Flask('auth', __name__, url_prefix='/auth')

auth.config["FILE_UPLOAD_PATH"] = "/mnt/c/CSCE315/Project3/code-analyzer-app/files"

@auth.route('/uploadFile', methods=['POST'])
def upload_file():

    if request.method == "POST":
        if request.files:
            file = request.files["file"]

            file.save(os.path.join(auth.config["FILE_UPLOAD_PATH"]))

