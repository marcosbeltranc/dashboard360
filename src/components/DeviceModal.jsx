'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    Grid, MenuItem, Box, Typography, Divider, IconButton, Fade, Grow
} from '@mui/material';
import { Save, Close, ChevronRight } from '@mui/icons-material';

const initialForm = {
    name: '',
    description: '',
    device_type_id: '',
    sub_type_id: '',
    location_id: '',
    status_id: '',
    ip_address: '',
    cpu: '',
    ram: '',
    storage: '',
    raid_type: '',
    folders_count: 0,
    brand: '',
    model: '',
    last_maintenance: '',
    next_maintenance: ''
};

export default function DeviceModal({ open, onClose, onSave, options }) {
    const [formData, setFormData] = useState(initialForm);
    const [selectedTypeSlug, setSelectedTypeSlug] = useState('');

    useEffect(() => {
        if (open) {
            setFormData(initialForm);
            setSelectedTypeSlug('');
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'device_type_id') {
            const type = options.deviceTypes.find(t => t.id === value);
            setSelectedTypeSlug(type?.slug || '');

            // Resetear campos al cambiar tipo para evitar contaminación de datos
            setFormData({
                ...initialForm,
                [name]: value,
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        if (!formData.name || !formData.device_type_id || !formData.location_id || !formData.status_id) {
            alert("Por favor completa los campos obligatorios (*)");
            return;
        }
        onSave(formData);
    };

    const currentSubTypes = selectedTypeSlug === 'server'
        ? options.serverTypes
        : selectedTypeSlug === 'dispositivo_red'
            ? options.networkTypes
            : [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Registrar Activo</Typography>
                    {selectedTypeSlug && (
                        <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                            Configurando: {options.deviceTypes.find(t => t.slug === selectedTypeSlug)?.name}
                        </Typography>
                    )}
                </Box>
                <IconButton onClick={onClose} size="small"><Close /></IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: 4, minHeight: selectedTypeSlug ? 'auto' : '200px', display: 'flex', flexDirection: 'column' }}>
                <Grid container spacing={3}>
                    {/* PASO 1: SELECCIÓN DE TIPO (Siempre visible) */}
                    <Grid item xs={12} md={selectedTypeSlug ? 4 : 12}>
                        <TextField
                            select
                            fullWidth
                            label="Tipo de Activo *"
                            name="device_type_id"
                            value={formData.device_type_id}
                            onChange={handleChange}
                            helperText={!selectedTypeSlug ? "Selecciona un tipo para comenzar" : ""}
                            color={selectedTypeSlug ? "success" : "primary"}
                            focused={!selectedTypeSlug}
                        >
                            {options.deviceTypes?.map(opt => (
                                <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* PASO 2: RESTO DEL FORMULARIO (Se muestra solo si hay un tipo seleccionado) */}
                    {selectedTypeSlug && (
                        <Grow in={!!selectedTypeSlug} style={{ transformOrigin: '0 0 0' }} timeout={500}>
                            <Grid item xs={12}>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12}><Divider><Chip label="Datos Generales" /></Divider></Grid>

                                    <Grid item xs={12} sm={8}>
                                        <TextField fullWidth label="Nombre del Dispositivo *" name="name" value={formData.name} onChange={handleChange} size="small" autoFocus />
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <TextField fullWidth label="Dirección IP" name="ip_address" value={formData.ip_address} onChange={handleChange} size="small" placeholder="0.0.0.0" />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField select fullWidth label="Ubicación *" name="location_id" value={formData.location_id} onChange={handleChange} size="small">
                                            {options.locations?.map(opt => <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>)}
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField select fullWidth label="Estado Actual *" name="status_id" value={formData.status_id} onChange={handleChange} size="small">
                                            {options.statuses?.map(opt => <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>)}
                                        </TextField>
                                    </Grid>

                                    {/* SECCIÓN ESPECÍFICA SEGÚN EL TIPO */}
                                    <Grid item xs={12}><Divider><Chip label="Detalles Técnicos" /></Divider></Grid>

                                    {currentSubTypes.length > 0 && (
                                        <Grid item xs={12} sm={6}>
                                            <TextField select fullWidth label="Categoría Específica" name="sub_type_id" value={formData.sub_type_id} onChange={handleChange} size="small">
                                                {currentSubTypes.map(opt => <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>)}
                                            </TextField>
                                        </Grid>
                                    )}

                                    {selectedTypeSlug === 'server' && (
                                        <>
                                            <Grid item xs={12} sm={3}><TextField fullWidth label="CPU" name="cpu" value={formData.cpu} onChange={handleChange} size="small" /></Grid>
                                            <Grid item xs={12} sm={3}><TextField fullWidth label="RAM" name="ram" value={formData.ram} onChange={handleChange} size="small" /></Grid>
                                        </>
                                    )}

                                    {selectedTypeSlug === 'nas' && (
                                        <>
                                            <Grid item xs={12} sm={4}><TextField fullWidth label="Capacidad" name="storage" value={formData.storage} onChange={handleChange} size="small" /></Grid>
                                            <Grid item xs={12} sm={4}><TextField fullWidth label="RAID" name="raid_type" value={formData.raid_type} onChange={handleChange} size="small" /></Grid>
                                            <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Carpetas" name="folders_count" value={formData.folders_count} onChange={handleChange} size="small" /></Grid>
                                        </>
                                    )}

                                    {(selectedTypeSlug === 'nas' || selectedTypeSlug === 'dispositivo_red') && (
                                        <>
                                            <Grid item xs={12} sm={6}><TextField fullWidth label="Marca" name="brand" value={formData.brand} onChange={handleChange} size="small" /></Grid>
                                            <Grid item xs={12} sm={6}><TextField fullWidth label="Modelo" name="model" value={formData.model} onChange={handleChange} size="small" /></Grid>
                                        </>
                                    )}

                                    {selectedTypeSlug === 'dispositivo_red' && (
                                        <>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth type="date" label="Último Mant." name="last_maintenance" value={formData.last_maintenance} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth type="date" label="Próximo Mant." name="next_maintenance" value={formData.next_maintenance} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
                                            </Grid>
                                        </>
                                    )}

                                    <Grid item xs={12}>
                                        <TextField fullWidth multiline rows={2} label="Descripción / Observaciones" name="description" value={formData.description} onChange={handleChange} size="small" />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grow>
                    )}
                </Grid>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
                <Button onClick={onClose} variant="outlined" color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
                <Fade in={!!selectedTypeSlug}>
                    <Button onClick={handleSave} variant="contained" startIcon={<Save />} sx={{ textTransform: 'none', px: 4, borderRadius: 2 }}>
                        Guardar Dispositivo
                    </Button>
                </Fade>
            </DialogActions>
        </Dialog>
    );
}

const Chip = ({ label }) => (
    <Box sx={{ bgcolor: '#e2e8f0', px: 1.5, py: 0.5, borderRadius: 10, fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
    </Box>
);