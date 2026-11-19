#!/bin/sh
# Copy the licensed MonoLisa webfont from the private nixicle-assets repo into the
# Git-ignored static/fonts/monolisa/. Never fails: without it, the site falls back
# to the next font in its monospace stack (Terminal Mono, a JetBrains Mono subset).
#
# Source, in order: $NIXICLE_ASSETS, ../nixicle-assets next to this repo, or a
# shallow clone using the GitLab CI job token (project is on the allowlist).
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
targets="$root/static/fonts/monolisa"
sub=fonts/MonoLisa-web

src=""
for dir in "${NIXICLE_ASSETS:-}" "$root/../nixicle-assets"; do
  if [ -n "$dir" ] && [ -f "$dir/$sub/woff2/0-normal.woff2" ]; then
    src="$dir/$sub"
    break
  fi
done

if [ -z "$src" ] && [ -n "${CI_JOB_TOKEN:-}" ]; then
  tmp=$(mktemp -d)
  if git clone -q --depth 1 --filter=blob:none --sparse \
    "https://gitlab-ci-token:${CI_JOB_TOKEN}@gitlab.com/hmajid2301/nixicle-assets.git" "$tmp" &&
    git -C "$tmp" sparse-checkout set "$sub"; then
    src="$tmp/$sub"
  fi
fi

if [ -z "$src" ]; then
  echo "fetch-fonts: MonoLisa not available; the site uses its fallback monospace fonts." >&2
  exit 0
fi

for target in $targets; do
  rm -rf "$target"
  mkdir -p "$target"
  cp -R "$src/woff2" "$src/LICENSE.md" "$target/"
done
echo "fetch-fonts: MonoLisa copied from $src"
