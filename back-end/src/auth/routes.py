from flask import Blueprint, Flask
from flask_bcrypt import Bcrypt

auth = Blueprint('auth', __name__, url_prefix='/auth')

@auth.route('/ping', methods=['GET'])
def ping_pong():
    return 'pong'

app = Flask(__name__)
bcrypt = Bcrypt(app)

@app.route('/register', methods=['GET'])
def register(name, lastName, username, password):
    hash_pass = bcrypt.generate_password_hash(password)
    