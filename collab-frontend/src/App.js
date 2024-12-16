import React, { useState } from 'react';
import { Container, Grid, Paper, Button } from '@mui/material';
import Login from './components/Login';
import GroupList from './components/GroupList';
import Chat from './components/Chat';
import Register from './components/Register';

function App() {
    const [user, setUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleRegister = (newUser) => {
        setUser(newUser);
        setIsRegistering(false); // Close registration after successful registration
    };

    const toggleRegister = () => {
        setIsRegistering(!isRegistering);
    };

    if (isRegistering) {
        return <Register onRegister={handleRegister} />;
    }

    if (!user) {
        return (
            <div>
                <Login onLogin={setUser} />
                <Button onClick={toggleRegister} variant="outlined" sx={{ mt: 2 }}>
                    Register
                </Button>
            </div>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <GroupList user={user} onSelectGroup={setSelectedGroup} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, height: '70vh' }}>
                        {selectedGroup ? (
                            <Chat user={user} groupId={selectedGroup} />
                        ) : (
                            <div>Select a group to start chatting</div>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default App;
