"""Generate the deck's three videos with MiniMax.

    python3 -m videos.mkvid

Needs MINIMAX_KEY. Writes <name>.mp4 next to this file. The prompts live in
video_jobs.json -- they are deliberately text-free, because a video model asked
to render words renders them badly.
"""
import json, os, sys, time, urllib.request
KEY=os.environ['MINIMAX_KEY']; BASE='https://api.minimax.io'  # NB: api.minimax.chat REJECTS the key (status 2049 'invalid api key')
def post(p, body):
    r=urllib.request.Request(BASE+p, data=json.dumps(body).encode(), method='POST',
      headers={'Authorization':'Bearer '+KEY,'Content-Type':'application/json'})
    return json.load(urllib.request.urlopen(r, timeout=60))
def get(p):
    r=urllib.request.Request(BASE+p, headers={'Authorization':'Bearer '+KEY})
    return json.load(urllib.request.urlopen(r, timeout=60))
JOBS = json.load(open(os.path.join(os.path.dirname(__file__), 'video_jobs.json')))
for name, prompt in JOBS.items():
    try:
        t=post('/v1/video_generation', {'model':'MiniMax-Hailuo-02','prompt':prompt,'duration':6,'resolution':'768P'})
        tid=t.get('task_id')
        print(f'  {name}: task {tid}', flush=True)
        for _ in range(80):
            time.sleep(12)
            q=get('/v1/query/video_generation?task_id='+tid)
            st=q.get('status')
            if st=='Success':
                fid=q.get('file_id')
                f=get('/v1/files/retrieve?file_id='+str(fid))
                url=f.get('file',{}).get('download_url')
                data=urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'x'}), timeout=180).read()
                open(os.path.join(os.path.dirname(__file__), f'{name}.mp4'),'wb').write(data)
                print(f'  {name}: DONE {len(data)} bytes -> /tmp/vid_{name}.mp4', flush=True)
                break
            if st in ('Fail','Error'):
                print(f'  {name}: FAILED {q}', flush=True); break
    except Exception as e:
        print(f'  {name}: error {e}', flush=True)
