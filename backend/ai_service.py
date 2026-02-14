import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


def calculate_financial_score(summary):
    score = 50

    if summary["savings_percent"] >= 30:
        score += 30
    elif summary["savings_percent"] >= 20:
        score += 20
    elif summary["savings_percent"] >= 10:
        score += 10

    if summary["total_expense"] > summary["total_income"]:
        score -= 20

    return min(max(score, 0), 100)


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
