#!/bin/bash

# Set up environment
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Use the full path to node
NODE_PATH="/Users/alexander/.nvm/versions/node/v22.9.0/bin/node"

# Set the full path to your project
PROJECT_DIR="/Users/alexander/code/sa-tender"
LOG_DIR="$PROJECT_DIR/app/scripts/logs"
LOG_FILE="$LOG_DIR/active-tenders-seed.log"

# Ensure we're in the correct directory
cd "$PROJECT_DIR" || {
    echo "Failed to change to project directory: $PROJECT_DIR" | tee -a "$LOG_FILE"
    exit 1
}

# Check that logs directory exists
mkdir -p "$LOG_DIR" || {
    echo "Failed to create log directory: $LOG_DIR" | tee -a "$LOG_FILE"
    exit 1
}

# Add timestamp and start message
{
    echo "============================================"
    echo "Starting active tenders database seeding at $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Current directory: $(pwd)"
    echo "Node version: $($NODE_PATH --version)"
    echo "NPM version: $($NODE_PATH -e "console.log(require('child_process').execSync('npm --version').toString())")"
} | tee -a "$LOG_FILE"

# Run active tenders seed
echo "Starting active tenders seed..." | tee -a "$LOG_FILE"
if $NODE_PATH app/scripts/seed.js 2>&1 | tee -a "$LOG_FILE"; then
    echo "Active tenders seed completed successfully at $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
    exit 0
else
    echo "Active tenders seed failed at $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
    exit 1
fi

# Ensure execute permissions: chmod +x /Users/alexander/code/sa-tender/app/scripts/initial-seed-active.sh
# Run once: /Users/alexander/code/sa-tender/app/scripts/initial-seed-active.sh
