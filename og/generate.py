import os
from pathlib import Path
import subprocess

d = "content/posts"
for path in os.listdir(d):
    full_path = os.path.join(d, path)
    if os.path.isdir(full_path):

        Path(f"{full_path}/images").mkdir(parents=True, exist_ok=True)
        generate_og = f"tcardgen -c og/config.yaml --template=og/template.png -f og/fonts/ {full_path}/index.md -o {full_path}/images/cover.png"
        add_cover_front_matter = f"""yq --front-matter='process'  -i '.cover.image = "images/cover.png"' {full_path}/index.md"""
        print(full_path)
        print(subprocess.Popen(generate_og, shell=True, stdout=subprocess.PIPE).stdout.read())
        print(subprocess.Popen(add_cover_front_matter, shell=True, stdout=subprocess.PIPE).stdout.read())
        print("\n\n")