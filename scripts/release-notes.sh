#!/usr/bin/env bash
# Prints the CHANGELOG section for a version: scripts/release-notes.sh 2.8.0
set -euo pipefail
version="${1:?usage: release-notes.sh <version>}"
awk -v v="$version" '
  $0 ~ "^## \\[" v "\\]" { found=1; next }
  found && /^## \[/ { exit }
  found { print }
' "$(dirname "$0")/../docs/CHANGELOG.md" | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}'
