#!/bin/sh

# Versions
KUBESEAL_VERSION=0.27.1

# Define the location of the local tar.gz files (binaries directory)
BINARIES_DIR=$(dirname "$0")

# Detect the architecture
ARCH=$(uname -m)

# Set variables for binary files based on architecture
if [ "$ARCH" = "x86_64" ]; then
    # For amd64 architecture
    echo "Detected architecture: amd64"
    
    KUBESEAL_TAR_FILE="${BINARIES_DIR}/kubeseal-${KUBESEAL_VERSION}-linux-amd64.tar.gz"
    KUBESEAL_BINARY_NAME="kubeseal-${KUBESEAL_VERSION}-linux-amd64"
    
elif [ "$ARCH" = "aarch64" ]; then
    # For arm64 architecture
    echo "Detected architecture: arm64"
    
    KUBESEAL_TAR_FILE="${BINARIES_DIR}/kubeseal-${KUBESEAL_VERSION}-linux-arm64.tar.gz"
    KUBESEAL_BINARY_NAME="kubeseal-${KUBESEAL_VERSION}-linux-arm64"
    
else
    echo "Unsupported architecture: $ARCH"
    exit 1
fi

# Function to extract and install binaries
install_binary() {
    TAR_FILE=$1
    BINARY_NAME=$2
    TOOL_NAME=$3

    # Check if the local tar.gz file exists
    if [ ! -f "$TAR_FILE" ]; then
        echo "Error: $TAR_FILE not found."
        exit 1
    fi

    # Extract the binary
    tar -xzf "$TAR_FILE" -C /usr/local/bin/

    # Rename the extracted binary to a common name
    mv /usr/local/bin/$BINARY_NAME /usr/local/bin/$TOOL_NAME

    # Make the binary executable
    chmod +x /usr/local/bin/$TOOL_NAME

    echo "$TOOL_NAME installed successfully."
}

# Install kubeseal
install_binary "$KUBESEAL_TAR_FILE" "$KUBESEAL_BINARY_NAME" "kubeseal"
