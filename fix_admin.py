import os

with open('apps/web/e2e/storage.spec.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("'teacher.a1.e2e@test.com'", "'admin.a.e2e@test.com'")
text = text.replace("'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee22'", "'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee21'")
text = text.replace("'admin.a.e2e@test.com'", "'teacher.a1.e2e@test.com'", 1) # wait, replacing first one backwards, let's just do it cleanly

with open('apps/web/e2e/storage.spec.ts', 'w', encoding='utf-8') as f:
    f.write(text)
