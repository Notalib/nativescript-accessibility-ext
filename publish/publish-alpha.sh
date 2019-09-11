#!/bin/bash
set -e

PACK_DIR=package;
TO_SOURCE_DIR=src;

publish() {
    cd $PACK_DIR
    echo 'Publishing to npm...'
    npm publish *.tgz --tag alpha
}

./pack.sh && publish
