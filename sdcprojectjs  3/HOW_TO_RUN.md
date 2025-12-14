# How to Run the AI Document Assistant

This guide will walk you through setting up and running the complete application stack.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (running on localhost:27017)
- **RabbitMQ** (running on localhost:5672)

## Project Structure

```
ps_ui/
├── backend/          # Node.js Express server (API + Authentication)
├── backend_python/   # Python Celery worker (Document processing)
└── frontend/         # Static HTML files (UI)
```

## Initial Setup (One-time)

### 1. Backend Setup (Node.js)

```powershell
# Navigate to backend directory
cd c:\Users\kolag\Desktop\ps_ui\backend

# Install Node.js dependencies
npm install

# Verify .env file contains your API key
# Make sure GEMINI_API_KEY is set in backend/.env
```

### 2. Backend Python Setup (Celery Worker)

```powershell
# Navigate to backend_python directory
cd c:\Users\kolag\Desktop\ps_ui\backend_python

# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\activate

# Install Python dependencies
pip install celery pymongo pdfminer.six python-docx python-pptx google-generativeai python-dotenv
```

## Running the Application

You need to start **4 different services** in separate terminal windows:

### Terminal 1: MongoDB

```powershell
# Start MongoDB (if not running as a service)
mongod
```

### Terminal 2: RabbitMQ

```powershell
# Start RabbitMQ (if not running as a service)
# On Windows, RabbitMQ is usually installed as a service and runs automatically
# Check status with:
rabbitmq-service status

# Or start manually:
rabbitmq-server
```

### Terminal 3: Node.js Backend Server

```powershell
cd c:\Users\kolag\Desktop\ps_ui\backend
npm start
```

**Expected output:** `Server running on port 5000`

The backend API will be available at: **http://localhost:5000**

### Terminal 4: Python Celery Worker

```powershell
cd c:\Users\kolag\Desktop\ps_ui\backend_python

# Activate virtual environment (if using one)
.\venv\Scripts\activate

# Start the Celery worker using the provided batch file
.\start_worker.bat

# Or manually:
celery -A celery_app worker --loglevel=info -Q file_processing_queue --pool=solo
```

**Expected output:** Celery worker should show as ready and connected to RabbitMQ

### Terminal 5: Frontend (Web Browser)

Open your web browser and navigate to:
```
file:///c:/Users/kolag/Desktop/ps_ui/frontend/index.html
```

Or use a simple HTTP server:
```powershell
cd c:\Users\kolag\Desktop\ps_ui\frontend
python -m http.server 8080
```

Then open: **http://localhost:8080/index.html**

## Using the Application

1. **Sign Up**: Create a new account on the signup page
2. **Login**: Use your credentials to log in
3. **Upload Documents**: Upload PDF, DOCX, or PPTX files
4. **Chat**: Ask questions about your uploaded documents using the AI assistant

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check if MongoDB service is active on port 27017

### RabbitMQ Connection Issues
- Verify RabbitMQ is running: `rabbitmq-diagnostics status`
- Default credentials: username=`guest`, password=`guest`

### Celery Worker Not Processing
- Check RabbitMQ is running
- Verify MongoDB connection in `tasks.py`
- Look for errors in the Celery worker terminal

### Backend API Errors
- Verify `.env` file has correct `GEMINI_API_KEY`
- Check MongoDB is accessible
- Ensure port 5000 is not in use

### GEMINI API Issues
- Verify your API key is valid
- Check internet connectivity
- Review quota limits on Google AI Studio

## Quick Start Script

Create a batch file `start_all.bat` in the project root:

```batch
@echo off
echo Starting AI Document Assistant...
echo.
echo Please ensure MongoDB and RabbitMQ are running!
echo.
echo Starting Node.js Backend...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3
echo Starting Celery Worker...
start "Celery Worker" cmd /k "cd backend_python && celery -A celery_app worker --loglevel=info -Q file_processing_queue --pool=solo"
timeout /t 3
echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && python -m http.server 8080"
echo.
echo All services started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8080
echo.
pause
```

## Stopping the Application

1. Press `Ctrl+C` in each terminal to stop the respective service
2. If using the virtual environment, deactivate it: `deactivate`

## Development Notes

- Backend API runs on port **5000**
- Frontend can be served on any port (e.g., **8080**)
- MongoDB uses default port **27017**
- RabbitMQ uses default port **5672**
- Uploaded files are stored in `backend/uploads/`
- Document metadata is stored in MongoDB database `ai_doc_db`

## Environment Variables

Located in `backend/.env`:
```
SECRET_KEY=REPLACE_WITH_A_STRONG_SECRET
PORT=5000
GEMINI_API_KEY=<your-api-key>
```

**Important:** Never commit your `.env` file to version control!
