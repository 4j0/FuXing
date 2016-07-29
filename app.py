# -*- coding: utf-8 -*-
import json 
from flask import Flask, jsonify, render_template, request, make_response
import MySQLdb
from functions import * 

app = Flask(__name__)

roomNums = ['201', '202', '203', '205', '206', '207', '208', '209', '210', '211', '212', '213', '214', '215', '216', '217', '218']
majiang = ['201', '211', '212', '213', '214', '215', '216', '217', '218']
DB = {'host' : 'localhost', 'user' : 'root', 'passwd' : 'fspqH3F5', 'db' : 'fuxing'}
class Room:

    def __init__(self, number, type):
        self.number = number
        self.type = type
        self.status = 'empty'
        self.bill_id = None
        self.startTime = None
        self.consumptions = []

class RoomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        return obj.__dict__

def init_rooms(roomNums):
    rooms = {}
    for roomNum in roomNums:
        if roomNum in majiang:
            rooms[roomNum] = Room(roomNum, 'majiang')
        else:
            rooms[roomNum] = Room(roomNum, 'tea')
    return rooms

rooms = init_rooms(roomNums)

@app.route("/rooms", methods=['GET'])
def get_rooms():
    #向数据库查询预订状况
    jsonData = json.dumps(rooms, cls=RoomJSONEncoder)
    return jsonify({'rooms':jsonData})

@app.route("/rooms/<string:roomNum>", methods=['GET'])
def get_room(roomNum):
    if not roomNum in roomNums:
        abort(404)
    print rooms[roomNum]
    return str(rooms[roomNum].__dict__)

@app.route("/rooms/<string:roomNum>", methods=['PUT'])
def update_room(roomNum):
    if not request.json:
        abort(400)
    if not roomNum in roomNums:
        abort(404)
    rooms[roomNum].startTime = request.json['startTime']
    rooms[roomNum].status = request.json['status']
    rooms[roomNum].consumptions = request.json['consumptions']
    #print request.json['consumptions']
    #print rooms[roomNum].consumptions
    #print request.json
    #print type(request.json)
    #print request.json['startTime']
    #print request.json[u'startTime']
    #print rooms[roomNum].startTime
    return "ok"

@app.route("/bills", methods=['GET'])
def get_billsByDate():
    datetime_range = request.args.get('datetime_range')
    start = datetime_range.split('~')[0]
    end = datetime_range.split('~')[1]
    db = MySQLdb.connect(host=DB['host'],user="root",passwd="fspqH3F5",db="fuxing",use_unicode=False, charset='utf8')
    cursor = db.cursor()
    sql = "SELECT * FROM bill WHERE end_time BETWEEN %s AND %s ORDER BY end_time"
    try:
        cursor.execute(sql, (start, end))
        col_name = [col[0] for col in cursor.description]
        results = cursor.fetchall()
    except MySQLdb.Error, e:
        #print e
        db.rollback()
        resp = make_response(str(e), 400)
        return resp
    results = [row_to_dict(row, col_name) for row in list(results)]
    db.close
    json_results = json.dumps(results)
    return json_results
    #return jsonify(results)



@app.route("/bills", methods=['POST'])
def create_bill():
    print request.json['start_time']
    sql_insert_bill = "INSERT INTO bill(\
       bill_id, start_time, end_time, room_id, consumption_amount, paid_in_amount, remark) \
       VALUES (NULL, %s, %s, %s, %s, %s, %s)" 

    sql_insert_consumption = "INSERT INTO consumption(\
    consumption_id, consumption_name, consumption_price, consumption_quantity, bill_id) \
    VALUES (NULL, %s, %s, %s, %s)"

    db = MySQLdb.connect(host="localhost",user="root",passwd="fspqH3F5",db="fuxing",use_unicode=False, charset='utf8')
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
    db.close
    return 'ok'

    

@app.route("/bills/<string:bill_id>", methods=['GET'])
def get_bill(bill_id):
    db = MySQLdb.connect(host="localhost",user="root",passwd="fspqH3F5",db="fuxing",use_unicode=False, charset='utf8')
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
    db.close
    return json_results

#@app.route("/")
#def root():
    #return render_template('index.html')

#@app.route("/")
#def hello():
    #db = MySQLdb.connect("localhost","root","cd$78FGH","test")
    #cursor = db.cursor()
    #cursor.execute("SELECT VERSION()")
    #data = cursor.fetchone()
    #db.close()
    #return test
    #return str(abc['201'])

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
    #app.run(host='192.168.7.20', debug=True)
