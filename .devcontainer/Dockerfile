ARG DENO_VERSION
FROM denoland/deno:bin-${DENO_VERSION} AS deno
FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Install Git and related tools
RUN apt-get update && apt-get install -y \
    git \
    git-lfs \
    && rm -rf /var/lib/apt/lists/*

RUN sudo apt-get update && sudo apt-get install gnupg2 -y

# Copy Deno binary
COPY --from=deno /deno /usr/local/bin/deno

# Configure Git
RUN git config --system core.autocrlf input \
    && git config --system core.eol lf \
    && git config --system credential.helper store \
    && git config --system pull.rebase false

# Set up Git credential helper
ENV GIT_CREDENTIAL_HELPER=/usr/local/bin/git-credential-helper.sh
RUN echo '#!/bin/sh\n\
if [ "$1" = "get" ]; then\n\
  if [ -n "${GITHUB_TOKEN}" ]; then\n\
    echo "protocol=https"\n\
    echo "host=github.com"\n\
    echo "username=x-access-token"\n\
    echo "password=${GITHUB_TOKEN}"\n\
  fi\n\
fi' > ${GIT_CREDENTIAL_HELPER} \
    && chmod +x ${GIT_CREDENTIAL_HELPER}
