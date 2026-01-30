ARG DENO_VERSION
FROM denoland/deno:bin-${DENO_VERSION} AS deno
FROM mcr.microsoft.com/devcontainers/typescript-node:24-bookworm@sha256:8f198c9de37a12b7e9f75781a6cfbd2667fa652b698604594783f30c5ccf64cd

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
