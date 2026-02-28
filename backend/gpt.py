import sys
import openai
import json
p = []
for data in sys.argv[1:]:
    p.append(json.loads(data))
openai.api_type= "azure"
openai.api_base ='https://ust-d3-2023-codered.openai.azure.com/'
openai.api_version = "2023-07-01-preview"
openai.api_key = '0ec934c3a21249b48a23276a4c9b3c4c'
response = openai.ChatCompletion.create(
    engine = "UST-D3-2023-codered",
    messages = p,
    temperature = 0.7,
    max_tokens = 800,
    top_p = 0.95,
    frequency_penalty = 0,
    presence_penalty = 0,
    stop= None
)
print(response["choices"][0]["message"]["content"])