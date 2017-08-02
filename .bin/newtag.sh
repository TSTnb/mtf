#!/usr/bin/env bash
existing_tag="$(echo "${1}" | sed -e 's/\([0-9]\)\.\([0-9]\)\.\([0-9]\)/\1\\.\2\\.\3/g')";
new_tag="${2}";
find . -type f -iname "*.js*" -exec sed -i -e 's/[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}/'$(date +'%Y-%m-%d')'/g' {} \;
find . -type f -iname "*.js*" -exec sed -i -e 's/'"${existing_tag}"'/'"${new_tag}"'/g' {} \;

sed -i -e 's/[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}/'$(date +'%Y-%m-%d')'/g' README.md
sed -i -e 's/'"${existing_tag}"'/'"${new_tag}"'/g' README.md;
