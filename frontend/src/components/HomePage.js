import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center py-6">
                    <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight hover:text-blue-600 transition duration-300">
                        {/*<img src={logo} alt="Fitness Tracker Logo" className="w-16 inline-block mr-2" />*/}
                        Fitness Tracker
                    </h1>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                    >
                        Login
                    </button>
                </header>

                <main className="space-y-12">
                    <section className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition duration-500 ease-in-out">
                        <h2 className="text-3xl font-semibold text-blue-700 mb-6">About Us</h2>
                        <div className="flex space-x-6">
                            {/*} <img
                                {/*src="/about-image.jpg"
                                alt="Fitness Tracker"
                                className="w-1/2 rounded-xl shadow-md"
                            />*/}
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Welcome to Fitness Tracker, your go-to platform for tracking fitness progress
                                and managing health goals. Whether you're an admin managing clients or a user logging food
                                consumption, our platform offers seamless tools tailored for your needs.
                            </p>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition duration-500 ease-in-out">
                        <h2 className="text-3xl font-semibold text-blue-700 mb-6">Contact Us</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xl font-medium text-blue-600 mb-2">Email</h3>
                                <p className="text-lg text-gray-600">support@fitnesstracker.com</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-blue-600 mb-2">Phone</h3>
                                <p className="text-lg text-gray-600">+91 8649132698</p>
                            </div>
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-medium text-blue-600 mb-2">Address</h3>
                                <p className="text-lg text-gray-600">
                                    college Jn Kothamangalam, kerela
                                </p>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="mt-12 text-center text-gray-500">
                    &copy; {new Date().getFullYear()} Fitness Tracker. All rights reserved.
                </footer>
            </div>
        </div>
    );
};

export default HomePage;
