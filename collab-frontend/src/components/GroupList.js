import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Button, Box, TextField } from '@mui/material';
import axios from 'axios';

function GroupList({ user, onSelectGroup }) {
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await axios.get('http://localhost:4444/api/groups');
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const createGroup = async () => {
        try {
            await axios.post('http://localhost:4444/api/groups', {
                groupName: newGroupName,
                creatorId: user.id,
                description: 'New group'
            });
            setNewGroupName('');
            fetchGroups();
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const joinGroup = async (groupId) => {
        try {
            await axios.post('http://localhost:4444/api/groups/join', {
                groupId,
                userId: user.id
            });
            onSelectGroup(groupId);
        } catch (error) {
            console.error('Error joining group:', error);
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Box sx={{ p: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    label="New Group Name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Button
                    fullWidth
                    variant="contained"
                    onClick={createGroup}
                    sx={{ mt: 1 }}
                >
                    Create Group
                </Button>
            </Box>
            <List>
                {groups.map((group) => (
                    <ListItem
                        key={group.id}
                        secondaryAction={
                            <Button onClick={() => joinGroup(group.id)}>
                                Join
                            </Button>
                        }
                    >
                        <ListItemText primary={group.name} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default GroupList;
