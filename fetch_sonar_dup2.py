import urllib.request
import json

url = 'https://sonarcloud.io/api/measures/component_tree?component=krishbindal_ERP-1&pullRequest=18&metricKeys=new_duplicated_lines_density'
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    print(json.dumps(data, indent=2))
