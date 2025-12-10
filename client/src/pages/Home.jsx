import React from 'react';
import { useAuth } from '../context/AuthContext';
import BinaryTool from '../components/BinaryTool';
import './Dashboard.css';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-container">
            <BinaryTool />
        </div>
    );
};

export default Home;
