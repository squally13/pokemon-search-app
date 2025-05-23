# Pokémon Database & Favorites App

A single-page web application built with React, PHP, and MySQL that allows users to search for Pokémon, view their details, create an account, and manage a personal list of favorite Pokémon. The application utilizes the public PokeAPI for Pokémon data.

## Features

* **Pokémon Search:** Search Pokémon by name or National Pokédex ID.
* **Live Search Suggestions:** Autocomplete suggestions appear as you type, showing Pokémon image, ID, and name.
* **Detailed Pokémon View:** Displays image, ID, name, types (color-coded), abilities, base stats (HP, Attack, Defense, Speed), and generation.
* **User Authentication:** Secure user registration and login system.
* **Favorites List:** Logged-in users can add Pokémon to a personal favorites list and remove them.
* **View Favorites:** Dedicated section to view all favorited Pokémon.
* **Custom Notifications:** On-page notifications for actions like adding/removing favorites, login success, etc.
* **Responsive Design (Basic):** Styled with CSS for a functional user experience.
* **Client-Side Routing:** Uses React Router DOM for navigation between views (e.g., main page, authentication page).

## Technologies Used

* **Frontend:**
    * React (v18+)
    * React Router DOM (v6+)
    * Axios (for API calls)
    * CSS3 (for styling)
* **Backend:**
    * PHP (v7.4+ recommended)
* **Database:**
    * MySQL
* **External API:**
    * PokeAPI (`pokeapi.co`) - for Pokémon data.
    * Raw GitHub content (for Pokémon sprites in suggestions: `raw.githubusercontent.com/PokeAPI/sprites/...`)

## Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js and npm:** (Node.js v16+ recommended) for running the React frontend. Download from [nodejs.org](https://nodejs.org/).
* **Local Web Server Stack:** A server environment that supports PHP and MySQL.
    * Examples: XAMPP (cross-platform), MAMP (macOS), WAMP (Windows).
    * Ensure Apache (or your webserver of choice) and MySQL services are running.
* **MySQL Management Tool:** Such as phpMyAdmin (often included with XAMPP/MAMP/WAMP) or a standalone client like MySQL Workbench or DBeaver.
* **Git:** (Optional) For cloning the repository.

## Setup and Installation

### 1. Backend Setup (PHP & MySQL)

1.  **Clone/Download:** If you have the project in a repository, clone it. Otherwise, ensure your backend files are ready.
2.  **Place Backend Files:**
    * Create a folder for your backend API within your local web server's document root (e.g., `htdocs` for XAMPP, `www` for WAMP/MAMP). Let's assume you name this folder `pokemon_api`.
    * Copy all your PHP files (`db_connect.php`, `register.php`, `login.php`, `logout.php`, `check_session.php`, `favorites.php`) into this `pokemon_api` folder.
3.  **Database Creation:**
    * Using your MySQL management tool (e.g., phpMyAdmin):
        * Create a new database. Let's assume the name `pokemon_app`.
        * Run the following SQL queries to create the necessary tables:
            ```sql
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE favorites (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                pokemon_name VARCHAR(100) NOT NULL,
                -- Optional: Consider adding pokemon_api_id if you fetch it when adding
                -- pokemon_api_id INT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_favorite (user_id, pokemon_name)
            );
            ```
4.  **Configure Database Connection:**
    * Open the `pokemon_api/db_connect.php` file.
    * Update the database connection variables:
        ```php
        $servername = "localhost"; // Or your DB host
        $username = "root";        // Your DB username (default for XAMPP/MAMP is often 'root')
        $password = "";            // Your DB password (default for XAMPP/MAMP is often empty)
        $dbname = "pokemon_app";   // The database name you created
        ```
5.  **Configure CORS Headers:**
    * In `pokemon_api/db_connect.php`, ensure the `Access-Control-Allow-Origin` header matches your React development server's address (usually `http://localhost:3000`):
        ```php
        header("Access-Control-Allow-Origin: http://localhost:3000");
        // ... other Access-Control headers ...
        ```

### 2. Frontend Setup (React)

1.  **Navigate to Frontend Directory:** Open your terminal and navigate to the root directory of your React application (e.g., `pokemon-search-app` if you used Create React App, or whatever you named it).
2.  **Install Dependencies:** If you haven't already, or if you've cloned the project, install the necessary Node.js packages:
    ```bash
    npm install
    ```
    This will install React, React Router DOM, Axios, and other development dependencies listed in `package.json`.
3.  **Configure API Base URL:**
    * Open the file `src/services/api.js`.
    * Locate the `apiClient` creation and ensure the `baseURL` points to your backend API folder:
        ```javascript
        const apiClient = axios.create({
            baseURL: 'http://localhost/pokemon_api', // Adjust if your path or port is different
            withCredentials: true
        });
        ```

## Running the Application

1.  **Start Backend Services:**
    * Ensure your Apache (or other web server) and MySQL services are running from your XAMPP/MAMP/WAMP control panel.
2.  **Start Frontend Development Server:**
    * In your terminal, navigate to the frontend project directory (`pokemon-search-app`).
    * Run the start script:
        ```bash
        npm start
        ```
    * This will typically open the application automatically in your default web browser at `http://localhost:3000`. If not, open it manually.

## Project Structure (Overview)

/pokemon_project_root
├── /pokemon_api/                 # Backend PHP files
│   ├── db_connect.php
│   ├── register.php
│   ├── login.php
│   ├── logout.php
│   ├── check_session.php
│   └── favorites.php
└── /pokemon-search-app/          # Frontend React application (e.g., created with Create React App)
├── public/
├── src/
│   ├── components/           # Reusable React components
│   │   ├── AuthForms.js
│   │   ├── FavoritesList.js
│   │   ├── PokemonCard.js
│   │   └── SearchBar.js
│   ├── services/             # API interaction logic
│   │   └── api.js
│   ├── App.js                # Main application component with routing
│   ├── App.css               # Main application styles
│   ├── index.js              # Entry point for React app
│   └── index.css             # Global styles
├── package.json
└── README.md                 # This file


## Backend API Endpoints

The PHP backend provides the following API endpoints (relative to your `pokemon_api` folder, e.g., `http://localhost/pokemon_api/login.php`):

* `POST /register.php`: User registration. Expects `username` and `password`.
* `POST /login.php`: User login. Expects `username` and `password`. Starts a session.
* `POST /logout.php`: User logout. Clears the session.
* `GET /check_session.php`: Checks if a user session is active.
* `GET /favorites.php`: Retrieves the logged-in user's favorite Pokémon.
* `POST /favorites.php`: Adds a Pokémon to the logged-in user's favorites. Expects `pokemon_name`.
* `DELETE /favorites.php`: Removes a Pokémon from favorites. Expects favorite `id` as a query parameter (e.g., `/favorites.php?id=123`).

## Future Enhancements (To-Do)

* More detailed Pokémon information (e.g., evolutions, move sets, locations).
* Advanced search and filtering options (by type, generation, etc.).
* User profile page.
* Password reset functionality.
* Enhanced UI/UX with more animations and transitions.
* Pagination for the main Pokémon list (if ever implemented) and favorites list.
* Debouncing for the search suggestions input for better performance.
* Loading skeletons for a smoother loading experience.
* Comprehensive error handling and user feedback.
* Unit and integration tests.
* Deployment scripts/guide for a live server.