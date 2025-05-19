// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import {
    searchPokemon,
    checkSession,
    logoutUser,
    getFavorites,
    addFavorite,
    fetchAllPokemonForSuggestions,
    removeFavorite
} from './services/api';
import SearchBar from './components/SearchBar';
import PokemonCard from './components/PokemonCard';
import AuthForms from './components/AuthForms';
import FavoritesList from './components/FavoritesList';

function App() {
    // --- State Variables ---
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [searchedPokemon, setSearchedPokemon] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
    const [favoritesError, setFavoritesError] = useState('');
    const [allPokemonForSuggestions, setAllPokemonForSuggestions] = useState([]);
    const [isLoadingAllPokemon, setIsLoadingAllPokemon] = useState(true);

    // --- Notification State ---
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });
    const [notificationTimeoutId, setNotificationTimeoutId] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const isSearchedPokemonFavorite = searchedPokemon && favorites.some(fav => fav.pokemon_name === searchedPokemon.name);

    // --- Helper to show notifications ---
    const showAppNotification = useCallback((message, type = 'info', duration = 3000) => {
        if (notificationTimeoutId) {
            clearTimeout(notificationTimeoutId);
        }
        setNotification({ message, type, visible: true });
        const newTimeoutId = setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
            setTimeout(() => setNotification({ message: '', type: '', visible: false }), 500);
        }, duration);
        setNotificationTimeoutId(newTimeoutId);
    }, [notificationTimeoutId]);

    useEffect(() => {
        return () => {
            if (notificationTimeoutId) {
                clearTimeout(notificationTimeoutId);
            }
        };
    }, [notificationTimeoutId]);

    const handleLogout = useCallback(async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout failed:", error);
            showAppNotification("Logout failed. Please try again.", "error");
        } finally {
            setCurrentUser(null);
            setSearchedPokemon(null);
            setFavorites([]);
            navigate('/');
        }
    }, [navigate, showAppNotification]);

    const fetchFavorites = useCallback(async () => {
        if (!currentUser) return;
        setIsLoadingFavorites(true);
        setFavoritesError('');
        try {
            const response = await getFavorites();
            if (response.data.success) {
                setFavorites(response.data.favorites);
            } else {
                setFavoritesError(response.data.message || 'Failed to load favorites.');
                showAppNotification(response.data.message || 'Failed to load favorites.', "error");
            }
        } catch (error) {
            console.error("Error fetching favorites:", error);
            setFavoritesError(error.response?.data?.message || 'Could not fetch favorites.');
            showAppNotification(error.response?.data?.message || 'Could not fetch favorites.', "error");
            if (error.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setIsLoadingFavorites(false);
        }
    }, [currentUser, handleLogout, showAppNotification]);

    const handleSearch = async (searchTerm) => {
        setIsLoadingSearch(true);
        setSearchError('');
        setSearchedPokemon(null);
        try {
            let termToSearch = searchTerm;
            if (typeof searchTerm === 'string') termToSearch = searchTerm.toLowerCase().trim();
            if (!termToSearch) {
                setSearchError("Please enter a Pokémon name or ID.");
                setIsLoadingSearch(false);
                return;
            }
            const data = await searchPokemon(termToSearch);
            setSearchedPokemon(data);
        } catch (error) {
            setSearchError(error.message);
            showAppNotification(error.message, "error");
        } finally {
            setIsLoadingSearch(false);
        }
    };

    const handleLoginSuccess = (userData) => {
        setCurrentUser(userData);
        navigate('/');
        showAppNotification(`Welcome back, ${userData.username}!`, "success");
    };

    // MODIFIED: handleAddToFavorites to capitalize the name in the notification
    const handleAddToFavorites = async (pokemonName) => {
        // pokemonName is likely lowercase here
        if (!currentUser) {
            showAppNotification("Please log in to add favorites.", "error");
            navigate('/auth');
            return;
        }
        try {
            const response = await addFavorite(pokemonName); // API expects lowercase name
            if (response.data.success) {
                // Capitalize the Pokémon name for the notification display
                const capitalizedPokemonName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
                showAppNotification(`${capitalizedPokemonName} added to favorites`, "success");
                fetchFavorites();
            } else {
                showAppNotification(response.data.message || 'Failed to add favorite.', "error");
            }
        } catch (error) {
            console.error("Add favorite error:", error);
            showAppNotification(error.response?.data?.message || 'Could not add favorite.', "error");
        }
    };

    const handleAttemptRemoveFavorite = async (favId, favName) => {
        // favName is likely lowercase here
        try {
            const response = await removeFavorite(favId);
            if (response.data.success) {
                setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== favId));
                const capitalizedFavName = favName.charAt(0).toUpperCase() + favName.slice(1);
                const notificationContent = (
                    <>
                        {capitalizedFavName} removed from favorites
                    </>
                );
                showAppNotification(notificationContent, "warning");
            } else {
                showAppNotification(response.data.message || 'Failed to remove favorite.', "error");
            }
        } catch (error) {
            console.error("Remove favorite error:", error);
            showAppNotification(error.response?.data?.message || 'An error occurred while removing favorite.', "error");
        }
    };

    useEffect(() => {
        setIsLoadingUser(true);
        setIsLoadingAllPokemon(true);
        const initialLoad = async () => {
            try {
                const sessionResponse = await checkSession();
                if (sessionResponse.data.loggedIn && sessionResponse.data.user) {
                    setCurrentUser(sessionResponse.data.user);
                } else { setCurrentUser(null); }
            } catch (error) {
                console.error("Initial session check failed:", error);
                setCurrentUser(null);
            } finally { setIsLoadingUser(false); }

            try {
                const allPokemonData = await fetchAllPokemonForSuggestions();
                setAllPokemonForSuggestions(allPokemonData);
            } catch (error) {
                console.error("Failed to load Pokémon list for suggestions:", error);
                showAppNotification("Could not load Pokémon list for suggestions. Autocomplete might not work.", "error");
            } finally { setIsLoadingAllPokemon(false); }
        };
        initialLoad();
    }, [showAppNotification]);

    useEffect(() => {
        if (currentUser) {
            fetchFavorites();
        } else {
            setFavorites([]);
        }
    }, [currentUser, fetchFavorites]);

    if (isLoadingUser || isLoadingAllPokemon) {
        return (
            <div className="App">
                <p className="loading-message">Loading Application Data...</p>
            </div>
        );
    }

    return (
        <div className="App">
            {notification.visible && (
                <div className={`app-notification ${notification.type} ${notification.visible ? 'show' : ''}`}>
                    {notification.message}
                    <button
                        onClick={() => {
                            if (notificationTimeoutId) clearTimeout(notificationTimeoutId);
                            setNotification(prev => ({ ...prev, visible: false }));
                            setTimeout(() => setNotification({ message: '', type: '', visible: false }), 500);
                        }}
                        className="notification-close-button"
                        aria-label="Close notification"
                    >
                        &times;
                    </button>
                </div>
            )}

            <h1>Pokémon Database</h1>
            {location.pathname !== '/auth' && (
                 currentUser ? (
                    <div className="user-info">
                        <span>Welcome, {currentUser.username}!</span>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                 ) : (
                    <div className="auth-links">
                        <Link to="/auth" className="auth-button-link">Login / Register</Link>
                    </div>
                 )
            )}

            <Routes>
                <Route path="/" element={
                    <>
                        <section className="search-section">
                            <h2>Search Pokémon</h2>
                            <SearchBar
                                onSearch={handleSearch}
                                allPokemonList={allPokemonForSuggestions}
                            />
                            {isLoadingSearch && <p className="loading-message">Searching...</p>}
                            {searchError && <p className="error-message">{searchError}</p>}
                            {searchedPokemon && (
                                <PokemonCard
                                    pokemon={searchedPokemon}
                                    onAddToFavorites={handleAddToFavorites}
                                    isFavorite={isSearchedPokemonFavorite}
                                    showAddButton={!!currentUser}
                                />
                            )}
                            {!currentUser && searchedPokemon && (
                                <p style={{textAlign: 'center', marginTop: '10px'}}><i>Log in to add Pokémon to favorites.</i></p>
                            )}
                        </section>
                        {currentUser && (
                            <section className="favorites-section">
                                <h2>My Favorites</h2>
                                {isLoadingFavorites && <p className="loading-message">Loading favorites...</p>}
                                {favoritesError && <p className="error-message">{favoritesError}</p>}
                                <FavoritesList
                                    favorites={favorites}
                                    onAttemptRemoveFavorite={handleAttemptRemoveFavorite}
                                    allPokemonList={allPokemonForSuggestions}
                                    onSelectFavorite={handleSearch}
                                />
                            </section>
                        )}
                    </>
                }/>
                 <Route path="/auth" element={
                    <section className="auth-section">
                        <h2>Login or Register</h2>
                        <AuthForms onLoginSuccess={handleLoginSuccess} />
                        <Link to="/" className="close-auth-button">Back to Search</Link>
                    </section>
                }/>
                <Route path="*" element={
                    <section>
                        <h2>Page Not Found</h2>
                        <Link to="/" className="close-auth-button">Go Home</Link>
                    </section>
                } />
            </Routes>
        </div>
    );
}
export default App;