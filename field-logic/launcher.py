import sys
import subprocess
import urllib.parse
import os

# Configuration
VLC_PATH = r"C:\Program Files\VideoLAN\VLC\vlc.exe"
MEDIA_DIR = r"C:\Data\surveys"

def main():
    if len(sys.argv) < 2:
        print("Usage: launcher.py fieldlogic://...")
        return

    # 1. Parse URI
    # format: fieldlogic://open?file=interview_01.webm&t=15.1
    uri = sys.argv[1]
    parsed = urllib.parse.urlparse(uri)
    query = urllib.parse.parse_qs(parsed.query)

    filename = query.get('file', [''])[0]
    timestamp = query.get('t', ['0'])[0]

    if not filename:
        print("Error: No filename provided")
        return

    file_path = os.path.join(MEDIA_DIR, filename)

    # 2. Launch VLC
    # vlc "path" --start-time=X
    cmd = [VLC_PATH, file_path, f"--start-time={timestamp}"]
    
    print(f"Launching: {' '.join(cmd)}")
    subprocess.Popen(cmd)

if __name__ == "__main__":
    main()
