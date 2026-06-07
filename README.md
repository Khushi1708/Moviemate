# MovieMate

MovieMate is a movie recommendation web application built with HTML, CSS, JavaScript, Node.js, and Express.js.

## Features

- User registration and login
- Admin login
- Movie search
- Genre-wise browsing
- Watchlist page
- Recommendations page
- Ratings page
- Light/dark theme support

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Authentication: JSON Web Token, bcryptjs
- Storage: In-memory demo data

## Project Structure

```text
MovieMate/
├── server.js
├── package.json
├── package-lock.json
├── index.html
├── login.html
├── main.html
├── genres.html
├── watchlist.html
├── recommendations.html
├── ratings.html
├── images/
├── *.css
└── *.js
```

## How to Run Locally

1. Install Node.js.
2. Open the project folder in terminal.
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file using `.env.example` as reference.
5. Start the server:

```bash
npm start
```

6. Open this URL in your browser:

```text
http://localhost:3000
```

## Default Admin Login

```text
Username: admin
Password: admin123
```

## GitHub Upload Commands

```bash
git init
git add .
git commit -m "Initial commit - MovieMate project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME` with your GitHub details.

## Important Notes

- Do not upload `node_modules` to GitHub.
- Run `npm install` after cloning the repository.
- This version uses in-memory storage, so registered users and ratings reset when the server restarts.
