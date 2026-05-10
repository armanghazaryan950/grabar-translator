import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
 
app = Flask(__name__)
CORS(app)  # թույլ է տալիս frontend-ին կապ հաստատել
 
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
 
SYSTEM_PROMPT = """You are an expert Armenian linguist and philologist specializing in Classical Armenian (Grabar) and Modern Armenian (Ashkharhabar). You have deep knowledge of the following dictionaries and use them as your primary references:
 
1. Հայկազեան բառարան (Haigazian Dictionary) – the monumental Classical Armenian dictionary by Mechitarist fathers, the gold standard for Grabar lexicography.
2. Նայիրի (Nayiri) – comprehensive modern Armenian dictionary.
3. Բողոս Գոճանեան (Boghos Kojayan) – Armenian dictionary known for precise definitions and etymology.
 
Rules:
- Be lexically precise, consulting the dictionary meanings above
- Preserve nuance, register, and tone
- For Grabar→Modern: use natural Modern Armenian, note archaic/rare words
- For Modern→Grabar: use authentic Grabar morphology and syntax
- After the translation, add a brief section called «Ծանօթութիւններ» (Notes) explaining:
  * Any notable archaic words or forms
  * Key grammatical structures specific to Grabar
  * Dictionary references where relevant
- Write the translation first, clearly separated, then the notes
- Respond entirely in Armenian script"""
 
 
@app.route("/translate", methods=["POST"])
def translate():
    if not ANTHROPIC_API_KEY:
        return jsonify({"error": "API key չկա. Սերվերի վրա ANTHROPIC_API_KEY-ը դիր։"}), 500
 
    data = request.json
    text = data.get("text", "").strip()
    direction = data.get("direction", "grabar-ashkharhabar")
 
    if not text:
        return jsonify({"error": "Տեքստ չկա"}), 400
 
    if direction == "grabar-ashkharhabar":
        src, tgt = "Classical Armenian (Grabar)", "Modern Armenian (Ashkharhabar)"
    else:
        src, tgt = "Modern Armenian (Ashkharhabar)", "Classical Armenian (Grabar)"
 
    user_message = f"Translate from {src} to {tgt}:\n\n{text}"
 
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 1500,
            "system": SYSTEM_PROMPT,
            "messages": [{"role": "user", "content": user_message}],
        },
    )
 
    if response.status_code != 200:
        return jsonify({"error": "Anthropic API-ի սխալ"}), 500
 
    result = response.json()
    translation = result["content"][0]["text"]
    return jsonify({"translation": translation})
 
 
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Գրաբար-Աշխարհաբար թարգմանիչ API"})
 
 
if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)
 
