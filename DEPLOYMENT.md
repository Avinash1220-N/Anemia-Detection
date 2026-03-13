# AI-Powered Anemia Detection System Deployment

## Architecture
- Frontend: Vercel static site
- Backend API: Render Flask web service
- ML inference: TensorFlow model in Render
- Chatbot: Groq API from Render
- Auth: Firebase Auth in the browser

## Files Used By Each Platform
- Vercel frontend:
  - `index.html`
  - `style.css`
  - `script.js`
  - `templates/index.html`
  - `static/style.css`
  - `static/script.js`
  - `Doctor Review ing patient.png`
- Render backend:
  - `app.py`
  - `my_model.keras`
  - `requirements.txt`
  - `.python-version`

## Render Setup
1. Push this repo to GitHub.
2. In Render, create a new `Web Service` from that repo.
3. Use these settings:
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
4. Add environment variables:
   - `GROQ_API_KEY=your_groq_api_key`
   - Optional: `GROQ_MODEL=llama-3.1-8b-instant`
5. Deploy and wait for the `onrender.com` URL.
6. Confirm these routes:
   - `GET /`
   - `POST /predict`
   - `POST /chat`

## Vercel Setup
1. Import the same GitHub repo into Vercel.
2. Set `Framework Preset` to `Other`.
3. Leave the build command empty.
4. Leave the output directory as the repo root.
5. Deploy.
6. Confirm the Vercel URL loads the dashboard and that requests go to:
   - `https://detection-of-anemia.onrender.com/predict`
   - `https://detection-of-anemia.onrender.com/chat`

## Firebase Auth Checklist
1. Open Firebase Console -> Authentication -> Settings.
2. Add your Vercel domain to `Authorized domains`.
3. If you use Google sign-in, keep the Google provider enabled.
4. If you still test locally, add `localhost` manually if your project does not already include it.

## Post-Deploy Smoke Test
1. Open the Vercel frontend URL.
2. Sign in with Firebase Auth.
3. Upload an eye image and confirm prediction results appear.
4. Open the chatbot and send a message about anemia.
5. Verify Render logs show successful `POST /predict` and `POST /chat` requests.
