# Pet Disease Detection Service - Local Setup

This guide will help you get the backend running locally with PostgreSQL and Google Gemini.

## Prerequisites
* Python 3.10+
* PostgreSQL (Installed locally or via pgAdmin)
* Google Gemini API Key

## 1. Database Setup (pgAdmin)
1. Open pgAdmin 4.
2. Right-click on **Databases** > **Create** > **Database...**.
3. Name it `pet_disease` and click **Save**.
4. The tables will be created automatically when you start the FastAPI server.

## 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in:
* `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio.
* `DATABASE_URL`: Update with your PostgreSQL username, password, and port.
  * Format: `postgresql+asyncpg://<user>:<password>@localhost:<port>/pet_disease`

## 3. Installation
Install the required packages:
```bash
pip install -r requirements.txt
pip install asyncpg  # Ensure async driver is installed
```

## 4. Running the Server
Start the server using uvicorn:
```bash
uvicorn app.main:app --reload
```
The server will be available at: http://localhost:8001

## 5. Testing with Swagger UI
1. Open your browser and go to http://localhost:8001/docs.
2. Find the `POST /api/v1/pets/scan` endpoint.
3. Click **Try it out**.
4. Upload a pet image and provide a name.
5. Click **Execute** and view the structured JSON response from Gemini.

## 6. Manual Testing (cURL)
You can test the scan endpoint using cURL:
```bash
curl -X POST "http://127.0.0.1:8001/api/v1/pets/scan" \
     -F "image=@test_pet.jpg" \
     -F "pet_name=Buddy"
```

## Features (Local Version)
* **Gemini Flash/Pro**: Uses the latest Gemini models for vision analysis.
* **Async SQLAlchemy**: High-performance database operations with PostgreSQL.
* **Auto-Table Creation**: Database tables are managed automatically on startup.
* **No AWS Required**: S3 integration is optional, allowing for immediate local testing.
