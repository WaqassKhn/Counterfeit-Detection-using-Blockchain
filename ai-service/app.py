from flask import Flask, jsonify, request

from detector import analyze_payload

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/analyze")
def analyze():
    payload = request.get_json(force=True)
    return jsonify(analyze_payload(payload))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

