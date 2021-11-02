from flask import Blueprint

auth = Blueprint('auth', __name__, url_prefix='/auth')

@auth.route('/ping', methods=['GET'])
def ping_pong():
    return 'pong'