#!/usr/bin/env bash
# Export every presenterm deck in content/slides/*/slides.md to static/slides/<name>/index.html.
# Requires presenterm + mermaid-cli from the nix dev shell.
# Skips Slidev directories (*-slidev) and decks without a presenterm config.
set -euo pipefail
shopt -s nullglob

if [ ! -f "presenterm/config.yaml" ]; then
    echo "No presenterm/config.yaml found; skipping presenterm export." >&2
    exit 0
fi

for deck in content/slides/*/slides.md; do
    name="$(basename "$(dirname "$deck")")"
    if [[ "$name" == *-slidev ]]; then
        continue
    fi
    mkdir -p "static/slides/$name"
    presenterm -c presenterm/config.yaml --export-html "$deck" --output "static/slides/$name/index.html"
done
