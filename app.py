# app.py
from flask import Flask, request, jsonify
import cv2  # Import OpenCV

app = Flask(__name__)

def recognize_luggage(image):
    # TO DO: Implement the luggage recognition logic here
    # For now, let's assume it returns a string indicating the luggage type
    luggage_type = "Unknown"  # Replace with your recognition logic
    return luggage_type

@app.route('/recognize', methods=['POST'])
def recognize():
    image = request.files['image']
    image_bytes = image.read()  # Read the image bytes from the request
    image_array = np.frombuffer(image_bytes, np.uint8)  # Convert to NumPy array
    image_cv = cv2.imdecode(image_array, cv2.IMREAD_COLOR)  # Convert to OpenCV image
    luggage_type = recognize_luggage(image_cv)
    return jsonify({'luggage_type': luggage_type})

if __name__ == '__main__':
    app.run(debug=True)