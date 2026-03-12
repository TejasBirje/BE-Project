import spacy
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
from keybert import KeyBERT

from ats_service import calculate_ats_score
from question_selector import QuestionBank, extract_jd_keywords, get_questions_for_jd

# ────────────────────────────────────────────
# APP SETUP
# ────────────────────────────────────────────
app = FastAPI(title="AI Interview Python Server", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ────────────────────────────────────────────
# LOAD MODELS (once, shared across modules)
# ────────────────────────────────────────────
print("\n" + "=" * 60)
print("🚀 LOADING MODELS")
print("=" * 60)

print("\n🔄 [1/4] Loading spaCy model (en_core_web_sm)...")
nlp = spacy.load("en_core_web_sm")
print("   ✅ spaCy loaded.")

print("\n🔄 [2/4] Loading SentenceTransformer (all-MiniLM-L6-v2)...")
st_model = SentenceTransformer('all-MiniLM-L6-v2')
print("   ✅ SentenceTransformer loaded.")

print("\n🔄 [3/4] Loading KeyBERT model...")
kw_model = KeyBERT(model=st_model)  # Reuse SentenceTransformer — no extra model download!
print("   ✅ KeyBERT loaded (sharing SentenceTransformer backbone).")

print("\n🔄 [4/4] Loading & vectorizing question bank...")
question_bank = QuestionBank(model=st_model)
print("   ✅ Question bank ready.")

print("\n" + "=" * 60)
print("✅ ALL MODELS LOADED — Server ready!")
print(f"   📊 Question Bank: {len(question_bank.questions)} questions")
print(f"   📂 Topics: {', '.join(question_bank.get_all_topics())}")
print("=" * 60 + "\n")


# ────────────────────────────────────────────
# ENDPOINT: Health Check
# ────────────────────────────────────────────
@app.get("/health")
async def health_check():
    print("💚 Health check hit")
    return {
        "status": "ok",
        "models_loaded": ["spacy", "sentence-transformers", "keybert"],
        "question_bank_size": len(question_bank.questions)
    }


# ────────────────────────────────────────────
# ENDPOINT: ATS Score Calculation
# ────────────────────────────────────────────
@app.post("/calculate_weighted_score")
async def calculate_weighted_score(data: dict):
    """Calculate ATS score for a resume against a job description."""
    jd = data.get("jd", "")
    resume_raw = data.get("resume", "")
    return calculate_ats_score(jd, resume_raw, model=st_model, nlp=nlp)


# ────────────────────────────────────────────
# ENDPOINT: Extract JD Keywords Only
# ────────────────────────────────────────────
@app.post("/extract_keywords")
async def extract_keywords_endpoint(data: dict):
    """Extract top keywords from a job description using KeyBERT."""
    jd_text = data.get("jd", "")
    if not jd_text or not jd_text.strip():
        print("❌ ERROR: JD text is empty")
        return {"error": "Job description (jd) is required", "keywords": []}

    top_n = data.get("top_n", 8)
    keywords = extract_jd_keywords(kw_model, jd_text, top_n=top_n)

    return {
        "keywords": [{"keyword": kw, "score": round(score, 4)} for kw, score in keywords]
    }


# ────────────────────────────────────────────
# ENDPOINT: Select Questions for Interview
# ────────────────────────────────────────────
@app.post("/select_questions")
async def select_questions_endpoint(data: dict):
    """
    Full pipeline: JD → keyword extraction → semantic question selection.
    
    Request body:
        jd: Job description text (required)
        num_questions: Number of questions to select (default: 5)
        difficulty: "Easy" | "Intermediate" | "Advanced" | null for progressive
    
    Response:
        keywords: extracted JD keywords with scores
        selected_questions: ranked questions from dataset
        total_dataset_size: size of question bank
    """
    jd_text = data.get("jd", "")
    if not jd_text or not jd_text.strip():
        print("❌ ERROR: JD text is empty")
        return {"error": "Job description (jd) is required", "selected_questions": []}

    num_questions = data.get("num_questions", 5)
    difficulty = data.get("difficulty", None)

    print(f"\n📥 /select_questions called — num={num_questions}, difficulty={difficulty or 'progressive'}")

    result = get_questions_for_jd(
        jd_text=jd_text,
        model=st_model,
        kw_model=kw_model,
        question_bank=question_bank,
        num_questions=num_questions,
        difficulty=difficulty
    )

    return result


# ────────────────────────────────────────────
# RUN SERVER
# ────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting AI Interview Python Server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)