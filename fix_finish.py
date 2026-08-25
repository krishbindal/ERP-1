import os
with open('supabase/tests/database/09_communication.test.sql', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove the appended text
text = text.split('-- 7. Resolution Logic Tests')[0]

# And insert it right before SELECT * FROM finish();
insertion = """-- 7. Resolution Logic Tests
SELECT results_eq(
    'SELECT unnest(public.fn_resolve_message_recipients(''00000000-0000-0000-0000-000000000000''))',
    ARRAY[]::UUID[],
    'Resolution function handles missing messages safely'
);
"""

text = text.replace('SELECT * FROM finish();', insertion + '\nSELECT * FROM finish();')
text = text.replace('SELECT plan(21);', 'SELECT plan(22);')

with open('supabase/tests/database/09_communication.test.sql', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
