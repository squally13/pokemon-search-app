# Pokémon Database & Advanced Favorites App

A comprehensive single-page web application built with React, PHP, and MySQL. This application allows users to search for Pokémon, view detailed information, receive live search suggestions, browse a paginated list of all Pokémon in a sidebar, create user accounts, and manage a personal list of favorite Pokémon with custom on-page notifications. It utilizes the public PokeAPI for Pokémon data.

## Features

* **Advanced Pokémon Search:**
    * Search by name or National Pokédex ID.
    * **Live Search Suggestions:** Autocomplete suggestions appear dynamically as you type, displaying Pokémon image, ID, and name.
* **Detailed Pokémon View:**
    * Displays high-quality image, National Pokédex ID, and name.
    * Color-coded Pokémon types.
    * List of abilities.
    * Base stats (HP, Attack, Defense, Speed).
    * Pokémon's generation.
* **"All Pokémon" Sidebar:**
    * Displays a scrollable and paginated list of all available Pokémon.
    * Each list item shows the Pokémon's image, name, ID, and generation.
    * Items are designed to be compact, showing many Pokémon per page.
    * Clicking a Pokémon in the sidebar loads its details into the main view, similar to a search.
    * The sidebar is visible on all main views except the authentication page.
* **User Authentication:**
    * Secure user registration and login system.
    * Session management to keep users logged in.
    * Dedicated authentication page (`/auth`).
    * Top-right UI elements change based on login status and current page.
* **Personalized Favorites List:**
    * Logged-in users can add/remove Pokémon to/from their personal favorites.
    * Favorites list displays Pokémon image and capitalized name.
    * Clicking a Pokémon name in the favorites list loads its details in the main view.
* **User Experience:**
    * Custom, styled on-page notifications for actions (e.g., adding/removing favorites, login success, errors) with different colors for status types (success, error, warning, info).
    * Main title "Pokémon Database" styled to mimic the iconic Pokémon logo.
    * Refined styling for input fields and buttons for a modern look and feel.
    * Client-side routing implemented with React Router DOM.

## Technologies Used

* **Frontend:**
    * React (v18+)
    * React Router DOM (v6+) (for client-side routing)
    * Axios (for API calls to backend and PokeAPI)
    * CSS3 (for custom styling and layout)
* **Backend:**
    * PHP (v7.4+ recommended)
* **Database:**
    * MySQL
* **External API:**
    * PokeAPI (`pokeapi.co`) - Primary source for Pokémon data.
    * Raw GitHub content (from PokeAPI/sprites repository) - For Pokémon sprites.

## Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js and npm:** (Node.js v16+ recommended). Download from [nodejs.org](https://nodejs.org/).
* **Local Web Server Stack:** Supporting PHP and MySQL (e.g., XAMPP, MAMP, WAMP).
* **MySQL Management Tool:** e.g., phpMyAdmin, MySQL Workbench, DBeaver.
* **Git:** (Optional) For cloning the repository.

## Setup and Installation

### 1. Backend Setup (PHP & MySQL)

1.  **Clone/Download Project:** Obtain the project files.
2.  **Place Backend Files:**
    * Create a folder for your backend API (e.g., `pokemon_api`) in your web server's document root (e.g., `htdocs` for XAMPP).
    * Copy all PHP files (`db_connect.php`, `register.php`, `login.php`, `logout.php`, `check_session.php`, `favorites.php`) into this `pokemon_api` folder.
3.  **Database Creation:**
    * Using your MySQL management tool:
        * Create a new database (e.g., `pokemon_app`).
        * Run the following SQL queries:
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
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_favorite (user_id, pokemon_name)
            );
            ```
4.  **Configure Database Connection:**
    * Open `pokemon_api/db_connect.php`.
    * Update the database variables: `$servername`, `$username`, `$password`, `$dbname`.
5.  **Configure CORS Headers:**
    * In `pokemon_api/db_connect.php`, ensure `Access-Control-Allow-Origin: http://localhost:3000` (or your React app's port) is correctly set.

### 2. Frontend Setup (React)

1.  **Navigate to Frontend Directory:** Open your terminal in the frontend project folder (e.g., `pokemon-search-app`).
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
    (This will install `react`, `react-dom`, `react-router-dom`, `axios`, etc., as defined in `package.json`).
3.  **Create Utility File (if not present):**
    * Ensure you have `src/utils/pokemonUtils.js` with the `getGenerationFromId` function (as provided in previous steps).
4.  **Configure API Base URL:**
    * Open `src/services/api.js`.
    * Verify/update the `baseURL` for `apiClient` to point to your PHP backend (e.g., `http://localhost/pokemon_api`).
    * Ensure `fetchAllPokemonForSuggestions` is implemented correctly to include `generation` and `detailUrl` (or use `id` for fetching details later).

## Running the Application

1.  **Start Backend Services:** Launch Apache and MySQL from your XAMPP/MAMP/WAMP control panel.
2.  **Start Frontend Development Server:**
    * In your terminal (in the frontend project directory):
        ```bash
        npm start
        ```
    * The application will typically open at `http://localhost:3000`.

## Backend API Endpoints

(Relative to your `pokemon_api` folder, e.g., `http://localhost/pokemon_api/login.php`):

* `POST /register.php`: User registration.
* `POST /login.php`: User login.
* `POST /logout.php`: User logout.
* `GET /check_session.php`: Checks active user session.
* `GET /favorites.php`: Retrieves user's favorite Pokémon.
* `POST /favorites.php`: Adds a Pokémon to favorites.
* `DELETE /favorites.php?id={fav_id}`: Removes a Pokémon from favorites.

## Future Enhancements / To-Do

* Display Pokémon types in the "All Pokémon" sidebar list (requires efficient data fetching for types).
* More detailed Pokémon information pages (evolutions, learnsets, game locations).
* Advanced filtering and sorting for the "All Pokémon" sidebar list.
* User profile page with more settings.
* "Forgot Password" / Password Reset functionality.
* Further UI/UX refinements, including loading skeletons and smoother transitions.
* Debouncing for the search input in `SearchBar.js` if not already implemented.
* Comprehensive unit and integration tests.
* Containerization with Docker for easier setup.
* Deployment guide for a live environment.