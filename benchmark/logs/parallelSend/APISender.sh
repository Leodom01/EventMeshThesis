#!/bin/bash
#Primo parametro numero max di API al secondo
#Secondo parametro numero di secondi in cui deve lavorare
#Terzo parametro url su cui chiamare get
max="$1"
counter="$2"
echo "url: $3
rate: $max calls / second"
START=$(date +%s);

get () {
    seq 1 $1 | xargs -n1 -P 0  curl $2
}
echo START TIME: $(date)
lastRun="0"
while true
do
    echo $(($(date +%s) - START)) | awk '{print int($1/60)":"int($1%60)}'

    currentDate=$(date +%s)
    while [[ $(( currentDate - 1 )) -lt $lastRun ]];do
        currentDate=$(date +%s)
    done

    lastRun=$(date +%s)

    get $1 $3 1>/dev/null 2>/dev/null &


    (( counter-- ))
    if [[ $counter = "0" ]];then
        echo END TIME: $(date)
        exit 0
    fi

done