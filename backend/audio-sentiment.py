import tensorflow as tf
import keras
from tensorflow.keras.initializers import glorot_uniform
import librosa
import numpy as np
import pandas as pd
from keras.utils import to_categorical
from sklearn.preprocessing import LabelEncoder
from flask import Flask, request
from keras.models import load_model
import json

app = Flask(__name__)

model = load_model('Data_noiseNshift.h5', custom_objects={'GlorotUniform': glorot_uniform()})
model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

def process_audio():
    input_duration = 3
    data_test = pd.DataFrame(columns=['feature'])
    X, sample_rate = librosa.load(audio_file_path, res_type='kaiser_fast',duration=input_duration,sr=22050*2,offset=0.5)
    sample_rate = np.array(sample_rate)
    mfccs = np.mean(librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=13), axis=0)
    feature = mfccs
    data_test.loc[0] = [feature]
    test_valid = pd.DataFrame(data_test['feature'].values.tolist())
    test_valid = np.array(test_valid)
    test_valid_lb = np.array(['male_none', 'female_none', 'female_calm', 'male_sad', 'female_fearful',
        'male_happy', 'male_fearful', 'male_calm', 'female_happy',
        'female_angry', 'male_angry', 'female_sad'])
    lb = LabelEncoder()
    test_valid_lb = to_categorical(lb.fit_transform(test_valid_lb))
    test_valid = np.expand_dims(test_valid, axis=2)
    preds = loaded_model.predict(test_valid, batch_size=1, verbose=1)
    preds1 = preds.argmax(axis=1)
    abc = preds1.astype(int).flatten()
    prediction = (lb.inverse_transform((abc)))
    prediction = prediction[0].split('_')[1]
    print(prediction)
    return prediction
    

@app.route('/mood', methods=['POST'])
def get_mood():
    try:
        if request.method == 'POST':
            res = process_audio(request.files['file'])
            return res
        else:
            return "error"
    except:
        return "error"


if __name__ == "__main__":
    app.run(debug=True)
