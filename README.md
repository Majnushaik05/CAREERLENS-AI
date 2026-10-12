# CareerLens AI - AI Career Intelligence & Recruitment Platform

CareerLens AI is an end-to-end platform featuring AI-powered fake job detection, resume scoring, semantic job matching, skill gap analysis, and automated candidate ranking.

🔗 **Live App:** [https://career-lens-ai.streamlit.app](https://career-lens-ai.streamlit.app).
CareerLens AI — Premium UI Final Package

This package applies a cohesive premium visual treatment to the existing CareerLens AI Streamlit application while preserving the current application flow and API implementation.

Package contents

app.py — existing Streamlit application with premium image-backed landing hero, responsive typography and spacing, refined metric cards, tabs, tables, alerts, expanders, and progress styling.

api.py — existing FastAPI backend copied unchanged from the latest accessible project version.

requirements.txt — Python dependencies for the frontend and API.

Run the Streamlit frontend

pip install -r requirements.txt
streamlit run app.py

Run the FastAPI backend

uvicorn api:app --host 0.0.0.0 --port 8000

The frontend uses API_URL for its backend endpoint; set it to the deployed API base URL if it differs from the configured default. The landing hero includes remote Unsplash photography over HTTPS; internet access is required to display those external images. Other app functionality continues to use the existing code paths.

Validation notes

Both Python files are syntax-compiled before packaging. This environment does not have Streamlit installed, so a live browser render and end-to-end workflow test must still be completed in the deployment environment. This package does not claim those runtime tests have passed.
