#!/bin/sh

FILE='spotishush.zip'

echo "Packing extension into ZIP file: ${PWD}/${FILE}"

zip -FS "${FILE}" -r 'img/' '_locales/' 'manifest.json' 'spotishush.js' 'background.js'
