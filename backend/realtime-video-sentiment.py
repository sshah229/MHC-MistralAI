from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from fer.fer import FER

app = Flask(__name__)
CORS(app)

detector = FER(mtcnn=True)


def map_to_sakhi_signal(emotions):
    if not emotions:
        return {"facialEmotion": "neutral", "stressLevel": "low", "confidence": 0.0}

    top_emotion, confidence = max(emotions.items(), key=lambda x: x[1])
    stress_map = {
        "angry": "high",
        "fear": "high",
        "sad": "medium",
        "disgust": "medium",
        "surprise": "medium",
        "neutral": "low",
        "happy": "low",
    }

    return {
        "facialEmotion": top_emotion,
        "stressLevel": stress_map.get(top_emotion, "low"),
        "confidence": round(float(confidence), 3),
    }


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.post("/analyze")
def analyze_frame():
    if "frame" not in request.files:
        return jsonify({"error": "No frame provided"}), 400

    file = request.files["frame"]
    data = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(data, cv2.IMREAD_COLOR)

    if frame is None:
        return jsonify({"error": "Invalid image"}), 400

    results = detector.detect_emotions(frame)
    if not results:
        return jsonify(
            {
                "faceDetected": False,
                "facialEmotion": "neutral",
                "stressLevel": "low",
                "confidence": 0.0,
                "rawEmotions": {},
            }
        )

    emotions = results[0].get("emotions", {})
    mapped = map_to_sakhi_signal(emotions)
    return jsonify({"faceDetected": True, "rawEmotions": emotions, **mapped})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)

