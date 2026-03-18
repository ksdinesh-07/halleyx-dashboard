# Halleyx Dashboard

A full stack web application for managing customer orders and visualising business analytics — built with React, Node.js, SQLite, Docker, AWS EC2, Terraform, Prometheus, and Grafana.

weblink:
        http://3.81.230.235

---

## What this project does

Halleyx Dashboard lets you create and manage customer orders through a clean table interface, and visualise your business data through a drag and drop dashboard builder. You can add charts, KPI cards, and tables to your dashboard and configure them to show exactly the data you care about.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Containerisation | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| Cloud | AWS EC2 |
| Infrastructure | Terraform |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana |
| System Metrics | Node Exporter |

---

## Project Structure
```
halleyx-dashboard/
├── backend/
│   ├── server.js              # Express API + SQLite + Prometheus metrics
│   ├── package.json
│   ├── Dockerfile
│   └── data/                  # SQLite database (auto created on first run)
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── CustomerOrders.js
│   │   │   └── DashboardConfig.js
│   │   └── components/
│   │       └── WidgetComponents.js
│   ├── Dockerfile
│   └── nginx.conf
├── terraform/
│   ├── main.tf                # EC2 + Security Group
│   ├── variables.tf
│   ├── outputs.tf
│   └── provider.tf
├── monitoring/
│   ├── prometheus.yml
│   └── alert.rules.yml
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions CI/CD pipeline
├── docker-compose.yml
└── README.md
```

---

## Features

### Customer Orders
- Create, edit, and delete customer orders
- Search and filter orders in real time
- Status tracking: Pending, In Progress, Completed
- Full form validation with floating labels
- Fixed column table with no overlap
- Auto sequential order IDs: ORD-0001, ORD-0002 and so on

### Dashboard
- Drag and drop widget builder
- Bar Chart, Line Chart, Area Chart, Pie Chart, Scatter Plot
- KPI cards with trend indicators
- Data table with filters and sorting
- Date range filter: Today, Last 7 Days, Last 30 Days, Last 90 Days
- Export chart data as CSV
- Dashboard saved per user session

---

## Running Locally

You need Node.js v18 or above and npm installed on your machine.

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
```

The backend starts on http://localhost:5005

The SQLite database is created automatically at backend/data/halleyx.db on first run.

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm start
```

The frontend opens at http://localhost:3000

Keep both terminals open at the same time. Closing either one stops the app.

---

## Running with Docker

This is the easiest way to run the complete stack including monitoring.
```bash
# Build and start all containers
docker compose up --build

# Run in background
docker compose up -d --build

# Stop everything
docker compose down

# Check running containers
docker ps
```

### What runs inside Docker

| Container | Port | Description |
|---|---|---|
| halleyx-frontend | 80 | React app served by Nginx |
| halleyx-backend | 5005 | Node.js API server |
| halleyx-prometheus | 9090 | Metrics collection |
| halleyx-grafana | 3001 | Metrics dashboard |
| halleyx-node-exporter | 9100 | Server hardware metrics |

The SQLite database is stored in a Docker named volume called sqlite_data. It persists even when containers are stopped or rebuilt.

---

## API Reference

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/orders | Get all orders |
| GET | /api/orders/:id | Get a single order |
| POST | /api/orders | Create a new order |
| PUT | /api/orders/:id | Update an existing order |
| DELETE | /api/orders/:id | Delete an order |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dashboard/:userId | Get saved dashboard layout |
| POST | /api/dashboard/:userId | Save dashboard layout |

### Other

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/session | Get or create a user session |
| GET | /metrics | Prometheus metrics endpoint |

---

## Terraform - Infrastructure as Code

Terraform automatically creates all AWS infrastructure with a single command. No clicking around in the AWS console needed.

### What Terraform creates

- One EC2 instance running Ubuntu 22.04
- One Security Group with ports 22, 80, 5005, 9090, 3001, 9100 open
- Auto installs Docker on the server
- Auto clones the GitHub repo and starts the app

### How to use it
```bash
# Install and configure AWS CLI first
aws configure

# Go to terraform folder
cd terraform

# Download required providers
terraform init

# Preview what will be created
terraform plan

# Create the infrastructure on AWS
terraform apply

# Get the server IP after creation
terraform output ec2_public_ip

# Destroy everything when done
terraform destroy
```

