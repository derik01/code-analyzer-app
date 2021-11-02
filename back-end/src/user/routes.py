from flask import Blueprint, jsonify

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