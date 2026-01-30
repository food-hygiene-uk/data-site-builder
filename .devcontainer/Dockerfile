ARG DENO_VERSION
FROM denoland/deno:bin-${DENO_VERSION} AS deno
FROM mcr.microsoft.com/devcontainers/typescript-node@sha256:8a013086bcf4a986186fbcb2264b6f16936be32d8b21c756a0fd7ea7d7c203d3
# 24-bookworm

# Install Git and related tools
RUN apt-get update && apt-get install -y \
  git \
  git-lfs \
  gnupg2 \
  && rm -rf /var/lib/apt/lists/*

# Copy Deno binary
COPY --from=deno /deno /usr/local/bin/deno

# Configure Git
RUN git config --system core.autocrlf input \
  && git config --system core.eol lf \
  && git config --system pull.rebase false
