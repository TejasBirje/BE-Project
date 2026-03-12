### 1️⃣ Start Python Microservice

```bash
cd python-server
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```


2️⃣ Start Backend (Node.js)
```bash
cd backend
npm install
npm run dev
```

3️⃣ Start Frontend
```bash
cd frontend
npm install
npm run dev
```
