#!/bin/bash
# Usage: bash push.sh YOUR_TOKEN
TOKEN=$1
if [ -z "$TOKEN" ]; then
  echo "Usage: bash push.sh YOUR_GITHUB_TOKEN"
  exit 1
fi
git push "https://${TOKEN}@github.com/Ardent-7322/QJan.git" main
