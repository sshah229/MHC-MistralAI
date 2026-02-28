from flask import Flask, render_template, request
from keras.models import load_model
from PIL import Image

app = Flask(__name__)

model = load_model("trained_vggface.h5")

def predict_result(frame):
    with open(frame_img, "rb") as image:
        f = image.read()
        b = bytearray(f)

    results = detector.detect_faces(b)
	# extract the bounding box from the first face
    if len(results) == 1: #len(results)==1 if there is a face detected. len ==0 if no face is detected
        try:
            x1, y1, width, height = results[0]['box']
            x2, y2 = x1 + width, y1 + height
        	# extract the face
            face = frame[y1:y2, x1:x2]
            #Draw a rectangle around the face
            cv2.rectangle(frame, (x1, y1), (x1+width, y1+height), (255, 0, 0), 2)
            # resize pixels to the model size
            cropped_img = cv2.resize(face, (96,96)) 
            cropped_img_expanded = np.expand_dims(cropped_img, axis=0)
            cropped_img_float = cropped_img_expanded.astype(float)
            pred = model.predict(cropped_img_float)
            return pred
        except:
            pass



@app.route('/prediction', methods=["POST"])
def call_predict_result():
    print("hii")
    #print(request.method)
    try:
        if request.method == 'POST':
           # return "hi"
            #return "yo"
            res = predict_result(img)
            print(res)
            return res
            
        else:
            return "bye"
    except:
        return []

@app.route('/hello')
def test_hello():
    return '<h1>Hello!</h1>'


if __name__ == "__main__":
    app.run(debug=True)

