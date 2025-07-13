# **AtlantaX**

![AtlantaX Banner](https://via.placeholder.com/1200x300.png?text=Welcome+to+AtlantaX) <!-- Replace with your custom banner image -->

**AtlantaX** is an exciting open-source mini-game inspired by tap-to-earn sensations like *Hamster Kombat* and *Notcoin*. Players tap to earn virtual currency, unlock upgrades, participate in events, and connect with others through squads and leaderboards. Built with modern JavaScript tools like Node.js and Bun, AtlantaX is lightweight, scalable, and perfect for both casual players and developers looking to contribute or customize.

This README provides everything you need to get started, from installation to deployment, along with opportunities to collaborate or request custom mini-game development.

---

## **Table of Contents**

- [Introduction](#introduction)
- [Features](#features)
- [Technical Stack](#technical-stack)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Installing Node.js](#installing-nodejs)
  - [Installing Bun](#installing-bun)
  - [Cloning and Setting Up the Project](#cloning-and-setting-up-the-project)
- [Deployment](#deployment)
  - [Building the Project](#building-the-project)
  - [Deploying to a Web Host](#deploying-to-a-web-host)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Custom Mini-Game Development](#custom-mini-game-development)

---

## **Introduction**

Welcome to **AtlantaX**, a mini-game that brings the addictive fun of tap-to-earn mechanics to your fingertips! Whether you're a player looking to climb the leaderboards or a developer eager to tweak and expand the game, AtlantaX offers a robust foundation. Built with community collaboration in mind, this project leverages Node.js for its backend and Bun for lightning-fast development and builds.

Our goal? To create a game that's simple to play yet rich with strategic depth—upgrades, daily rewards, and social features keep you coming back for more.

---

## **Features**

- **Tap-to-Earn Core**: Earn coins with every tap, building your virtual fortune.
- **Upgrades System**: Boost your earnings with purchasable upgrades like multipliers or auto-tappers.
- **Daily Rewards**: Log in daily for bonus coins and surprises.
- **Events**: Join time-limited challenges for exclusive rewards.
- **Squads**: Team up with friends to share bonuses and compete together.
- **Leaderboards**: See how you stack up against the global AtlantaX community.
- **Cross-Platform**: Play on web browsers, with potential for Telegram integration.

---

## **Technical Stack**

- **Frontend**: React (with Vite)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Real-Time Communication**: WebSockets (via Socket.IO)
- **Development Environment**: Node.js & npm for backend, Vite dev server for frontend.
- **Deployment Options**: Platforms supporting Node.js full-stack applications (e.g., Render, Heroku, AWS, DigitalOcean).

---

## **Installation**

Follow these detailed steps to set up AtlantaX on your local machine.

### **Prerequisites**

Ensure you have the following tools installed:

- **Git**: For cloning the repository ([Download Git](https://git-scm.com/)).
- **Node.js**: Version 18.x or higher recommended ([Download Node.js](https://nodejs.org/)). (This will include npm).
- **MongoDB**: A running MongoDB instance (local or cloud-hosted like MongoDB Atlas). ([Install MongoDB](https://www.mongodb.com/try/download/community)).
- A modern web browser (Chrome, Firefox, etc.).
- A code editor like VS Code (optional but recommended).

### **Setup Instructions**

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/AtlantaX.git # Replace yourusername if you forked
    cd AtlantaX
    ```

2.  **Configure Environment Variables (Backend)**:
    -   Navigate to the project root (`AtlantaX`).
    -   Create a `.env` file by copying the example:
        ```bash
        cp .env.example .env
        ```
        (You might need to create `.env.example` first if it doesn't exist, with `PORT` and `MONGODB_URI`)
    -   Edit the `.env` file with your settings:
        ```env
        PORT=3000
        MONGODB_URI=mongodb://localhost:27017/atlantax
        # Ensure your MongoDB server is running and accessible at this URI.
        # For MongoDB Atlas, use your Atlas connection string.
        ```
        *Note: `SESSION_SECRET` is not currently used.*

3.  **Install Backend Dependencies**:
    -   In the project root directory (`AtlantaX`):
        ```bash
        npm install
        ```

4.  **Install Frontend Dependencies**:
    -   Navigate to the `frontend` directory:
        ```bash
        cd frontend
        npm install
        cd ..
        ```
        (Return to the root directory)

---

## **Running the Application (Development)**

You'll need two terminals open to run both the backend and frontend development servers.

1.  **Start the Backend Server**:
    -   In your first terminal, from the project root (`AtlantaX`):
        ```bash
        npm run dev
        ```
    -   This will typically start the Node.js/Express server on `http://localhost:3000` (or the port specified in your `.env`).

2.  **Start the Frontend Development Server**:
    -   In your second terminal, navigate to the `frontend` directory:
        ```bash
        cd frontend
        npm run dev
        ```
    -   This will start the Vite development server, usually on `http://localhost:5173`.

3.  **Access the Application**:
    -   Open your web browser and go to `http://localhost:5173`.
    -   The frontend (running on Vite) will proxy API requests to the backend server.

---

## **Building for Production**

1.  **Build the Frontend**:
    -   Navigate to the `frontend` directory:
        ```bash
        cd frontend
        npm run build
        cd ..
        ```
        (Return to the root directory)
    -   This will create optimized static assets in the `frontend/dist` directory. The backend Express server is already configured to serve files from this location.

2.  **Backend**:
    -   The Node.js backend (`src/backend/server.js`) does not require a separate build step. It runs directly using Node.

---

## **Deployment**

Deploying a full-stack application like AtlantaX involves deploying both the Node.js backend and the React frontend assets.

**General Steps for a Platform (e.g., Render, Heroku, VPS):**

1.  **Platform Setup**:
    -   Choose a hosting platform that supports Node.js applications.
    -   Configure your platform to install dependencies using `npm install` for the root `package.json` (for backend) and then `cd frontend && npm install` for the frontend.

2.  **Build Command**:
    -   Set your platform's build command to build the React frontend. This typically involves:
        ```bash
        cd frontend && npm run build
        ```

3.  **Start Command**:
    -   Set your platform's start command to run the Node.js backend server:
        ```bash
        npm start
        ```
        (This relies on the `start` script in the root `package.json`, which should be `node src/backend/server.js`).

4.  **Environment Variables**:
    -   Set the `MONGODB_URI` (and `PORT` if necessary) environment variables on your hosting platform, similar to your local `.env` file.
    -   Ensure `NODE_ENV` is set to `production` on the hosting platform for optimizations.

5.  **Serving Frontend**:
    -   The Express backend is already configured to serve static files from `frontend/dist`. Ensure your hosting service correctly routes all non-API traffic to the Node.js server so it can serve the React app's `index.html`.

**Example (Conceptual for Render):**
-   **Build Command**: `npm install && cd frontend && npm install && npm run build`
-   **Start Command**: `node src/backend/server.js` (or `npm start` if defined in root `package.json`)

---

## **Usage**

- **Playing**: Access the game via the frontend URL (e.g., `http://localhost:5173` in development). Tap the screen to earn coins, buy upgrades, join squads, and view leaderboards.
- **Backend Development**: Modify source code in `src/backend/`. The server (`npm run dev` in root) will typically auto-restart due to `nodemon`.
- **Frontend Development**: Modify source code in `frontend/src/`. The Vite dev server (`npm run dev` in `frontend/`) provides Hot Module Replacement (HMR) for fast updates.
- **Testing**: (Placeholder for future test instructions)
  ```bash
  # Example: npm test (if tests are added to root package.json)
  # cd frontend && npm test (if tests are added to frontend package.json)
  ```

---

## **Contributing**

We’d love your help to make AtlantaX even better! Here’s how to contribute:

1. **Fork the Repo**: Click “Fork” on GitHub.
2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/yourusername/AtlantaX.git
   ```
3. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Commit Changes**:
   ```bash
   git commit -m "Add your feature description"
   ```
5. **Push and Open a Pull Request**: Share your work with us!

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## **License**

AtlantaX is released under the MIT License. Feel free to use, modify, and distribute it as you see fit. Check [LICENSE.md](LICENSE.md) for more info.

---

## **Contact**

Have questions or ideas? Reach out to us:

- **Email**: [chavariamike@gmail.com](mailto:chavariamike@gmail.com) 📧  
- **GitHub**: Open an issue on this repository 🐙  
- **Twitter**: Follow us @AtlantaXGame (optional, add if you create an account) 🐦  

---

## **Custom Mini-Game Development**

**Looking for a custom private mini-game for Telegram or another platform?**  
We’re experts in crafting unique mini-games tailored to your needs—whether it’s a branded game for your business, a community engagement tool, or a personal project. From tap-to-earn mechanics to complex RPGs, we’ve got you covered.

- **Get in Touch**: [chavariamike@gmail.com](mailto:chavariamike@gmail.com) 📧  
- **What We Offer**:
  - Custom themes and gameplay mechanics
  - Telegram bot integration
  - Scalable and secure solutions
- **Let’s Talk**: Drop us a line to discuss your vision!

---

**Happy Trippin!**  
AtlantaX is more than a game—it’s a community. Join us as a player, contributor, or client, and let’s build something incredible together! 🐹💰  
