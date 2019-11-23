#!/usr/bin/env bash

export CODE_TESTS_PATH="$(pwd)/client/out/test"
# export CODE_TESTS_WORKSPACE="$(pwd)/client/testFixture"
export CODE_TESTS_WORKSPACE="$(pwd)/server/tests/project-stub"

node "$(pwd)/client/node_modules/vscode/bin/test"