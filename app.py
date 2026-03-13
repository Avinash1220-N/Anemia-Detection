from pathlib import Path
import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from groq import Groq
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model

BASE_DIR = Path(__file__).resolve().parent
os.chdir(BASE_DIR)

app = Flask(__name__)
CORS(app)


def load_env_file():
    env_path = Path(".env")
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file()

MODEL = load_model("my_model.keras")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")
SYSTEM_PROMPT = (
    "You are a concise medical AI assistant focused on anemia and blood health. "
    "Answer clearly in under 80 words and always remind users to consult a "
    "healthcare professional."
)


def warm_up_model():
    dummy_input = np.zeros((1, 64, 64, 3), dtype=np.float32)
    MODEL.predict(dummy_input, verbose=0)


warm_up_model()


@app.route("/")
def home():
    return jsonify({"status": "ok", "message": "AI-Powered Anemia Detection System API"})


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    img = Image.open(file.stream).convert("RGB")
    img = img.resize((64, 64))
    img = np.array(img) / 255.0
    img = np.expand_dims(img, axis=0)

    prediction = MODEL.predict(img, verbose=0)
    value = prediction[0][0]

    if value > 0.5:
        result = "Anemic"
        confidence = float(value)
    else:
        result = "Normal"
        confidence = float(1 - value)

    if result == "Normal":
        severity = "Normal"
    elif confidence >= 0.9:
        severity = "Severe"
    elif confidence >= 0.75:
        severity = "Moderate"
    else:
        severity = "Mild"

    return jsonify({
        "result": result,
        "confidence": confidence,
        "severity": severity,
    })


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(silent=True) or {}
        user_message = str(data.get("message", "")).strip()

        if not user_message:
            return jsonify({"error": "Empty message"}), 400

        groq_api_key = os.environ.get("GROQ_API_KEY")
        if not groq_api_key:
            return jsonify({"error": "Missing GROQ_API_KEY in environment or .env"}), 500

        groq_client = Groq(api_key=groq_api_key)
        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=150,
        )

        reply = completion.choices[0].message.content or "I could not generate a reply."
        return jsonify({"reply": reply})

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
