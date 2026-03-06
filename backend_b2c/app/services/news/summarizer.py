import google.generativeai as genai
from typing import Dict, Any, Optional
import json

from app.config import get_settings

settings = get_settings()

if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)

# The model to use. Gemini 1.5 Flash is fast and cheap, good for summarization.
MODEL_NAME = "gemini-1.5-flash"

PROMPT_TEMPLATE = """
You are a tech journalist writing for PC Lagbe, a Bangladeshi PC building platform.

Summarize this article. 
1. Create a 2-3 sentence excerpt.
2. Write a 3-paragraph body:
  - Paragraph 1: What happened (the news)
  - Paragraph 2: Why it matters for PC builders
  - Paragraph 3: Bangladesh impact (expected local pricing if applicable, availability timeline)
3. Suggest the most appropriate category for this news from the following list: [gpu, cpu, ram_storage, deals, benchmarks, bd_news]. 

Return ONLY a valid JSON object with the keys "excerpt", "body", and "category". Do not include markdown blocks like ```json.

Article title: {title}
Article URL: {source_url}
Article text: {content}

Auto-detected category (use as a hint): {hint_category}
"""

async def summarize_article(title: str, source_url: str, content: str, hint_category: str) -> Optional[Dict[str, Any]]:
    """Generates an excerpt, body, and category suggestion using Gemini."""
    if not settings.gemini_api_key:
        print("Warning: Gemini API key not configured. Skipping summarization.")
        return None
        
    prompt = PROMPT_TEMPLATE.format(
        title=title,
        source_url=source_url,
        content=content[:10000],  # Truncate content if it's too long
        hint_category=hint_category
    )
    
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Remove markdown ticks if Gemini included them despite the prompt
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        result = json.loads(text.strip())
        return result
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return None
