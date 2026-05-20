ARG DENO_VERSION
FROM denoland/deno:bin-${DENO_VERSION} AS deno
FROM mcr.microsoft.com/devcontainers/typescript-node:24-bookworm@sha256:559126d7fc0af1e018994f832968f59bc678ba9af8ce00241801a7c79d2e7358

# Install Git and related tools
RUN apt-get update && apt-get install -y \
  git \
  git-lfs \
  gnupg2 \
  && rm -rf /var/lib/apt/lists/*

# Copy Deno binary
COPY --from=deno /deno /usr/local/bin/deno

RUN deno x --install-alias

# Configure Git
RUN git config --system core.autocrlf input \
  && git config --system core.eol lf \
  && git config --system pull.rebase false
