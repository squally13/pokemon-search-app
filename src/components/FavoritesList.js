import React from 'react';
import { removeFavorite } from '../services/api'; // Import API function

// Pass favorites and handler
function FavoritesList({ favorites, onRemoveFavoriteSuccess }) {

    const handleRemove = async (favId, favName) => {
         // Optional: Add confirmation dialog
         if (window.confirm(`Are you sure you want to remove ${favName} from favorites?`)) {
             try {
                 const response = await removeFavorite(favId);
                 if (response.data.success) {
                     alert('Favorite removed!'); // Or use a better notification system
                     onRemoveFavoriteSuccess(favId); // Notify parent component to update state
                 } else {
                      alert(response.data.message || 'Failed to remove favorite.');
                 }
             } catch (error) {
                  console.error("Remove favorite error:", error);
                  alert(error.response?.data?.message || error.message || 'An error occurred.');
             }
         }
    };

    if (!favorites || favorites.length === 0) {
        // Use a specific class for styling empty message if needed
        return <p className="empty-list-message">Your favorites list is empty.</p>;
    }

    return (
        // The wrapping div might not even be necessary if it just contains the list
        // <div className="FavoritesList"> Remove if it's just the list
            <ul>
                {favorites.map(fav => (
                    <li key={fav.id}>
                        {fav.pokemon_name}
                        <button onClick={() => handleRemove(fav.id, fav.pokemon_name)} style={{marginLeft: '10px'}}>
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
        // </div>
    );
}

export default FavoritesList;