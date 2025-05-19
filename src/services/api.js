import axios from 'axios';

// Set base URL for your PHP backend
// Make sure your PHP server is running and accessible
const apiClient = axios.create({
    baseURL: 'http://localhost/pokemon_api', // Adjust if your PHP API is elsewhere
    withCredentials: true // Important for sending/receiving session cookies
});

// PokeAPI base URL
const pokeApiUrl = 'https://pokeapi.co/api/v2';

export const fetchAllPokemonForSuggestions = async (limit = 1302) => { // Current approx total Pokémon
    try {
        const response = await axios.get(`${pokeApiUrl}/pokemon?limit=${limit}`);
        const pokemonList = response.data.results.map(pokemon => {
            // Extract ID from the URL (e.g., "https://pokeapi.co/api/v2/pokemon/1/")
            const urlParts = pokemon.url.split('/');
            const id = urlParts[urlParts.length - 2]; // ID is the second to last part
            return {
                id: parseInt(id),
                name: pokemon.name,
                // Construct sprite URL using a common source like raw.githubusercontent
                spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
            };
        });
        return pokemonList;
    } catch (error) {
        console.error("Error fetching all Pokémon for suggestions:", error);
        throw new Error('Failed to fetch Pokémon list for suggestions.');
    }
};

// --- PokeAPI Functions ---
export const searchPokemon = async (pokemonNameOrId) => {
    try {
        const response = await axios.get(`${pokeApiUrl}/pokemon/${pokemonNameOrId.toLowerCase()}`);
        return response.data; // Contains all pokemon info
    } catch (error) {
        console.error("Error fetching from PokeAPI:", error);
        // Handle specific errors (e.g., 404 Not Found)
        if (error.response && error.response.status === 404) {
            throw new Error(`Pokemon "${pokemonNameOrId}" not found.`);
        }
        throw new Error('Failed to fetch Pokémon data.'); // Generic error
    }
};

// --- Backend API Functions ---
export const registerUser = (username, password) => {
    return apiClient.post('/register.php', { username, password });
};

export const loginUser = (username, password) => {
    return apiClient.post('/login.php', { username, password });
};

export const logoutUser = () => {
    return apiClient.post('/logout.php'); // Adjust if using GET or other method
};

export const checkSession = () => {
     return apiClient.get('/check_session.php');
};

export const getFavorites = () => {
    return apiClient.get('/favorites.php');
};

export const addFavorite = (pokemonName) => {
    return apiClient.post('/favorites.php', { pokemon_name: pokemonName });
};

export const removeFavorite = (favoriteId) => {
     // Pass ID as query parameter for DELETE request
     return apiClient.delete(`/favorites.php?id=${favoriteId}`);
};

export default apiClient; // Export the configured axios instance if needed elsewhere