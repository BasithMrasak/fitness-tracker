import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('clients');
    const [clients, setClients] = useState([]);
    const [foodConsumption, setFoodConsumption] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        dob: '',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/clients', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setClients(response.data);
            setIsLoading(false);
        } catch (err) {
            setError('Error fetching clients. Please try again later.');
            setIsLoading(false);
        }
    };

    const fetchFoodConsumption = async (clientId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/food-consumption/${clientId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setFoodConsumption(response.data);
            setError(null);
        } catch (err) {
            setError('Error fetching food consumption details. Please try again later.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await axios.post('http://localhost:5000/api/clients', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setSuccess('Client added successfully!');
            fetchClients();
            setFormData({ username: '', password: '', first_name: '', last_name: '', dob: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Error creating user and client.');
        }
    };

    const deleteClient = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/clients/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setSuccess('Client deleted successfully!');
            fetchClients();
        } catch (error) {
            setError('An error occurred while deleting the client');
        }
    };

    const handleSearch = () => {
        const client = clients.find(
            (c) => `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (client) {
            fetchFoodConsumption(client.user_id);
        } else {
            setFoodConsumption([]);
            setError('No client found with that name.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const renderClientsTab = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Manage Clients</h2>
                {error && <p className="text-red-500 bg-red-50 p-3 rounded mb-4">{error}</p>}
                {success && <p className="text-green-500 bg-green-50 p-3 rounded mb-4">{success}</p>}

                <form onSubmit={handleFormSubmit} className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                            Add Client
                        </button>
                    </div>
                </form>

                <div className="bg-gray-50 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-3">Client List</h3>
                    <div className="space-y-2">
                        {clients.map((client) => (
                            <div key={client.user_id} className="flex justify-between items-center p-3 bg-white rounded shadow-sm">
                                <span className="font-medium">
                                    {client.first_name} {client.last_name}
                                    <span className="text-gray-500 ml-2">({client.username})</span>
                                </span>
                                <button
                                    onClick={() => deleteClient(client.user_id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFoodConsumptionTab = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Food Consumption</h2>
                {error && <p className="text-red-500 bg-red-50 p-3 rounded mb-4">{error}</p>}

                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="Enter client name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                    >
                        Search
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Item</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {foodConsumption.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">{item.food_item}</td>
                                    <td className="px-4 py-2">{item.quantity}</td>
                                    <td className="px-4 py-2">{new Date(item.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {foodConsumption.length === 0 && !error && (
                        <p className="text-center text-gray-500 py-4">No food consumption data found</p>
                    )}
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>

                <div className="mb-6 flex space-x-2 bg-white rounded shadow p-1">
                    <button
                        onClick={() => setActiveTab('clients')}
                        className={`flex-1 py-2 rounded transition duration-200 ${activeTab === 'clients'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Manage Clients
                    </button>
                    <button
                        onClick={() => setActiveTab('food')}
                        className={`flex-1 py-2 rounded transition duration-200 ${activeTab === 'food'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Food Consumption
                    </button>
                </div>

                {activeTab === 'clients' ? renderClientsTab() : renderFoodConsumptionTab()}
            </div>
        </div>
    );
};

export default AdminDashboard;