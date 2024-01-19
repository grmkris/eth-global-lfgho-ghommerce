#!/bin/bash

if ! command -v zellij &> /dev/null
then
    echo "Zellij could not be found. Installing now..."
    curl -fsSL https://github.com/zellij-org/zellij/releases/latest/download/zellij-x86_64-unknown-linux-musl.tar.gz | tar xzv
    sudo mv zellij /usr/local/bin/
fi

zellij --layout setup.zellij.kdl
