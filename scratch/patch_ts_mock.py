import re

with open("apps/web/src/lib/attendance/actions.test.ts", "r") as f:
    ts = f.read()

# Remove the resolveInstructionalDay mock entirely since it's no longer used
ts = re.sub(r"// Mock resolveInstructionalDay\nvi\.mock\('@/lib/calendar/resolver', \(\) => \(\{\n  resolveInstructionalDay: vi\.fn\(\)\.mockImplementation\(\(date\) => \{\n    if \(date === '2026-12-25'\) return \{ instructional: false \};\n    return \{ instructional: true \};\n  \}\)\n\}\)\);\n", "", ts)

# Update the RPC mock to return the error for non-instructional date
mock_impl = """if (name === 'rpc_save_attendance') {
            if (args.p_date === '2026-12-25') {
              return { error: { message: 'Cannot record attendance on a non-instructional day' } };
            }
            if (args.p_records.length > 0 && args.p_records[0].student_id === 'unauthorized-student') {"""

ts = ts.replace("""if (name === 'rpc_save_attendance') {
            if (args.p_records.length > 0 && args.p_records[0].student_id === 'unauthorized-student') {""", mock_impl)

with open("apps/web/src/lib/attendance/actions.test.ts", "w") as f:
    f.write(ts)
