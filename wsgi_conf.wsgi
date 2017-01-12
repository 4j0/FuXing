import sys, logging
sys.path.insert(0, '/var/www/FuXing')
logging.basicConfig(stream=sys.stderr)
from app import app as application
#import hello
