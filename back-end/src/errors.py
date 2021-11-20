from flask import jsonify

# https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
BAD_REQUEST = 400
UNAUTHORIZED = 401

class ServerErr:

    def __init__(self, code : str, msg : str, status : int):

        self.code = code
        self.msg = msg
        self.status = status
    
    def responsify(self):
        return  jsonify({
            'code': self.code,
            'msg': self.msg,
        }), self.status

class err:

    ROUTE_ONLY_ACCEPTS_JSON = ServerErr(
        'ONLY_ACCEPTS_JSON',
        'Route only accepts json parameters',
        BAD_REQUEST
    )

    FILE_ID_NOT_VALID = ServerErr(
        'INVALID_FILE_ID',
        'File id is not valid', 
        BAD_REQUEST
    )
    
    INVALID_CREDENTIALS = ServerErr(
        'INVALID_CREDENTIALS',
        'Your username or passowrd is incorrect',
        UNAUTHORIZED
    )

    ACCOUNT_EXISTS = ServerErr(
        'ACCOUNT_EXISTS',
        'An account exists with this email',
        BAD_REQUEST
    )