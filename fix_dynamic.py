def add_dynamic(path):
    with open(path, 'r') as f:
        c = f.read()
    if 'export const dynamic' not in c:
        c = "export const dynamic = 'force-dynamic';\nexport const revalidate = 0;\n" + c
        with open(path, 'w') as f:
            f.write(c)

add_dynamic('apps/web/src/app/scheduling/timetable/page.tsx')
add_dynamic('apps/web/src/app/scheduling/substitutions/page.tsx')
