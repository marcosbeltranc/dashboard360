'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Grid, Typography, Card, CardContent, TextField, Button,
    Chip, Divider, Stack, IconButton, MenuItem, Paper, Avatar
} from '@mui/material';
import {
    Edit, Save, Dns, Person, Settings, ArrowBack,
    Storage, Terminal, Language, Code,
    Description, Business, Notes, Lan, Update
} from '@mui/icons-material';

export default function SystemFormView({
    mode = 'view',
    initialData,
    options = { areas: [], priorities: [], statuses: [] },
    servers = [],
    users = [],
    onSave
}) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
    const [formData, setFormData] = useState(initialData || {});

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

    const DataField = ({ label, name, value, icon: IconComponent, select = false, optionsArray = [], multiline = false, rows = 1, type = 'text' }) => (
        <Box sx={{ mb: 2, display: 'flex', alignItems: isEditing ? 'flex-start' : 'center', gap: 2 }}>
            {!isEditing && IconComponent && (
                <Avatar variant="rounded" sx={{ bgcolor: 'rgba(37, 99, 235, 0.08)', color: 'primary.main', width: 42, height: 42 }}>
                    <IconComponent sx={{ fontSize: 20 }} />
                </Avatar>
            )}

            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {isEditing && IconComponent && <IconComponent sx={{ fontSize: 14, mr: 0.5 }} />} {label}
                </Typography>

                {isEditing ? (
                    <TextField
                        fullWidth size="small" name={name} value={value || ''}
                        onChange={handleChange} select={select} type={type}
                        variant="outlined" multiline={multiline} rows={rows}
                        sx={{ bgcolor: '#fff' }}
                        InputLabelProps={{ shrink: true }}
                    >
                        {optionsArray.map(opt => (
                            <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                        ))}
                    </TextField>
                ) : (
                    <Typography variant="body1" fontWeight="600" color="#1e293b" sx={{ minHeight: '24px', lineHeight: 1.2 }}>
                        {select
                            ? (optionsArray?.find(opt => opt.id === value)?.name || 'No asignado')
                            : (value || '—')
                        }
                    </Typography>
                )}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={() => router.back()} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                        <ArrowBack fontSize="small" />
                    </IconButton>
                    <Box>
                        {isEditing ? (
                            <TextField
                                name="name" value={formData.name || ''} onChange={handleChange}
                                placeholder="Nombre del Sistema" variant="standard" fullWidth
                                InputProps={{ style: { fontSize: '1.5rem', fontWeight: 'bold' } }}
                            />
                        ) : (
                            <Typography variant="h4" fontWeight="bold" color="#1e293b">{formData.name || 'Sin Nombre'}</Typography>
                        )}
                        <Typography color="text.secondary">{formData.description || 'Detalle del sistema'}</Typography>
                    </Box>
                </Box>
                <Stack direction="row" spacing={2}>
                    {!isEditing ? (
                        <Button variant="contained" startIcon={<Edit />} onClick={() => setIsEditing(true)}>Editar</Button>
                    ) : (
                        <>
                            <Button onClick={handleCancel}>Cancelar</Button>
                            <Button variant="contained" startIcon={<Save />} onClick={handleSave}>Guardar</Button>
                        </>
                    )}
                </Stack>
            </Box>

            {/* FILA 1: KPI CARDS (4 VALORES) */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent>
                        <DataField label="Servidor" name="server_device_id" value={formData.server_device_id} select icon={Dns} optionsArray={servers} />
                    </CardContent></Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent>
                        <DataField label="Criticidad" name="priority_id" value={formData.priority_id} select icon={Settings} optionsArray={options?.priorities} />
                    </CardContent></Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent>
                        <DataField label="Responsable" name="responsible_id" value={formData.responsible_id} select icon={Person} optionsArray={users} />
                    </CardContent></Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent>
                        <DataField label="Última Actualización" name="updated_at" value={formData.updated_at} icon={Update} />
                    </CardContent></Card>
                </Grid>
            </Grid>

            {/* FILA 2: AREA Y TECNOLOGIAS (2 TARJETAS) */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}><CardContent>
                        <DataField label="Área Solicitante" name="area_id" value={formData.area_id} select icon={Business} optionsArray={options?.areas} />
                    </CardContent></Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}><CardContent>
                        <DataField label="Tecnologías / Notas" name="technical_notes" value={formData.technical_notes} icon={Notes} multiline rows={2} />
                    </CardContent></Card>
                </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* SECCIÓN DETALLES TÉCNICOS Y ACCESOS */}
            <Grid container spacing={4}>
                {/* Accesos y Repositorios */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                        <Language color="primary" /> Accesos y Repositorios
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <DataField label="URL de Acceso" name="url" value={formData.url} icon={Language} />
                        <DataField label="Repositorio (Git)" name="repository_url" value={formData.repository_url} icon={Terminal} />
                        <DataField label="Documentación API" name="api_doc_url" value={formData.api_doc_url} icon={Description} />
                    </Paper>
                </Grid>

                {/* Base de Datos */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                        <Storage color="primary" /> Configuración de Base de Datos
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <DataField label="Motor BD" name="db_engine" value={formData.db_engine} icon={Settings} />
                            </Grid>
                            <Grid item xs={6}>
                                <DataField label="Nombre BD" name="db_name" value={formData.db_name} icon={Code} />
                            </Grid>
                            <Grid item xs={8}>
                                <DataField label="Host / IP" name="db_host" value={formData.db_host} icon={Lan} />
                            </Grid>
                            <Grid item xs={4}>
                                <DataField label="Puerto" name="db_port" value={formData.db_port} type="number" icon={Settings} />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}