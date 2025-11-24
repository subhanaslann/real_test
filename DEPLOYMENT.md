# Sentinel Project Deployment Guide

This guide provides step-by-step instructions to deploy the Sentinel project on an Ubuntu server using Docker and Docker Compose.

## Prerequisites

*   **Ubuntu Server** (20.04 or 22.04 LTS recommended)
*   **Docker** and **Docker Compose** installed
*   **Domain Name** pointing to your server's IP address (e.g., `fluttertest.tech`)
*   **GitHub OAuth App** credentials (Client ID and Client Secret)

## 1. Server Setup

### Install Docker & Docker Compose
If you haven't installed Docker yet, run the following commands:

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker compose version
```

## 2. Project Setup

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_REPO_URL> sentinel
    cd sentinel
    ```

2.  **Configure Environment Variables:**

    You need to create `.env` files for both backend and frontend.

    **Backend (`backend/.env`):**
    ```bash
    cp backend/.env.production backend/.env
    nano backend/.env
    ```
    *   Update `DATABASE_URL` password.
    *   Update `JWT_SECRET` (generate a new one with `openssl rand -base64 32`).
    *   Update `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
    *   Ensure `FRONTEND_URL` matches your domain.

    **Frontend (`frontend/.env`):**
    ```bash
    cp frontend/.env.production frontend/.env
    nano frontend/.env
    ```
    *   Ensure `VITE_API_URL` is correct (e.g., `https://fluttertest.tech/api/v1`).

    **Root Docker Compose (`.env`):**
    Create a `.env` file in the root directory to pass secrets to `docker-compose.yml`.
    ```bash
    nano .env
    ```
    Add the following content (match values with `backend/.env`):
    ```env
    DB_PASSWORD=YourSecurePassword
    JWT_SECRET=YourSecureJWTSecret
    GITHUB_CLIENT_ID=your_github_client_id
    GITHUB_CLIENT_SECRET=your_github_client_secret
    ```

## 3. SSL Certificate Setup (First Time Only)

Since the Nginx configuration expects SSL certificates that don't exist yet, we need to follow a specific procedure to generate them.

1.  **Prepare Nginx for Challenge:**
    We will use a temporary HTTP-only configuration to allow Certbot to verify the domain.

    ```bash
    # Backup the production config
    cp frontend/nginx.conf frontend/nginx.conf.original
    
    # Use the HTTP-only config
    cp frontend/nginx.conf.http frontend/nginx.conf
    ```

2.  **Start the services:**
    ```bash
    docker compose up -d --build
    ```

3.  **Generate Certificates:**
    Run Certbot to generate the certificates. Replace `fluttertest.tech` with your actual domain.

    ```bash
    docker compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot -d fluttertest.tech -d www.fluttertest.tech
    ```
    *   Follow the prompts (enter email, agree to TOS).

4.  **Restore Production Nginx Config:**
    Once certificates are generated, restore the SSL configuration.

    ```bash
    cp frontend/nginx.conf.original frontend/nginx.conf
    ```

5.  **Restart Nginx:**
    ```bash
    docker compose restart frontend
    ```

## 4. Database Migration

Run the database migrations to set up the schema.

```bash
docker compose exec backend npx prisma migrate deploy
```

## 5. Verify Deployment

1.  Visit `https://fluttertest.tech` (or your domain).
2.  Try logging in with GitHub.
3.  Check logs if anything goes wrong:
    ```bash
    docker compose logs -f backend
    ```

## Maintenance & Updates

*   **Update Application:**
    ```bash
    git pull
    docker compose up -d --build
    docker compose exec backend npx prisma migrate deploy
    ```

*   **View Logs:**
    ```bash
    docker compose logs -f
    ```

*   **Renew Certificates:**
    The `certbot` container is configured to check for renewals every 12 hours automatically. No action is needed.

## Troubleshooting

*   **Database Connection Error:** Check if `DATABASE_URL` in `backend/.env` matches the credentials in `docker-compose.yml`. Note that inside Docker, the host is `postgres`, not `localhost`.
*   **GitHub Login 404:** Check if `GITHUB_CALLBACK_URL` in `backend/.env` matches exactly what is registered in GitHub OAuth settings.
*   **White Screen on Dashboard:** Ensure you have the latest frontend code with the safety checks we added.
