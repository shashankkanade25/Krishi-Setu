# 🌾 KrishiSetu - Full Stack Agri-Commerce Platform with DevSecOps, GitOps & Kubernetes
<img width="2760" height="1304" alt="image" src="https://github.com/user-attachments/assets/f4e6e5b2-2074-4ea0-b39e-be4ef2469571" />


### Empowering Farmers Through Technology • From Research Paper to Production Deployment

KrishiSetu is a full-stack agri-commerce platform that connects farmers directly with customers, eliminating middlemen. Farmers can register, list and manage their products, while customers can browse, search, and purchase fresh produce through the web or mobile application. An admin panel is provided to manage users, products, and platform activities. The application is deployed on AWS using Docker, Docker Compose, Jenkins CI/CD, Nginx, and HTTPS, making it production-ready.

---

# 🏆 Project Highlights

### 🔬 Research to Real Product

Published Research Paper: https://tinyurl.com/publish-paper

**"Digital Agriculture in Action: Krishi-Setu as a Model for Farmer-to-Consumer Platforms"**

Rather than stopping at theoretical research, the proposed solution was transformed into a fully functional software product and deployed on cloud infrastructure.

---

# ✨ Project Highlights

### 🌐 Full Stack Platform

- 👨‍🌾 Farmer Dashboard
- 🛒 Customer Marketplace
- 👨‍💼 Admin Dashboard
- 🔐 Authentication & Authorization
- 📦 Product & Inventory Management
- 🔍 Search & Filtering

---

### 📱 Mobile Application

- ⚛️ Built with React Native & Expo
- 📱 Cross-platform Experience
- 🛍️ Mobile Marketplace
- 🌾 Farmer Accessibility

---

### ☁️ Cloud & DevOps

- 🐳 Docker & Docker Compose
- ☁️ AWS EC2 Deployment
- ⚙️ Jenkins CI Pipeline
- 📦 Docker Hub Registry
- 🌐 Nginx Reverse Proxy
- 🔒 HTTPS with Let's Encrypt
---

# 🌍 Live Deployments

### Production Environment (AWS + Nginx + HTTPS)

https://krishisetu.duckdns.org

### Mobile Application

https://expo.dev/accounts/shashankkanade25/projects/krishisetu/builds/c3efadb5-b18b-41b1-85a9-dec41f0c7e8b

### Source Code

https://github.com/shashankkanade25/Krishi-Setu

---

# 🏗️ Enterprise-Style Architecture

<img width="1536" height="1024" alt="Krishisetu_architecture 12" src="https://github.com/user-attachments/assets/a16aa1c2-33fb-4ee0-aab2-5ef006ea836b" />


---

## ⚙️ Automated CI/CD Pipeline

GitHub Repository
│
▼
Jenkins Pipeline
│
▼
Docker Image Build
│
▼
Docker Hub Registry
│
▼
AWS EC2 Deployment
│
▼
Production Environment

This pipeline automates:

✔ Source Code Integration

✔ Docker Image Creation

✔ Docker Registry Publishing

✔ Automated Deployment Workflow

✔ Infrastructure Consistency

---

# 🛠️ Technology Stack

<div align="center">

| Category | Technologies |
|:---------|:-------------|
| 🎨 **Frontend** | <p align="center"><img src="https://skillicons.dev/icons?i=react,html,css,js" /><br><sub><b>React • HTML5 • CSS3 • JavaScript</b></sub></p> |
| 📱 **Mobile** | <p align="center"><img src="https://skillicons.dev/icons?i=react" height="48"/><br><sub><b>React Native • Expo</b></sub></p> |
| ⚙️ **Backend** | <p align="center"><img src="https://skillicons.dev/icons?i=nodejs,express" /><br><sub><b>Node.js • Express.js • REST APIs</b></sub></p> |
| 🗄️ **Database** | <p align="center"><img src="https://skillicons.dev/icons?i=mongodb" /><br><sub><b>MongoDB • Mongoose</b></sub></p> |
| ☁️ **Cloud & DevOps** | <p align="center"><img src="https://skillicons.dev/icons?i=aws,docker,linux,nginx" /><br><sub><b>AWS EC2 • Docker • Ubuntu • Nginx</b></sub><br><sub><b>Docker Compose • SSL/TLS • Let's Encrypt</b></sub></p> |
| 🚀 **CI/CD** | <p align="center"><img src="https://skillicons.dev/icons?i=jenkins,docker" /><br><sub><b>Jenkins • Docker Hub</b></sub></p> |
| 🌿 **Version Control** | <p align="center"><img src="https://skillicons.dev/icons?i=git,github" /><br><sub><b>Git • GitHub</b></sub></p> |

</div>

---

# 🚀 Evolution to Production DevSecOps & GitOps Platform

KrishiSetu evolved beyond a traditional Docker deployment into a production-inspired **Cloud Native DevSecOps & GitOps platform**.

Instead of manually deploying containers, the project now follows an automated software delivery workflow where **every Git commit is validated, secured, versioned, and deployed through GitOps**.

---

# 🔐 DevSecOps Pipeline

The CI pipeline was redesigned following modern DevSecOps principles where security checks are integrated directly into the software delivery lifecycle.

## Pipeline Workflow

```text
Developer
    │
Git Push
    │
    ▼
GitHub Repository
    │
GitHub Webhook
    │
    ▼
Jenkins Pipeline
    │
    ├── Source Code Checkout
    ├── SonarQube Static Code Analysis
    ├── Docker Image Build
    ├── Trivy Vulnerability Scan
    ├── Docker Image Versioning
    └── Docker Hub Push
```
---

