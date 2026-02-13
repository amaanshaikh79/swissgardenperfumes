# Deploying GoldBerg Perfumes on Render

This project is configured as a monorepo for easy deployment on Render as a single Web Service. Follow these steps to host your application.

## Prerequisites

1.  **GitHub Account**: You must have a GitHub repository with this code pushed to it.
2.  **Render Account**: Sign up at [render.com](https://render.com).
3.  **MongoDB Atlas**: Ensure you have a MongoDB connection string (URI) accessible from anywhere (whitelist IP `0.0.0.0/0` in Network Access).

## Deployment Steps

1.  **Push to GitHub**:
    -   Initialize a git repository locally if you haven't: `git init`
    -   Add all files: `git add .`
    -   Commit: `git commit -m "Initial commit"`
    -   Push to your GitHub repository.

2.  **Create New Web Service on Render**:
    -   Go to your Render Dashboard.
    -   Click **New +** -> **Web Service**.
    -   Connect your GitHub repository.

3.  **Configure Service**:
    -   **Name**: `goldberg-perfumes` (or any name)
    -   **Region**: Choose closest to you (e.g., Singapore, Frankfurt).
    -   **Branch**: `main` (or `master`)
    -   **Root Directory**: Leave empty (defaults to root).
    -   **Runtime**: `Node`
    -   **Build Command**: `npm run build`
        -   *This command installs dependencies for both server and client, and builds the React app.*
    -   **Start Command**: `npm start`
        -   *This starts the Node.js server which serves both the API and the React frontend.*

4.  **Environment Variables**:
    -   Scroll down to **Environment Variables** section and click **Add Environment Variable**.
    -   Copy the values from your `server/.env` file. You need at least these:
        -   `NODE_ENV`: `production`
        -   `MONGO_URI`: Your MongoDB connection string.
        -   `JWT_SECRET`: A secure random string.
        -   `JWT_EXPIRE`: `30d`
        -   `COOKIE_EXPIRE`: `30`
    -   Add any other variables you use (e.g., SMTP for emails, Payment keys).

5.  **Deploy**:
    -   Click **Create Web Service**.
    -   Render will start building. It may take a few minutes (installing dependencies).
    -   Once finished, you will see "Live" status and a URL (e.g., `https://goldberg-perfumes.onrender.com`).

## Troubleshooting

-   **Build Failures**: Check the logs. Ensure `npm run build` runs successfully locally.
-   **White Screen / 404**: Ensure the `client/dist` folder is being created during build. The build command `npm run build --prefix client` handles this.
-   **Database Error**: Check if your MongoDB IP Whitelist allows access from anywhere (`0.0.0.0/0`). Render IPs change dynamicallly.

## Local Testing of Production Build

To test the production setup locally before deploying:

1.  Run `npm run build` in the root directory.
2.  Set `NODE_ENV=production` in `server/.env`.
3.  Run `npm start` in the root directory.
4.  Visit `http://localhost:5000` - you should see the React app served by Express.
