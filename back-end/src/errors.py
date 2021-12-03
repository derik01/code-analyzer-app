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

    PARAMETER_MISSING = ServerErr(
        'MISSING_PARAM',
        'A parameter is missing',
        BAD_REQUEST
    )

    INVALID_EMAIL = ServerErr(
        'INVALID_EMAIL',
        'The email provided is invalid',
        BAD_REQUEST
    )

    INVALID_USER = ServerErr(
        'INVALID_USER',
        'We don\'t reconize this username',
        BAD_REQUEST
    )

    BAD_PASSWORD = ServerErr(
        'BAD_PASSWORD',
        'Password should be at least 8 characters',
        BAD_REQUEST
    )