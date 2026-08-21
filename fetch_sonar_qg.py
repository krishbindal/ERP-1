import urllib.request
import json

url = 'https://sonarcloud.io/api/qualitygates/project_status?projectKey=krishbindal_ERP-1&pullRequest=18'
req = urllib.request.Request(url)

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")
