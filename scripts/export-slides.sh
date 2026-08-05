#!/usr/bin/env bash
# Export every deck in presentations/*/slides.md to static/slides/<name>/index.html.
# Requires presenterm + mermaid-cli from the nix dev shell.
set -euo pipefail

for deck in presentations/*/slides.md; do
    name="$(basename "$(dirname "$deck")")"
    mkdir -p "static/slides/$name"
    presenterm -c presenterm/config.yaml --export-html "$deck" --output "static/slides/$name/index.html"
done
