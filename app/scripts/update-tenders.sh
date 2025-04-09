#!/bin/zsh

# Set the full path to your project
PROJECT_DIR="/Users/alexander/code/sa-tender"
LOG_DIR="$PROJECT_DIR/app/scripts/logs"
LOG_FILE="$LOG_DIR/tenders-update.log"

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
    echo "Starting tender update at $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Current directory: $(pwd)"
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
} | tee -a "$LOG_FILE"

# Run the update script and log output
if node app/scripts/updateTenders.js 2>&1 | tee -a "$LOG_FILE"; then
    echo "Update completed successfully at $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
else
    echo "Update failed at $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
    exit 1
fi

echo "" | tee -a "$LOG_FILE"  # Add a blank line for spacing

# Ensure execute permissions: ls -l /Users/alexander/code/tender/app/scripts/update-tenders.sh
# If not executable, set permissions with: chmod +x /Users/alexander/code/tender/app/scripts/update-tenders.sh
# crontab -e
# 0 0 * * * /Users/alexander/code/tender/app/scripts/update-tenders.sh
# script runs everyday at midnight
# crontab -l