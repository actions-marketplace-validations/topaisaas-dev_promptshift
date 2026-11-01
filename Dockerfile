# Generated for Glama.ai & universal containerized MCP execution
# PromptShift Universal AI Rules Transpiler (https://promptshift.dev)
FROM node:22-alpine

WORKDIR /app

# Copy bin, CLI, README, LICENSE and package metadata
COPY bin /app/bin
COPY packages/cli /app/packages/cli
COPY package.json /app/package.json
COPY LICENSE /app/LICENSE
COPY README.md /app/README.md

# Secure file permissions and switch to unprivileged user
RUN chmod +x /app/bin/promptshift.js /app/packages/cli/bin/promptshift.js && chown -R node:node /app

USER node

# Production environment configuration
ENV NODE_ENV=production \
    CI=true

# Standard Model Context Protocol (MCP) JSON-RPC 2.0 STDIO Entrypoint
ENTRYPOINT ["node", "/app/bin/promptshift.js", "--mcp"]
