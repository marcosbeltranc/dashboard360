'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    Grid, MenuItem, Box, Typography, Divider, Stack, IconButton
} from '@mui/material';
import { Save, Close, CloudUpload } from '@mui/icons-material';

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

    // Resetear formulario al abrir o cerrar
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

            // Lógica de limpieza: Si cambia el tipo, reseteamos campos específicos
            // para no mandar basura (ej. mandar CPU en un NAS)
            setFormData(prev => ({
                ...prev,
                [name]: value,
                sub_type_id: '', // Resetear subtipo al cambiar tipo principal
                cpu: '', ram: '', storage: '', raid_type: '',
                folders_count: 0, brand: '', model: '',
                last_maintenance: '', next_maintenance: ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        // Validaciones básicas antes de enviar
        if (!formData.name || !formData.device_type_id || !formData.location_id || !formData.status_id) {
            alert("Por favor completa los campos obligatorios (*)");
            return;
        }
        onSave(formData);
    };

    // Determinar qué subtipos mostrar
    const currentSubTypes = selectedTypeSlug === 'server'
        ? options.serverTypes
        : selectedTypeSlug === 'dispositivo_red'
            ? options.networkTypes
            : [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
                <Typography variant="h6" fontWeight="bold">Registrar Nuevo Dispositivo</Typography>
                <IconButton onClick={onClose} size="small"><Close /></IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: 4 }}>
                <Grid container spacing={2.5}>
                    {/* --- SECCIÓN 1: DATOS OBLIGATORIOS --- */}
                    <Grid item xs={12}>
                        <Typography variant="overline" color="primary" fontWeight="bold">Datos Principales</Typography>
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <TextField fullWidth label="Nombre del Dispositivo *" name="name" value={formData.name} onChange={handleChange} size="small" />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Dirección IP" name="ip_address" value={formData.ip_address} onChange={handleChange} size="small" placeholder="0.0.0.0" />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField select fullWidth label="Tipo de Activo *" name="device_type_id" value={formData.device_type_id} onChange={handleChange} size="small">
                            {options.deviceTypes?.map(opt => <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>)}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField select fullWidth label="Ubicación *" name="location_id" value={formData.location_id} onChange={handleChange} size="small">
                            {options.locations?.map(opt => <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>)}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField select fullWidth label="Estado Actual *" name="status_id" value={formData.status_id} onChange={handleChange} size="small">
                            {options.statuses?.map(opt => <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>)}
                        </TextField>
                    </Grid>

                    {/* --- SECCIÓN 2: CAMPOS DINÁMICOS SEGÚN EL TIPO --- */}
                    {selectedTypeSlug && (
                        <>
                            <Grid item xs={12}><Divider sx={{ my: 1 }}><Chip label="Detalles Técnicos" size="small" /></Divider></Grid>

                            {/* Subtipo para Server o Red */}
                            {currentSubTypes.length > 0 && (
                                <Grid item xs={12} sm={6}>
                                    <TextField select fullWidth label="Categoría Específica" name="sub_type_id" value={formData.sub_type_id} onChange={handleChange} size="small">
                                        {currentSubTypes.map(opt => <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>)}
                                    </TextField>
                                </Grid>
                            )}

                            {/* ESPECÍFICOS SERVIDOR */}
                            {selectedTypeSlug === 'server' && (
                                <>
                                    <Grid item xs={12} sm={3}><TextField fullWidth label="CPU" name="cpu" value={formData.cpu} onChange={handleChange} size="small" /></Grid>
                                    <Grid item xs={12} sm={3}><TextField fullWidth label="RAM" name="ram" value={formData.ram} onChange={handleChange} size="small" /></Grid>
                                </>
                            )}

                            {/* ESPECÍFICOS NAS */}
                            {selectedTypeSlug === 'nas' && (
                                <>
                                    <Grid item xs={12} sm={4}><TextField fullWidth label="Capacidad (TB/GB)" name="storage" value={formData.storage} onChange={handleChange} size="small" /></Grid>
                                    <Grid item xs={12} sm={4}><TextField fullWidth label="Configuración RAID" name="raid_type" value={formData.raid_type} onChange={handleChange} size="small" /></Grid>
                                    <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Cant. Carpetas" name="folders_count" value={formData.folders_count} onChange={handleChange} size="small" /></Grid>
                                </>
                            )}

                            {/* MARCA Y MODELO (Para NAS y Red) */}
                            {(selectedTypeSlug === 'nas' || selectedTypeSlug === 'dispositivo_red') && (
                                <>
                                    <Grid item xs={12} sm={6}><TextField fullWidth label="Marca" name="brand" value={formData.brand} onChange={handleChange} size="small" /></Grid>
                                    <Grid item xs={12} sm={6}><TextField fullWidth label="Modelo" name="model" value={formData.model} onChange={handleChange} size="small" /></Grid>
                                </>
                            )}

                            {/* MANTENIMIENTO (Solo Red) */}
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
                        </>
                    )}

                    <Grid item xs={12}>
                        <TextField fullWidth multiline rows={2} label="Descripción / Observaciones" name="description" value={formData.description} onChange={handleChange} size="small" />
                    </Grid>
                </Grid>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
                <Button onClick={onClose} variant="outlined" color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained" startIcon={<Save />} sx={{ textTransform: 'none', px: 4, borderRadius: 2 }}>Guardar Dispositivo</Button>
            </DialogActions>
        </Dialog>
    );
}

// Pequeño componente interno para el separador con chip
const Chip = ({ label }) => (
    <Box sx={{ bgcolor: '#e2e8f0', px: 1.5, py: 0.5, borderRadius: 10, fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
        {label}
    </Box>
);