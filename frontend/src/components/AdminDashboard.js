import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [foodConsumption, setFoodConsumption] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch clients on component load
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/clients', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setClients(response.data);
            } catch (err) {
                setError('Error fetching clients. Please try again later.');
            }
        };

        fetchClients();
    }, []);

    // Fetch food consumption details for a selected client
    const fetchFoodConsumption = async (clientId) => {
        setLoading(true);
        setError(null);
        setSelectedClientId(clientId);

        try {
            const response = await axios.get(
                `http://localhost:5000/api/food-consumption/${clientId}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            setFoodConsumption(response.data);
        } catch (err) {
            setError('Error fetching food consumption details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

            {/* Client List */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="text-xl font-semibold mb-3">Clients</h2>
                {error && <p className="text-red-500 mb-3">{error}</p>}
                <ul>
                    {clients.map((client) => (
                        <li
                            key={client.id}
                            className="mb-2 cursor-pointer hover:underline"
                            onClick={() => fetchFoodConsumption(client.id)}
                        >
                            {client.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Food Consumption Details */}
            {selectedClientId && (
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-3">Food Consumption</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-b p-2">Date</th>
                                    <th className="border-b p-2">Food Item</th>
                                    <th className="border-b p-2">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {foodConsumption.map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="border-b p-2">{entry.date}</td>
                                        <td className="border-b p-2">{entry.food_item}</td>
                                        <td className="border-b p-2">{entry.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
