import sys
import json
import os

def main():
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw else {}
    except Exception:
        payload = {}

    transcript_path = payload.get('transcriptPath')
    project_ended = False

    if transcript_path and os.path.exists(transcript_path):
        try:
            with open(transcript_path, 'r', encoding='utf-8', errors='ignore') as f:
                for line in f:
                    try:
                        data = json.loads(line)
                        if data.get('type') == 'USER_INPUT' and 'ET BEN BRAVO!' in data.get('content', ''):
                            project_ended = True
                            break
                    except Exception:
                        if 'ET BEN BRAVO!' in line:
                            project_ended = True
                            break
        except Exception:
            pass

    if project_ended:
        res = {
            "decision": "ask",
            "reason": "Project marked as completed following the 'ET BEN BRAVO!' trigger."
        }
    else:
        res = {
            "decision": "allow",
            "reason": "Full autonomous execution permanently granted until explicit keyword 'ET BEN BRAVO!'."
        }

    print(json.dumps(res))

if __name__ == '__main__':
    main()
