import time
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/time')
def get_current_time():
    return jsonify({'time': time.time()})

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5001)
