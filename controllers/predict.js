// Heart Disease Prediction Controller

// Function to fetch and insert HTML components
async function loadComponent(url, containerId) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const html = await response.text();
            document.getElementById(containerId).innerHTML = html;
            
            // After loading the form, add event listeners
            if (containerId === 'predict-form-container') {
                setupFormHandlers();
            }
        } else {
            console.error(`Failed to load component from ${url}`);
        }
    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}

// Function to set up form handlers
function setupFormHandlers() {
    const form = document.getElementById('heart-predict-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Set up result section buttons
    const newPredictionBtn = document.getElementById('new-prediction');
    if (newPredictionBtn) {
        newPredictionBtn.addEventListener('click', () => {
            document.getElementById('result-section').classList.remove('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    const downloadReportBtn = document.getElementById('download-report');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', handleDownloadReport);
    }
}

// Function to handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Show loading state
    document.body.classList.add('loading');
    
    // Collect form data
    const form = event.target;
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());
    
    try {
        // Send data to backend API
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject)
        });
        
        if (!response.ok) {
            throw new Error('Server response was not ok');
        }
        
        const result = await response.json();
        displayResults(formObject, result);
    } catch (error) {
        console.error('Error during prediction:', error);
        alert('An error occurred during prediction. Please try again.');
    } finally {
        document.body.classList.remove('loading');
    }
}

// Function to display results from API
function displayResults(formData, result) {
    // Get risk score from result
    const riskScore = result.risk_score;
    
    // Update the gauge
    const gauge = document.getElementById('risk-gauge');
    gauge.style.width = `${riskScore}%`;
    
    // Update risk level text
    const riskLevel = document.getElementById('risk-level');
    if (riskScore < 30) {
        riskLevel.textContent = "Low";
        riskLevel.className = "risk-level low";
    } else if (riskScore < 70) {
        riskLevel.textContent = "Moderate";
        riskLevel.className = "risk-level moderate";
    } else {
        riskLevel.textContent = "High";
        riskLevel.className = "risk-level high";
    }
    
    // Update probability
    document.getElementById('risk-probability').textContent = `${riskScore.toFixed(1)}%`;
    
    // Map chest pain type values to text
    const chestPainTypes = {
        "0": "Typical Angina",
        "1": "Atypical Angina", 
        "2": "Non-anginal Pain",
        "3": "Asymptomatic"
    };
    
    // Update risk factors
    document.getElementById('factor-age').textContent = formData.age;
    document.getElementById('factor-chest-pain').textContent = chestPainTypes[formData.chest_pain_type];
    document.getElementById('factor-bp').textContent = `${formData.resting_bp} mmHg`;
    document.getElementById('factor-cholesterol').textContent = `${formData.cholesterol} mg/dL`;
    document.getElementById('factor-heart-rate').textContent = formData.max_heart_rate;
    document.getElementById('factor-exercise-angina').textContent = formData.exercise_angina === "1" ? "Yes" : "No";
    
    // Update interpretation text based on risk level
    const interpretationEl = document.getElementById('interpretation-text');
    if (riskScore < 30) {
        interpretationEl.innerHTML = "Your assessment shows a <strong>low risk</strong> of heart disease based on the provided information. Maintain a healthy lifestyle with regular exercise and a balanced diet. Continue with routine check-ups as advised by your healthcare provider.";
    } else if (riskScore < 70) {
        interpretationEl.innerHTML = "Your assessment shows a <strong>moderate risk</strong> of heart disease. Consider consulting with a healthcare professional to review your cardiovascular health. Focus on improving lifestyle factors such as diet, exercise, and stress management.";
    } else {
        interpretationEl.innerHTML = "Your assessment shows a <strong>high risk</strong> of heart disease. We strongly recommend consulting with a healthcare professional promptly. Early intervention and proper medical guidance are important for managing cardiovascular risk factors.";
    }
    
    // Update date
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('result-date').textContent = today.toLocaleDateString('en-US', options);
    
    // Show the result section
    const resultSection = document.getElementById('result-section');
    if (resultSection) {
        resultSection.classList.add('active');
        
        // Scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Function to handle report download
function handleDownloadReport() {
    // In a real implementation, this would generate a PDF
    alert("Report generation feature would be implemented here. This would typically create a PDF with your heart health assessment results.");
}

// Initialize component loading when the page loads
function initPredictPage() {
    loadComponent('/components/Header.html', 'header-container');
    loadComponent('/components/PredictForm.html', 'predict-form-container');
    loadComponent('/components/DisplayResult.html', 'display-result-container');
    loadComponent('/components/Footer.html', 'footer-container');
}

// Export functions for use in other modules if needed
window.heartPredictController = {
    init: initPredictPage,
    loadComponent: loadComponent,
    handleFormSubmit: handleFormSubmit,
    displayResults: displayResults,
    handleDownloadReport: handleDownloadReport
};

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initPredictPage);