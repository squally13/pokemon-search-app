// src/components/AllPokemonList.js
import React, { useState, useMemo } from 'react';

const ITEMS_PER_PAGE = 40; // Możesz dostosować, aby więcej Pokémonów mieściło się na stronie

function AllPokemonList({ allPokemonList, onPokemonSelect }) {
    const [currentPage, setCurrentPage] = useState(1);

    const paginatedData = useMemo(() => {
        if (!allPokemonList || allPokemonList.length === 0) {
            return { currentItems: [], totalPages: 0 };
        }
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const currentItems = allPokemonList.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allPokemonList.length / ITEMS_PER_PAGE);
        return { currentItems, totalPages };
    }, [allPokemonList, currentPage]);

    const { currentItems, totalPages } = paginatedData;

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            // Optionally scroll to top of list on page change
            // const listElement = document.querySelector('.all-pokemon-list-container');
            // if (listElement) listElement.scrollTop = 0;
        }
    };

    const handleItemClick = (pokemonNameOrId) => {
        if (onPokemonSelect) {
            onPokemonSelect(pokemonNameOrId); // Wywołuje handleSearch w App.js
        }
    };

    if (!allPokemonList || allPokemonList.length === 0) {
        return <p className="loading-message">Loading Pokémon list...</p>; // Użyj klasy dla spójnego stylu
    }

    // Pagination buttons logic
    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; // Max visible page buttons (e.g., 1 ... 3 4 5 ... 10)
        const halfPagesToShow = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= halfPagesToShow + 1) {
                for (let i = 1; i <= maxPagesToShow - 1; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - halfPagesToShow) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - (maxPagesToShow - 2); i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - halfPagesToShow +1 ; i <= currentPage + halfPagesToShow -1; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }


        return pageNumbers.map((number, index) =>
            typeof number === 'number' ? (
                <button
                    key={index}
                    onClick={() => handlePageChange(number)}
                    disabled={currentPage === number}
                    className={currentPage === number ? 'active' : ''}
                >
                    {number}
                </button>
            ) : (
                <span key={index} className="pagination-ellipsis">...</span>
            )
        );
    };


    return (
        <div className="all-pokemon-list-container">
            <ul className="all-pokemon-list">
                {currentItems.map(pokemon => (
                    <li
                        key={`${pokemon.id}-${pokemon.name}`} // Klucz powinien być unikalny
                        className="all-pokemon-list-item"
                        onClick={() => handleItemClick(pokemon.name)} // Przekaż nazwę do wyszukania
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleItemClick(pokemon.name);}}}
                    >
                        <img src={pokemon.spriteUrl} alt={pokemon.name} className="all-pokemon-list-sprite" />
                        <div className="all-pokemon-list-details">
                            <span className="all-pokemon-list-name">{pokemon.name}</span>
                            <div className="all-pokemon-list-meta">
                                <span className="all-pokemon-list-id">ID: #{String(pokemon.id).padStart(3, '0')}</span>
                                <span className="all-pokemon-list-gen">Gen: {pokemon.generation}</span>
                            </div>
                             {/* Types would require more data or individual fetches */}
                             {/* <div className="all-pokemon-list-types">
                                {pokemon.types && pokemon.types.length > 0
                                    ? pokemon.types.map(type => <span key={type} className={`type-badge type-${type.toLowerCase()}`}>{type}</span>)
                                    : <span className="type-badge type-unknown">N/A</span>
                                }
                            </div> */}
                        </div>
                    </li>
                ))}
            </ul>

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous Page"
                    >
                        &laquo; Prev
                    </button>
                    {renderPageNumbers()}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next Page"
                    >
                        Next &raquo;
                    </button>
                </div>
            )}
        </div>
    );
}

export default AllPokemonList;