from flask import jsonify

class err:
    ROUTE_ONLY_ACCEPTS_JSON = ('Route only accepts json parameters', 400)
    FILE_ID_NOT_VALID = ('File id is not valid', 400)

def errify(errmsg):
    return jsonify({
        'err': errmsg[0]
    }), errmsg[1]
