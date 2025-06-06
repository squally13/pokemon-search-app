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
import AllPokemonList from './components/AllPokemonList';

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
    const [allPokemonForSuggestions, setAllPokemonForSuggestions] = useState([]); // Used for SearchBar and AllPokemonList
    const [isLoadingAllPokemon, setIsLoadingAllPokemon] = useState(true);

    // --- Notification State ---
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });
    const [notificationTimeoutId, setNotificationTimeoutId] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const isSearchedPokemonFavorite = searchedPokemon && favorites.some(fav => fav.pokemon_name.toLowerCase() === searchedPokemon.name.toLowerCase());


    // --- Helper to show notifications ---
    const showAppNotification = useCallback((message, type = 'info', duration = 3000) => {
        if (notificationTimeoutId) clearTimeout(notificationTimeoutId);
        setNotification({ message, type, visible: true });
        const newTimeoutId = setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
            setTimeout(() => setNotification({ message: '', type: '', visible: false }), 500);
        }, duration);
        setNotificationTimeoutId(newTimeoutId);
    }, [notificationTimeoutId]);

    useEffect(() => { // Cleanup timeout on unmount
        return () => { if (notificationTimeoutId) clearTimeout(notificationTimeoutId); };
    }, [notificationTimeoutId]);


    // --- Event Handlers & Data Fetching (mostly unchanged, ensure they use showAppNotification) ---
    const handleLogout = useCallback(async () => {
        try { await logoutUser(); } catch (error) { console.error("Logout failed:", error); showAppNotification("Logout failed.", "error"); }
        finally { setCurrentUser(null); setSearchedPokemon(null); setFavorites([]); navigate('/'); }
    }, [navigate, showAppNotification]);

    const fetchFavorites = useCallback(async () => {
        if (!currentUser) return;
        setIsLoadingFavorites(true); setFavoritesError('');
        try {
            const response = await getFavorites();
            if (response.data.success) setFavorites(response.data.favorites);
            else { setFavoritesError(response.data.message || 'Failed to load favorites.'); showAppNotification(response.data.message || 'Failed to load favs.', "error");}
        } catch (error) {
            console.error("Error fetching favorites:", error); setFavoritesError(error.message || 'Could not fetch favs.'); showAppNotification(error.message || 'Could not fetch favs', "error");
            if (error.response?.status === 401) handleLogout();
        } finally { setIsLoadingFavorites(false); }
    }, [currentUser, handleLogout, showAppNotification]);

    const handleSearch = async (searchTerm) => {
        setIsLoadingSearch(true); setSearchError(''); setSearchedPokemon(null);
        try {
            let termToSearch = searchTerm;
            if (typeof searchTerm === 'string') termToSearch = searchTerm.toLowerCase().trim();
            if (!termToSearch && typeof termToSearch !== 'number') { // Allow number 0
                 setSearchError("Please enter a Pokémon name or ID.");
                 setIsLoadingSearch(false);
                 return;
            }
            const data = await searchPokemon(termToSearch); // searchPokemon should handle toLowerCase for string
            setSearchedPokemon(data);
        } catch (error) { setSearchError(error.message); showAppNotification(error.message, "error"); }
        finally { setIsLoadingSearch(false); }
    };

    const handleLoginSuccess = (userData) => {
        setCurrentUser(userData); navigate('/'); showAppNotification(`Welcome back, ${userData.username}!`, "success");
    };

    const handleAddToFavorites = async (pokemonName) => {
        if (!currentUser) { showAppNotification("Please log in to add favorites.", "error"); navigate('/auth'); return; }
        try {
            // API expects lowercase name, pokemonName from PokeAPI is already lowercase
            const response = await addFavorite(pokemonName);
            if (response.data.success) {
                const capitalizedName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
                showAppNotification(`${capitalizedName} added to favorites!`, "success");
                fetchFavorites();
            } else showAppNotification(response.data.message || 'Failed to add favorite.', "error");
        } catch (error) { console.error("Add favorite error:", error); showAppNotification(error.message || 'Could not add favorite.', "error"); }
    };

    const handleAttemptRemoveFavorite = async (favId, favName) => {
        try {
            const response = await removeFavorite(favId);
            if (response.data.success) {
                setFavorites(prev => prev.filter(f => f.id !== favId));
                const capName = favName.charAt(0).toUpperCase() + favName.slice(1);
                showAppNotification(<>{capName} removed from favorites.</>, "warning");
            } else showAppNotification(response.data.message || 'Failed to remove favorite.', "error");
        } catch (error) { console.error("Remove favorite error:", error); showAppNotification(error.message || 'An error occurred.', "error"); }
    };

    // --- useEffect Hooks ---
    useEffect(() => { // Initial data load
        setIsLoadingUser(true); setIsLoadingAllPokemon(true);
        const initialLoad = async () => {
            try {
                const sessionRes = await checkSession();
                if (sessionRes.data.loggedIn && sessionRes.data.user) setCurrentUser(sessionRes.data.user);
                else setCurrentUser(null);
            } catch (e) { console.error("Session check failed:", e); setCurrentUser(null); }
            finally { setIsLoadingUser(false); }

            try {
                const allPokeData = await fetchAllPokemonForSuggestions();
                setAllPokemonForSuggestions(allPokeData);
            } catch (e) { console.error("Failed to load suggestions list:", e); showAppNotification("Could not load Pokémon list for suggestions.", "error");}
            finally { setIsLoadingAllPokemon(false); }
        };
        initialLoad();
    }, [showAppNotification]);

    useEffect(() => { // Fetch favorites on user change
        if (currentUser) fetchFavorites();
        else setFavorites([]);
    }, [currentUser, fetchFavorites]);

    // --- Render Logic ---
    if (isLoadingUser || isLoadingAllPokemon) {
        return (
            <div className="page-loading-container">
                <p className="loading-message">Loading Application Data...</p>
            </div>
        );
    }

    // --- NEW LAYOUT WRAPPER ---
    return (
        <div className="page-layout-wrapper">
            {/* --- Main Content Area --- */}
            <main className="App"> {/* Main content area keeps class "App" for existing styles */}
                {notification.visible && (
                    <div className={`app-notification ${notification.type} ${notification.visible ? 'show' : ''}`}>
                        {notification.message}
                        <button onClick={() => { if (notificationTimeoutId) clearTimeout(notificationTimeoutId); setNotification(prev => ({ ...prev, visible: false })); setTimeout(() => setNotification({ message: '', type: '', visible: false }), 500);}} className="notification-close-button" aria-label="Close notification">&times;</button>
                    </div>
                )}
                <h1>Pokémon Database</h1>
                {/* Top-right auth links/user info - rendered only if not on /auth page */}
                {location.pathname !== '/auth' && (
                     currentUser ? (
                        <div className="user-info"><span>Welcome, {currentUser.username}!</span><button onClick={handleLogout}>Logout</button></div>
                     ) : (
                        <div className="auth-links"><Link to="/auth" className="auth-button-link">Login / Register</Link></div>
                     )
                )}

                <Routes>
                    <Route path="/" element={
                        <>
                            <section className="search-section">
                                <h2>Search Pokémon</h2>
                                <SearchBar onSearch={handleSearch} allPokemonList={allPokemonForSuggestions} />
                                {isLoadingSearch && <p className="loading-message">Searching...</p>}
                                {searchError && <p className="error-message">{searchError}</p>}
                                {searchedPokemon && (
                                    <PokemonCard pokemon={searchedPokemon} onAddToFavorites={handleAddToFavorites} isFavorite={isSearchedPokemonFavorite} showAddButton={!!currentUser} />
                                )}
                                {!currentUser && searchedPokemon && (<p style={{textAlign: 'center', marginTop: '10px'}}><i>Log in to add Pokémon to favorites.</i></p>)}
                            </section>
                            {currentUser && (
                                <section className="favorites-section">
                                    <h2>My Favorites</h2>
                                    {isLoadingFavorites && <p className="loading-message">Loading favorites...</p>}
                                    {favoritesError && <p className="error-message">{favoritesError}</p>}
                                    <FavoritesList favorites={favorites} onAttemptRemoveFavorite={handleAttemptRemoveFavorite} allPokemonList={allPokemonForSuggestions} onSelectFavorite={handleSearch} />
                                </section>
                            )}
                        </>
                    }/>
                    <Route path="/auth" element={
                        // For auth page, main .App container will be used, but sidebar won't render
                        <section className="auth-section full-page-auth">
                            <h2>Login or Register</h2>
                            <AuthForms onLoginSuccess={handleLoginSuccess} />
                            <Link to="/" className="close-auth-button auth-page-back-button">Back to Search</Link>
                        </section>
                    }/>
                    <Route path="*" element={
                        <section><h2>Page Not Found</h2><Link to="/" className="close-auth-button">Go Home</Link></section>
                    } />
                </Routes>
            </main> {/* End of .App (main content area) */}

            {/* --- Right Sidebar - Conditionally Rendered --- */}
            {location.pathname !== '/auth' && ( // Only show sidebar if not on auth page
                <aside className="pokemon-sidebar">
                    <h2>All Pokémons</h2>
                    <AllPokemonList
                        allPokemonList={allPokemonForSuggestions}
                        onPokemonSelect={handleSearch} // Clicking a Pokémon in sidebar searches it
                    />
                </aside>
            )}
        </div> // End of .page-layout-wrapper
    );
}
export default App;