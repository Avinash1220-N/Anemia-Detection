from keras.models import load_model
import matplotlib.pyplot as plt
import os
import cv2 as cv
import numpy as np

# Load the saved model
model = load_model('my_model.keras')
model.summary()

# Load test images
data = []
data_dir = r'C:\Users\nania\OneDrive\Documents\VS-CODE\project\CP-AnemiC dataset\Test'
dirs = os.listdir(data_dir)

for i in dirs:
    path = os.path.join(data_dir, i)
    for img in os.listdir(path):
        image = cv.imread(os.path.join(path, img))
        image = cv.resize(image, (64, 64))
        data.append([image, i])

# Separate into images and labels
images = [img for img, _ in data]
labels = [lab for _, lab in data]

# Pick one test image
idx = 124   # change index to test different images
ing = images[idx]

plt.imshow(cv.cvtColor(ing, cv.COLOR_BGR2RGB))  # convert BGR → RGB for display
plt.title(f"True Label: {labels[idx]}")
plt.axis("off")
plt.show()

# Preprocess for model
ing = ing.reshape(1, 64, 64, 3).astype('float32') / 255.0

# Predict
res = model.predict(ing)[0][0]
confidence = res * 100
prediction = "Anemia Detected" if res > 0.5 else "No Anemia"

print(f"Prediction: {prediction} with confidence {confidence:.2f}%")
print("Raw Output:", res)
