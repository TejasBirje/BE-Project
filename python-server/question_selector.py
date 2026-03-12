"""
Question Selector Module
────────────────────────
Two-stage pipeline:
  1. KeyBERT extracts top keywords/skills from a Job Description
  2. Semantic search finds the most relevant questions from the dataset
     using cosine similarity on SentenceTransformer embeddings
"""

import json
import os
import numpy as np
from keybert import KeyBERT
from sklearn.metrics.pairwise import cosine_similarity


# ────────────────────────────────────────────
# DATASET LOADER & VECTORIZER
# ────────────────────────────────────────────
class QuestionBank:
    """Loads questions from JSON and pre-computes embeddings at startup."""

    def __init__(self, model, dataset_path=None):
        """
        Args:
            model: SentenceTransformer instance (shared with app.py)
            dataset_path: Path to questions_dataset.json
        """
        if dataset_path is None:
            dataset_path = os.path.join(os.path.dirname(__file__), "datasets/questions_dataset.json")

        print(f"\n🔄 Loading question dataset from: {dataset_path}")
        with open(dataset_path, "r", encoding="utf-8") as f:
            self.questions = json.load(f)
        print(f"   ✅ Loaded {len(self.questions)} questions")

        # Pre-compute embeddings for all questions (topic + question + keywords combined)
        print("🔄 Vectorizing questions with SentenceTransformer...")
        self.question_texts = []
        for q in self.questions:
            # Combine topic, question, and ideal keywords into a rich text for better matching
            combined = f"{q['topic']} {q['question']} {' '.join(q.get('ideal_keywords', []))}"
            self.question_texts.append(combined)

        self.question_vectors = model.encode(self.question_texts)
        print(f"   ✅ Vectorized {len(self.question_vectors)} questions (shape: {self.question_vectors.shape})")

    def get_all_topics(self):
        """Return unique topics in the dataset."""
        return sorted(set(q['topic'] for q in self.questions))


# ────────────────────────────────────────────
# STAGE 1: Keyword Extraction (KeyBERT)
# ────────────────────────────────────────────
def extract_jd_keywords(kw_model, jd_text, top_n=8):
    """
    Extract the most important keywords/skills from a job description using KeyBERT.

    Args:
        kw_model: KeyBERT model instance
        jd_text: Raw job description text
        top_n: Number of keywords to extract

    Returns:
        list of (keyword, score) tuples
    """
    print("\n" + "─" * 50)
    print("🔑 STAGE 1: Keyword Extraction (KeyBERT)")
    print("─" * 50)
    print(f"   JD Preview: {jd_text[:120]}...")

    keywords_with_scores = kw_model.extract_keywords(
        jd_text,
        keyphrase_ngram_range=(1, 2),
        stop_words='english',
        top_n=top_n,
        use_mmr=True,          # Maximal Marginal Relevance for diversity
        diversity=0.5          # Balance between relevance and diversity
    )

    print(f"\n   📋 Extracted {len(keywords_with_scores)} keywords:")
    for kw, score in keywords_with_scores:
        print(f"      • {kw:<25} (relevance: {score:.4f})")

    return keywords_with_scores


