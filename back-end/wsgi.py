from flask import Flask

from user import user
from auth import auth

app = Flask(__name__)

app.register_blueprint(user, url_prefix='/user')
app.register_blueprint(auth, url_prefix='/auth')