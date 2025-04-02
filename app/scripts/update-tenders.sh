#!/bin/zsh

# Log file path
LOG_FILE="/Users/alexander/code/tender/app/scripts/logs/tenders-update.log"
   

# Navigate to your project directory
cd /Users/alexander/code/tender

# Check that logs directory exists
mkdir -p /Users/alexander/code/tender/app/scripts/logs

# Run the update script and log output
echo "Starting tender update at $(date '+%Y-%m-%d %H:%M:%S')" >> $LOG_FILE
node app/scripts/updateTenders.js >> $LOG_FILE 2>&1
echo "Finished tender update at $(date '+%Y-%m-%d %H:%M:%S')" >> $LOG_FILE
echo "" >> $LOG_FILE  # Add a blank line for spacing

# Ensure execute permissions: ls -l /Users/alexander/code/tender/app/scripts/update-tenders.sh
# If not executable, set permissions with: chmod +x /Users/alexander/code/tender/app/scripts/update-tenders.sh
# crontab -e
# 0 0 * * * /Users/alexander/code/tender/app/scripts/update-tenders.sh
# script runs everyday at midnight
# crontab -l