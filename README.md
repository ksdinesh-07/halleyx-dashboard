# Halleyx Dashboard

## Setup & Run

### Terminal 1 — Backend
```bash
cd backend
npm install
npm run dev
```
Runs on **http://localhost:5005**

### Terminal 2 — Frontend
```bash
 cd ~/Downloads
cd "halleyx-dashboard(1)/halleyx-final/frontend"
npm install
npm start
```
Runs on **http://localhost:3000**



# Step 1 — Go to your project folder
cd ~/Downloads/halleyx-dashboard\(1\)/halleyx-final

# Step 2 — Initialize git
git init

# Step 3 — Connect to your GitHub repo
git remote add origin https://github.com/ksdinesh-07/halleyx-dashboard.git

# Step 4 — Stage all files
git add .

# Step 5 — Commit
git commit -m "refactor: replace JSON storage with SQLite, fix all bugs"

# Step 6 — Rename branch to main
git branch -M main

# Step 7 — Force push to replace old code
git push -f origin main