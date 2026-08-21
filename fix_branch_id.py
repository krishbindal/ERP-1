with open('apps/web/src/app/scheduling/actions.ts', 'r') as f:
    content = f.read()

content = content.replace(".eq('id', id);", ".eq('id', id).eq('branch_id', branch_id);")

with open('apps/web/src/app/scheduling/actions.ts', 'w') as f:
    f.write(content)