### Required before running

- AWS account with IAM user that has EC2 and VPC permissions
- AWS CLI installed and configured with your access keys
- EC2 key pair named halleyx-key created in AWS console
- Terraform installed on your machine

---

## GitHub Actions - CI/CD Pipeline

Every time you push code to the main branch, GitHub Actions automatically builds new Docker images, pushes them to Docker Hub, connects to your EC2 server via SSH, and restarts the containers with the latest code.

### How the pipeline works
```
You push code to GitHub
        |
GitHub Actions triggers
        |
Build backend Docker image
Build frontend Docker image
        |
Push both images to Docker Hub
        |
SSH into EC2 server
Pull latest images
Restart containers
        |
App is live with new code
```

### Secrets you need to add in GitHub

Go to your repo Settings > Secrets and variables > Actions and add these:

| Secret Name | What to put |
|---|---|
| DOCKER_USERNAME | Your Docker Hub username |
| DOCKER_PASSWORD | Your Docker Hub password |
| SERVER_HOST | EC2 public IP address |
| SERVER_USER | ubuntu |
| SERVER_SSH_KEY | Contents of your .pem key file |

---

## AWS Deployment

### Connect to your server
```bash
chmod 400 halleyx-key.pem
ssh -i halleyx-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Deploy on the server
```bash
git clone https://github.com/ksdinesh-07/halleyx-dashboard.git
cd halleyx-dashboard
docker compose up -d --build
```

### Useful server commands
```bash
# Check all containers
docker ps

# View backend logs
docker compose logs backend

# Restart everything
docker compose down && docker compose up -d

# Pull latest code and redeploy
git pull origin main && docker compose up -d --build
```

---

## Monitoring

### Access the dashboards

| Tool | URL | Login |
|---|---|---|
| App | http://YOUR_EC2_IP | - |
| Prometheus | http://YOUR_EC2_IP:9090 | - |
| Grafana | http://YOUR_EC2_IP:3001 | admin / admin123 |

### Setting up Grafana

1. Open Grafana and login with admin / admin123
2. Go to Connections > Add new connection
3. Search for Prometheus and select it
4. Set the URL to http://prometheus:9090
5. Click Save and Test
6. Go to Dashboards > New > Import
7. Enter dashboard ID 1860 and click Load
8. Select Prometheus as the data source and click Import

### Useful Prometheus queries
```
# CPU usage percentage
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage percentage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Node.js heap used in MB
nodejs_heap_size_used_bytes / 1024 / 1024

# Disk usage percentage
(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100

# Check if all targets are up
up

# Event loop lag in milliseconds
nodejs_eventloop_lag_seconds * 1000
```

### Alert rules

The project includes pre-configured alert rules that fire when:

- CPU usage goes above 80 percent for 2 minutes
- Memory usage goes above 80 percent for 2 minutes
- Any monitored instance goes down for more than 1 minute

---

## Environment Variables

Create a .env file in the backend folder if you want to customise settings:
```
PORT=5005
NODE_ENV=production
```

---

## Common Issues

### Port already in use
```bash
sudo fuser -k 5005/tcp
sudo fuser -k 80/tcp
docker compose down
docker compose up -d
```

### Cannot connect to backend

Make sure the backend container is running:
```bash
docker ps
docker compose logs backend
```

### Prometheus target is down

Check if the backend metrics endpoint is working:
```bash
curl http://localhost:5005/metrics
```

### Git permission denied on EC2
```bash
sudo chown -R ubuntu:ubuntu ~/halleyx-dashboard
git pull origin main
```

---

## DevOps Pipeline Summary

| Phase | Tool | Status |
|---|---|---|
| Local Development | React + Node.js + SQLite | Done |
| Containerisation | Docker + Docker Compose | Done |
| Version Control | GitHub | Done |
| CI/CD Pipeline | GitHub Actions | Done |
| Cloud Infrastructure | Terraform + AWS EC2 | Done |
| Monitoring | Prometheus + Grafana | Done |

---

## Live URLs

| Service | URL |
|---|---|
| Application | http://3.81.230.235 |
| Prometheus | http://3.81.230.235:9090 |
| Grafana | http://3.81.230.235:3001 |

---

## Author

Dinesh KS
GitHub: https://github.com/ksdinesh-07

