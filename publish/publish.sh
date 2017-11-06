#!/bin/bash

PACK_DIR=package;
TO_SOURCE_DIR=src;

publish() {
    ## cd $PACK_DIR
    ## echo 'Publishing to npm...'
    ## npm publish *.tgz

    cd $TO_SOURCE_DIR
    echo 'Publishing to npm...'
    npm publish
}

./pack.sh && publish
