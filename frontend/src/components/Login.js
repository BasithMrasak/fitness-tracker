import React, { useState } from 'react';
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                username,
                password,
            });
            // Save token in local storage or state
            localStorage.setItem('token', response.data.token);
            // Redirect to dashboard based on user type
            if (response.data.userType === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/client';
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full bg-white shadow-lg rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-6">
                    <h2 className="text-center text-3xl font-bold text-white">Fitness Tracker</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                       transition duration-300 ease-in-out"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                       transition duration-300 ease-in-out"
                            placeholder="Enter your password"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                                       shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-teal-400 
                                       hover:from-blue-600 hover:to-teal-500 focus:outline-none focus:ring-2 
                                       focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out 
                                       transform hover:scale-105 active:scale-95"
                        >
                            Sign In
                        </button>
                    </div>

                    {/*<div className="text-center">
                        <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 transition duration-300">
                            Forgot Password?
                        </a>
                    </div>*/}
                </form>
            </div>
        </div>
    );
}

export default Login;