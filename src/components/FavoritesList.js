// src/components/FavoritesList.js
import React from 'react';
// removeFavorite API call is now handled by App.js

// Receive onAttemptRemoveFavorite prop
function FavoritesList({ favorites, allPokemonList, onSelectFavorite, onAttemptRemoveFavorite }) {

    const handleRemoveClick = (favId, favName) => {
        // Call the handler passed from App.js, which will handle confirmation, API call, and notification
        onAttemptRemoveFavorite(favId, favName);
    };

    if (!favorites || favorites.length === 0) {
        return <p className="empty-list-message">Your favorites list is empty.</p>;
    }

    return (
        <ul className="FavoritesListUL">
            {favorites.map(fav => {
                const pokemonDetails = allPokemonList.find(
                    p => p.name.toLowerCase() === fav.pokemon_name.toLowerCase()
                );
                const spriteUrl = pokemonDetails ? pokemonDetails.spriteUrl : '/placeholder.png';
                const pokeApiId = pokemonDetails ? pokemonDetails.id : null;

                return (
                    <li key={fav.id}>
                        <div className="favorite-item-info">
                            <img
                                src={spriteUrl}
                                alt={fav.pokemon_name}
                                className="favorite-item-sprite"
                            />
                            <span
                                className="favorite-item-name"
                                onClick={() => onSelectFavorite(fav.pokemon_name)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onSelectFavorite(fav.pokemon_name);
                                    }
                                }}
                            >
                                {fav.pokemon_name}
                                {pokeApiId && <span className="favorite-item-pokeapi-id"> (#{pokeApiId})</span>}
                            </span>
                        </div>
                        <button
                            onClick={() => handleRemoveClick(fav.id, fav.pokemon_name)}
                            className="remove-favorite-button"
                        >
                            Remove
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

export default FavoritesList;