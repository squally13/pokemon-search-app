import React, { useState } from 'react';

function SearchBar({ onSearch }) { // Pass search handler function as prop
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent page reload
        if (searchTerm.trim()) {
            onSearch(searchTerm.trim());
        }
        // Optional: clear search term after search
        // setSearchTerm('');
    };

    return (
        // --- DODAJEMY Wrapper DIV z className ---
        <div className="SearchBar">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Search Pokémon by name or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>
        </div>
        // --- Koniec Wrapper DIV ---
    );
}

export default SearchBar;