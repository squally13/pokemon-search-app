import React, { useState } from 'react';
// Assuming api functions are correctly imported
import { registerUser, loginUser } from '../services/api';

function AuthForms({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // Can store string or JSX
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage(''); // Clear previous message
        setLoading(true);

        try {
            let response;
            if (isLogin) {
                response = await loginUser(username, password);
                if (response.data.success) {
                    // Login successful - trigger navigation via onLoginSuccess
                    onLoginSuccess(response.data.user);
                    // No need to set a message here, page will change
                } else {
                    // Login failed - set error message
                    setMessage(<p className="error">{response.data.message || 'Login failed.'}</p>);
                }
            } else { // Registration logic
                response = await registerUser(username, password);
                if (response.data.success) {
                    // Registration successful - show success message and switch to login
                     setMessage(<p className="success">{response.data.message || 'Registration successful! Please log in.'}</p>);
                     setIsLogin(true); // Switch to login view
                     // Optionally clear fields after successful registration
                     // setUsername(''); // Keep username maybe?
                     setPassword('');
                } else {
                     // Registration failed - show error message
                     setMessage(<p className="error">{response.data.message || 'Registration failed.'}</p>);
                }
            }
        } catch (error) {
            console.error("Auth error:", error);
            // Catch block likely means an error - show error message
            setMessage(<p className="error">{error.response?.data?.message || error.message || 'An error occurred during authentication.'}</p>);
        } finally {
             setLoading(false);
        }
    };

    return (
        // --- ADD className="AuthForms" HERE ---
        <div className="AuthForms">
            <h3>{isLogin ? 'Login' : 'Register'}</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username" // Add autocomplete hint
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        // Set autocomplete based on login/register mode
                        autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                </button>
            </form>

            {/* Render the message state (which might be a string or JSX) */}
            {message}

            {/* Switch mode button */}
            <button onClick={() => {
                 setIsLogin(!isLogin);
                 setMessage(''); // Clear message when switching modes
                 }}
                 disabled={loading}
                 // Add type="button" to prevent accidental form submission if ever inside <form>
                 type="button"
                >
                Switch to {isLogin ? 'Register' : 'Login'}
            </button>
        </div>
        // --- End of Wrapper DIV ---
    );
}

export default AuthForms;