'use client';

import { useEffect, useState } from 'react';
import {
    Box, Tabs, Tab, Typography, TextField, Paper,
    IconButton, Button, Stack, Dialog, DialogTitle,
    DialogContent, DialogActions, MenuItem
} from '@mui/material';

import { Edit, Delete } from '@mui/icons-material';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const LEVELS = [
    { id: 0, label: 'Admin' },
    { id: 1, label: 'Developer' },
    { id: 2, label: 'Network' },
    { id: 3, label: 'Support' },
    { id: 4, label: 'User' },
];

export default function UsersPage() {

    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);

    const [activeTab, setActiveTab] = useState(0);
    const [search, setSearch] = useState('');

    const [openModal, setOpenModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        level: 4
    });

    // Load users
    const loadUsers = async () => {
        const res = await api.get('/users');
        setUsers(res.data);
    };

    const handleTabChange = (e, v) => {
        setActiveTab(v);
        setSearch('');
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Filter
    useEffect(() => {
        let data = users.filter(u => u.level === activeTab);

        const normalizedSearch = search.trim().toLowerCase();

        if (normalizedSearch) {
            data = data.filter(u =>
                u.name.toLowerCase().includes(normalizedSearch) ||
                u.email.toLowerCase().includes(normalizedSearch)
            );
        }

        setFiltered(data);
    }, [users, search, activeTab]);

    // Create / Update
    const handleSave = async () => {
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, form);
                toast.success('Usuario actualizado');
            } else {
                await api.post('/users', form);
                toast.success('Usuario creado');
            }

            setOpenModal(false);
            setEditingUser(null);
            setForm({ name: '', email: '', password: '', level: activeTab });

            loadUsers();
        } catch (e) {
            toast.error('Error al guardar');
        }
    };

    // Edit
    const handleEdit = (user) => {
        setEditingUser(user);

        setForm({
            name: user.name,
            email: user.email,
            password: '',
            level: Number(user.level)
        });

        setSearch('');
        setActiveTab(Number(user.level));
        setOpenModal(true);
    };

    // Delete
    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar usuario?')) return;

        await api.delete(`/users/${id}`);
        toast.success('Eliminado');
        loadUsers();
    };

    return (
        <Box p={4}>

            {/* HEADER */}
            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    Usuarios
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => {
                        setEditingUser(null);
                        setForm({ name: '', email: '', password: '', level: activeTab });
                        setSearch('');
                        setOpenModal(true);
                    }}
                >
                    Nuevo Usuario
                </Button>
            </Stack>

            {/* TABS */}
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{ mb: 2 }}
            >
                {LEVELS.map(l => (
                    <Tab key={l.id} label={l.label} />
                ))}
            </Tabs>

            {/* SEARCH */}
            <TextField
                key={activeTab}
                fullWidth
                size="small"
                placeholder="Buscar usuario..."
                value={search ?? ''}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 3 }}
            />

            {/* LIST */}
            <Paper variant="outlined">

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 100px',
                        px: 2,
                        py: 1,
                        borderBottom: '1px solid #eee'
                    }}
                >
                    <Typography variant="caption">Nombre</Typography>
                    <Typography variant="caption">Email</Typography>
                    <Typography variant="caption">Acciones</Typography>
                </Box>

                {filtered.map(user => (
                    <Box
                        key={user.id}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 100px',
                            px: 2,
                            py: 1.5,
                            alignItems: 'center',
                            borderBottom: '1px solid #f5f5f5'
                        }}
                    >
                        <Typography>{user.name}</Typography>
                        <Typography color="text.secondary">{user.email}</Typography>

                        <Box>
                            <IconButton onClick={() => handleEdit(user)}>
                                <Edit fontSize="small" />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDelete(user.id)}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                ))}

                {filtered.length === 0 && (
                    <Box p={3} textAlign="center">
                        <Typography color="text.secondary">
                            Sin usuarios
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* MODAL */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs">
                <DialogTitle>
                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Nombre"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />

                        <TextField
                            label="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />

                        <TextField
                            label="Password"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />

                        <TextField
                            select
                            label="Nivel"
                            value={form.level ?? ''}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    level: Number(e.target.value)
                                })
                            }
                        >
                            {LEVELS.map(l => (
                                <MenuItem key={l.id} value={l.id}>
                                    {l.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}