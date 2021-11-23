# Mongodb collections for import throughout the application
# 
# import db
#
# db.users.do_something()

import pymongo

client = pymongo.MongoClient("mongodb://mongo:27017")

# Use a staging database
db = client.staging

# database to store users
# user:
#  - username: "string"
#  - password: "string"
users = db.users

# database to store analyses
# analysis
#  - ... 
analyses = db.analyses