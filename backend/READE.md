# Backend Setup

## 1) Go to backend folder

```bash
cd backend
```

## 2) Create virtual environment

```bash
python -m venv venv
```

## 3) Activate virtual environment

### macOS / Linux

```bash
source venv/bin/activate
```

### Windows (PowerShell)

```powershell
.\venv\Scripts\activate
```

## 4) Install dependencies

```bash
pip install -r requirements.txt
```

## 5) Run the app

```bash
uvicorn app.main:app --reload --port 8000
```