# ────────────────────────────────────────────
# STAGE 2: Semantic Question Selection
# ────────────────────────────────────────────
def select_questions(model, question_bank, keywords, num_questions=5, difficulty=None):
    """
    Find the most relevant questions from the dataset using semantic similarity.

    Args:
        model: SentenceTransformer instance
        question_bank: QuestionBank instance with pre-computed vectors
        keywords: list of (keyword, score) tuples from KeyBERT
        num_questions: Number of questions to return
        difficulty: Optional filter — "Easy", "Intermediate", "Advanced", or None for progressive

    Returns:
        list of question dicts with similarity scores
    """
    print("\n" + "─" * 50)
    print("🎯 STAGE 2: Semantic Question Selection")
    print("─" * 50)

    # Build query from keywords (weighted by their KeyBERT scores)
    query_parts = []
    for kw, score in keywords:
        # Repeat high-relevance keywords to boost their importance 
        repeat = max(1, int(score * 3))
        query_parts.extend([kw] * repeat)
    query_text = " ".join(query_parts)
    print(f"   🔍 Search Query: {query_text}")

    # Encode query and compute similarities
    query_vector = model.encode([query_text])
    similarities = cosine_similarity(query_vector, question_bank.question_vectors)[0]

    # Build scored question list
    scored_questions = []
    for i, q in enumerate(question_bank.questions):
        scored_questions.append({
            **q,
            "similarity": round(float(similarities[i]), 4)
        })

    # Sort by similarity (descending)
    scored_questions.sort(key=lambda x: x["similarity"], reverse=True)

    print(f"\n   📊 All questions ranked by relevance:")
    for i, q in enumerate(scored_questions[:10]):  # Show top 10 in logs
        marker = "✅" if i < num_questions else "  "
        print(f"      {marker} [{q['difficulty']:<13}] sim={q['similarity']:.4f} | {q['topic']:<15} | {q['question'][:70]}...")

    # Apply difficulty filter if specified
    if difficulty:
        scored_questions = [q for q in scored_questions if q['difficulty'] == difficulty]
        print(f"\n   🔧 Filtered to difficulty='{difficulty}': {len(scored_questions)} questions remaining")

    # If difficulty=None, use progressive difficulty: mix Easy → Intermediate → Advanced
    selected = []
    if not difficulty and num_questions >= 3:
        # Progressive: pick from each difficulty level proportionally
        difficulty_order = ["Easy", "Intermediate", "Advanced"]
        by_difficulty = {d: [q for q in scored_questions if q['difficulty'] == d] for d in difficulty_order}

        # Allocate: ~20% Easy, ~50% Intermediate, ~30% Advanced
        n_easy = max(1, int(num_questions * 0.2))
        n_advanced = max(1, int(num_questions * 0.3))
        n_intermediate = num_questions - n_easy - n_advanced

        selected.extend(by_difficulty["Easy"][:n_easy])
        selected.extend(by_difficulty["Intermediate"][:n_intermediate])
        selected.extend(by_difficulty["Advanced"][:n_advanced])

        # If we didn't get enough, fill from remaining scored questions
        selected_ids = {q['id'] for q in selected}
        for q in scored_questions:
            if len(selected) >= num_questions:
                break
            if q['id'] not in selected_ids:
                selected.append(q)

        print(f"\n   📈 Progressive difficulty: {n_easy} Easy + {n_intermediate} Intermediate + {n_advanced} Advanced")
    else:
        selected = scored_questions[:num_questions]

    # Ensure we don't exceed requested count
    selected = selected[:num_questions]

    print(f"\n   🎯 SELECTED {len(selected)} QUESTIONS:")
    for i, q in enumerate(selected):
        print(f"      {i+1}. [{q['difficulty']:<13}] [{q['topic']:<15}] sim={q['similarity']:.4f}")
        print(f"         Q: {q['question']}")

    return selected


# ────────────────────────────────────────────
# CONVENIENCE: Full Pipeline
# ────────────────────────────────────────────
def get_questions_for_jd(jd_text, model, kw_model, question_bank, num_questions=5, difficulty=None):
    """
    Complete pipeline: JD → keywords → semantic search → ranked questions.

    Args:
        jd_text: Raw job description
        model: SentenceTransformer instance
        kw_model: KeyBERT instance
        question_bank: QuestionBank instance
        num_questions: How many questions to select
        difficulty: Optional difficulty filter

    Returns:
        dict with keywords and selected questions
    """
    print("\n" + "=" * 60)
    print("📋 QUESTION SELECTION PIPELINE STARTED")
    print("=" * 60)

    # Stage 1: Extract keywords
    keywords = extract_jd_keywords(kw_model, jd_text)

    # Stage 2: Semantic search
    selected = select_questions(model, question_bank, keywords, num_questions, difficulty)

    result = {
        "keywords": [{"keyword": kw, "score": round(score, 4)} for kw, score in keywords],
        "selected_questions": [
            {
                "id": q["id"],
                "topic": q["topic"],
                "difficulty": q["difficulty"],
                "question": q["question"],
                "ideal_keywords": q.get("ideal_keywords", []),
                "similarity": q["similarity"]
            }
            for q in selected
        ],
        "total_dataset_size": len(question_bank.questions)
    }

    print(f"\n📤 PIPELINE COMPLETE — {len(selected)} questions selected from {len(question_bank.questions)} total")
    print("=" * 60 + "\n")

    return result