# 📸 DevSecOps Pipeline Screenshots

## Jenkins CI Pipeline


<p align="center">
<img src="https://github.com/user-attachments/assets/5f723910-9cd0-47d4-ada6-0b1b441eea18" width="2836" height="1716" />
</p>

---

## SonarQube Code Quality Analysis


<p align="center">
<img src="https://github.com/user-attachments/assets/6dd61a38-e5f3-44a5-a438-1e9ce9a6951c"  width="2862" height="1628"/>

</p>


---

# ☸️ GitOps Continuous Deployment

After completing the CI pipeline, the deployment architecture was redesigned using **GitOps principles**.

Rather than allowing Jenkins to deploy directly into Kubernetes, Git became the **single source of truth**, while **Argo CD continuously synchronized the cluster with the desired state stored in Git.**

---

# ⚙️ GitOps Workflow

Every source code change automatically follows the workflow below:

<img width="1758" height="388" alt="image" src="https://github.com/user-attachments/assets/d04ceb7a-19ee-4606-a1e9-510d5470c0ba" />


No manual deployment commands are required.

The Kubernetes cluster is always synchronized with the desired state defined in Git.

---

# ☸️ Kubernetes & GitOps Deployment

KrishiSetu is deployed on a **Kind Kubernetes Cluster** using a production-inspired GitOps workflow. Deployment is fully automated through **Helm** and **Argo CD**, enabling consistent, declarative, and version-controlled application releases.

---

## 🚀 Kubernetes Implementation

| Feature | Implementation |
|:--------|:---------------|
| ☸️ Workload Management | Deployments, ReplicaSets & Pods |
| 🌐 Networking | Services & Ingress |
| ⚙️ Configuration | ConfigMaps & Secrets |
| ❤️ Reliability | Liveness & Readiness Probes |
| 📈 Resource Management | CPU & Memory Requests/Limits |
| 🔄 Deployment Strategy | Rolling Updates & Rollbacks |
| ♻️ Resiliency | Self-Healing Deployments |

---

## 📦 Helm

Helm is used to package and manage Kubernetes resources through reusable and parameterized charts.

**Highlights**

- 📦 Reusable Helm Charts
- ⚙️ Centralized Configuration
- 🏷️ Image Tag Management
- 🔄 Simplified Application Releases
- 📁 Version-Controlled Deployments

---

## 🚀 GitOps with Argo CD

Argo CD continuously monitors the GitOps repository and synchronizes the Kubernetes cluster with the desired state defined in Git.

**GitOps Features**

- 🔄 Automatic Synchronization
- ♻️ Self-Healing
- 🔍 Drift Detection
- 🚀 Rolling Deployments
- 📂 Declarative Infrastructure

---

# 📸 GitOps Platform Screenshots

## Argo CD Dashboard

<p align="center">
<img src="https://github.com/user-attachments/assets/31d8dc7b-e53a-451d-a30d-0c971c85a369" />
</p>

---

# 🏗️ Engineering Challenges Solved

<div align="center">

| ☁️ Cloud & Linux | ⚙️ CI/CD | 🔐 DevSecOps | ☸️ Kubernetes & GitOps |
|:----------------:|:--------:|:------------:|:----------------------:|
| AWS EC2 Memory Optimization | Jenkins Pipeline Debugging | SonarQube Integration | Helm Chart Development |
| OOM Killer Resolution | GitHub Webhooks | Trivy Security Scanning | Kubernetes Networking |
| Docker Permission Issues | Docker Hub Authentication | Secure Image Workflow | Ingress Configuration |
| Linux Administration | CI Pipeline Automation | | Argo CD Synchronization |
| | | | GitOps Automation |
| | | | Rolling Deployments |
| | | | Resource Troubleshooting |

</div>

<p align="center">
<i>Resolved through hands-on debugging, infrastructure optimization, and production-style DevSecOps & GitOps practices.</i>
</p>

---

# 🎯 Skills Demonstrated

<table>
<tr>
<td>

### Cloud

- AWS EC2
- Ubuntu Linux
- Docker
- Docker Hub

</td>

<td>

### DevOps

- Jenkins
- CI/CD
- Shell Scripting
- GitHub Webhooks

</td>
</tr>

<tr>
<td>

### DevSecOps

- SonarQube
- Trivy
- Secure Pipelines
- Docker Security

</td>

<td>

### GitOps

- Kubernetes
- Helm
- Argo CD
- Declarative Deployments

</td>
</tr>
</table>

---

# ⭐ Project Outcome

KrishiSetu demonstrates the complete software delivery lifecycle—from research and application development to production-inspired DevSecOps and GitOps deployment.

The project showcases practical experience with building secure CI pipelines, automating container delivery, implementing GitOps workflows, managing Kubernetes deployments, and troubleshooting real infrastructure issues encountered during development.


---

# 👨‍💻 About the Developer

<div align="center">

## Shashank Kanade

**Computer Engineering Student • Full Stack Developer • Cloud & DevOps Enthusiast • SRE Aspirant**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github)](https://github.com/shashankkanade25)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/shashank-kanade25)

</div>

---

## 💡 Skills Demonstrated

<div align="center">

`Full Stack Development` • `React Native` • `Cloud Computing` • `DevOps` • `DevSecOps` • `GitOps` • `CI/CD` • `Docker` • `Kubernetes` • `Helm` • `Jenkins` • `Linux` • `AWS` • `Nginx` • `MongoDB` • `System Design` • `Deployment Automation`

</div>

---

<p align="center">

Made with ❤️ by **Shashank Kanade**

</p>
