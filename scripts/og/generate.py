import os
from pathlib import Path
import subprocess
import sys

def create_og_image(full_path):
    if os.path.isdir(full_path):
        Path(f"{full_path}/images").mkdir(parents=True, exist_ok=True)
        generate_og = f"tcardgen -c scripts/og/config.yaml --template=scripts/og/template.png -f scripts/og/fonts/ {full_path}/index.md -o {full_path}/images/cover.png"
        print(full_path)
        print(subprocess.Popen(generate_og, shell=True, stdout=subprocess.PIPE).stdout.read())

if sys.argv[1] == "all":
    content_path = 'content/posts/'
    for path in os.listdir(content_path):
        full_path = os.path.join(content_path, path)
        create_og_image(full_path)
        print("\n\n")
else:
    full_path = sys.argv[1]
    create_og_image(full_path)

