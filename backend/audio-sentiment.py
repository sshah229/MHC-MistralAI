import os
import tempfile
import tensorflow as tf
import keras
from tensorflow.keras.initializers import glorot_uniform
import librosa
import numpy as np
import pandas as pd
from keras.utils import to_categorical
from sklearn.preprocessing import LabelEncoder
from flask import Flask, request, jsonify
from keras.models import load_model

app = Flask(__name__)

model_path = os.path.join(os.path.dirname(__file__), "Data_noiseNshift.h5")
if os.path.exists(model_path):
    model = load_model(model_path, custom_objects={"GlorotUniform": glorot_uniform()})
    model.compile(loss="categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
else:
    model = None
    print(f"Warning: Model file not found at {model_path}")


def process_audio(audio_file):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        audio_file.save(tmp.name)
        audio_file_path = tmp.name

    try:
        input_duration = 3
        data_test = pd.DataFrame(columns=["feature"])
        X, sample_rate = librosa.load(
            audio_file_path,
            res_type="kaiser_fast",
            duration=input_duration,
            sr=22050 * 2,
            offset=0.5,
        )
        sample_rate = np.array(sample_rate)
        mfccs = np.mean(
            librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=13), axis=0
        )
        data_test.loc[0] = [mfccs]
        test_valid = pd.DataFrame(data_test["feature"].values.tolist())
        test_valid = np.array(test_valid)

        label_names = [
            "male_none", "female_none", "female_calm", "male_sad",
            "female_fearful", "male_happy", "male_fearful", "male_calm",
            "female_happy", "female_angry", "male_angry", "female_sad",
        ]
        lb = LabelEncoder()
        to_categorical(lb.fit_transform(label_names))

        test_valid = np.expand_dims(test_valid, axis=2)
        preds = model.predict(test_valid, batch_size=1, verbose=1)
        preds1 = preds.argmax(axis=1)
        abc = preds1.astype(int).flatten()
        prediction = lb.inverse_transform(abc)
        mood = prediction[0].split("_")[1]
        return mood
    finally:
        os.unlink(audio_file_path)


@app.route("/mood", methods=["POST"])
def get_mood():
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 503
        audio_file = request.files.get("file")
        if not audio_file:
            return jsonify({"error": "No audio file provided"}), 400
        mood = process_audio(audio_file)
        return jsonify({"mood": mood})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
