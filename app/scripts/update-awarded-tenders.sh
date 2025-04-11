#!/bin/bash

# Set up environment
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Use the full path to node
NODE_PATH="/Users/alexander/.nvm/versions/node/v22.9.0/bin/node"

# Log file
LOG_FILE="logs/awarded-tenders-update.log"

# Create logs directory if it doesn't exist
mkdir -p logs

# Log start of update
echo "============================================" >> "$LOG_FILE"
echo "Starting awarded tender update at $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "Current directory: $(pwd)" >> "$LOG_FILE"
echo "Node version: $($NODE_PATH --version)" >> "$LOG_FILE"
echo "NPM version: $($NODE_PATH -e "console.log(require('child_process').execSync('npm --version').toString())")" >> "$LOG_FILE"

# Run the update script
$NODE_PATH updateAwardedTenders.js >> "$LOG_FILE" 2>&1

# Log completion
echo "Awarded tender update completed successfully at $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Ensure execute permissions: chmod +x /Users/alexander/code/sa-tender/app/scripts/update-awarded-tenders.sh
# crontab -e
# 0 0 * * * /Users/alexander/code/sa-tender/app/scripts/update-awarded-tenders.sh
# script runs everyday at midnight
# crontab -l