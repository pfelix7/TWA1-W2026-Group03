# TWA1-W2026-Group3
Final Project in Transactional Web Application

## Features
- Users can create an account if they do not already have an account.
- Users can browse multiple listings and filter by price and location.
- Users click on each listing to view more details about the property as well as reviews left by others.
- Users can rate, write reviews, and upload pictures about listings.
- Users can edit or delete their previous reviews if needed.

## Prerequisites
- Node.js
- npm
- MongoDB (for backend)

## Setting up Frontend
1. Using the terminal, navigate to client folder:
``` bash
cd client
```
2. Install the dependencies:
``` bash
npm install
```
3. Spin up the Frontend
``` bash
npm run dev
```
Either navigate to http://localhost:5173 or click the link provided in terminal.

## Setting up Backend
1. In a new terminal, navigate to server folder:
``` bash
cd server
```
2. Install the dependencies:
``` bash
npm install
```
3. Create a .env file with database and JWT configuration.
4. Spin up the Frontend
``` bash
node server.js
```