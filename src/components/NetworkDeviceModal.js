'use client';
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Divider, Box, CircularProgress, Alert
} from '@mui/material';

export default function NetworkDeviceModal({ open, onClose, onSave, options, initialData = null }) {
    const initialState = {
        name: '',
        status_id: '',
        device_type_id: '',
        location_id: '',
        sku: '',
        brand: '',
        model: '',
        serial_number: '',
        notes: '',
        ip_address: '',
        last_maintenance: '',
    };

    const [formData, setFormData] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Si recibimos initialData (editar), llenamos el estado. Si no, reseteamos.
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                // Aseguramos que los valores null no rompan los inputs
                last_maintenance: initialData.last_maintenance || '',
                notes: initialData.notes || '',
            });
        } else {
            setFormData(initialState);
        }
        setError(null);
    }, [initialData, open]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Error al procesar la solicitud.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const commonTextFieldProps = {
        fullWidth: true,
        size: "small",
        InputLabelProps: { shrink: true },
        variant: "outlined",
        disabled: isSubmitting,
        sx: { '& .MuiInputBase-root': { height: '40px' } }
    };

    return (
        <Dialog open={open} onClose={!isSubmitting ? onClose : null} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', color: '#1e293b' }}>
                {initialData ? `Editar: ${initialData.name}` : 'Nueva Entrada: Dispositivo de Red'}
            </DialogTitle>
            <Divider />

            <DialogContent sx={{ p: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={3}>
                    <TextField {...commonTextFieldProps} label="Nombre" name="name" value={formData.name} onChange={handleChange} />
                    <TextField {...commonTextFieldProps} label="Dirección IP" name="ip_address" value={formData.ip_address} onChange={handleChange} />
                    <TextField {...commonTextFieldProps} select label="Tipo de Red" name="device_type_id" value={formData.device_type_id} onChange={handleChange}>
                        {options.networkTypes?.map((type) => (
                            <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                        ))}
                    </TextField>

                    <TextField {...commonTextFieldProps} label="Marca" name="brand" value={formData.brand} onChange={handleChange} />
                    <TextField {...commonTextFieldProps} label="Modelo" name="model" value={formData.model} onChange={handleChange} />
                    <TextField {...commonTextFieldProps} label="SKU / Parte" name="sku" value={formData.sku} onChange={handleChange} />

                    <TextField {...commonTextFieldProps} select label="Ubicación" name="location_id" value={formData.location_id} onChange={handleChange}>
                        {options.locations.map((loc) => (
                            <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                        ))}
                    </TextField>
                    <TextField {...commonTextFieldProps} select label="Estado" name="status_id" value={formData.status_id} onChange={handleChange}>
                        {options.statuses.map((st) => (
                            <MenuItem key={st.id} value={st.id}>{st.name}</MenuItem>
                        ))}
                    </TextField>
                    <TextField {...commonTextFieldProps} label="Número de Serie" name="serial_number" value={formData.serial_number} onChange={handleChange} />

                    <TextField {...commonTextFieldProps} label="Último Mantenimiento" type="date" name="last_maintenance" value={formData.last_maintenance} onChange={handleChange} />

                    <Box sx={{ gridColumn: 'span 3' }}>
                        <TextField
                            {...commonTextFieldProps}
                            multiline rows={3} label="Notas Técnicas" name="notes"
                            value={formData.notes} onChange={handleChange}
                            sx={{ '& .MuiInputBase-root': { height: 'auto' } }}
                        />
                    </Box>
                </Box>
            </DialogContent>

            <Divider />
            <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
                <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color={initialData ? "primary" : "success"}
                    disabled={isSubmitting}
                    sx={{ px: 4, fontWeight: 'bold' }}
                >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : initialData ? 'Actualizar' : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}