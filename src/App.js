import React, { useState, useEffect, useCallback } from 'react';
// --- React Router Imports ---
// Import useLocation along with other router hooks/components
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// Import CSS
import './App.css';

// Import API functions
import {
    searchPokemon,
    checkSession,
    logoutUser,
    getFavorites,
    addFavorite,
} from './services/api';

// Import Components
import SearchBar from './components/SearchBar';
import PokemonCard from './components/PokemonCard';
import AuthForms from './components/AuthForms';
import FavoritesList from './components/FavoritesList';

// --- Main App Component (holds state and logic directly) ---
function App() {
    // --- State Variables ---
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true); // Tracks initial session check
    const [searchedPokemon, setSearchedPokemon] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
    const [favoritesError, setFavoritesError] = useState('');

    // --- React Router Hooks ---
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location object

    // --- Helper Calculation ---
    // Determines if the currently searched Pokemon is already in the favorites list
    const isSearchedPokemonFavorite = searchedPokemon && favorites.some(fav => fav.pokemon_name === searchedPokemon.name);

    // --- Event Handlers & Data Fetching ---

    // Handle Logout (memoized with useCallback)
    const handleLogout = useCallback(async () => {
         try {
             await logoutUser();
         } catch (error) {
              console.error("Logout failed:", error);
         } finally {
              setCurrentUser(null);
              setSearchedPokemon(null); // Clear search results on logout
              setFavorites([]); // Clear favorites on logout
              navigate('/'); // Redirect to home page after logout
         }
    }, [navigate]); // Dependency: navigate

     // Fetch Favorites Function (memoized with useCallback)
     const fetchFavorites = useCallback(async () => {
        // The useEffect calling this already checks for currentUser
        setIsLoadingFavorites(true);
        setFavoritesError('');
        try {
            const response = await getFavorites();
            if (response.data.success) {
                setFavorites(response.data.favorites);
            } else {
                 setFavoritesError(response.data.message || 'Failed to load favorites.');
            }
        } catch (error) {
            console.error("Error fetching favorites:", error);
            setFavoritesError(error.response?.data?.message || error.message || 'Could not fetch favorites.');
            if (error.response?.status === 401) { // If unauthorized (session likely expired)
                 handleLogout(); // Automatically log out
            }
        } finally {
            setIsLoadingFavorites(false);
        }
     // Ensure handleLogout is stable by using useCallback, include as dependency
     }, [handleLogout]);


    // Handle Search Submission
    const handleSearch = async (searchTerm) => {
        setIsLoadingSearch(true);
        setSearchError('');
        setSearchedPokemon(null); // Clear previous result
        try {
            const data = await searchPokemon(searchTerm);
            setSearchedPokemon(data);
        } catch (error) {
            setSearchError(error.message);
        } finally {
            setIsLoadingSearch(false);
        }
    };

    // Handle Successful Login (passed to AuthForms)
    const handleLoginSuccess = (userData) => {
        setCurrentUser(userData); // Set the user
        navigate('/'); // Redirect to home page after successful login
    };

    // Handle Adding a Favorite (passed to PokemonCard)
    const handleAddToFavorites = async (pokemonName) => {
         // Check if user is logged in
         if (!currentUser) {
             alert("Please log in to add favorites.");
             navigate('/auth'); // Redirect to login/register page if not logged in
             return; // Stop execution
         }
         // Proceed to add favorite if logged in
         try {
            const response = await addFavorite(pokemonName);
            if (response.data.success) {
                alert(`${pokemonName} added to favorites!`);
                fetchFavorites(); // Refresh the favorites list
            } else {
                 alert(response.data.message || 'Failed to add favorite.');
            }
         } catch (error) {
             console.error("Add favorite error:", error);
             alert(error.response?.data?.message || error.message || 'Could not add favorite.');
         }
    };

    // Handle Successful Removal of Favorite (callback from FavoritesList)
    const handleRemoveFavoriteSuccess = (removedFavId) => {
        // Update favorites state immediately for better UX
        setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== removedFavId));
    };


    // --- useEffect Hooks ---

    // Effect #1: Check user session on initial application load
    useEffect(() => {
        setIsLoadingUser(true);
        checkSession()
            .then(response => {
                if (response.data.loggedIn && response.data.user) {
                    setCurrentUser(response.data.user);
                } else {
                    setCurrentUser(null); // Ensure user is logged out if no valid session
                }
            })
            .catch(error => {
                console.error("Initial session check failed:", error);
                setCurrentUser(null); // Ensure logged out on error
            })
            .finally(() => {
                setIsLoadingUser(false); // Finish initial loading state
            });
    }, []); // Empty dependency array -> Runs only once on mount

    // Effect #2: Fetch favorites list when the logged-in user changes
    useEffect(() => {
         if (currentUser) { // Only fetch if a user is actually logged in
             fetchFavorites();
         } else {
             // If user logs out (currentUser becomes null), clear favorites immediately
             setFavorites([]);
         }
    // Dependencies: currentUser (triggers on login/logout) and fetchFavorites (stable due to useCallback)
    }, [currentUser, fetchFavorites]);


    // --- Render Logic ---

    // Display a loading message during the initial session check
    if (isLoadingUser) {
        return (
            <div className="App"> {/* Keep main container for consistent layout */}
                 <p className="loading-message">Loading Application...</p>
            </div>
        );
    }

    // Main application structure after initial load
    return (
        <div className="App"> {/* Main container with position: relative */}
            <h1>Pokémon Database</h1> {/* Title is always visible */}

            {/* --- Top-Right Corner - Conditional Rendering --- */}
            {/* Only render this block if NOT on the /auth page */}
            {location.pathname !== '/auth' && (
                 currentUser ? (
                    // Logged-in: Show User Info + Logout Button
                    <div className="user-info">
                        <span>Welcome, {currentUser.username}!</span>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                 ) : (
                     // Logged-out: Show Login/Register Link
                    <div className="auth-links">
                        <Link to="/auth" className="auth-button-link">Login / Register</Link>
                    </div>
                 )
            )}
            {/* --- End of Top-Right Corner --- */}


            {/* --- Main Content Area - Switches based on Route --- */}
            <Routes>
                {/* Route for the main page ("/") */}
                <Route path="/" element={
                    // Use Fragment to group multiple sections
                    <>
                        {/* Search Section - Always shown on "/" */}
                        <section className="search-section">
                            <h2>Search Pokémon</h2>
                            <SearchBar onSearch={handleSearch} />
                            {isLoadingSearch && <p className="loading-message">Searching...</p>}
                            {searchError && <p className="error-message">{searchError}</p>}
                            {searchedPokemon && (
                                <PokemonCard
                                    pokemon={searchedPokemon}
                                    onAddToFavorites={handleAddToFavorites}
                                    isFavorite={isSearchedPokemonFavorite}
                                    showAddButton={!!currentUser} // Pass boolean based on user login status
                                />
                            )}
                            {/* Login prompt shown only if logged out AND a pokemon is displayed */}
                            {!currentUser && searchedPokemon && (
                                <p style={{textAlign: 'center', marginTop: '10px'}}><i>Log in to add Pokémon to favorites.</i></p>
                            )}
                        </section>

                        {/* Favorites Section - Shown only if logged in on "/" */}
                        {currentUser && (
                            <section className="favorites-section">
                                <h2>My Favorites</h2>
                                {isLoadingFavorites && <p className="loading-message">Loading favorites...</p>}
                                {favoritesError && <p className="error-message">{favoritesError}</p>}
                                <FavoritesList
                                    favorites={favorites}
                                    onRemoveFavoriteSuccess={handleRemoveFavoriteSuccess}
                                />
                            </section>
                        )}
                    </>
                }/> {/* End of main route element */}

                {/* Route for the Authentication page ("/auth") */}
                <Route path="/auth" element={
                    <section className="auth-section">
                        <h2>Login or Register</h2>
                        {/* Pass the login success handler */}
                        <AuthForms onLoginSuccess={handleLoginSuccess} />
                        {/* "Back to Search" Link - positioned by CSS */}
                        <Link to="/" className="close-auth-button">Back to Search</Link>
                    </section>
                }/> {/* End of auth route element */}

                {/* Catch-all route for 404 Not Found */}
                <Route path="*" element={
                    <section>
                        <h2>Page Not Found</h2>
                        <Link to="/" className="close-auth-button">Go Home</Link> {/* Re-use button style */}
                    </section>
                } />

            </Routes>
            {/* --- End of Main Content Area --- */}

        </div> // End of .App div
    ); // End of return
} // End of App function

export default App;