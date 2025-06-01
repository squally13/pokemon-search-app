// src/utils/pokemonUtils.js

/**
 * Determines the generation of a Pokémon based on its National Pokédex ID.
 * @param {number} id - The National Pokédex ID of the Pokémon.
 * @returns {number|string} The generation number or 'N/A' if not determinable.
 */
export const getGenerationFromId = (id) => {
    if (typeof id !== 'number' || id <= 0) return 'N/A';

    if (id >= 1 && id <= 151) return 1;    // Generation I (Kanto)
    if (id >= 152 && id <= 251) return 2;   // Generation II (Johto)
    if (id >= 252 && id <= 386) return 3;   // Generation III (Hoenn)
    if (id >= 387 && id <= 493) return 4;   // Generation IV (Sinnoh)
    if (id >= 494 && id <= 649) return 5;   // Generation V (Unova)
    if (id >= 650 && id <= 721) return 6;   // Generation VI (Kalos)
    if (id >= 722 && id <= 809) return 7;   // Generation VII (Alola)
    if (id >= 810 && id <= 905) return 8;   // Generation VIII (Galar, Hisui)
    if (id >= 906 && id <= 1025) return 9;  // Generation IX (Paldea) - (Current approx. end, update as needed)
    // Add more ranges as new generations are released.
    return 'N/A';
};