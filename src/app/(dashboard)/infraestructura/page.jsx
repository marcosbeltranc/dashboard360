'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Tabs, Tab, Typography, Chip, CircularProgress, Stack, TextField,
    InputAdornment, Grid, Card, CardContent, Button, MenuItem
} from '@mui/material';
import {
    Storage, Router, DnsOutlined, Place, Memory, SdCard, Search, Add
} from '@mui/icons-material';

export default function InfraestructuraGestion() {
    const [allDevices, setAllDevices] = useState([]);
    const [options, setOptions] = useState({ statuses: [], locations: [] });
    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);
    const [search, setSearch] = useState('');
    const [filterLocation, setFilterLocation] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const tabMapping = ['server', 'nas', 'dispositivo_red'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [infraRes, optionsRes] = await Promise.all([
                    api.get('/infrastructure'),
                    api.get('/options')
                ]);
                setAllDevices(infraRes.data);
                const groupedOptions = (optionsRes.data || []).reduce((acc, item) => {
                    const group = item.type;
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(item);
                    return acc;
                }, {});
                setOptions({
                    statuses: groupedOptions.status_type || [],
                    locations: groupedOptions.location || [],
                });
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const counts = useMemo(() => ({
        server: allDevices.filter(d => d.device_type?.slug === 'server').length,
        nas: allDevices.filter(d => d.device_type?.slug === 'nas').length,
        red: allDevices.filter(d => d.device_type?.slug === 'dispositivo_red').length,
        locations: [...new Set(allDevices.map(d => d.location_id))].length
    }), [allDevices]);

    const filteredDevices = useMemo(() => {
        return allDevices.filter(device => {
            const matchesTab = device.device_type?.slug === tabMapping[tabIndex];
            const matchesSearch = device.name.toLowerCase().includes(search.toLowerCase()) ||
                (device.ip_address && device.ip_address.includes(search));
            const matchesLoc = filterLocation === 'all' || device.location_id === filterLocation;
            const matchesStatus = filterStatus === 'all' || device.status?.slug === filterStatus;
            return matchesTab && matchesSearch && matchesLoc && matchesStatus;
        });
    }, [allDevices, tabIndex, search, filterLocation, filterStatus]);

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* ... Encabezado y Tarjetas (Mantener igual) ... */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#1e293b">Infraestructura</Typography>
                    <Typography color="text.secondary">Gestión de activos tecnológicos</Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}>
                    Agregar Dispositivo
                </Button>
            </Box>

            <Grid container spacing={3} mb={4}>
                {[
                    { label: 'Servidores', count: counts.server, icon: <DnsOutlined color="primary" />, color: '#e0f2fe' },
                    { label: 'NAS', count: counts.nas, icon: <Storage sx={{ color: '#a855f7' }} />, color: '#f3e8ff' },
                    { label: 'Red', count: counts.red, icon: <Router sx={{ color: '#22c55e' }} />, color: '#dcfce7' },
                    { label: 'Ubicaciones', count: counts.locations, icon: <Place sx={{ color: '#f97316' }} />, color: '#ffedd5' },
                ].map((card, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1.5, bgcolor: card.color, borderRadius: 2, display: 'flex' }}>{card.icon}</Box>
                                <Box><Typography variant="h5" fontWeight="bold">{card.count}</Typography><Typography variant="body2" color="text.secondary">{card.label}</Typography></Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                <TextField fullWidth size="small" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
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

            {/* TABLA CON LÓGICA DIFERENCIADA REINTEGRADA */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                {tabIndex === 1 ? 'NAS' : tabIndex === 2 ? 'Dispositivo' : 'Servidor'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                {tabIndex === 0 ? 'Especificaciones' : tabIndex === 1 ? 'Capacidad' : 'Marca / Modelo'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>IP</TableCell>

                            {/* Columna de Ubicación (Servidores y Red) o Carpetas (NAS) */}
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                {tabIndex === 1 ? 'Carpetas' : 'Ubicación'}
                            </TableCell>

                            {/* Columnas condicionales que SIEMPRE deben existir en el Head si se usan en el Body */}
                            {tabIndex === 2 && <TableCell sx={{ fontWeight: 'bold' }}>Último Mant.</TableCell>}
                            {tabIndex === 1 && <TableCell sx={{ fontWeight: 'bold' }}>RAID</TableCell>}

                            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDevices.map((device) => (
                            <TableRow key={device.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="bold">{device.name}</Typography>
                                    <Typography variant="caption" color="text.disabled">{device.description}</Typography>
                                </TableCell>

                                <TableCell>
                                    {tabIndex === 1 ? (
                                        <Box>
                                            <Typography variant="body2">{device.brand}</Typography>
                                            <Typography variant="caption" color="text.secondary">{device.model}</Typography>
                                        </Box>
                                    ) : (
                                        <Chip label={device.sub_type?.name || 'N/A'} size="small" variant="outlined" />
                                    )}
                                </TableCell>

                                <TableCell>
                                    {tabIndex === 0 ? (
                                        <Stack spacing={0.5}>
                                            <Typography variant="caption" display="flex" alignItems="center"><Memory sx={{ fontSize: 14, mr: 0.5 }} /> {device.cpu || 'N/A'}</Typography>
                                            <Typography variant="caption" display="flex" alignItems="center"><SdCard sx={{ fontSize: 14, mr: 0.5 }} /> {device.ram || 'N/A'}</Typography>
                                        </Stack>
                                    ) : tabIndex === 1 ? (
                                        <Typography variant="body2">{device.storage || 'N/A'}</Typography>
                                    ) : (
                                        <Box>
                                            <Typography variant="body2">{device.brand || 'N/A'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{device.model || 'N/A'}</Typography>
                                        </Box>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', px: 1, borderRadius: 1, display: 'inline-block' }}>
                                        {device.ip_address || '-'}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    {tabIndex === 1 ? (
                                        <Typography variant="body2">{device.folders_count || 0} ítems</Typography>
                                    ) : (
                                        <Typography variant="body2">{device.location?.name || 'No asignada'}</Typography>
                                    )}
                                </TableCell>

                                {/* IMPORTANTE: Mantener el orden de las celdas igual al del Header */}
                                {tabIndex === 2 && (
                                    <TableCell>
                                        <Typography variant="body2">{device.last_maintenance || 'N/A'}</Typography>
                                    </TableCell>
                                )}

                                {tabIndex === 1 && (
                                    <TableCell>
                                        <Chip label={device.raid_type || 'N/A'} size="small" sx={{ fontWeight: 'bold' }} />
                                    </TableCell>
                                )}

                                <TableCell>
                                    <Chip
                                        label={device.status?.name || 'N/A'}
                                        color={device.status?.slug === 'activo' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}