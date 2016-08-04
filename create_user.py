import hashlib
import MySQLdb
from db_conf import DB_CONFIG
from  getpass import getpass
db = MySQLdb.connect(host=DB_CONFIG['host'], \
            user=DB_CONFIG['user'], \
            passwd=DB_CONFIG['passwd'], \
            db=DB_CONFIG['db'], \
            #use_unicode=False, \
            #charset='utf8')
            )
cursor = db.cursor() 
cursor.execute("SELECT user_name FROM user")
result = [item[0] for item in cursor.fetchall()]
user = raw_input("pls input user name:")
while user in result:
    user = raw_input(user + " is already exist! pls try again:")
pprompt = lambda: (getpass(), getpass('Retype password: '))
p1, p2 = pprompt()
while p1 != p2:
    print('Passwords do not match. Try again')
    p1, p2 = pprompt()
hashed_passwd = hashlib.sha256(p1).hexdigest()
sql = "INSERT INTO user(u_id, user_name, passwd) VALUES (NULL, %s, %s)"
try:
    cursor.execute(sql, (user, hashed_passwd))
    db.commit()
except MySQLdb.Error, e:
   print e
   print Error
   db.rollback()
db.close()


