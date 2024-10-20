# classification.py
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

def train_model(X_train, y_train, X_test, y_test):
    le = LabelEncoder()
    y_train = le.fit_transform(y_train)
    y_test = le.transform(y_test)
    
    model = build_cnn_model()
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test))
    
    y_pred = model.predict(X_test)
    y_pred_class = np.argmax(y_pred, axis=1)
    
    accuracy = accuracy_score(y_test, y_pred_class)
    print(f'Accuracy: {accuracy:.3f}')