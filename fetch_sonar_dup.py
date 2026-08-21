import urllib.request
import json

url = 'https://sonarcloud.io/api/duplications/show?key=krishbindal_ERP-1&pullRequest=18'
# This endpoint requires a file key. Let's find duplicated files first.

url2 = 'https://sonarcloud.io/api/measures/component_tree?component=krishbindal_ERP-1&pullRequest=18&metricKeys=new_duplicated_lines_density&qualifiers=FIL'
req = urllib.request.Request(url2)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    for comp in data.get('components', []):
        for msr in comp.get('measures', []):
            if msr.get('metric') == 'new_duplicated_lines_density' and float(msr.get('period', {}).get('value', 0)) > 0:
                print(f"{comp['key']}: {msr['period']['value']}%")
