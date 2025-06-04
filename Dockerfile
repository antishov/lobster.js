FROM node:22

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install only essential global development tools
RUN npm install -g http-server@latest

# Create development directory and set permissions
WORKDIR /workspace
RUN chown -R node:node /workspace

# Switch to non-root user
USER node 