
#from sklearn.ensemble import RandomForestClassifier
import cv2 as cv
import numpy as np
import os
import matplotlib.pyplot as plt
import keras
from keras.layers import Input, Dense, Conv2D, MaxPool2D, GlobalAveragePooling2D
from keras.models import Sequential, Model
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from tensorflow.keras.optimizers import SGD

#from google.colab import drive
#1drive.mount('/content/drive')

data = []
data_dir = r'C:\Users\nania\OneDrive\Documents\VS-CODE\project\CP-AnemiC dataset\Test'
dirs = os.listdir(data_dir)

for i in dirs:
    path = os.path.join(data_dir,i)
    for img in os.listdir(path):
        image = cv.imread(os.path.join(path,img))
        image = cv.resize(image, (64,64))
        data.append([image, i])

images = []
labels = []

for img, lab in data:
    images.append(img)
    labels.append(lab)
#preprocessing
from sklearn.preprocessing import LabelEncoder

images = np.array(images)
#normalization
images = images/255.

le = LabelEncoder()
encoded = le.fit_transform(labels)

labels = np.array(labels)

from sklearn.model_selection import train_test_split

x_train, x_test, y_train, y_test = train_test_split(images, encoded, test_size=0.2,random_state=42)
import tensorflow as tf
#model architecture design

inputs = Input(shape=(64,64,3))

x1 = (Conv2D(32, (2,2), input_shape=(64,64,3), padding="same", activation="relu"))(inputs)
x2 = (MaxPool2D(2,2))(x1)
x3 = (Conv2D(64, (2,2), padding="same", activation="relu"))(x2)
x4 = (MaxPool2D(2,2))(x3)
x5 = (Conv2D(128, (2,2), padding="same", activation="relu"))(x4)
x6 = (MaxPool2D(2,2))(x5)

x7 = (GlobalAveragePooling2D())(x6)
x8 = (Dense(100, activation="relu"))(x7)
x9 = (Dense(1, activation="sigmoid"))(x8)

model = Model(inputs=inputs, outputs=x9)

model.summary()
#training the model

import tensorflow as tf
from tensorflow.keras.optimizers import SGD, Adam
sgd = SGD(learning_rate=0.0001, momentum=0.9, nesterov=True)
opt=Adam(learning_rate=0.0001)
model.compile(optimizer='adam', loss="binary_crossentropy", metrics=['accuracy'])
print(x_train.shape)
print(y_train.shape)
print(x_test.shape)
print(y_test.shape)
print()

history = model.fit(x_train,y_train, validation_data=(x_test,y_test), epochs=100, batch_size=8)
acc=model.evaluate(x_test,y_test)
print(f"accuracy: {acc[1]*100}")
# --- Predict on Full Test Set ---
res = model.predict(x_test)

# Convert probabilities to 0/1
y_pred = (res > 0.5).astype(int).flatten()
y_true = y_test.flatten()

# --- Compute Metrics ---
from sklearn.metrics import precision_score, recall_score, f1_score

precision = precision_score(y_true, y_pred)
recall = recall_score(y_true, y_pred)
f1 = f1_score(y_true, y_pred)

print("\n--- Classification Metrics ---")
print(f"Precision: {precision:.4f}")
print(f"Recall: {recall:.4f}")
print(f"F1 Score: {f1:.4f}")


# Plotting training & validation accuracy
plt.figure(figsize=(12, 6))

plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Training Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Model Accuracy')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()

# Plotting training & validation loss
plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()
plt.show()
# model saving
keras.saving.save_model(model, 'my_model.keras')
