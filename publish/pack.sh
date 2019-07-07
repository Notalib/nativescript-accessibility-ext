#!/bin/bash
set -e

wd() {
    cd $(dirname $0)
    echo $PWD
}

install(){
    npm i
}

WORKDIR=$(wd)
SOURCE_DIR="${WORKDIR}/../src";
TO_SOURCE_DIR="${WORKDIR}/src";
PACK_DIR="${WORKDIR}/package";
ROOT_DIR="${WORKDIR}/..";
PUBLISH=--publish

cd $WORKDIR;

pack() {
    echo "Clearing ${TO_SOURCE_DIR} and ${PACK_DIR}..."
    cd "${WORKDIR}"
    npx rimraf "${PACK_DIR}"

    # copy src
    echo 'Copying src...'
    rsync -aP \
        --delete \
        --delete-excluded \
        --exclude node_modules \
        --exclude hooks \
        --exclude "*.js" \
        --exclude "*.map" \
        --exclude "*.css" \
        --exclude "*.metadata.json" \
         "${SOURCE_DIR}/" \
         "${ROOT_DIR}/LICENSE" \
         "${ROOT_DIR}/README.md" \
         "${TO_SOURCE_DIR}/"

    # compile package and copy files required by npm
    echo 'Building /src...'
    cd "${TO_SOURCE_DIR}"
    npm ci
    npm run lint
    npm run build
    cd "${WORKDIR}"

    echo 'Creating package...'
    # create package dir
    mkdir "${PACK_DIR}"

    npx json -e "delete this.private" \
        -e "delete this.scripts" \
        -e "delete this.devDependencies" \
        -I -f "${TO_SOURCE_DIR}"/package.json

    # create the package
    cd "${PACK_DIR}"
    npm pack "${TO_SOURCE_DIR}"

    # delete source directory used to create the package
    cd "${WORKDIR}"
    npx rimraf "${TO_SOURCE_DIR}"
}

install && pack
