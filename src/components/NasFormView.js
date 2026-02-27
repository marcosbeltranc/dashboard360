'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Grid, Typography, Card, CardContent, TextField, Button,
    Chip, Divider, Stack, IconButton, MenuItem, Paper, Avatar,
} from '@mui/material';
import {
    Edit, Save, Dns, Place, ArrowBack, DataSaverOff, LanOutlined, Person, ContentCopy, OpenInNew
} from '@mui/icons-material';

export default function NasFormView({ mode = 'view', initialData, options, onSave }) {
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

    const DataField = ({ label, name, value, icon: IconComponent, type = 'text', select = false, noMargin = false, children }) => (
        <Box sx={{ mb: noMargin ? 0 : 2, display: 'flex', alignItems: isEditing ? 'flex-start' : 'center', gap: 2, width: '100%' }}>
            {!isEditing && IconComponent && (
                <Avatar
                    variant="rounded"
                    sx={{
                        bgcolor: '#dbdbdb88',
                        color: 'primary.main',
                        width: 48,
                        height: 48,
                    }}
                >
                    <IconComponent sx={{ fontSize: 24, color: '#8d8d8d' }} />
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

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
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
                                placeholder="Nombre del NAS"
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
                    { label: "Almacenamiento", name: "storage", value: formData.storage, icon: DataSaverOff },
                    { label: "Ubicación", name: "location_id", value: formData.location_id, select: true, icon: Place, optionsKey: 'locations' },
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

            <Box sx={{ width: '100%' }}>
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
                        <Typography variant="h6" fontWeight="bold" mb={3}>Información de Hardware</Typography>
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
                                { label: "Configuración RAID", name: "raid_controller", value: formData.raid_controller },
                            ].map((field, i) => (
                                <Box
                                    key={field.name}
                                    sx={{
                                        p: 2
                                    }}
                                >
                                    <DataField label={field.label} name={field.name} value={field.value} noMargin />
                                </Box>
                            ))}
                        </Box>

                        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                        <Box sx={{ mt: 3 }}>
                            <DataField label="Almacenamiento" name="storage" value={formData.storage} icon={DataSaverOff} />
                        </Box>
                    </Paper>

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
                        <Typography variant="h6" fontWeight="bold" mb={3}>Accesos y Fechas</Typography>
                        <Stack spacing={2} sx={{ flexGrow: 0 }}>
                            <Typography variant="caption" fontWeight="bold" color="primary" display="block">
                                Métodos de Acceso
                            </Typography>

                            {[
                                { label: "Web", name: "web_access", value: formData.web_access, canOpen: true },
                                { label: "SSH", name: "ssh_access", value: formData.ssh_access, canOpen: false },
                            ].map((item) => (
                                <Box
                                    key={item.name}
                                    sx={{
                                        width: '100%',
                                        borderRadius: '12px',
                                        p: 2,
                                        bgcolor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    {/* Icono */}
                                    <Avatar variant="rounded" sx={{ bgcolor: '#f1f5f9', color: '#94a3b8', width: 40, height: 40 }}>
                                        <LanOutlined sx={{ fontSize: 20 }} />
                                    </Avatar>

                                    {/* Texto */}
                                    <Box sx={{ flexGrow: 1 }}>
                                        {isEditing ? (
                                            <>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={0.5}>
                                                    {item.label}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    name={item.name}
                                                    value={formData[item.name] || ''}
                                                    onChange={handleChange}
                                                    placeholder={`Dirección ${item.label}`}
                                                    variant="outlined"
                                                    sx={{ bgcolor: '#fff' }}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="body2" fontWeight="bold" color="#1e293b">
                                                    {item.label}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#2563eb', fontFamily: 'monospace' }}>
                                                    {formData[item.name] || '—'}
                                                </Typography>
                                            </>
                                        )}
                                    </Box>

                                    {/* Acciones */}
                                    {!isEditing && formData[item.name] && (
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton
                                                size="small"
                                                onClick={() => navigator.clipboard.writeText(formData[item.name])}
                                                sx={{ color: '#94a3b8', '&:hover': { color: '#2563eb' } }}
                                            >
                                                <ContentCopy sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            {item.canOpen && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => window.open(formData[item.name], '_blank')}
                                                    sx={{ color: '#94a3b8', '&:hover': { color: '#2563eb' } }}
                                                >
                                                    <OpenInNew sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    )}
                                </Box>
                            ))}

                            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

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
                                    { label: "Última actualización", type: "date", name: "last_update", value: formData.last_update },
                                    { label: "Último mantenimiento", type: "date", name: "last_maintenance", value: formData.last_maintenance },
                                ].map((field, i) => (
                                    <Box
                                        key={field.name}
                                        sx={{
                                            p: 2
                                        }}
                                    >
                                        <DataField label={field.label} name={field.name} type={field.type} value={field.value} noMargin />
                                    </Box>
                                ))}
                            </Box>


                            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

                            <Box>
                                <DataField label="Notas" name="notes" value={formData.notes} noMargin />
                            </Box>
                        </Stack>
































                        {/* <Stack spacing={2} sx={{ flexGrow: 0 }}>
                            <Typography variant="caption" fontWeight="bold" color="primary" display="block">
                                Métodos de Acceso
                            </Typography>

                            <Box
                                sx={{
                                    width: '100%',
                                    borderRadius: '12px',
                                    p: 2,
                                    bgcolor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                            >
                                <DataField
                                    label="WEB"
                                    name="network_card"
                                    value={formData.network_card}
                                    icon={LanOutlined}
                                    noMargin
                                />
                            </Box>

                            <Box
                                sx={{
                                    width: '100%',
                                    borderRadius: '12px',
                                    p: 2,
                                    bgcolor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                            >
                                <DataField
                                    label="SSH"
                                    name="ssh"
                                    value={formData.ssh}
                                    icon={LanOutlined}
                                    noMargin
                                />
                            </Box>

                            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

                            <Box>
                                <DataField label="Notas" name="notes" value={formData.notes} noMargin />
                            </Box>
                        </Stack> */}
                    </Paper>
                </Stack>
            </Box>
        </Box >
    );
}