import re

with open("apps/web/src/lib/attendance/actions.test.ts", "r") as f:
    ts = f.read()

# Right now the mock for `rpc` is probably at the top. Let's see what it is.
