import React, { useState, useEffect, useRef } from 'react';

function SearchBar({ onSearch, allPokemonList }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Ref for the main SearchBar container (the form itself will be main interactive area)
    const formRef = useRef(null); // Changed from searchBarRef to formRef for clarity

    useEffect(() => {
        function handleClickOutside(event) {
            // If the click is outside the formRef element, hide suggestions
            if (formRef.current && !formRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [formRef]); // Dependency: formRef

    const handleChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (value.length > 0 && allPokemonList && allPokemonList.length > 0) {
            const filteredSuggestions = allPokemonList
                .filter(pokemon =>
                    pokemon.name.toLowerCase().startsWith(value.toLowerCase())
                )
                .slice(0, 7);
            setSuggestions(filteredSuggestions);
            setShowSuggestions(filteredSuggestions.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (pokemon) => {
        const selectedName = pokemon.name;
        setSearchTerm(selectedName);
        setSuggestions([]);
        setShowSuggestions(false);
        onSearch(selectedName);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setShowSuggestions(false);
        if (searchTerm.trim()) {
            onSearch(searchTerm.trim());
        }
    };

    return (
        // The outer .SearchBar div is mainly for centering the form via CSS
        <div className="SearchBar">
            {/* Form is now the relative parent for suggestions and handles clicks outside */}
            <form onSubmit={handleSubmit} ref={formRef} style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search Pokémon by name or ID"
                    value={searchTerm}
                    onChange={handleChange}
                    onFocus={() => {
                        if (searchTerm.length > 0 && suggestions.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                    autoComplete="off"
                />
                <button type="submit">Search</button>

                {/* Suggestions Dropdown - MOVED INSIDE THE FORM */}
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="suggestions-list">
                        {suggestions.map((pokemon) => (
                            <li
                                key={pokemon.id}
                                className="suggestion-item"
                                onMouseDown={() => handleSuggestionClick(pokemon)}
                            >
                                <img src={pokemon.spriteUrl} alt={pokemon.name} className="suggestion-sprite" />
                                <span className="suggestion-id">#{String(pokemon.id).padStart(3, '0')}</span>
                                <span className="suggestion-name">{pokemon.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </form>
        </div>
    );
}

export default SearchBar;