with open('.github/workflows/schoolos-pipeline.yml', 'r') as f:
    c = f.read()
c = c.replace(
    "-x realtime,storage-api,edge-runtime,studio,postgres-meta,mailpit,imgproxy,logflare,vector,supavisor",
    "-x realtime -x storage-api -x edge-runtime -x studio -x postgres-meta -x mailpit -x imgproxy -x logflare -x vector -x supavisor"
)
with open('.github/workflows/schoolos-pipeline.yml', 'w') as f:
    f.write(c)
