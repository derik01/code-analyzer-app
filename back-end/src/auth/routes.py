import flask
from flask import Blueprint, Flask, request, jsonify
import pymongo
import re
from errors import err
from flask_bcrypt import Bcrypt
import db

auth = Blueprint('auth', __name__, url_prefix='/auth')

bcrypt = Bcrypt()

@auth.route('/')
def home():
    user_id = request.cookies.get("UserCookie")
    if user_id:
        userN = db.users.find_one({"userName": user_id})
        if userN:
            return jsonify()
        else:
            return err.NO_USER.responsify()

def user_exists(email, username):
    exists = db.users.find_one({"$or": [{"userName": username}, {"email": email}]})
    if exists:
        return True
    else:
        return False


def validate_user(username, password):
    matches = db.users.find_one({"email": username})
    if matches:
        if bcrypt.check_password_hash(matches["password"], password):
            return "True", str(matches['_id'])
        else:
            return "False", None
    else:
        return "No User", None


regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'


def check_email(email):
    if re.fullmatch(regex, email):
        return True
    else:
        return False


@auth.route('/register', methods=['POST'])
def register():
    json = request.get_json()

    if 'email' not in json or 'password' not in json:
        return err.PARAMETER_MISSING.responsify() 

    email, password = json['email'], json['password']
    analyses_list = []

    if not user_exists(email, password):
        if len(password) < 8:
            return err.BAD_PASSWORD.responsify()
        elif not check_email(email):
            return err.INVALID_EMAIL.responsify()
        else:
            hash_pass = bcrypt.generate_password_hash(password).decode('utf-8')
            userRecord = {
                "email": email,
                "password": hash_pass,
                "analyses": analyses_list
            }
            db.users.insert_one(userRecord)
            return jsonify()
    
    return err.ACCOUNT_EXISTS.responsify()

@auth.route('/login', methods=['POST'])
def login():
    json = request.get_json()
    
    if 'email' not in json or 'password' not in json:
        return err.PARAMETER_MISSING.responsify() 

    email, password = json['email'], json['password']

    validated, userid = validate_user(email, password)

    if validated == "True":
        res = flask.make_response(jsonify())
        res.set_cookie('session', userid)
        return res
    elif validated == "False":
        return err.INVALID_CREDENTIALS.responsify()

    return err.INVALID_USER.responsify()