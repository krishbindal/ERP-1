import urllib.request
import json

url = 'https://sonarcloud.io/api/issues/search?projectKeys=krishbindal_ERP-1&pullRequest=18&facets=files&ps=1'
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    print(json.dumps(data.get('facets', []), indent=2))
