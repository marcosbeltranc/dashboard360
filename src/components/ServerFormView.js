'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Grid, Typography, Card, CardContent, TextField, Button,
    Chip, Divider, Stack, IconButton, MenuItem, Paper, Tab, Tabs, Avatar, Tooltip
} from '@mui/material';
import {
    Edit, Save, Dns, Place, Event, Person, Settings, ArrowBack, Memory, Lock, SettingsInputComponent, Storage, Terminal, ContentCopy, AccountTree
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

    const DataField = ({ label, name, value, icon: IconComponent, type = 'text', select = false, children }) => (
        <Box sx={{ mb: 2, display: 'flex', alignItems: isEditing ? 'flex-start' : 'center', gap: 2 }}>
            {!isEditing && IconComponent && (
                <Avatar
                    variant="rounded"
                    sx={{
                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                        color: 'primary.main',
                        width: 48,
                        height: 48,
                    }}
                >
                    <IconComponent sx={{ fontSize: 24 }} />
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
                        variant="outlined"
                        sx={{ bgcolor: '#fff' }}
                        InputLabelProps={{ shrink: true }}
                    >
                        {children}
                    </TextField>
                ) : (
                    <Typography variant="body1" fontWeight="600" color="#1e293b" sx={{ minHeight: '24px', lineHeight: 1.2 }}>
                        {select ? (
                            Array.isArray(children)
                                ? children.find(c => c.props.value === value)?.props.children || '—'
                                : children?.props?.value === value ? children.props.children : '—'
                        ) : (value || '—')}
                    </Typography>
                )}
            </Box>
        </Box>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ width: '100%', alignItems: 'stretch', mb: 4 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                flex: 1,
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
                                <DataField label="Memoria RAM" name="ram" value={formData.ram} icon={SettingsInputComponent} />
                                <DataField label="Almacenamiento" name="storage" value={formData.storage} icon={Storage} />
                                <DataField label="Sistema Operativo" name="os" value={formData.os} icon={Terminal} />
                            </Stack>
                        </Paper>

                        {/* Columna Información Adicional */}
                        <Paper
                            variant="outlined"
                            sx={{
                                flex: 1,
                                borderRadius: 3,
                                p: 3,
                                bgcolor: '#fff',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold" mb={3}>Información Adicional</Typography>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    border: '1px solid #f1f5f9',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    mb: 2,
                                    width: '100%',
                                }}
                            >
                                {[
                                    { label: "Marca", name: "brand", value: formData.brand },
                                    { label: "Modelo", name: "model", value: formData.model },
                                    { label: "N° Serie", name: "serial_number", value: formData.serial_number },
                                    { label: "MAC Address", name: "mac_address", value: formData.mac_address },
                                    { label: "IP Secundaria", name: "secondary_ip", value: formData.secondary_ip },
                                    { label: "Última Actualización", type: "date", name: "last_update", value: formData.last_update },
                                ].map((field, i) => (
                                    <Box
                                        key={field.name}
                                        sx={{
                                            p: 2
                                        }}
                                    >
                                        <DataField label={field.label} name={field.name} value={field.value} type={field.type} noMargin />
                                    </Box>
                                ))}
                            </Box>


                            <Stack spacing={2} sx={{ flexGrow: 1 }}>

                                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

                                <Typography variant="caption" fontWeight="bold" color="primary" display="block">
                                    ESPECIFICACIONES ADICIONALES
                                </Typography>

                                <Paper
                                    variant="outlined"
                                    sx={{
                                        flex: 1,
                                        borderRadius: 3,
                                        p: 3,
                                        bgcolor: '#fff',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}><DataField label="Tarjeta de Red" name="network_card" value={formData.network_card} /></Grid>
                                        <Grid item xs={6}><DataField label="Controladora RAID" name="raid_controller" value={formData.raid_controller} /></Grid>
                                        <Grid item xs={12}><DataField label="Fuente de Poder" name="power_supply" value={formData.power_supply} /></Grid>
                                    </Grid>
                                </Paper>

                                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                                <DataField label="Notas" name="notes" value={formData.notes} />
                            </Stack>
                        </Paper>
                    </Stack>
                );
            case 1:
                return (

                    <Box
                        sx={{
                            width: '100%',
                            borderRadius: '12px',
                            p: 3, // Un poco más de padding queda mejor
                            bgcolor: '#fff',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        <Stack spacing={0.5}>
                            <Typography variant="h6" fontWeight="bold">
                                Métodos de Acceso
                            </Typography>
                            <Typography variant="caption" fontWeight="regular" color="grey" sx={{ letterSpacing: 1 }}>
                                Formas de conectarse al servidor
                            </Typography>
                            {/* {isEditing && (
                                <Button size="small" variant="contained" disableElevation sx={{ borderRadius: 2 }}>
                                    Nuevo Acceso
                                </Button>
                            )} */}
                        </Stack>
                        {/* GRID DE ACCESOS */}
                        <Grid container spacing={2}>
                            {formData.server_access && formData.server_access.length > 0 ? (
                                formData.server_access.map((access, index) => (
                                    <Grid item xs={12} md={6} key={index}>
                                        <AccessCard item={access} />
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Box sx={{
                                        py: 4,
                                        textAlign: 'center',
                                        bgcolor: '#f8fafc',
                                        borderRadius: 3,
                                        border: '1px dashed #e2e8f0'
                                    }}>
                                        <Typography variant="body2" color="text.disabled">
                                            No hay métodos de acceso configurados para este servidor.
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                );
            case 2:
                return (
                    <Box
                        sx={{
                            width: '100%',
                            borderRadius: '12px',
                            p: 3,
                            bgcolor: '#fff',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        <Stack spacing={0.5} mb={3}>
                            <Typography variant="h6" fontWeight="bold">
                                Usuarios de Windows
                            </Typography>
                            <Typography variant="caption" fontWeight="regular" color="text.secondary">
                                Cuentas configuradas en el servidor
                            </Typography>
                        </Stack>

                        {/* Encabezado de la "Tabla" */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 1fr 2fr 48px',
                            px: 1,
                            pb: 1,
                            borderBottom: '2px solid #f1f5f9'
                        }}>
                            {['Usuario', 'Tipo', 'Descripción', ''].map((head) => (
                                <Typography key={head} variant="caption" fontWeight="bold" color="text.disabled">
                                    {head}
                                </Typography>
                            ))}
                        </Box>

                        {/* Listado de Usuarios */}
                        <Box>
                            {formData.server_users && formData.server_users.length > 0 ? (
                                formData.server_users.map((user, index) => (
                                    <UserRow key={index} user={user} />
                                ))
                            ) : (
                                <Box sx={{ py: 6, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.disabled">
                                        No hay usuarios registrados.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                );
            case 3:
            // return <SistemasTab />;
            default:
                return null;
        }
    };

    const AccessCard = ({ item }) => {
        const handleCopy = (text) => {
            if (text) navigator.clipboard.writeText(text);
        };

        return (
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    transition: '0.2s',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                }}
            >
                <Box sx={{
                    p: 1.5,
                    bgcolor: '#eff6ff',
                    borderRadius: 2,
                    display: 'flex',
                    color: '#3b82f6'
                }}>
                    <AccountTree fontSize="small" />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                        {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {item.access_ip}{item.port ? `:${item.port}` : ''}
                    </Typography>
                    {item.description && (
                        <Typography variant="caption" color="text.disabled" display="block">
                            {item.description}
                        </Typography>
                    )}
                </Box>

                <Tooltip title="Copiar acceso">
                    <IconButton
                        size="small"
                        onClick={() => handleCopy(`${item.access_ip}${item.port ? `:${item.port}` : ''}`)}
                        sx={{ color: '#94a3b8' }}
                    >
                        <ContentCopy fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            </Paper>
        );
    };

    const UserRow = ({ user }) => {
        const handleCopy = (text) => {
            if (text) navigator.clipboard.writeText(text);
        };

        const typeStyles = {
            'Administrador': { bgcolor: '#fee2e2', color: '#ef4444', label: 'Administrador' },
            'Servicio': { bgcolor: '#eff6ff', color: '#3b82f6', label: 'Servicio' }
        };

        const style = typeStyles[user.type] || { bgcolor: '#f1f5f9', color: '#64748b', label: user.type };

        return (
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 2fr 48px',
                alignItems: 'center',
                py: 2,
                px: 1,
                borderBottom: '1px solid #f1f5f9',
                '&:hover': { bgcolor: '#fafafa' }
            }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                    {user.name}
                </Typography>

                <Box>
                    <Chip
                        label={style.label}
                        size="small"
                        sx={{
                            bgcolor: style.bgcolor,
                            color: style.color,
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: 20
                        }}
                    />
                </Box>

                <Typography variant="body2" color="text.secondary">
                    {user.description || '—'}
                </Typography>

                <Tooltip title="Copiar usuario">
                    <IconButton size="small" onClick={() => handleCopy(user.username)}>
                        <ContentCopy sx={{ fontSize: 18, color: '#94a3b8' }} />
                    </IconButton>
                </Tooltip>
            </Box>
        );
    };

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header / Top Bar */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={() => router.back()} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                        <ArrowBack fontSize="small" />
                    </IconButton>
                    <Box>
                        {isEditing ? (
                            <TextField
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                placeholder="Nombre del Servidor"
                                variant="standard"
                                fullWidth
                                InputProps={{
                                    style: {
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: '#1e293b'
                                    },
                                    disableUnderline: false,
                                }}
                                sx={{
                                    mb: 0.5,
                                    '& .MuiInput-underline:after': { borderBottomColor: '#2563eb' }
                                }}
                            />
                        ) : (
                            <Typography variant="h4" fontWeight="bold" color="#1e293b">
                                {formData.name || 'Sin Nombre'}
                            </Typography>
                        )}

                        {/* Subtítulo dinámico */}
                        {isEditing ? (
                            <TextField
                                name="sku"
                                value={formData.sku || ''}
                                onChange={handleChange}
                                placeholder="SKU o Identificador"
                                variant="standard"
                                size="small"
                                InputProps={{
                                    style: { fontSize: '0.875rem', color: '#64748b' },
                                    disableUnderline: true,
                                }}
                            />
                        ) : (
                            <Typography color="text.secondary">
                                {formData.sku || 'Detalle técnico y ubicación'}
                            </Typography>
                        )}
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

            <Stack direction="row" spacing={1} mb={3} alignItems="center">
                {isEditing ? (
                    <Box sx={{ minWidth: 200 }}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            name="status_id"
                            value={formData.status_id || ''}
                            onChange={handleChange}
                            variant="outlined"
                            label="Estado del Equipo"
                            sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        >
                            {/* Usamos 'statuses' porque es la llave que definiste en el grouped de tu page.js */}
                            {options?.statuses?.map(opt => (
                                <MenuItem key={opt.id} value={opt.id}>
                                    {opt.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                ) : (
                    <Chip
                        label={options?.statuses?.find(s => s.id === formData.status_id)?.name || 'Activo'}
                        size="small"
                        sx={{
                            bgcolor: formData.status_id === 10 ? '#dcfce7' : '#fee2e2',
                            color: formData.status_id === 10 ? '#166534' : '#991b1b',
                            fontWeight: 'bold',
                            borderRadius: 1.5
                        }}
                    />
                )}

                {/* Estos se mantienen como Chips informativos */}
                <Chip label={formData.sku || 'SKU-PENDIENTE'} size="small" variant="outlined" sx={{ borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: '#fff' }} />
                <Chip label={formData.brand || 'Marca N/A'} size="small" variant="outlined" sx={{ borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: '#fff' }} />
            </Stack>

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
                            flex: 1,
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
                {renderTabContent()}
            </Box>
        </Box >
    );
}