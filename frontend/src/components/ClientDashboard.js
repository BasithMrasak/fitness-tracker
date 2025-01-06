import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [clientDetails, setClientDetails] = useState(null);
    const [foodConsumption, setFoodConsumption] = useState([]);
    const [foodForm, setFoodForm] = useState({
        food_item: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0] // Default to today's date
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Enhanced token validation
    const getValidToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authentication token found. Please log in.');
            setIsLoading(false);
            return null;
        }
        return token;
    };

    // Fetch client details and food consumption on component load
    useEffect(() => {
        const token = getValidToken();
        if (token) {
            Promise.all([
                fetchClientDetails(token),
                fetchFoodConsumption(token)
            ]).finally(() => setIsLoading(false));
        }
    }, []);

    const fetchClientDetails = async (token) => {
        try {
            const response = await axios.get('http://localhost:5000/api/client-details', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClientDetails(response.data);
        } catch (err) {
            console.error('Detailed client details error:', err.response || err);
            setError(err.response?.data?.message || 'Error fetching client details');
        }
    };

    const fetchFoodConsumption = async (token) => {
        try {
            const response = await axios.get('http://localhost:5000/api/client-food-consumption', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFoodConsumption(response.data);
        } catch (err) {
            console.error('Detailed food consumption error:', err.response || err);
            setError(err.response?.data?.message || 'Error fetching food consumption');
        }
    };

    const handleFoodFormChange = (e) => {
        const { name, value } = e.target;
        setFoodForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFoodSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const token = getValidToken();
        if (!token) return;

        try {
            const response = await axios.post(
                'http://localhost:5000/api/food-consumption',
                foodForm,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSuccess(response.data.message);
            await fetchFoodConsumption(token);

            // Reset form
            setFoodForm({
                food_item: '',
                quantity: '',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            console.error('Food submission error:', err.response || err);
            setError(err.response?.data?.error || 'Failed to add food consumption');
        }
    };
    const navigate = useNavigate(); // Initialize navigate

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the stored token
        alert('You have been logged out!');
        navigate('/login'); // Redirect to the login page
    };

    const renderProfileTab = () => {
        if (isLoading) return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
        if (error) return <div className="text-red-500 p-4 bg-red-50 rounded-md">{error}</div>;
        if (!clientDetails) return <div className="text-center p-4">No client details found</div>;

        return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="flex items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                        <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                        <p className="text-lg font-semibold text-gray-800">{clientDetails.first_name}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                        <p className="text-lg font-semibold text-gray-800">{clientDetails.last_name}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                        <p className="text-lg font-semibold text-gray-800">
                            {new Date(clientDetails.dob).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Registered Since</label>
                        <p className="text-lg font-semibold text-gray-800">
                            {new Date(clientDetails.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderFoodConsumptionTab = () => {
        if (isLoading) return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
        if (error) return <div className="text-red-500 p-4 bg-red-50 rounded-md">{error}</div>;

        return (
            <div className="space-y-6">
                {/* Add Food Consumption Form */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Log Food Consumption</h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {success && <p className="text-green-500 mb-4">{success}</p>}
                    <form onSubmit={handleFoodSubmit} className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Food Item</label>
                            <input
                                type="text"
                                name="food_item"
                                value={foodForm.food_item}
                                onChange={handleFoodFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                type="text"
                                name="quantity"
                                value={foodForm.quantity}
                                onChange={handleFoodFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={foodForm.date}
                                onChange={handleFoodFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="md:col-span-3 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
                        >
                            Add Food Consumption
                        </button>
                    </form>
                </div>

                {/* Food Consumption History */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Food Consumption History</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Item</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {foodConsumption.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{item.food_item}</td>
                                        <td className="px-4 py-3">{item.quantity}</td>
                                        <td className="px-4 py-3">
                                            {new Date(item.date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {foodConsumption.length === 0 && (
                            <p className="text-center text-gray-500 py-4">
                                No food consumption records found
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Client Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
                    >
                        Logout
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6 flex space-x-2 bg-white rounded-lg shadow-md p-1">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 rounded-md transition duration-300 ${activeTab === 'profile'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('food-consumption')}
                        className={`flex-1 py-3 rounded-md transition duration-300 ${activeTab === 'food-consumption'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Food Consumption
                    </button>
                </div>

                {/* Conditional Rendering of Tabs */}
                {activeTab === 'profile' ? renderProfileTab() : renderFoodConsumptionTab()}
            </div>
        </div>
    );
};

export default ClientDashboard;