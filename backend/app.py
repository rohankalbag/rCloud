from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from hashlib import sha256
from flask_cors import CORS
import os
from flask import session
import json
from flask_wtf.csrf import generate_csrf
from flask_session import Session
from waitress import serve

app = Flask(__name__)

with app.app_context():
    with open("config.json", "r") as f:
        config = json.load(f)
    app.config["SQLALCHEMY_DATABASE_URI"] = config["SQLALCHEMY_DATABASE_URI"]
    app.config["SECRET_KEY"] = config["SECRET_KEY"]
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_TYPE"] = "filesystem"
    CLOUD_STORAGE_ROOT_PATH = config["CLOUD_STORAGE_ROOT_PATH"]
    DEPLOY_TO_PROD = config["DEPLOY_TO_PROD"]

CORS(app, resources={
     r"/*": {"origins": "*"}}, supports_credentials=True)
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'py'}
db = SQLAlchemy(app)
Session(app)


def allowed_file(filename): return '.' in filename and filename.rsplit(
    '.', 1)[1].lower() in ALLOWED_EXTENSIONS


class User(db.Model):
    _tablename_ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True)
    password = db.Column(db.String(128))
    dob = db.Column(db.Date, nullable=False)
    cloudpath = db.Column(db.String(128), nullable=True)

    def __repr__(self):
        return f'<User {self.username}>'


with app.app_context():
    db.create_all()


@app.route('/', methods=['GET'])
def home():
    if 'user' in session:
        return f'Welcome to RCloud, {session["user"]}!'
    return 'Welcome to RCloud, please login!'


@app.route('/users', methods=['GET'])
def get_users():
    if 'user' not in session:
        return jsonify({'message': 'Please login to view users!'}), 401
    csrf_token = request.headers.get('X-CSRFToken')
    if not csrf_token or csrf_token != session.get('csrf_token'):
        return jsonify({'message': 'Invalid CSRF token'}), 403
    users = User.query.all()
    return jsonify([(user.username, user.dob.strftime("%-d %B %Y")) for user in users])


@app.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS OK'}), 200
    data = request.json
    username = data['username']
    password = sha256(data['password'].encode()).hexdigest()
    dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
    user_cloud_path = os.path.join(CLOUD_STORAGE_ROOT_PATH, username)
    user = User(username=username, password=password,
                dob=dob, cloudpath=user_cloud_path)

    try:
        db.session.add(user)
        db.session.commit()
    except:
        return jsonify({'message': 'You are already registered! Please login!'}), 400

    if not os.path.exists(user_cloud_path):
        os.mkdir(user_cloud_path)
    session['user'] = user.username
    session['csrf_token'] = generate_csrf()

    return jsonify({
        'message': 'User registered successfully!',
        'csrf_token': session['csrf_token']
    })


@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS OK'}), 200

    data = request.json
    username = data['username']
    password = sha256(data['password'].encode()).hexdigest()

    user = User.query.filter_by(username=username, password=password).first()
    if user:
        session['user'] = user.username
        session['csrf_token'] = generate_csrf()
        return jsonify({
            'message': 'Login successful!',
            'csrf_token': session['csrf_token']
        })
    else:
        return jsonify({'message': 'Invalid credentials!'}), 401


@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out successfully!'})


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'user' not in session:
        return jsonify({'message': 'Please login to upload files!'}), 401
    csrf_token = request.headers.get('X-CSRFToken')
    if not csrf_token or csrf_token != session.get('csrf_token'):
        return jsonify({'message': 'Invalid CSRF token'}), 403

    user = User.query.filter_by(username=session['user']).first()
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    file = request.files['file']

    if not allowed_file(file.filename):
        return jsonify({'message': 'Invalid file type!'}), 400

    if 'path' not in request.form:
        return jsonify({'message': 'Invalid request! parameter "path" not specified'}), 400

    rel_path = request.form.get("path")

    if not os.path.exists(os.path.join(CLOUD_STORAGE_ROOT_PATH, session['user']) + rel_path):
        return jsonify({'message': 'No such directory path exists'}), 400

    try:
        file.save(os.path.join(CLOUD_STORAGE_ROOT_PATH,
                  session['user']) + rel_path + f"/{file.filename}")
    except:
        return jsonify({'message': 'Error saving file!'}), 500

    return jsonify({'message': 'File uploaded successfully!'})


