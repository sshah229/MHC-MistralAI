import sys
import json
import os
from mistralai import Mistral

api_key = os.environ.get("MISTRAL_API_KEY", "your-mistral-api-key-here")
client = Mistral(api_key=api_key)

messages = []
for data in sys.argv[1:]:
    messages.append(json.loads(data))

response = client.chat.complete(
    model="mistral-large-latest",
    messages=messages,
    temperature=0.7,
    max_tokens=800,
)
print(response.choices[0].message.content)
