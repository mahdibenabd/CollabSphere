import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

function Register({ onRegister }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [userClass, setUserClass] = useState('');
    const [department, setDepartment] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:4444/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    email,
                    userClass,
                    department,
                }),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const data = await response.json();
            onRegister(data.user); // Call the onRegister prop with the new user data
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Register
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <form onSubmit={handleRegister}>
                <TextField
                    label="Username"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="User Class"
                    fullWidth
                    margin="normal"
                    value={userClass}
                    onChange={(e) => setUserClass(e.target.value)}
                />
                <TextField
                    label="Department"
                    fullWidth
                    margin="normal"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                    Register
                </Button>
            </form>
        </Box>
    );
}

export default Register; 