@app.route('/ls', methods=['POST', 'OPTIONS'])
def list_files():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS OK'}), 200
    if 'user' not in session:
        return jsonify({'message': 'Please login to list files!'}), 401
    csrf_token = request.headers.get('X-CSRFToken')
    if not csrf_token or csrf_token != session.get('csrf_token'):
        return jsonify({'error': 'Invalid CSRF token'}), 403
    data = request.json
    if 'path' not in data:
        return jsonify({'message': 'Invalid request! parameter "path" not specified'}), 400
    rel_path = data["path"]
    if not os.path.exists(os.path.join(CLOUD_STORAGE_ROOT_PATH, session['user']) + rel_path):
        return jsonify({'message': 'No such directory path exists'}), 400
    files = os.listdir(os.path.join(
        CLOUD_STORAGE_ROOT_PATH, session['user']) + rel_path)
    directories = [f for f in files if os.path.isdir(os.path.join(
        CLOUD_STORAGE_ROOT_PATH, session['user']) + rel_path + f"/{f}")]
    files = [f for f in files if os.path.isfile(os.path.join(
        CLOUD_STORAGE_ROOT_PATH, session['user']) + rel_path + f"/{f}")]
    return jsonify({'directories': directories, 'files': files})


@app.route('/mkdir', methods=['POST'])
def make_directory():
    if 'user' not in session:
        return jsonify({'message': 'Please login to create directories!'}), 401
    csrf_token = request.headers.get('X-CSRFToken')
    if not csrf_token or csrf_token != session.get('csrf_token'):
        return jsonify({'error': 'Invalid CSRF token'}), 403
    data = request.json
    if 'path' not in data:
        return jsonify({'message': 'Invalid request! parameter "path" not specified'}), 400
    rel_path = data["path"]
    if not os.path.exists(os.path.join(CLOUD_STORAGE_ROOT_PATH, session['user']) + rel_path):
        os.mkdir(os.path.join(CLOUD_STORAGE_ROOT_PATH,
                 session['user']) + rel_path)
        return jsonify({'message': 'Directory created successfully!'})
    else:
        return jsonify({'message': 'Directory already exists!'}), 400


@app.route('/rm', methods=['POST'])
def remove_file():
    if 'user' not in session:
        return jsonify({'message': 'Please login to remove files!'}), 401
    csrf_token = request.headers.get('X-CSRFToken')
    if not csrf_token or csrf_token != session.get('csrf_token'):
        return jsonify({'error': 'Invalid CSRF token'}), 403
    data = request.json
    if 'path' not in data:
        return jsonify({'message': 'Invalid request! parameter "path" not specified'}), 400
    if 'filename' not in data:
        return jsonify({'message': 'Invalid request! parameter "filename" not specified'}), 400
    rel_path = data["path"]
    file_name = data["filename"]
    if not os.path.exists(os.path.join(CLOUD_STORAGE_ROOT_PATH, session['user']) + rel_path + f"/{file_name}"):
        return jsonify({'message': 'No such file exists!'}), 400
    os.remove(os.path.join(CLOUD_STORAGE_ROOT_PATH,
              session['user']) + rel_path + f"/{file_name}")
    return jsonify({'message': 'File removed successfully!'})


@app.route('/rmdir', methods=['POST'])
def remove_directory():
    if 'user' not in session:
        return jsonify({'message': 'Please login to remove directories!'}), 401
    csrf_token = request.headers.get('X-CSRFToken')
    if not csrf_token or csrf_token != session.get('csrf_token'):
        return jsonify({'error': 'Invalid CSRF token'}), 403
    data = request.json
    if 'path' not in data:
        return jsonify({'message': 'Invalid request! parameter "path" not specified'}), 400
    rel_path = data["path"]
    if not os.path.exists(os.path.join(CLOUD_STORAGE_ROOT_PATH, session['user']) + rel_path):
        return jsonify({'message': 'No such directory exists!'}), 400
    if os.listdir(os.path.join(CLOUD_STORAGE_ROOT_PATH, session['user']) + rel_path):
        return jsonify({'message': 'Directory is not empty!'}), 400
    os.rmdir(os.path.join(CLOUD_STORAGE_ROOT_PATH, session['user']) + rel_path)
    return jsonify({'message': 'Directory removed successfully!'})


if __name__ == '__main__':
    if DEPLOY_TO_PROD:
        serve(app, host="0.0.0.0", port=3000)
    else:
        app.run(host="0.0.0.0", debug=True, port=3000)
