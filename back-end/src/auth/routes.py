from flask import Blueprint, Flask
import pymongo
from flask_bcrypt import Bcrypt

auth = Blueprint('auth', __name__, url_prefix='/auth')


@auth.route('/ping', methods=['GET'])
def ping_pong():
    return 'pong'


app = Flask(__name__)
client = pymongo.MongoClient("mongodb://127.0.0.1:27017/")
db = client['User']
info = db.userInfo

bcrypt = Bcrypt(app)


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


def register1(firstName, lastName, email, username, password):
    if not user_exists(username, email):
        if len(password) < 8:
            print("Password must be at least 8 characters long")
        else:
            hash_pass = bcrypt.generate_password_hash(password).decode('utf-8')
            userRecord = {
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "userName": username,
                "password": hash_pass
            }
            info.insert_one(userRecord)
    else:
        print("User already exists")


def login1(username, password):
    if validate_user(username, password) == "True":
        print("You are logged in")
    elif validate_user(username, password) == "False":
        print("The username and password do not match")
    else:
        print("The username does not exist")


register1("Aref", "Sadeghi", "Aref@example.com", "ArefS", "password")
register1("Alex", "Born", "Alex@example.com", "AlexB", "password2")
register1("Ankith", "Pillay", "Ankith@example.com", "AnkithP", "password3")
register1("Jamie", "Wist", "Jamie@example.com", "JamieW", "password4")
register1("Derik", "Wang", "Wang@example.com", "DerikW", "password5")
login1("JamieW", "password4")
#info.delete_one({"userName": "AnkithP"})

@app.route('/register', methods=['POST'])
def register(firstName, lastName, email, username, password):
    if not user_exists(username, email):
        if password.len() < 8:
            print("Password must be at least 8 characters long")
        else:
            hash_pass = bcrypt.generate_password_hash(password).decode('utf-8')
            userRecord = {
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "userName": username,
                "password": hash_pass
            }
            info.insert_one(userRecord)


@app.route('/login', methods=['POST'])
def login(username, password):
    if validate_user(username, password) == "True":
        print("You are logged in")
    elif validate_user(username, password) == "False":
        print("The username and password do not match")
    else:
        print("The username does not exist")