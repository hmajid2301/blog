import os
from pathlib import Path
import subprocess

d = "content/posts"
for path in os.listdir(d):
    full_path = os.path.join(d, path)
    if os.path.isdir(full_path):

        Path(f"{full_path}/images").mkdir(parents=True, exist_ok=True)
        generate_og = f"tcardgen -c scripts/og/config.yaml --template=scripts/og/template.png -f scripts/og/fonts/ {full_path}/index.md -o {full_path}/images/cover.png"
        print(full_path)
        print(subprocess.Popen(generate_og, shell=True, stdout=subprocess.PIPE).stdout.read())
        print("\n\n")
