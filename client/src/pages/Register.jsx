import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError(' Passwords do not match');
        }

        try {
            await register(formData);
            navigate('/'); // Go to dashboard if auto-login works
        } catch (err) {
            setError(err.message || 'REGISTRATION FAILED');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h2>INITIALIZE PROTOCOL</h2>
                    <p className="typing-effect">Create new user identity...</p>
                </div>

                {error && <div className="auth-error">&gt;&gt; {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>USERNAME</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                    </div>

                    <div className="form-group">
                        <label>EMAIL</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                    </div>

                    <div className="form-group">
                        <label>ACCESS KEY</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>CONFIRM KEY</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn">
                        [ REGISTER IDENTITY ]
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already waiting? <Link to="/login">Execute Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
