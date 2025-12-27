#!/usr/bin/env bash
set -euo pipefail

# Install Claude if missing
if [ ! -f "$HOME/.local/bin/claude" ]; then
  curl -fsSL https://claude.ai/install.sh | bash
fi

# Ensure PATH
export PATH="$HOME/.local/bin:$PATH"

# Verify
which claude
claude --version
