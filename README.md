# 🏥 Medical AI - Anemia Detection System

A professional medical application for detecting anemia through conjunctiva analysis using AI, with Firebase authentication for hospitals and clinics.

## ✨ Features

### 🔐 Authentication System
- **Hospital/Clinic Registration** - Secure signup for medical institutions
- **Email/Password Authentication** - Traditional login system
- **Google OAuth** - One-click sign-in with Google
- **Email Verification** - Automatic confirmation emails
- **Password Reset** - Secure password recovery
- **User Profiles** - Store institution information in Firestore

### 🧠 AI Analysis
- **Conjunctiva Analysis** - AI-powered anemia detection
- **Real-time Results** - Instant medical assessment
- **Confidence Scoring** - Professional confidence metrics
- **Medical Notes** - Clinical recommendations and guidance

### 🏥 Medical Features
- **HIPAA Compliant Design** - Professional healthcare UI
- **Medical Institution Types** - Hospital, Clinic, Medical Center, Laboratory, Research Institute
- **Analysis History** - Store and retrieve past analyses
- **Professional Medical UI** - Clean, trustworthy healthcare interface

## 🚀 Setup Instructions

### 1. Firebase Project Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name (e.g., "medical-ai-anemia")
   - Follow setup wizard

2. **Enable Authentication**
   - In Firebase Console, go to "Authentication"
   - Click "Get started"
   - Enable "Email/Password" provider
   - Enable "Google" provider
   - Add your domain to authorized domains

3. **Enable Firestore Database**
   - Go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select location closest to your users

4. **Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "Add app" → Web app
   - Register app and copy config

### 2. Update Firebase Configuration

Edit `firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Firestore Security Rules

Set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own analyses
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 4. Email Templates (Optional)

For production, set up custom email templates in Firebase Console:

1. **Go to Authentication → Templates**
2. **Email verification template**
3. **Password reset template**
4. **Customize with your branding**

### 5. Run the Application

1. **Start Flask Backend**
   ```bash
   python app.py
   ```

2. **Access Application**
   - Open browser to `http://127.0.0.1:5000/`
   - You'll see the authentication screen first

## 📁 Project Structure

```
project/
├── app.py                 # Flask backend with AI model
├── index.html            # Main application interface
├── style.css             # Medical-themed styling
├── script.js             # Main JavaScript functionality
├── firebase-config.js    # Firebase configuration
├── my_model.keras        # Trained AI model
├── README.md             # This file
└── CP-AnemiC dataset/    # Training dataset
```

## 🔧 Configuration Options

### Customizing Institution Types

Edit the institution types in `index.html`:

```html
<select id="institutionType" required>
  <option value="">Select institution type</option>
  <option value="hospital">Hospital</option>
  <option value="clinic">Clinic</option>
  <option value="medical_center">Medical Center</option>
  <option value="laboratory">Laboratory</option>
  <option value="research_institute">Research Institute</option>
  <!-- Add more as needed -->
</select>
```

### Email Configuration

For production email sending, implement a backend service:

```python
# In app.py, add email sending functionality
import smtplib
from email.mime.text import MIMEText

def send_welcome_email(email, institution_name):
    # Configure your email service
    # Send welcome email to new users
    pass
```

## 🔒 Security Considerations

### Production Deployment

1. **Environment Variables**
   - Store Firebase config in environment variables
   - Never commit API keys to version control

2. **HTTPS Only**
   - Deploy with SSL certificate
   - Update Firebase authorized domains

3. **Firestore Rules**
   - Implement proper security rules
   - Restrict access based on user roles

4. **Data Privacy**
   - Implement data retention policies
   - Ensure HIPAA compliance for medical data

## 🎨 Customization

### Styling

The application uses a medical theme with:
- Professional blue color scheme
- Medical icons and symbols
- Clean, trustworthy design
- Responsive layout

### Branding

Update the logo and branding in:
- `index.html` - Application title and logo
- `style.css` - Color scheme and styling
- `firebase-config.js` - Email templates

## 📊 Analytics & Monitoring

### Firebase Analytics

Enable Firebase Analytics for insights:
1. Go to Firebase Console → Analytics
2. Follow setup instructions
3. Track user engagement and feature usage

### Error Monitoring

Implement error tracking:
```javascript
// In script.js
window.addEventListener('error', (e) => {
  // Log errors to Firebase Crashlytics or your preferred service
  console.error('Application error:', e.error);
});
```

## 🚀 Deployment

### Vercel/Netlify Deployment

1. **Build the project**
2. **Deploy static files**
3. **Configure environment variables**
4. **Update Firebase authorized domains**

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

## 📞 Support

For issues and questions:
1. Check Firebase Console for authentication errors
2. Review browser console for JavaScript errors
3. Verify Firestore security rules
4. Ensure all Firebase services are enabled

## 📄 License

This project is for educational and demonstration purposes. For medical use, ensure compliance with local healthcare regulations and HIPAA requirements.

---

**Note**: This is a demonstration application. For production medical use, implement additional security measures, HIPAA compliance, and proper medical data handling protocols.
