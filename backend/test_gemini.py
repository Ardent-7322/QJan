from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=key)

response = client.models.generate_content(
    model="gemini-2.0-flash-lite",
    contents="Say hello in one word"
)

print(response.text)