'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Grid, Typography, Card, CardContent, TextField, Button,
    Chip, Divider, Stack, IconButton, MenuItem, Paper, Tab, Tabs
} from '@mui/material';
// ASEGÚRATE DE TENER TODOS ESTOS IMPORTS:
import {
    Edit, Save, Dns, Place, Event, Person, Settings, ArrowBack, Memory, Lock
} from '@mui/icons-material';

export default function ServerFormView({ mode = 'view', initialData, options, onSave }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
    const [formData, setFormData] = useState(initialData || {});
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        if (mode !== 'create') setIsEditing(false);
    };

    const handleCancel = () => {
        if (mode === 'create') {
            router.back();
        } else {
            setFormData(initialData);
            setIsEditing(false);
        }
    };

    // Componente auxiliar para campos de datos
    const DataField = ({ label, name, value, icon: IconComponent, type = 'text', select = false, children }) => (
        <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {IconComponent && <IconComponent sx={{ fontSize: 14, mr: 0.5 }} />} {label}
            </Typography>
            {isEditing ? (
                <TextField
                    fullWidth size="small" name={name} value={value || ''}
                    onChange={handleChange} select={select} type={type}
                    variant="outlined"
                    sx={{ bgcolor: '#fff' }}
                    InputLabelProps={{ shrink: true }}
                >
                    {children}
                </TextField>
            ) : (
                <Typography variant="body1" fontWeight="600" color="#1e293b" sx={{ minHeight: '24px' }}>
                    {select ? (
                        Array.isArray(children)
                            ? children.find(c => c.props.value === value)?.props.children || '—'
                            : children?.props?.value === value ? children.props.children : '—'
                    ) : (value || '—')}
                </Typography>
            )}
        </Box>
    );

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header / Top Bar */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={() => router.back()} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                        <ArrowBack fontSize="small" />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="#1e293b">
                            {isEditing ? (mode === 'create' ? 'Nuevo Activo' : 'Editando Activo') : formData.name}
                        </Typography>
                        <Typography color="text.secondary">Detalle técnico y ubicación</Typography>
                    </Box>
                </Box>

                <Stack direction="row" spacing={2}>
                    {!isEditing ? (
                        <Button
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={() => setIsEditing(true)}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                        >
                            Editar Equipo
                        </Button>
                    ) : (
                        <>
                            <Button variant="outlined" color="inherit" onClick={handleCancel} sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#fff' }}>
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Save />}
                                onClick={handleSave}
                                sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                            >
                                {mode === 'create' ? 'Crear Activo' : 'Guardar Cambios'}
                            </Button>
                        </>
                    )}
                </Stack>
            </Box>

            {/* Status Chips Quick Bar */}
            <Stack direction="row" spacing={1} mb={3}>
                <Chip
                    label={options?.statuses?.find(s => s.id === formData.status_id)?.name || 'Activo'}
                    size="small"
                    sx={{
                        bgcolor: formData.status_id === 1 ? '#dcfce7' : '#fee2e2',
                        color: formData.status_id === 1 ? '#166534' : '#991b1b',
                        fontWeight: 'bold',
                        borderRadius: 1.5
                    }}
                />
                <Chip label={formData.sku || 'SKU-PENDIENTE'} size="small" variant="outlined" sx={{ borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: '#fff' }} />
                <Chip label={formData.brand || 'Marca N/A'} size="small" variant="outlined" sx={{ borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: '#fff' }} />
            </Stack>

            {/* Cards de Resumen - Distribución Simétrica Forzada (Estilo Home) */}
            <Stack
                direction="row"
                spacing={3}
                mb={4}
                sx={{ width: '100%', alignItems: 'stretch' }}
            >
                {[
                    { label: "Dirección IP", name: "ip_address", value: formData.ip_address, icon: Dns },
                    { label: "Ubicación", name: "location_id", value: formData.location_id, select: true, icon: Place, optionsKey: 'locations' },
                    { label: "Últ. Mantenimiento", name: "last_maintenance", value: formData.last_maintenance, type: "date", icon: Event },
                    { label: "Responsable", name: "responsible_id", value: formData.responsible_id, select: true, icon: Person, optionsKey: 'responsibles' }
                ].map((item, i) => (
                    <Card
                        key={i}
                        variant="outlined"
                        sx={{
                            flex: 1, // <--- Esto obliga a que todas midan exactamente el 25% del padre
                            borderRadius: 3,
                            border: '1px solid #e2e8f0',
                            bgcolor: '#fff',
                            boxShadow: 'none',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, flexGrow: 1 }}>
                            <DataField
                                label={item.label}
                                name={item.name}
                                value={item.value}
                                icon={item.icon}
                                type={item.type}
                                select={item.select}
                            >
                                {item.select && options[item.optionsKey]?.map(opt => (
                                    <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                                ))}
                            </DataField>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            {/* TABS NAVEGACIÓN */}
            <Box sx={{ borderBottom: '1px solid #e2e8f0', mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, v) => setActiveTab(v)}
                    sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold', minWidth: 120 } }}
                >
                    <Tab icon={<Settings fontSize="small" />} iconPosition="start" label="Especificaciones" />
                    <Tab icon={<Lock fontSize="small" />} iconPosition="start" label="Accesos" />
                    <Tab icon={<Person fontSize="small" />} iconPosition="start" label="Usuarios Windows" />
                    <Tab icon={<Dns fontSize="small" />} iconPosition="start" label="Sistemas (2)" />
                </Tabs>
            </Box>

            {/* CONTENIDO SEGÚN TAB */}
            <Box sx={{ width: '100%' }}>
                {activeTab === 0 ? (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ width: '100%', alignItems: 'stretch', mb: 4 }}>
                        {/* Columna Hardware */}
                        <Paper
                            variant="outlined"
                            sx={{
                                flex: 1, // Esto fuerza el 50% exacto en 'row'
                                borderRadius: 3,
                                p: 3,
                                bgcolor: '#fff',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold" mb={3}>Hardware</Typography>
                            <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                <DataField label="Procesador" name="processor" value={formData.processor} icon={Memory} />
                                <DataField label="Memoria RAM" name="ram" value={formData.ram} />
                                <DataField label="Almacenamiento" name="storage" value={formData.storage} />
                                <DataField label="Sistema Operativo" name="os" value={formData.os} />
                            </Stack>
                        </Paper>

                        {/* Columna Información Adicional */}
                        <Paper
                            variant="outlined"
                            sx={{
                                flex: 1, // Esto fuerza el 50% exacto en 'row'
                                borderRadius: 3,
                                p: 3,
                                bgcolor: '#fff',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold" mb={3}>Información Adicional</Typography>

                            <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}><DataField label="Modelo" name="model" value={formData.model} /></Grid>
                                    <Grid item xs={6}><DataField label="N° Serie" name="serial_number" value={formData.serial_number} /></Grid>
                                    <Grid item xs={6}><DataField label="MAC Address" name="mac_address" value={formData.mac_address} /></Grid>
                                    <Grid item xs={6}><DataField label="IP Secundaria" name="secondary_ip" value={formData.secondary_ip} /></Grid>
                                    <Grid item xs={12}><DataField label="Última Actualización" name="last_update" value={formData.last_update} /></Grid>
                                </Grid>

                                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

                                <Typography variant="caption" fontWeight="bold" color="primary" display="block">
                                    ESPECIFICACIONES ADICIONALES
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={6}><DataField label="Tarjeta de Red" name="nic" value={formData.nic} /></Grid>
                                    <Grid item xs={6}><DataField label="Controladora RAID" name="raid" value={formData.raid} /></Grid>
                                    <Grid item xs={12}><DataField label="Fuente de Poder" name="psu" value={formData.psu} /></Grid>
                                </Grid>

                                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                                <DataField label="Notas" name="notes" value={formData.notes} />
                            </Stack>
                        </Paper>
                    </Stack>
                ) : (
                    <Paper variant="outlined" sx={{ borderRadius: 3, p: 4, bgcolor: '#fff', minHeight: '500px' }}>
                        <Typography variant="h6" fontWeight="bold">Contenido de {activeTab === 1 ? 'Accesos' : activeTab === 2 ? 'Usuarios' : 'Sistemas'}</Typography>
                        <Box sx={{ mt: 3, p: 5, border: '2px dashed #f1f5f9', borderRadius: 4, textAlign: 'center', color: 'text.disabled' }}>
                            Próximamente...
                        </Box>
                    </Paper>
                )}
            </Box>
        </Box >
    );
}