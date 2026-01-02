ARG DENO_VERSION
FROM denoland/deno:bin-${DENO_VERSION} AS deno
FROM mcr.microsoft.com/devcontainers/typescript-node:24-bookworm@sha256:634d3ffc8c37508259a23462b838fd85a9e5bb80dcdd0b31d673aa33dc4c8592

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
