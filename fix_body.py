import os
for fpath in ['apps/web/e2e/storage.spec.ts', 'apps/web/src/app/communication/new/page.tsx', 'apps/web/src/app/communication/actions.ts', 'apps/web/src/app/communication/inbox/page.tsx']:
    with open(fpath, 'r', encoding='utf-8') as f:
        text = f.read()
    if fpath == 'apps/web/src/app/communication/actions.ts':
        text = text.replace("const content = formData.get('content')", "const body = formData.get('content')")
        text = text.replace("subject,\n      content,", "subject,\n      body,")
    elif fpath == 'apps/web/e2e/storage.spec.ts':
        text = text.replace("content: 'This is a test',", "body: 'This is a test',")
    elif fpath == 'apps/web/src/app/communication/inbox/page.tsx':
        text = text.replace('content', 'body')
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(text)
print("done")
