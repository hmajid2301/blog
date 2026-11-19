#!/usr/bin/env bash
# Fetch the licensed MonoLisa webfont from the private nixicle-assets repo into
# static/fonts/monolisa/ (gitignored). The EULA forbids committing it to this public repo.
#
# CI: authenticates with CI_JOB_TOKEN (blog is on nixicle-assets' job token allowlist).
# Local: uses your SSH key. Without access the site falls back to ui-monospace.
set -euo pipefail

dest="static/fonts/monolisa"
ref="${MONOLISA_REF:-main}"
if [ -n "${CI_JOB_TOKEN:-}" ]; then
  repo="https://gitlab-ci-token:${CI_JOB_TOKEN}@gitlab.com/hmajid2301/nixicle-assets.git"
else
  repo="git@gitlab.com:hmajid2301/nixicle-assets.git"
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

if ! git clone --quiet --depth 1 --branch "$ref" --filter=blob:none --sparse "$repo" "$tmp/assets"; then
  echo "fetch-monolisa: cannot reach nixicle-assets; building with fallback monospace font" >&2
  [ -n "${CI:-}" ] && exit 1
  exit 0
fi
git -C "$tmp/assets" sparse-checkout set fonts/MonoLisa-web

rm -rf "$dest"
mkdir -p "$dest"
cp -r "$tmp/assets/fonts/MonoLisa-web/." "$dest/"
echo "fetch-monolisa: $(find "$dest" -name '*.woff2' | wc -l) woff2 files -> $dest"
