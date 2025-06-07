# Test backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app/main.py

# Test frontend (new terminal)
cd frontend
npm install
npm start 