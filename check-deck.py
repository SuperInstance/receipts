#!/usr/bin/env python3
"""Every video the deck references must exist, and every video it ships
must be referenced.

A deck that points at a missing file shows a black rectangle at exactly
the moment the audience is supposed to be paying attention, so this is a
build-time check rather than a surprise.
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(HERE, "index.html")
VIDEOS = os.path.join(HERE, "videos")

html = open(HTML, encoding="utf-8").read()
refs = re.findall(r'<video[^>]*\ssrc="([^"]+)"', html)
if not refs:
    print("FAIL: no videos referenced at all")
    sys.exit(1)

missing = [r for r in refs if not os.path.exists(os.path.join(HERE, r))]
shipped = {f"videos/{f}" for f in os.listdir(VIDEOS) if f.endswith(".mp4")}
unreferenced = shipped - set(refs)

for r in refs:
    p = os.path.join(HERE, r)
    size = os.path.getsize(p) if os.path.exists(p) else 0
    print(f"  {'ok ' if size else 'MISSING'} {r:42s} {size:>10,} B")

# A video that is present but has no <video> tag is a shipping bug.
for u in sorted(unreferenced):
    print(f"  ORPHAN {u} -- shipped but never referenced")

if missing:
    print(f"\nFAIL: {len(missing)} referenced video(s) missing")
    sys.exit(1)
if unreferenced:
    print(f"\nFAIL: {len(unreferenced)} shipped video(s) never referenced")
    sys.exit(1)
print(f"\nPASS: {len(refs)} video(s) referenced, all present, none orphaned.")
