import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

def calculate_financial_score(summary):
    score = 0

    savings_percent = summary["savings_percent"]
    total_income = summary["total_income"]
    total_expense = summary["total_expense"]

    # Savings percentage weight (50 points)
    if savings_percent >= 40:
        score += 50
    elif savings_percent >= 25:
        score += 40
    elif savings_percent >= 15:
        score += 30
    elif savings_percent >= 5:
        score += 20
    else:
        score += 10

    # Expense control weight (30 points)
    if total_expense < total_income:
        score += 30
    else:
        score += 5

    # Income existence weight (20 points)
    if total_income > 0:
        score += 20

    return min(score, 100)

def generate_financial_insight_stream(summary):

    prompt = f"""
You are an AI Financial Copilot for an Indian user.

All currency values are in Indian Rupees (₹).
Do NOT use dollars ($).
Always display currency using ₹ symbol.

Income: ₹{summary['total_income']}
Expense: ₹{summary['total_expense']}
Savings: ₹{summary['savings']}
Savings %: {summary['savings_percent']}%

Give short practical advice.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )

    for chunk in response:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
