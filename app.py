# -*- coding: utf-8 -*-
import json, MySQLdb, hashlib
from flask import Flask, jsonify, render_template, request, make_response, abort, Response
from functools import wraps
from functions import * 
from db_conf import *
#import pdb
app = Flask(__name__)
roomNums = ['201', '202', '203', '205', '206', '207', '208', '209', '210', '211', '212', '213', '214', '215', '216', '217', '218']
majiang = ['201', '211', '212', '213', '214', '215', '216', '217', '218']
#USER = {'name': 'test', 'passwd': 'test'}
tokens = {}

class Room:

    def __init__(self, number, type):
        self.number = number
        self.type = type
        self.status = 'empty'
        self.startTime = None
        self.consumptions = []

    def get_consumption(self, name):
        for c in self.consumptions:
            if c['name'] == name:
                return c
        return None

    def addConsumption(self, consumption):
        for c in self.consumptions:
            if c['name'] == consumption['name']:
                c['quantity'] += consumption['quantity']
                return
        self.consumptions.append(consumption)

class RoomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        return obj.__dict__

def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kw):
        token = request.cookies.get('token')
        user_name = request.cookies.get('user')
        if tokens.has_key(user_name) and token == tokens[user_name]:
            return func(*args, **kw)
        else:
            abort(401)
    return decorated_function

def init_rooms(roomNums):
    rooms = {}
    for roomNum in roomNums:
        if roomNum in majiang:
            rooms[roomNum] = Room(roomNum, 'majiang')
        else:
            rooms[roomNum] = Room(roomNum, 'tea')
    return rooms

rooms = init_rooms(roomNums)

@app.route("/login", methods=['POST'])
def login():
    name = request.json.get('userName')
    passwd = request.json.get('passwd')
#    if name == USER['name'] and passwd == USER['passwd']
        #hashed_passwd = hashlib.sha256(passwd).hexdigest()
        #token = hashlib.sha256(name + hashed_passwd).hexdigest()
        #tokens[name] = token
        #response = Response('')
        #response.set_cookie('token',value=token)
        #response.set_cookie('user',value=name)
        #return response

    hashed_passwd = hashlib.sha256(passwd).hexdigest()
    db = new_db(DB_CONFIG)
    sql = "SELECT passwd FROM user WHERE user_name=%s"
    cursor = db.cursor()
    cursor.execute(sql,(name, ))
    result = cursor.fetchone()
    db.close()
    if result == None:
        abort(401)
    db_passwd = result[0]
    if hashed_passwd == db_passwd:
        token = hashlib.sha256(name + hashed_passwd).hexdigest()
        tokens[name] = token
        response = Response('ok')
        response.set_cookie('token',value=token)
        response.set_cookie('user',value=name)
        return response
    abort(401)
    
@app.route("/rooms", methods=['GET'])
@login_required
def get_rooms():
    jsonData = json.dumps(rooms, cls=RoomJSONEncoder)
    return jsonify({'rooms':jsonData})

@app.route("/rooms/<string:roomNum>", methods=['PATCH'])
@login_required
#token
def patch_room(roomNum):
    if not request.json:
        abort(400)
    if not roomNum in roomNums:
        abort(404)
    room = rooms[roomNum]
    for (k,v) in request.json.items():
        if (k not in ['startTime', 'status', 'consumptions']):
            abort(400)
        setattr(room, k, v)
    return "", 201

@app.route("/bills", methods=['GET'])
def get_billsByDate():
    datetime_range = request.args.get('datetime_range')
    start = datetime_range.split('~')[0]
    end = datetime_range.split('~')[1]
    db = new_db(DB_CONFIG)
    cursor = db.cursor()
    sql = "SELECT * FROM bill WHERE end_time BETWEEN %s AND %s ORDER BY end_time"
    try:
        cursor.execute(sql, (start, end))
        col_name = [col[0] for col in cursor.description]
        results = cursor.fetchall()
    except MySQLdb.Error, e:
        db.rollback()
        resp = make_response(str(e), 400)
        return resp
    results = [row_to_dict(row, col_name) for row in list(results)]
    db.close()
    json_results = json.dumps(results)
    return json_results

@app.route("/bills", methods=['POST'])
@login_required
#token
def create_bill():
    print request.json['start_time']
    sql_insert_bill = "INSERT INTO bill(\
       bill_id, start_time, end_time, room_id, consumption_amount, paid_in_amount, remark) \
       VALUES (NULL, %s, %s, %s, %s, %s, %s)" 

    sql_insert_consumption = "INSERT INTO consumption(\
    consumption_id, consumption_name, consumption_price, consumption_quantity, bill_id) \
    VALUES (NULL, %s, %s, %s, %s)"

    db = new_db(DB_CONFIG)
    cursor = db.cursor()    
    try:
        cursor.execute(sql_insert_bill, (request.json['start_time'], request.json['end_time'], request.json['room_id'], request.json['consumption_amount'], request.json['paid_in_amount'], request.json['remark']))
        cursor.execute("SELECT LAST_INSERT_ID()")
        last = int(cursor.fetchone()[0])
        for consumption in request.json['consumptions']:
            cursor.execute(sql_insert_consumption, (consumption['name'], consumption['price'], consumption['quantity'], last))
        db.commit()
    except MySQLdb.Error, e:
       print e
       db.rollback()
       resp = make_response(str(e), 400)
       return resp
    db.close()
    return '', 201
    
@app.route("/rooms/<string:roomNum>/consumptions", methods=['PUT'])
@login_required
def putConsumptions(roomNum):
    if not request.json:
        abort(400)
    if roomNum not in rooms:
        abort(404)
    room = rooms[roomNum]
    for consumption in request.json:
        room.addConsumption(consumption)
    return '', 201

@app.route("/rooms/<string:roomNum>/consumptions/<string:consumption_name>", methods=['DELETE'])
@login_required
def delConsumption(roomNum, consumption_name):
    if roomNum not in rooms:
        abort(404)
    consumption = rooms[roomNum].get_consumption(consumption_name)
    if not consumption:
        abort(404)
    rooms[roomNum].consumptions.remove(consumption)
    return '', 204

@app.route("/rooms/<string:roomNum>/consumptions/<string:consumption_name>/quantity", methods=['PUT'])
@login_required
def patch_consumption(roomNum, consumption_name):
    if roomNum not in rooms:
        abort(404)
    consumption = rooms[roomNum].get_consumption(consumption_name)
    if not consumption:
        abort(404)
    consumption['quantity'] = request.json['quantity']
    return '', 201

@app.route("/bills/<string:bill_id>", methods=['GET'])
def get_bill(bill_id):
    db = new_db(DB_CONFIG)
    cursor = db.cursor()    
    sql = "SELECT * FROM consumption WHERE bill_id=" + bill_id
    try :
        cursor.execute(sql)
    except MySQLdb.Error, e:
        db.rollback()
        resp = make_response(str(e), 400)
        return resp
    results = dictfetchall(cursor)
    json_results = json.dumps(results)
    db.close()
    return json_results

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)

