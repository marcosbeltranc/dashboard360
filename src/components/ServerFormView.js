'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Grid, Typography, Card, CardContent, TextField, Button,
    Chip, Divider, Stack, IconButton, MenuItem, Paper, Tab, Tabs, Avatar, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
    Edit, Save, Dns, Place, Event, Person, Settings, ArrowBack, Memory, Lock, SettingsInputComponent, Storage, Terminal, ContentCopy, AccountTree, Assignment, Delete, Visibility, VisibilityOff
} from '@mui/icons-material';
import api from '@/lib/api';
import toast from "react-hot-toast";
import DeviceMaintenanceTab from './DeviceMaintenanceTab';
import { usePermissions } from '@/hooks/usePermissions';

const UserRow = ({ user, index, isEditing, onUserChange, onDeleteUser, canEdit, canDelete, showPasswords, togglePassword }) => {
    const typeStyles = {
        'Administrador': { bgcolor: '#fee2e2', color: '#ef4444', label: 'Administrador' },
        'Servicio': { bgcolor: '#eff6ff', color: '#3b82f6', label: 'Servicio' }
    };

    const style = typeStyles[user.type] || {
        bgcolor: '#f1f5f9',
        color: '#64748b',
        label: user.type
    };

    if (isEditing && canEdit) {
        return (
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 2fr 48px',
                    gap: 1,
                    py: 1
                }}
            >
                <TextField
                    size="small"
                    value={user.name || ''}
                    onChange={(e) => onUserChange(index, 'name', e.target.value)}
                />

                {user.password && (
                    <TextField
                        size="small"
                        type={showPasswords[`user-${index}`] ? 'text' : 'password'}
                        value={user.password || ''}
                        onChange={(e) => onUserChange(index, 'password', e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <IconButton onClick={() => togglePassword(`user-${index}`)}>
                                    {showPasswords[`user-${index}`] ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            )
                        }}
                    />
                )}

                <TextField
                    select
                    size="small"
                    value={user.type || 'Servicio'}
                    onChange={(e) => onUserChange(index, 'type', e.target.value)}
                >
                    <MenuItem value="Administrador">Administrador</MenuItem>
                    <MenuItem value="Servicio">Servicio</MenuItem>
                </TextField>

                <TextField
                    size="small"
                    value={user.description || ''}
                    onChange={(e) => onUserChange(index, 'description', e.target.value)}
                />
                {canDelete && (
                    <IconButton
                        color="error"
                        onClick={() => onDeleteUser(index, user.id)}
                    >
                        <Delete />
                    </IconButton>
                )}
            </Box>
        );
    }

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

            {user.password && (
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    {showPasswords[`user-${index}`]
                        ? user.password
                        : '••••••••'}
                    <IconButton
                        size="small"
                        onClick={() => togglePassword(`user-${index}`)}
                    >
                        {showPasswords[`user-${index}`] ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                </Typography>
            )}
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
        </Box>
    );
};

