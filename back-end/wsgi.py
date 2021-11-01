from flask import Flask

from user import user
from auth import auth

app = Flask(__name__)

app.register_blueprint(user, url_prefix='/user')
app.register_blueprint(auth, url_prefix='/auth')

if __name__ == '__main__':
        app.run(host="0.0.0.0", port=3001, debug=True)