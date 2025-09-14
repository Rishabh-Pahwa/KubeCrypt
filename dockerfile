# Use an official Node.js image
FROM node:20.19

# # Install bash and kubeseal
# RUN apt-get update && \
#     apt-get install -y bash curl && \
#     curl -L https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.5/kubeseal-linux-amd64 \
#     -o /usr/local/bin/kubeseal && \
#     chmod +x /usr/local/bin/kubeseal

# Copy the binaries directory and the installation script into the image
COPY binaries/ /usr/local/bin/binaries/

# Make the script executable
RUN chmod +x /usr/local/bin/binaries/install.sh

# Run the installation script to install the appropriate kubeseal binary
RUN /usr/local/bin/binaries/install.sh

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN npm install

# Build the SvelteKit app
RUN npm run build

# Expose port (from adapter-node)
EXPOSE 3000

# Start the server
CMD ["node", "build/index.js"]


