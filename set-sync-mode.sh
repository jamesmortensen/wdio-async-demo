#!/bin/sh

if [[ -z $1 ]]; then
   echo "Must run either mode.sh sync or mode.sh async..."
   exit;
fi

if [[ "$1" != "sync" ]] && [[ "$1" != "async" ]]; then
   echo "args are either sync or async..."
   exit
fi

if [[ "$1" == "sync" ]]; then
   if [[ -e ./temp/sync ]]; then
      mv temp/sync node_modules/@wdio/sync
      echo "enabling @wdio/sync mode... WARN: @wdio/sync mode is deprecated..."
   else
      echo "@wdio/sync mode already enabled..."
   fi
elif [[ "$1" == "async" ]]; then
   if [[ -e ./node_modules/@wdio/sync ]]; then
      mv node_modules/@wdio/sync temp/sync
      echo "disabling @wdio/sync mode... async mode enabled..."
   else 
      echo "@wdio/sync mode already disabled..."
   fi
else
   echo "unknown command..."
fi