const DataField = ({ label, name, value, icon: IconComponent, type = 'text', select = false, children, isEditing, handleChange }) => (
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

export default function ServerFormView({ mode = 'view', initialData, options, onSave }) {
    const { can, isLoaded } = usePermissions();

    const canView = can('server', 'view');
    const canEdit = can('server', 'edit');
    const canRequest = can('server', 'access');

    const canAccess = {
        view: can('server_access', 'view'),
        create: can('server_access', 'create'),
        edit: can('server_access', 'edit'),
        delete: can('server_access', 'delete'),
    };

    const canUsers = {
        view: can('server_users', 'view'),
        create: can('server_users', 'create'),
        edit: can('server_users', 'edit'),
        delete: can('server_users', 'delete'),
    };

    const canUpdates = {
        view: can('server_updates', 'view'),
    };
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => {
        if (mode === 'create') {
            setIsEditing(true);
        } else if (mode === 'edit' && canEdit) {
            setIsEditing(true);
        } else {
            setIsEditing(false);
        }
    }, [mode, canEdit]);

    const [formData, setFormData] = useState(initialData || {});
    const [activeTab, setActiveTab] = useState('specs');
    const [openUserModal, setOpenUserModal] = useState(false);

    const [newUser, setNewUser] = useState({
        name: '',
        password: '',
        description: '',
        type: 'Servicio'
    });

    const [openAccessModal, setOpenAccessModal] = useState(false);

    const [accessForm, setAccessForm] = useState({
        reason: '',
        start_at: '',
        end_at: ''
    });

    useEffect(() => {
        if (initialData) {
            // Normalizamos usuarios y accesos con IDs temporales para la edición
            const users = (initialData.server_users || []).map(u => ({
                ...u,
                tempId: u.id ?? crypto.randomUUID()
            }));

            const access = (initialData.server_access || []).map(a => ({
                ...a,
                tempId: a.id ?? crypto.randomUUID()
            }));

            setFormData({
                ...initialData,
                server_users: users,
                server_access: access
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!canEdit) return;
        const server = await onSave(formData);
        const serverId = server?.id || formData.id;
        let flag = false;
        try {
            // Guardar Usuarios
            if (formData.server_users) {
                for (const user of formData.server_users) {
                    const payload = {
                        ...user,
                        server_device_id: serverId
                    };

                    if (user.id) {
                        await api.put(`/server-users/${user.id}`, payload);
                    } else {
                        await api.post('/server-users', payload);
                    }
                }
            }
        } catch (error) {
            toast.error("Error: Revisa la seccion de usuarios");
            flag = true;
        }

        try {
            // Guardar Accesos
            if (formData.server_access) {
                for (const acc of formData.server_access) {
                    const payload = { ...acc, server_device_id: serverId };
                    acc.id ? await api.put(`/server-access/${acc.id}`, payload) : await api.post('/server-access', payload);
                }
            }
        } catch (error) {
            toast.error("Error: Revisa la seccion de accesos");
            flag = true;
        }

        if (!flag) {
            setIsEditing(false);
        }

    };

    const handleCancel = () => {
        if (mode === 'create') {
            router.back();
        } else {
            setFormData(initialData);
            setIsEditing(false);
        }
    };

    const handleAddUser = () => {
        const newUser = {
            tempId: crypto.randomUUID(),
            name: '',
            password: '',
            description: '',
            type: 'Servicio'
        };

        setFormData(prev => ({
            ...prev,
            server_users: [...(prev.server_users || []), newUser]
        }));
    };

    const handleDeleteUser = async (index, id) => {
        if (!canUsers.delete) return;
        if (id) {
            await api.delete(`/server-users/${id}`);
        }

        setFormData(prev => ({
            ...prev,
            server_users: prev.server_users.filter((_, i) => i !== index)
        }));
    };

    const handleUserChange = (index, field, value) => {

        setFormData(prev => {
            const users = [...prev.server_users];

            users[index] = {
                ...users[index],
                [field]: value
            };

            return {
                ...prev,
                server_users: users
            };
        });
    };

    const handleAddAccess = () => {
        const newAccess = {
            tempId: crypto.randomUUID(),
            name: '',
            access_ip: '',
            port: '',
            description: ''
        };
        setFormData(prev => ({
            ...prev,
            server_access: [...(prev.server_access || []), newAccess]
        }));
    };

    const handleAccessChange = (index, field, value) => {
        setFormData(prev => {
            const access = [...prev.server_access];
            access[index] = { ...access[index], [field]: value };
            return { ...prev, server_access: access };
        });
    };

    const handleDeleteAccess = async (index, id) => {
        if (!canAccess.delete) return;
        if (id) await api.delete(`/server-access/${id}`);
        setFormData(prev => ({
            ...prev,
            server_access: prev.server_access.filter((_, i) => i !== index)
        }));
    };

    const hasPasswords = formData.server_users?.some(u => u.password);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'specs':
                return (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ width: '100%', alignItems: 'stretch', mb: 4 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                flex: 1,
                                borderRadius: 1,
                                p: 3,
                                bgcolor: '#fff',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold" mb={3}>Hardware</Typography>
                            <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                <DataField label="Procesador" name="processor" value={formData.processor} icon={Memory} isEditing={isEditing} handleChange={handleChange} />
                                <DataField label="Memoria RAM" name="ram" value={formData.ram} icon={SettingsInputComponent} isEditing={isEditing} handleChange={handleChange} />
                                <DataField label="Almacenamiento" name="storage" value={formData.storage} icon={Storage} isEditing={isEditing} handleChange={handleChange} />
                                <DataField label="Sistema Operativo" name="os" value={formData.os} icon={Terminal} isEditing={isEditing} handleChange={handleChange} />
                            </Stack>
                        </Paper>

                        {/* Columna Información Adicional */}
                        <Paper
                            variant="outlined"
                            sx={{
                                flex: 1,
                                borderRadius: 1,
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
                                    borderRadius: 1,
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
                                        <DataField label={field.label} name={field.name} value={field.value} type={field.type} noMargin isEditing={isEditing} handleChange={handleChange} />
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
                                        borderRadius: 1,
                                        p: 3,
                                        bgcolor: '#fff',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}><DataField label="Tarjeta de Red" name="network_card" value={formData.network_card} isEditing={isEditing} handleChange={handleChange} /></Grid>
                                        <Grid item xs={6}><DataField label="Controladora RAID" name="raid_controller" value={formData.raid_controller} isEditing={isEditing} handleChange={handleChange} /></Grid>
                                        <Grid item xs={12}><DataField label="Fuente de Poder" name="power_supply" value={formData.power_supply} isEditing={isEditing} handleChange={handleChange} /></Grid>
                                    </Grid>
                                </Paper>

                                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                                <DataField label="Notas" name="notes" value={formData.notes} isEditing={isEditing} handleChange={handleChange} />
                            </Stack>
                        </Paper>
                    </Stack>
                );
            case 'access':
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
                                Métodos de Acceso
                            </Typography>
                            <Typography variant="caption" fontWeight="regular" color="grey" sx={{ letterSpacing: 1 }}>
                                Formas de conectarse al servidor
                            </Typography>
                            {isEditing && canAccess.create && (
                                <Box display="flex" justifyContent="flex-end" mt={2}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={handleAddAccess}
                                        sx={{ borderRadius: 1, textTransform: 'none' }}
                                    >
                                        + Nuevo Acceso
                                    </Button>
                                </Box>
                            )}
                        </Stack>
                        {/* GRID DE ACCESOS */}
                        <Grid container spacing={2}>
                            {formData.server_access?.map((acc, index) => (
                                <Grid item xs={12} key={acc.id ?? acc.tempId}>
                                    {isEditing && canAccess.edit ? (
                                        <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, bgcolor: '#f8fafc', alignItems: 'center' }}>
                                            <TextField label="Nombre" size="small" value={acc.name} onChange={(e) => handleAccessChange(index, 'name', e.target.value)} />
                                            {acc.password !== undefined && (
                                                <TextField
                                                    label="Password"
                                                    size="small"
                                                    type={showPasswords[`access-${index}`] ? 'text' : 'password'}
                                                    value={acc.password || ''}
                                                    onChange={(e) => handleAccessChange(index, 'password', e.target.value)}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <IconButton onClick={() => togglePassword(`access-${index}`)}>
                                                                {showPasswords[`access-${index}`] ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        )
                                                    }}
                                                />
                                            )}
                                            <TextField label="IP/Host" size="small" value={acc.access_ip} onChange={(e) => handleAccessChange(index, 'access_ip', e.target.value)} />
                                            <TextField label="Puerto" size="small" sx={{ width: 100 }} value={acc.port} onChange={(e) => handleAccessChange(index, 'port', e.target.value)} />
                                            <TextField label="Descripción" size="small" fullWidth value={acc.description} onChange={(e) => handleAccessChange(index, 'description', e.target.value)} />
                                            <IconButton color="error" onClick={() => handleDeleteAccess(index, acc.id)}><Delete /></IconButton>
                                        </Paper>
                                    ) : (
                                        <AccessCard
                                            item={acc}
                                            index={index}
                                            showPasswords={showPasswords}
                                            togglePassword={togglePassword}
                                        />
                                    )}
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                );
            case 'users':
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
                            {isEditing && canUsers.create && (
                                <Box display="flex" justifyContent="flex-end" mt={2}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => setOpenUserModal(true)}
                                        sx={{ borderRadius: 1, textTransform: 'none' }}
                                    >
                                        + Nuevo Usuario
                                    </Button>
                                </Box>
                            )}
                        </Stack>

                        {/* Encabezado de la "Tabla" */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 1fr 2fr 48px',
                            px: 1,
                            pb: 1,
                            borderBottom: '2px solid #f1f5f9'
                        }}>
                            {['Usuario', ...(hasPasswords ? ['Contraseña'] : []), 'Tipo', 'Descripción', ''].map((head) => (
                                <Typography key={head} variant="caption" fontWeight="bold" color="text.disabled">
                                    {head}
                                </Typography>
                            ))}
                        </Box>

                        {/* Listado de Usuarios */}
                        <Box>
                            {formData.server_users && formData.server_users.length > 0 ? (
                                formData.server_users.map((user, index) => (
                                    <UserRow
                                        key={user.id ?? user.tempId}
                                        user={user}
                                        index={index}
                                        isEditing={isEditing}
                                        onUserChange={handleUserChange}
                                        onDeleteUser={handleDeleteUser}
                                        canEdit={canUsers.edit}
                                        canDelete={canUsers.delete}
                                        showPasswords={showPasswords}
                                        togglePassword={togglePassword}
                                    />
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
            case 'systems':
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
                        <Stack spacing={0.5} sx={{ mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold" >
                                Sistemas
                            </Typography>
                        </Stack>
                        <Grid container spacing={2}>
                            {formData.system && formData.system.length > 0 ? (
                                formData.system.map((sys, index) => (
                                    <Grid item xs={12} md={6} key={index}>
                                        <SystemCard item={sys} />
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Box sx={{
                                        py: 4,
                                        textAlign: 'center',
                                        bgcolor: '#f8fafc',
                                        borderRadius: 1,
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
            case 'updates':
                return (
                    <DeviceMaintenanceTab
                        deviceId={formData.id}
                        deviceType="App\Models\ServerDevice"
                        maintenanceNotes={formData.maintenance_notes}
                        options={options}
                        isEditingServer={isEditing}
                        onMaintenanceNotesChange={(newValue) => {
                            setFormData(prev => ({
                                ...prev,
                                maintenance_notes: newValue
                            }));
                        }}
                    />
                );
            default:
                return null;
        }
    };

    const AccessCard = ({ item, index, showPasswords, togglePassword }) => {
        const handleCopy = (text) => {
            if (text) navigator.clipboard.writeText(text);
        };

        return (
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: 1,
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
                    borderRadius: 1,
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
                    {item.password && (
                        <Typography
                            variant="caption"
                            sx={{
                                fontFamily: 'monospace',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mt: 0.5
                            }}
                        >
                            {showPasswords[`access-${index}`]
                                ? item.password
                                : '••••••••'}

                            <IconButton
                                size="small"
                                onClick={() => togglePassword(`access-${index}`)}
                            >
                                {showPasswords[`access-${index}`] ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
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

    const SystemCard = ({ item }) => {
        const handleCopy = (text) => {
            if (text) navigator.clipboard.writeText(text);
        };

        return (
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    transition: '0.2s',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                }}
            >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{
                        p: 1.5,
                        bgcolor: '#eff6ff',
                        borderRadius: 1,
                        display: 'flex',
                        color: '#3b82f6'
                    }}>
                        <AccountTree fontSize="small" />
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                            {item.name}
                        </Typography>

                        {item.description && (
                            <Typography variant="body2" color="text.secondary">
                                {item.description}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {item.status && (
                    <Chip
                        label={item.status.name}
                        size="small"
                        sx={{
                            fontWeight: 500,
                            textTransform: 'lowercase',
                            bgcolor: `${item.status.color}20`, // fondo suave
                            color: item.status.color,
                            border: `1px solid ${item.status.color}40`
                        }}
                    />
                )}
            </Paper>
        );
    };

    const handleRequestAccess = async () => {
        try {
            await api.post(`/servers/${formData.id}/access-request`, {
                reason: accessForm.reason,
                start_at: accessForm.start_at,
                end_at: accessForm.end_at || null
            });

            toast.success('Solicitud enviada correctamente');

            setOpenAccessModal(false);
            setAccessForm({
                reason: '',
                start_at: '',
                end_at: ''
            });

        } catch (error) {
            console.error(error);

            const message =
                error?.response?.data?.message ||
                'Error al solicitar acceso';

            toast.error(message);
        }
    };

    const tabs = [
        { key: 'specs', label: 'Especificaciones', icon: <Settings fontSize="small" />, visible: true },
        { key: 'access', label: 'Accesos', icon: <Lock fontSize="small" />, visible: canAccess.view },
        { key: 'users', label: 'Usuarios Windows', icon: <Person fontSize="small" />, visible: canUsers.view },
        { key: 'systems', label: 'Sistemas', icon: <Dns fontSize="small" />, visible: true },
        { key: 'updates', label: 'Actualizaciones', icon: <Assignment fontSize="small" />, visible: canUpdates.view },
    ];

    const visibleTabs = tabs.filter(t => t.visible);

    useEffect(() => {
        if (!visibleTabs.find(t => t.key === activeTab)) {
            setActiveTab(visibleTabs[0]?.key);
        }
    }, [visibleTabs]);

    const [showPasswords, setShowPasswords] = useState({});

    const togglePassword = (key) => {
        setShowPasswords(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    if (!isLoaded) return null;

    if (!canView) {
        return (
            <Box p={4}>
                <Typography>No tienes acceso a este servidor</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, minHeight: '100vh' }} className="bg-white p-6 rounded-lg shadow-sm">
            {/* Header / Top Bar */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={() => router.back()} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 1 }}>
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
                        <>
                            {canEdit && (
                                <Button
                                    variant="contained"
                                    startIcon={<Edit />}
                                    onClick={() => setIsEditing(true)}
                                >
                                    Editar Equipo
                                </Button>
                            )}

                            {canRequest && (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => setOpenAccessModal(true)}
                                >
                                    Solicitar acceso
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={handleCancel}
                                sx={{ borderRadius: 1, textTransform: 'none', bgcolor: '#fff' }}
                            >
                                Cancelar
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<Save />}
                                onClick={handleSave}
                                sx={{ borderRadius: 1, textTransform: 'none', px: 3 }}
                            >
                                {mode === 'create' ? 'Crear' : 'Guardar'}
                            </Button>
                        </>
                    )}
                </Stack>
            </Box>

            <Stack direction="row" spacing={1} mb={3} alignItems="center">
                {isEditing ? (
                    <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 500 }}>
                        {/* Selector de Estado */}
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                name="status_id"
                                label="Estado"
                                value={formData.status_id || ''}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                            >
                                {options?.statuses?.map(opt => (
                                    <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {/* Selector de Tipo de Servidor (NUEVO) */}
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                name="server_type_id"
                                label="Tipo de Servidor"
                                value={formData.server_type_id || ''}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                            >
                                {options?.server_types?.map(opt => (
                                    <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Stack>
                ) : (
                    <>
                        {/* Vista de lectura */}
                        <Chip
                            label={options?.statuses?.find(s => s.id === formData.status_id)?.name || 'Activo'}
                            size="small"
                            sx={{
                                bgcolor: formData.status_id === 10 ? '#dcfce7' : '#fee2e2',
                                color: formData.status_id === 10 ? '#166534' : '#991b1b',
                                fontWeight: 'bold', borderRadius: 1
                            }}
                        />
                        <Chip
                            label={options?.server_types?.find(t => t.id === formData.server_type_id)?.name || 'Tipo N/A'}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 1, fontWeight: 500 }}
                        />
                    </>
                )}

                {/* Estos se mantienen como Chips informativos */}
                <Chip label={formData.sku || 'SKU-PENDIENTE'} size="small" variant="outlined" sx={{ borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: '#fff' }} />
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
                            borderRadius: 1,
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
                                isEditing={isEditing}
                                handleChange={handleChange}
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
                >
                    {visibleTabs.map(tab => (
                        <Tab
                            key={tab.key}
                            value={tab.key}
                            label={tab.label}
                            icon={tab.icon}
                            iconPosition="start"
                        />
                    ))}
                </Tabs>
            </Box>

            {/* CONTENIDO SEGÚN TAB */}
            <Box sx={{ width: '100%' }}>
                {renderTabContent()}
            </Box>
            <Dialog open={openUserModal} onClose={() => setOpenUserModal(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 'bold' }}>Nuevo Usuario</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Usuario"
                            fullWidth
                            size="small"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                        <TextField
                            label="Contraseña"
                            fullWidth
                            size="small"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                        <TextField
                            label="Tipo"
                            select
                            fullWidth
                            size="small"
                            value={newUser.type}
                            onChange={(e) => setNewUser({ ...newUser, type: e.target.value })}
                        >
                            <MenuItem value="Administrador">Administrador</MenuItem>
                            <MenuItem value="Servicio">Servicio</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenUserModal(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            const userToAdd = { ...newUser, tempId: crypto.randomUUID() };
                            setFormData(prev => ({
                                ...prev,
                                server_users: [...(prev.server_users || []), userToAdd]
                            }));
                            setOpenUserModal(false);
                            setNewUser({ name: '', password: '', description: '', type: 'Servicio' });
                        }}
                    >
                        Agregar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openAccessModal} onClose={() => setOpenAccessModal(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    Solicitar acceso al servidor
                </DialogTitle>

                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>

                        <TextField
                            label="Motivo"
                            multiline
                            rows={3}
                            fullWidth
                            value={accessForm.reason}
                            onChange={(e) =>
                                setAccessForm(prev => ({ ...prev, reason: e.target.value }))
                            }
                        />

                        <TextField
                            label="Fecha inicio"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={accessForm.start_at}
                            onChange={(e) =>
                                setAccessForm(prev => ({ ...prev, start_at: e.target.value }))
                            }
                        />

                        <TextField
                            label="Fecha fin (opcional)"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={accessForm.end_at}
                            onChange={(e) =>
                                setAccessForm(prev => ({ ...prev, end_at: e.target.value }))
                            }
                        />

                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenAccessModal(false)}>
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleRequestAccess}
                        disabled={!accessForm.reason || !accessForm.start_at}
                    >
                        Enviar solicitud
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}