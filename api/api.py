import time
from crypt import methods

from flask import Flask, request, jsonify
from flask_cors import CORS
from dpr_core.Analyzer import Analyzer
from dpr_core.Attack import Attack

app = Flask(__name__)
CORS(app)

def unpack_json(data):
    build = Analyzer(data["title"])
    for i in range(len(data["attacks"])):
        json_attack = data["attacks"][i]
        py_attack = Attack(name=json_attack["name"], damagef=json_attack["damagef"], toHitf=json_attack["hitf"])
        build.add(py_attack, int(json_attack["times"]))
    return build

@app.route('/api/time')
def get_current_time():
    return jsonify({'time': time.time()})

@app.route('/api/averages', methods=['POST'])
def get_average_damages():
    data = request.get_json()
    build = unpack_json(data)

    result = {}
    AC_range = range(int(data["acs"]["min"]), int(data["acs"]["max"])+1)
    for AC in AC_range:
        avg = build.get_avg(AC)
        result[AC] = round(avg, 1)
    
    return jsonify({'result' : result})

@app.route('/api/cross-section', methods=['POST'])
def get_cross_section():
    data = request.get_json()
    build = unpack_json(data)

    result = build.simulate(int(data["acs"]["test"]))
    return jsonify({'result' : result})

@app.route('/api/three-d', methods=['POST'])
def get_three_d():
    data = request.get_json()
    build = unpack_json(data)

    result = {}
    ac_range = range(int(data["acs"]["min"]), int(data["acs"]["max"])+1)
    for ac in ac_range:
        result[ac] = build.simulate(ac)
    return jsonify({'result' : result})

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5001)
