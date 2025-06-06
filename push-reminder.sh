#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking for unpushed changes...${NC}"

# Check if there are any unpushed commits
if git status | grep -q "Your branch is ahead of"; then
    echo -e "${YELLOW}You have unpushed commits!${NC}"
    echo -e "Current branch: $(git branch --show-current)"
    echo -e "Last commit message: $(git log -1 --pretty=%B)"
    echo -e "\n${GREEN}Would you like to push these changes now? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        git push origin $(git branch --show-current)
        echo -e "${GREEN}Changes pushed successfully!${NC}"
    else
        echo -e "${YELLOW}Remember to push your changes later!${NC}"
    fi
else
    echo -e "${GREEN}All changes are pushed!${NC}"
fi 