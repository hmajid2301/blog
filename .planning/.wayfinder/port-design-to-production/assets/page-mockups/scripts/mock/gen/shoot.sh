#!/bin/sh
# usage: shoot.sh page alt...
page=$1; shift
for a in "$@"; do /tmp/mock/shoot /mockups/$page/$a/ /tmp/mock/$page-$a >/dev/null 2>&1; for m in light dark mobile; do magick /tmp/mock/$page-$a-$m.png -resize 900x /tmp/mock/s-$page-$a-$m.png; done; done
