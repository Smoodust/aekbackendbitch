from flask import Flask
from functions import *

players = []
lobbys = []

app = Flask(__name__)

@app.route("/player/add")
def hello_world():
    return "<p>Hello, World!</p>"