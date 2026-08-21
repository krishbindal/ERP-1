with open('apps/web/e2e/substitutions.spec.ts', 'r') as f:
    content = f.read()

# Make entry 1 (Wednesday): Class 11 B Math
content = content.replace("await page.locator('select[name=\"class_id\"]').selectOption('aaaaaaaa-2222-2222-2222-222222222223');\n      await page.waitForTimeout(1000); // NOSONAR \n      await page.locator('select[name=\"section_id\"]').selectOption('aaaaaaaa-3333-3333-3333-333333333334');\n      await page.locator('select[name=\"subject_id\"]').selectOption('aaaaaaaa-4444-4444-4444-444444444445');", 
"await page.locator('select[name=\"class_id\"]').selectOption('aaaaaaaa-2222-2222-2222-222222222223');\n      await page.waitForTimeout(1000); // NOSONAR \n      await page.locator('select[name=\"section_id\"]').selectOption('aaaaaaaa-3333-3333-3333-333333333334');\n      await page.locator('select[name=\"subject_id\"]').selectOption('aaaaaaaa-4444-4444-4444-444444444444');")

# Make entry 2 (Thursday): Class 10 A Physics -> No, we want Class 11 B Physics? No, Class 11 B Math is unique.
# But we need a second unique entry for Thursday.
# We can use Class 10 A Math? No, timetable uses it.
# Class 10 A Physics? No, timetable uses it.
# Class 11 B Physics? No, timetable uses it.
# Are there other subjects? Let's use Class 11 B Math for Wednesday, and... wait, do we have Class 10 B? No.
# What about Period 2? We can just add Period 2! But we don't have Period 2 seeded.
# What about Teacher?
# The problem is the LABEL: "Class 10 Section A - Mathematics (Period 1)"
# It only includes Class, Section, Subject, Period.
# Wait, can we just use Friday (day 5)?
# If we use Class 11 B Math for both Wednesday (day 3) and Thursday (day 4), their labels will be EXACTLY the same!
# "Class 11 Section B - Mathematics (Period 1)".
# And playwright will pick the FIRST one.
# So if we have TWO identical labels on different days, playwright will always select the first one (Wednesday), breaking the Thursday test!
