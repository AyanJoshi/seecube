#! /bin/bash
line=$(diff - "$1" "$2" | awk '{print $NF}')
if [ ! -z $line ]; then
    awk -v file="$1" -v line=$line 'NR==line{print "Expected: "$0; exit}' "$1"
    awk -v file="$2" -v line=$line 'NR==line{print "Your Output: "$0; exit}' "$2"
 fi
