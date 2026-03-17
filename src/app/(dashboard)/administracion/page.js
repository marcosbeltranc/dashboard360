'use client';
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Divider,
    CircularProgress, IconButton, Button, Stack,
    Table, TableBody, TableCell, TableContainer, TableRow, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
    TextField
} from '@mui/material';
import {
    Add,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility,
    Layers as LayersIcon,
    Close,
    Save,
    Settings
} from '@mui/icons-material';
import api from '@/lib/api';

const colorPalette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function Sistemas() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modales
    const [openOptionsModal, setOpenOptionsModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [openFormModal, setOpenFormModal] = useState(false);
    const [editingOption, setEditingOption] = useState(null);
    const [formOption, setFormOption] = useState({ name: '', color: colorPalette[0], sort_order: 1 });
    const [openGroupModal, setOpenGroupModal] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', code: '', description: '' });

    // Nuevo: Editar grupo
    const [openEditGroupModal, setOpenEditGroupModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [editGroupForm, setEditGroupForm] = useState({ name: '', description: '' });

    useEffect(() => { fetchGroups(); }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await api.get('/option_groups');
            setGroups(response.data.data);
        } catch (error) {
            console.error("Error al cargar grupos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Grupos
    const handleSaveGroup = async () => {
        if (!newGroup.name || !newGroup.code) return;
        try {
            await api.post('/option_groups', { ...newGroup, is_active: true });
            await fetchGroups();
            setOpenGroupModal(false);
            setNewGroup({ name: '', code: '', description: '' });
        } catch (error) {
            console.error("Error al crear grupo:", error);
            alert("Error: El código debe ser único.");
        }
    };

    // Editar grupo
    const handleOpenEditGroup = (group) => {
        setEditingGroup(group);
        setEditGroupForm({ name: group.name, description: group.description || '' });
        setOpenEditGroupModal(true);
    };

    const handleSaveEditGroup = async () => {
        if (!editGroupForm.name || !editingGroup) return;
        try {
            await api.put(`/option_groups/${editingGroup.id}`, editGroupForm);
            if (selectedGroup?.id === editingGroup.id) {
                setSelectedGroup(prev => ({ ...prev, ...editGroupForm }));
            }
            await fetchGroups();
            setOpenEditGroupModal(false);
            setEditingGroup(null);
        } catch (error) {
            console.error("Error al editar grupo:", error);
            alert("Hubo un error al guardar los cambios.");
        }
    };

    // Opciones
    const handleOpenOptions = (group) => {
        setSelectedGroup(group);
        setOpenOptionsModal(true);
    };

    const handleOpenCreateForm = () => {
        setEditingOption(null);
        setFormOption({ name: '', color: colorPalette[0], sort_order: (selectedGroup?.options?.length || 0) + 1 });
        setOpenFormModal(true);
    };

    const handleOpenEditForm = (option) => {
        setEditingOption(option);
        setFormOption({ name: option.name, color: option.color || colorPalette[0], sort_order: option.sort_order || 1 });
        setOpenFormModal(true);
    };

    const handleDeleteOption = async (optionId) => {
        try {
            await api.delete(`/options/${optionId}`);
            await fetchGroups();
            setOpenOptionsModal(false);
        } catch (error) {
            console.error("Error al eliminar opción:", error);
            alert("Hubo un error al eliminar la opción.");
        }
    };

    const handleSaveOption = async () => {
        if (!formOption.name || !selectedGroup) return;

        try {
            const commonPayload = {
                name: formOption.name,
                color: formOption.color,
                sort_order: parseInt(formOption.sort_order),
                slug: formOption.name.toLowerCase().trim().replace(/\s+/g, '_')
            };

            if (editingOption) {
                const response = await api.put(`/options/${editingOption.id}`, commonPayload);
                setSelectedGroup(prev => ({
                    ...prev,
                    options: prev.options.map(opt => opt.id === response.data.id ? response.data : opt)
                }));
            } else {
                const response = await api.post('/options', {
                    ...commonPayload,
                    type: selectedGroup.code,
                    option_group_id: selectedGroup.id,
                    is_active: true
                });
                setSelectedGroup(prev => ({
                    ...prev,
                    options: [...(prev.options || []), response.data]
                }));
            }

            fetchGroups();
            setOpenFormModal(false);
            setEditingOption(null);
        } catch (error) {
            console.error("Error al guardar opción:", error);
            alert("Hubo un error al guardar los cambios.");
        }
    };

    if (loading && groups.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress thickness={4} size={50} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f1f5f9', minHeight: '100vh' }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
                <Box>
                    <Typography variant="h4" fontWeight="900" color="#1e293b">
                        Configuración de Diccionarios
                    </Typography>
                    <Typography color="text.secondary">Gestiona las categorías y listas de valores del sistema</Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpenGroupModal(true)} sx={{ borderRadius: 1 }}>
                    Nuevo Grupo
                </Button>
            </Box>

            {/* Grid de Tarjetas - 3 por fila */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {groups.map((group) => (
                    <Box key={group.id} sx={{
                        width: 'calc(33.333% - 16px)',
                        boxSizing: 'border-box'
                    }}>
                        <Paper sx={{
                            p: 3,
                            borderRadius: 1,
                            border: '1px solid #e2e8f0',
                            height: '100%'
                        }}>
                            <Stack spacing={2} sx={{ height: '100%' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="subtitle1" fontWeight="800" noWrap>{group.name}</Typography>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 'bold' }}>
                                                {group.code.toUpperCase()}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <IconButton size="small" onClick={() => handleOpenEditGroup(group)}>
                                        <Settings fontSize="small" />
                                    </IconButton>
                                </Stack>

                                <Typography variant="body2" color="text.secondary" sx={{ height: 40, overflow: 'hidden' }}>
                                    {group.description || 'Sin descripción definida para este grupo.'}
                                </Typography>

                                <Box sx={{ flex: 1 }} />
                                <Divider />

                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" fontWeight="700" color="#64748b">
                                        {group.options?.length || 0} Opciones
                                    </Typography>
                                    <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => handleOpenOptions(group)} sx={{ borderRadius: 1 }}>
                                        Gestionar
                                    </Button>
                                </Box>
                            </Stack>
                        </Paper>
                    </Box>
                ))}
            </Box>

            {/* Modal Opciones */}
            <Dialog open={openOptionsModal} onClose={() => setOpenOptionsModal(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" fontWeight="900">Listado: {selectedGroup?.name}</Typography>
                        <Typography variant="caption" color="primary">{selectedGroup?.code}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => setOpenOptionsModal(false)}><Close /></IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreateForm} sx={{ borderRadius: 1 }}>
                            Nuevo Ítem
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table size="small">
                            <TableBody>
                                {selectedGroup?.options?.map((option) => (
                                    <TableRow key={option.id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: option.color || '#cbd5e1' }} />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="700">{option.name}</Typography>
                                                    <Typography variant="caption" color="text.disabled">
                                                        {option.slug} • Orden: {option.sort_order}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleOpenEditForm(option)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error">
                                                <DeleteIcon fontSize="small" onClick={() => handleDeleteOption(option.id)} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenOptionsModal(false)} sx={{ borderRadius: 1 }}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal Form Opción */}
            <Dialog open={openFormModal} onClose={() => setOpenFormModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{editingOption ? 'Editar Ítem' : 'Nuevo Ítem'}</DialogTitle>
                <DialogContent>
                    <Typography variant="caption" display="block" mb={2}>Categoría: {selectedGroup?.name}</Typography>
                    <Stack spacing={2}>
                        <TextField fullWidth label="Nombre" size="small" value={formOption.name}
                            onChange={(e) => setFormOption({ ...formOption, name: e.target.value })} sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }} />
                        <Box>
                            <Typography variant="caption" fontWeight="bold">Color</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                {colorPalette.map((c) => (
                                    <Box key={c} onClick={() => setFormOption({ ...formOption, color: c })}
                                        sx={{
                                            width: 30, height: 30, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                                            border: formOption.color === c ? '3px solid #000' : '2px solid transparent'
                                        }} />
                                ))}
                            </Box>
                        </Box>
                        <TextField type="number" label="Orden" size="small" value={formOption.sort_order}
                            onChange={(e) => setFormOption({ ...formOption, sort_order: e.target.value })} sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFormModal(false)} sx={{ borderRadius: 1 }}>Cancelar</Button>
                    <Button onClick={handleSaveOption} variant="contained" startIcon={<Save />} disabled={!formOption.name} sx={{ borderRadius: 1 }}>
                        {editingOption ? 'Guardar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Nuevo Grupo */}
            <Dialog open={openGroupModal} onClose={() => setOpenGroupModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Nuevo Grupo</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField fullWidth label="Nombre" size="small" value={newGroup.name}
                            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} />
                        <TextField fullWidth label="Código" size="small" value={newGroup.code}
                            onChange={(e) => setNewGroup({ ...newGroup, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })} />
                        <TextField fullWidth label="Descripción" size="small" multiline rows={2} value={newGroup.description}
                            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenGroupModal(false)}>Cancelar</Button>
                    <Button onClick={handleSaveGroup} variant="contained" disabled={!newGroup.name || !newGroup.code}>
                        Crear
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Editar Grupo */}
            <Dialog open={openEditGroupModal} onClose={() => setOpenEditGroupModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Grupo</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField fullWidth label="Nombre" size="small" value={editGroupForm.name}
                            onChange={(e) => setEditGroupForm({ ...editGroupForm, name: e.target.value })} />
                        <TextField fullWidth label="Código" size="small" value={editingGroup?.code || ''} disabled />
                        <TextField fullWidth label="Descripción" size="small" multiline rows={2} value={editGroupForm.description}
                            onChange={(e) => setEditGroupForm({ ...editGroupForm, description: e.target.value })} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditGroupModal(false)}>Cancelar</Button>
                    <Button onClick={handleSaveEditGroup} variant="contained" disabled={!editGroupForm.name}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}