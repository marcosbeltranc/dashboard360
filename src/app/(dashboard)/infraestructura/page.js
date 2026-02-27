'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import NetworkDeviceModal from '@/components/NetworkDeviceModal';
import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Tabs, Tab, Typography, Chip, CircularProgress, Stack, TextField,
    InputAdornment, Grid, Card, CardContent, Button, MenuItem
} from '@mui/material';
import {
    Storage, Router, DnsOutlined, Place, Memory, SdCard, Search, Add
} from '@mui/icons-material';

export default function InfraestructuraGestion() {
    const router = useRouter();

    const [devices, setDevices] = useState({
        servers: [],
        nas: [],
        network: []
    });

    const [options, setOptions] = useState({
        statuses: [],
        locations: [],
        deviceTypes: [],
        networkTypes: [],
    });

    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);
    const [search, setSearch] = useState('');
    const [filterLocation, setFilterLocation] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Estados para el Modal de Red (Crear y Editar)
    const [openNetworkModal, setOpenNetworkModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);

    const tabDataKeys = ['servers', 'nas', 'network'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [srvRes, nasRes, netRes, optionsRes] = await Promise.all([
                    api.get('/server-devices'),
                    api.get('/nas-devices'),
                    api.get('/network-devices'),
                    api.get('/options')
                ]);

                setDevices({
                    servers: srvRes.data.data || [],
                    nas: nasRes.data.data || [],
                    network: netRes.data.data || []
                });

                const groupedOptions = (optionsRes.data || []).reduce((acc, item) => {
                    const group = item.type;
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(item);
                    return acc;
                }, {});

                setOptions({
                    statuses: groupedOptions.status_type || [],
                    locations: groupedOptions.location || [],
                    deviceTypes: groupedOptions.device_type || [],
                    networkTypes: groupedOptions.network_type || [],
                });
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Función unificada para Guardar/Actualizar Red
    const handleSaveNetworkDevice = async (formData) => {
        try {
            if (selectedDevice) {
                // Modo Edición (PUT)
                const response = await api.put(`/network-devices/${selectedDevice.id}`, formData);
                const updatedItem = response.data.data || response.data;

                setDevices(prev => ({
                    ...prev,
                    network: prev.network.map(d => d.id === selectedDevice.id ? updatedItem : d)
                }));
            } else {
                // Modo Creación (POST)
                const response = await api.post('/network-devices', formData);
                const newItem = response.data.data || response.data;

                setDevices(prev => ({
                    ...prev,
                    network: [newItem, ...prev.network]
                }));
            }
        } catch (error) {
            console.error("Error en la operación de red:", error);
            throw error; // Re-lanzamos para que el modal gestione el error visualmente
        }
    };

    const handleOpenCreateNetwork = () => {
        setSelectedDevice(null);
        setOpenNetworkModal(true);
    };

    const handleOpenEditNetwork = (device) => {
        setSelectedDevice(device);
        setOpenNetworkModal(true);
    };

    const counts = useMemo(() => ({
        server: devices.servers.length,
        nas: devices.nas.length,
        red: devices.network.length,
        locations: options.locations.length
    }), [devices, options.locations]);

    const filteredDevices = useMemo(() => {
        const currentCategory = tabDataKeys[tabIndex];
        const listToFilter = devices[currentCategory] || [];

        return listToFilter.filter(device => {
            const matchesSearch = device.name.toLowerCase().includes(search.toLowerCase()) ||
                (device.ip_address && device.ip_address.includes(search));
            const matchesLoc = filterLocation === 'all' || device.location_id === filterLocation;
            const matchesStatus = filterStatus === 'all' || device.status?.slug === filterStatus;
            return matchesSearch && matchesLoc && matchesStatus;
        });
    }, [devices, tabIndex, search, filterLocation, filterStatus]);

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#1e293b">Infraestructura</Typography>
                    <Typography color="text.secondary">Gestión de activos tecnológicos</Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    {tabIndex === 0 && (
                        <Button
                            variant="contained" startIcon={<Add />}
                            onClick={() => router.push('/infraestructura/servers/new')}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                        >
                            Nuevo Servidor
                        </Button>
                    )}
                    {tabIndex === 1 && (
                        <Button
                            variant="contained" startIcon={<Add />}
                            onClick={() => router.push('/infraestructura/nas/new')}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 3, bgcolor: '#a855f7', '&:hover': { bgcolor: '#9333ea' } }}
                        >
                            Nuevo NAS
                        </Button>
                    )}
                    {tabIndex === 2 && (
                        <Button
                            variant="contained" startIcon={<Add />}
                            onClick={handleOpenCreateNetwork}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 3, bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
                        >
                            Nuevo Dispositivo de Red
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* Cards de Resumen - Con Ancho Simétrico Forzado */}
            <Grid container spacing={2} mb={4}>
                {[
                    { label: 'Servidores', count: counts.server, icon: <DnsOutlined color="primary" />, color: '#e0f2fe' },
                    { label: 'NAS', count: counts.nas, icon: <Storage sx={{ color: '#a855f7' }} />, color: '#f3e8ff' },
                    { label: 'Red', count: counts.red, icon: <Router sx={{ color: '#22c55e' }} />, color: '#dcfce7' },
                    { label: 'Ubicaciones', count: counts.locations, icon: <Place sx={{ color: '#f97316' }} />, color: '#ffedd5' },
                ].map((card, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i} sx={{
                        display: 'flex',
                        // Aplicamos el "trío dinámico" para igualdad de ancho
                        flexBasis: 0,
                        flexGrow: 1,
                        minWidth: 0
                    }}>
                        <Card variant="outlined" sx={{
                            borderRadius: 3,
                            border: '1px solid #e2e8f0',
                            boxShadow: 'none',
                            width: '100%', // La tarjeta llena el espacio exacto del Grid item
                            display: 'flex'
                        }}>
                            <CardContent sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                flexGrow: 1, // Permite que el contenido interno use todo el espacio
                                '&:last-child': { pb: 2 }
                            }}>
                                <Box sx={{
                                    p: 1.5,
                                    bgcolor: card.color,
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexShrink: 0 // Evita que el icono se aplaste si el texto es largo
                                }}>
                                    {card.icon}
                                </Box>
                                <Box sx={{ minWidth: 0 }}> {/* minWidth: 0 para permitir truncado si fuera necesario */}
                                    <Typography variant="h5" fontWeight="bold">
                                        {card.count}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        noWrap // Opcional: añade puntos suspensivos si el texto no cabe
                                    >
                                        {card.label}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                <TextField
                    fullWidth size="small" placeholder="Buscar por nombre o IP..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
                />
                <TextField select size="small" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} sx={{ minWidth: 200 }}>
                    <MenuItem value="all">Todas las ubicaciones</MenuItem>
                    {options.locations.map((loc) => <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>)}
                </TextField>
                <TextField select size="small" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ minWidth: 150 }}>
                    <MenuItem value="all">Todos los estados</MenuItem>
                    {options.statuses.map((st) => <MenuItem key={st.id} value={st.slug}>{st.name}</MenuItem>)}
                </TextField>
            </Paper>

            <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ mb: 2 }}>
                <Tab label={`Servidores (${counts.server})`} />
                <Tab label={`NAS (${counts.nas})`} />
                <Tab label={`Red (${counts.red})`} />
            </Tabs>

            {/* Tabla */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Marca / Modelo</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{tabIndex === 0 ? 'CPU / RAM' : tabIndex === 1 ? 'Almacenamiento' : 'SKU'}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>IP</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Ubicación</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDevices.map((device) => (
                            <TableRow key={`${tabIndex}-${device.id}`} hover>
                                <TableCell>
                                    <Box
                                        component="span"
                                        onClick={() => {
                                            if (tabIndex === 2) {
                                                // Si es RED, abrimos el modal para EDITAR
                                                handleOpenEditNetwork(device);
                                            } else {
                                                // Si es Servidor o NAS, navegamos a su página
                                                const path = tabIndex === 0 ? 'servers' : 'nas';
                                                router.push(`/infraestructura/${path}/${device.id}`);
                                            }
                                        }}
                                        sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                                    >
                                        <Typography variant="subtitle2" fontWeight="bold">{device.name}</Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.disabled">{device.serial_number}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{device.brand || 'N/A'}</Typography>
                                    <Typography variant="caption" color="text.secondary">{device.model || 'N/A'}</Typography>
                                </TableCell>
                                <TableCell>
                                    {tabIndex === 0 ? (
                                        <Stack spacing={0.5}>
                                            <Typography variant="caption" display="flex" alignItems="center"><Memory sx={{ fontSize: 14, mr: 0.5 }} /> {device.processor || 'N/A'}</Typography>
                                            <Typography variant="caption" display="flex" alignItems="center"><SdCard sx={{ fontSize: 14, mr: 0.5 }} /> {device.ram || 'N/A'}</Typography>
                                        </Stack>
                                    ) : tabIndex === 1 ? (
                                        <Typography variant="body2">{device.storage || 'N/A'}</Typography>
                                    ) : (
                                        <Typography variant="body2">{device.sku || 'N/A'}</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', px: 1, borderRadius: 1, display: 'inline-block' }}>
                                        {device.ip_address || '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell>{device.location?.name || 'No asignada'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={device.status?.name} size="small"
                                        sx={{
                                            bgcolor: device.status?.slug === 'activo' ? '#dcfce7' : '#fee2e2',
                                            color: device.status?.slug === 'activo' ? '#166534' : '#991b1b',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Red - Configurado para Crear y Editar */}
            <NetworkDeviceModal
                open={openNetworkModal}
                onClose={() => {
                    setOpenNetworkModal(false);
                    setSelectedDevice(null);
                }}
                onSave={handleSaveNetworkDevice}
                options={options}
                initialData={selectedDevice}
            />
        </Box>
    );
}