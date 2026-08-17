import json
with open('audit.json', 'r') as f:
    data = json.load(f)

vulnerabilities = data.get('vulnerabilities', {})
for name, vuln in vulnerabilities.items():
    print(f"{name} @ {vuln.get('severity')}:")
    for via in vuln.get('via', []):
        if isinstance(via, dict):
            print(f"  - {via.get('title')} ({via.get('url')})")
        else:
            print(f"  - via {via}")
