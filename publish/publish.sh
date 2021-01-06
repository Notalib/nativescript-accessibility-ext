#!/bin/bash
set -e

PACK_DIR=package;
TO_SOURCE_DIR=src;

publish() {
    cd $PACK_DIR
    echo 'Publishing to npm...'
    npm publish --tag nativescript6 *.tgz
}

./pack.sh && publish
