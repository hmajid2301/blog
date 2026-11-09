#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

port="${PORT:-8767}"
if [[ ! "$port" =~ ^[0-9]+$ ]] || (( port < 1 || port > 65535 )); then
  echo "PORT must be between 1 and 65535" >&2
  exit 1
fi
output="$(mktemp -d "${TMPDIR:-/tmp}/blog-design-lab.XXXXXX")"
trap 'rm -rf -- "$output"' EXIT
base="http://127.0.0.1:$port"
hugo --config hugo.toml,hugo-design-lab.toml --environment development \
  --baseURL "$base/" --destination "$output"
hugo --config hugo-slides.toml,hugo-design-lab.toml,hugo-design-lab-slides.toml \
  --environment development --baseURL "$base/slides/" --destination "$output/slides"

# Slidev presentations keep their published designs; this demo does not rebuild them.
for deck in go-labs-eda-go-kafka python-to-go-concurrency; do
  mkdir -p "$output/slides/$deck"
  printf '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=https://haseebmajid.dev/slides/%s/"><title>Open published presentation</title><a href="https://haseebmajid.dev/slides/%s/">Open published presentation</a>\n' "$deck" "$deck" > "$output/slides/$deck/index.html"
done
printf '\nDesign demo: %s/\nUse the toolbar to customise. Ctrl+C stops the demo.\n\n' "$base"
python3 -m http.server "$port" --bind 127.0.0.1 --directory "$output"
