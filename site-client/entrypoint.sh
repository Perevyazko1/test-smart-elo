#!/bin/sh
set -e

echo "Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed"
    exit 1
fi

echo "Starting Next.js application..."
npm start
