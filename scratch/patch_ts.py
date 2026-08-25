import re

with open("apps/web/src/lib/attendance/actions.ts", "r") as f:
    ts = f.read()

# I want to remove the Calendar resolution from `saveAttendance`
# The code currently looks like:
#     // 1. Calendar resolution
#     const { data: ay, error: ayError } = ...
#     if (!dayResolution.instructional) { ... }

pattern = re.compile(r"// 1\. Calendar resolution.*?// Call atomic RPC for save", re.DOTALL)
new_ts = pattern.sub("// Call atomic RPC for save", ts)

# Also remove resolveInstructionalDay import
new_ts = new_ts.replace("import { resolveInstructionalDay } from '@/lib/calendar/resolver';\n", "")
new_ts = new_ts.replace("import { resolveInstructionalDay } from '@/lib/calendar/actions';\n", "")

with open("apps/web/src/lib/attendance/actions.ts", "w") as f:
    f.write(new_ts)
