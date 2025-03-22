from flask import Flask, render_template, request, jsonify
import joblib
import os
import pandas as pd

app = Flask(__name__,
            static_folder=".",
            static_url_path="",
            template_folder="views/ui")

# Load the model
model = None

def load_model():
    global model
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(BASE_DIR, "models", "model.pkl")

    if not os.path.exists(model_path):
        print(f"Model file not found at: {model_path}")
        return False

    try:
        model = joblib.load(model_path)
        print(f"Model loaded successfully: {type(model)}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

# Load model on startup
load_model()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict')
def predict_page():
    return render_template('predict.html')

@app.route('/about')
def about_page():
    return render_template('about.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        input_data = {
            'age': int(data['age']),
            'sex': int(data['sex']),
            'chest pain type': int(data['chest_pain_type']),
            'resting bp s': int(data['resting_bp']),
            'cholesterol': int(data['cholesterol']),
            'fasting blood sugar': int(data['fasting_blood_sugar']),
            'resting ecg': int(data['resting_ecg']),
            'max heart rate': int(data['max_heart_rate']),
            'exercise angina': int(data['exercise_angina']),
            'oldpeak': float(data['oldpeak']),
            'ST slope': int(data['st_slope'])
        }

        input_df = pd.DataFrame([input_data])

        if model is None:
            if not load_model():
                return jsonify({'error': 'Model not available. Please try again later.'}), 500

        prediction = model.predict(input_df)
        probability = model.predict_proba(input_df)

        probability_list = probability.tolist()

        feature_importance = {}
        if hasattr(model, 'feature_importances_'):
            for idx, col in enumerate(input_data.keys()):
                feature_importance[col] = float(model.feature_importances_[idx])

        risk_score = int(probability[0][1] * 100)

        result = {
            'prediction': int(prediction[0]),
            'probability': probability_list[0],
            'risk_score': risk_score,
            'class_labels': model.classes_.tolist(),
            'feature_importance': feature_importance
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
