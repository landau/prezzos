#!/bin/sh

rm -rf examples
mkdir examples
cd examples

split -p "//--" ../code.js 

n=1
for file in *; do
  echo "// $n\n" > "$n.js"
  cat $file >> "$n.js"
  rm $file
  let n=$n+1
done
