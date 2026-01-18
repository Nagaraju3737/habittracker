"""
Thread-safe JSON file database operations
"""


import os
from datetime import datetime
from pymongo import MongoClient

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb+srv://nagarajuch3737:Nr%4012102004@habit-tracker.b47rper.mongodb.net/?appName=Habit-tracker')
client = MongoClient(MONGO_URI)
# Use 'habit_tracker' database for all collections
db = client['habit_tracker']
users_collection = db['users']  # Store email and password
habits_collection = db['habits']  # Store habits per user
logs_collection = db['daily_logs']  # Store logs per user

def init_db():
    """MongoDB does not require file initialization."""
    pass


## Removed old JSON file functions (read_json, write_json)


# User operations (MongoDB)
def get_users():
    return list(users_collection.find({}, {'_id': 0}))

def add_user(user):
    users_collection.insert_one(user)
    return user

def find_user_by_email(email):
    user = users_collection.find_one({'email': email}, {'_id': 0})
    return user

def find_user_by_id(user_id):
    user = users_collection.find_one({'id': user_id}, {'_id': 0})
    return user

# Habit operations (MongoDB)
def get_habits():
    return list(habits_collection.find({}, {'_id': 0}))

def add_habit(habit):
    habits_collection.insert_one(habit)
    habit_copy = habit.copy()
    habit_copy.pop('_id', None)
    return habit_copy

def get_user_habits(user_id):
    return list(habits_collection.find({'user_id': user_id}, {'_id': 0}))

def find_habit(habit_id):
    return habits_collection.find_one({'id': habit_id}, {'_id': 0})

def update_habit(habit_id, updates):
    result = habits_collection.update_one({'id': habit_id}, {'$set': updates})
    if result.modified_count:
        return habits_collection.find_one({'id': habit_id}, {'_id': 0})
    return None

def delete_habit(habit_id):
    habits_collection.delete_one({'id': habit_id})
    logs_collection.delete_many({'habit_id': habit_id})

# Daily log operations (MongoDB)
def get_daily_logs():
    return list(logs_collection.find({}, {'_id': 0}))

def get_user_logs(user_id, year, month):
    prefix = f"{year}-{month:02d}"
    return list(logs_collection.find({
        'user_id': user_id,
        'date': {'$regex': f'^{prefix}'}
    }, {'_id': 0}))

def get_habit_logs(habit_id, year, month):
    prefix = f"{year}-{month:02d}"
    return list(logs_collection.find({
        'habit_id': habit_id,
        'date': {'$regex': f'^{prefix}'}
    }, {'_id': 0}))

def find_log(user_id, habit_id, date):
    return logs_collection.find_one({
        'user_id': user_id,
        'habit_id': habit_id,
        'date': date
    }, {'_id': 0})

def upsert_log(user_id, habit_id, date, completed):
    log_entry = {
        'user_id': user_id,
        'habit_id': habit_id,
        'date': date,
        'completed': completed,
        'updated_at': datetime.utcnow().isoformat()
    }
    logs_collection.update_one(
        {'user_id': user_id, 'habit_id': habit_id, 'date': date},
        {'$set': log_entry},
        upsert=True
    )
    return log_entry