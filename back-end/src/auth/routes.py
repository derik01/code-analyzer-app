from flask import Blueprint, request, jsonify
from errors import err

auth = Blueprint('auth', __name__, url_prefix='/auth')

@auth.route('/ping', methods=['GET'])
def ping_pong():
    return 'pong'

def is_test_user(username, password):
    return username == "test" and password == "password"

@auth.route('/login', methods=['POST'])
def login():
    params = request.get_json()

    if(is_test_user(params['username'], params['password'])):
        return jsonify() # Success

    return  err.INVALID_CREDENTIALS.responsify()

@auth.route('/signup', methods=['POST'])
def signup():
    params = request.get_json()

    if(not is_test_user(params['username'], params['password'])):
        return jsonify() # Success

    return err.ACCOUNT_EXISTS.responsify()