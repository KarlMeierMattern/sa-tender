#!/bin/zsh

# Set the full path to your project
PROJECT_DIR="/Users/alexander/code/sa-tender"
LOG_DIR="$PROJECT_DIR/app/scripts/logs"
ACTIVE_LOG_FILE="$LOG_DIR/active-tenders-seed.log"
AWARDED_LOG_FILE="$LOG_DIR/awarded-tenders-seed.log"

# Ensure we're in the correct directory
cd "$PROJECT_DIR" || {
    echo "Failed to change to project directory: $PROJECT_DIR" | tee -a "$ACTIVE_LOG_FILE" | tee -a "$AWARDED_LOG_FILE"
    exit 1
}

# Check that logs directory exists
mkdir -p "$LOG_DIR" || {
    echo "Failed to create log directory: $LOG_DIR" | tee -a "$ACTIVE_LOG_FILE" | tee -a "$AWARDED_LOG_FILE"
    exit 1
}

# Add timestamp and start message
{
    echo "============================================"
    echo "Starting initial database seeding at $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Current directory: $(pwd)"
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
} | tee -a "$ACTIVE_LOG_FILE" | tee -a "$AWARDED_LOG_FILE"

# Run active tenders seed first
echo "Starting active tenders seed..." | tee -a "$ACTIVE_LOG_FILE"
if node app/scripts/seed.js 2>&1 | tee -a "$ACTIVE_LOG_FILE"; then
    echo "Active tenders seed completed successfully at $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$ACTIVE_LOG_FILE"
    
    # Only proceed with awarded tenders if active tenders completed successfully
    echo "Starting awarded tenders seed..." | tee -a "$AWARDED_LOG_FILE"
    if node app/scripts/seed-awarded.js 2>&1 | tee -a "$AWARDED_LOG_FILE"; then
        echo "Awarded tenders seed completed successfully at $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$AWARDED_LOG_FILE"
        echo "All seeding completed successfully!" | tee -a "$ACTIVE_LOG_FILE" | tee -a "$AWARDED_LOG_FILE"
        exit 0
    else
        echo "Awarded tenders seed failed at $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$AWARDED_LOG_FILE"
        exit 1
    fi
else
    echo "Active tenders seed failed at $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$ACTIVE_LOG_FILE"
    exit 1
fi

# Ensure execute permissions: chmod +x /Users/alexander/code/sa-tender/app/scripts/initial-seed.sh
# Run once: /Users/alexander/code/sa-tender/app/scripts/initial-seed.sh 