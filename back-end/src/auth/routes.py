import flask
from flask import Blueprint, Flask, request, jsonify
import pymongo
from flask_bcrypt import Bcrypt
import re
from errors import err


auth = Blueprint('auth', __name__, url_prefix='/auth')


@auth.route('/ping', methods=['GET'])
def ping_pong():
    return 'pong'


app = Flask(__name__)
client = pymongo.MongoClient("mongodb://127.0.0.1:27017/")
db = client.User
info = db.userInfo

bcrypt = Bcrypt(app)

@app.route('/')
def home():
    user_id = request.cookies.get("UserCookie")
    if user_id:
        userN = info.find_one({"userName": user_id})
        if userN:
            return jsonify()
        else:
            return err.NO_USER.responsify()

def user_exists(email, username):
    exists = info.find_one({"$or": [{"userName": username}, {"email": email}]})
    if exists:
        return True
    else:
        return False


def validate_user(username, password):
    matches = info.find_one({"userName": username})
    if matches:
        if bcrypt.check_password_hash(matches["password"], password):
            return "True"
        else:
            return "False"
    else:
        return "No User"


regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'


def check_email(email):
    if re.fullmatch(regex, email):
        return True
    else:
        return False


@app.route('/register', methods=['POST'])
def register(email, password):
    if not user_exists(email, password):
        if password.len() < 8:
            return err.BAD_PASSWORD.responsify()
        elif not check_email(email):
            return err.INVALID_EMAIL.responsify()
        else:
            hash_pass = bcrypt.generate_password_hash(password).decode('utf-8')
            userRecord = {
                "email": email,
                "password": hash_pass
            }
            info.insert_one(userRecord)
            return jsonify()
    else:
        return err.ACCOUNT_EXISTS.responsify()


@app.route('/login', methods=['POST'])
def login(username, password):
    if validate_user(username, password) == "True":
        response = flask.make_response()
        response.set_cookie("UserCookie", username)
        return jsonify()
    elif validate_user(username, password) == "False":
        return err.INVALID_CREDENTIALS.responsify()
    else:
        return err.NO_USER.responsify()
