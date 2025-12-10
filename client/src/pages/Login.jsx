import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Real API call
            await login(formData);
            navigate('/');
        } catch (err) {
            setError(err.message || 'ACCESS DENIED: Invalid Credentials');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h2>SYSTEM ACCESS</h2>
                    <p className="typing-effect">Enter credentials to decrypt...</p>
                </div>

                {error && <div className="auth-error">&gt;&gt; {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>IDENTITY (EMAIL/USERNAME)</label>
                        <input
                            type="text"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                    </div>

                    <div className="form-group">
                        <label>ACCESS KEY (PASSWORD)</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn">
                        [ EXECUTE LOGIN ]
                    </button>
                </form>

                <div className="auth-footer">
                    <p>No access key? <Link to="/register">Initialize Protocol</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
