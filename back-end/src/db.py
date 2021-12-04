# Mongodb collections for import throughout the application
# 
# import db
#
# db.users.do_something()

import os
import pymongo

client = pymongo.MongoClient(os.environ['MONGO_URL'])

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