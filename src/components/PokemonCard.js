import React from 'react';

// Mapa kolorów dla typów Pokémonów (możesz dostosować kolory)
const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C', // Żółty dla electric
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
};

// Funkcja pomocnicza do znalezienia konkretnej statystyki
const findStat = (stats, statName) => {
    const foundStat = stats?.find(statInfo => statInfo.stat.name === statName);
    return foundStat ? foundStat.base_stat : 'N/A'; // Zwróć 'N/A', jeśli nie znaleziono
};

// Funkcja pomocnicza do określenia generacji na podstawie ID
const getGenerationFromId = (id) => {
    if (id >= 1 && id <= 151) return 1;
    if (id >= 152 && id <= 251) return 2;
    if (id >= 252 && id <= 386) return 3;
    if (id >= 387 && id <= 493) return 4;
    if (id >= 494 && id <= 649) return 5;
    if (id >= 650 && id <= 721) return 6;
    if (id >= 722 && id <= 809) return 7;
    if (id >= 810 && id <= 905) return 8;
    if (id >= 906 && id <= 1025) return 9; // Zakres dla Gen 9 (może wymagać aktualizacji)
    return 'Unknown'; // Dla ID poza znanymi zakresami
};


// Komponent PokemonCard
function PokemonCard({ pokemon, onAddToFavorites, isFavorite, showAddButton }) {
    if (!pokemon) return null; // Nie renderuj, jeśli brak danych pokemona

    const handleAddClick = () => {
        if (onAddToFavorites) {
            onAddToFavorites(pokemon.name);
        }
    };

    // Pobieranie statystyk
    const hp = findStat(pokemon.stats, 'hp');
    const attack = findStat(pokemon.stats, 'attack');
    const defense = findStat(pokemon.stats, 'defense');
    const speed = findStat(pokemon.stats, 'speed');

    // Pobieranie generacji
    const generation = getGenerationFromId(pokemon.id);

    return (
        <div className="pokemon-card">
            {/* Nazwa i ID */}
            <h2>{pokemon.name} (#{pokemon.id})</h2>

            {/* Obrazek */}
            <img src={pokemon.sprites?.front_default || '/placeholder.png'} alt={pokemon.name} />
            {/* Użyj obrazka zastępczego, jeśli front_default nie istnieje */}

            {/* Generacja */}
             <div className="pokemon-info-section generation-section">
                 <strong>Generation:</strong>
                 {/* Wrap the generation variable in a span with the new class */}
                 <span className="generation-number">{generation}</span>
            </div>


            {/* Typy (z kolorami) */}
            <div className="pokemon-info-section">
                <strong>Types:</strong>
                <ul>
                    {pokemon.types?.map(typeInfo => {
                        const typeName = typeInfo.type.name;
                        const backgroundColor = typeColors[typeName] || '#777'; // Domyślny kolor szary
                        // Dodaj styl dla lepszej czytelności tekstu na niektórych tłach
                        const textColor = ['electric', 'ice', 'fairy', 'grass', 'water', 'flying', 'normal', 'psychic'].includes(typeName) ? '#000' : '#FFF';


                        return (
                            <li
                                key={typeName}
                                style={{
                                    backgroundColor: backgroundColor,
                                    color: textColor, // Ustaw kolor tekstu
                                    padding: '3px 8px', // Dodaj trochę paddingu
                                    margin: '3px',
                                    borderRadius: '3px',
                                    display: 'inline-block' // Upewnij się, że są obok siebie
                                }}
                            >
                                {typeName}
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Wybrane Statystyki */}
            <div className="pokemon-info-section">
                <strong>Base Stats:</strong>
                <ul className="stats-list">
                    <li>HP: {hp}</li>
                    <li>Attack: {attack}</li>
                    <li>Defense: {defense}</li>
                    <li>Speed: {speed}</li>
                </ul>
            </div>


            {/* Abilities (pozostawione bez zmian dla kompletności) */}
            <div className="pokemon-info-section">
                <strong>Abilities:</strong>
                <ul className="abilities-list">
                    {pokemon.abilities?.map(abilityInfo => (
                        <li key={abilityInfo.ability.name}>{abilityInfo.ability.name}</li>
                    ))}
                </ul>
            </div>


            {/* Przycisk dodawania do ulubionych */}
            {showAddButton && onAddToFavorites && !isFavorite && (
                 <button onClick={handleAddClick}>Add to Favorites</button>
            )}
             {isFavorite && <span className="favorite-star">⭐ Favorite</span>}
        </div>
    );
}

export default PokemonCard;