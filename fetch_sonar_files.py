import urllib.request
import json

url = 'https://sonarcloud.io/api/duplications/show?key=krishbindal_ERP-1:apps/web/src/app/scheduling/substitutions/page.tsx&pullRequest=18'
try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        print("substitutions/page.tsx duplication: ", len(json.loads(response.read().decode()).get('duplications', [])))
except Exception:
    pass

url = 'https://sonarcloud.io/api/duplications/show?key=krishbindal_ERP-1:apps/web/src/app/scheduling/timetable/page.tsx&pullRequest=18'
try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        print("timetable/page.tsx duplication: ", len(json.loads(response.read().decode()).get('duplications', [])))
except Exception:
    pass

url = 'https://sonarcloud.io/api/duplications/show?key=krishbindal_ERP-1:apps/web/src/app/scheduling/substitutions/components/SubstitutionForm.tsx&pullRequest=18'
try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        print("SubstitutionForm.tsx duplication: ", len(json.loads(response.read().decode()).get('duplications', [])))
except Exception:
    pass
    
url = 'https://sonarcloud.io/api/duplications/show?key=krishbindal_ERP-1:apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx&pullRequest=18'
try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        print("TimetableEntryForm.tsx duplication: ", len(json.loads(response.read().decode()).get('duplications', [])))
except Exception:
    pass
