// src/services/api.js
import axios from 'axios';
// Zaimportuj funkcję pomocniczą
import { getGenerationFromId } from '../utils/pokemonUtils'; // Dostosuj ścieżkę, jeśli utils jest gdzie indziej

// Set base URL for your PHP backend
const apiClient = axios.create({
    baseURL: 'http://localhost/pokemon_api', // Adjust if your PHP API is elsewhere
    withCredentials: true
});

// PokeAPI base URL
const pokeApiUrl = 'https://pokeapi.co/api/v2';

// ZAKTUALIZOWANA FUNKCJA
export const fetchAllPokemonForSuggestions = async (limit = 1302) => { // Current approx total Pokémon
    try {
        const response = await axios.get(`${pokeApiUrl}/pokemon?limit=${limit}`);
        const pokemonList = response.data.results.map(pokemon => {
            const urlParts = pokemon.url.split('/');
            const id = parseInt(urlParts[urlParts.length - 2]); // ID is the second to last part
            return {
                id: id,
                name: pokemon.name,
                spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                generation: getGenerationFromId(id), // DODANO GENERACJĘ
                types: [] // Placeholder - typy wymagałyby dodatkowych zapytań
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
        // Jeśli pokemonNameOrId jest stringiem, konwertuj do małych liter
        const searchTerm = typeof pokemonNameOrId === 'string' ? pokemonNameOrId.toLowerCase() : pokemonNameOrId;
        const response = await axios.get(`${pokeApiUrl}/pokemon/${searchTerm}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching from PokeAPI:", error);
        if (error.response && error.response.status === 404) {
            throw new Error(`Pokémon "${pokemonNameOrId}" not found.`);
        }
        throw new Error('Failed to fetch Pokémon data.');
    }
};

// --- Backend API Functions (Twoje istniejące funkcje) ---
export const registerUser = (username, password) => {
    return apiClient.post('/register.php', { username, password });
};

export const loginUser = (username, password) => {
    return apiClient.post('/login.php', { username, password });
};

export const logoutUser = () => {
    return apiClient.post('/logout.php');
};

export const checkSession = () => {
     return apiClient.get('/check_session.php');
};

export const getFavorites = () => {
    return apiClient.get('/favorites.php');
};

export const addFavorite = (pokemonName) => {
    // API backendu prawdopodobnie oczekuje nazwy z małej litery
    return apiClient.post('/favorites.php', { pokemon_name: pokemonName.toLowerCase() });
};

export const removeFavorite = (favoriteId) => {
     return apiClient.delete(`/favorites.php?id=${favoriteId}`);
};

export default apiClient;