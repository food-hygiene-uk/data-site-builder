ARG DENO_VERSION
FROM denoland/deno:bin-${DENO_VERSION} AS deno
FROM mcr.microsoft.com/devcontainers/typescript-node:24-bookworm@sha256:7958dd7e6fe4242fce6ba4f57b9de561ea82233d5542921b5335d435c2c78791

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
