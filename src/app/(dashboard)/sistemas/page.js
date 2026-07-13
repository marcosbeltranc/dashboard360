'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import {
    Box, Typography, CircularProgress, Stack, TextField,
    InputAdornment, Grid, Card, CardContent, Button, MenuItem, Chip, Tooltip
} from '@mui/material';
import {
    Search, Add, OpenInNew, People, Description, Storage,
    Business, Language, PriorityHigh
} from '@mui/icons-material';

export default function SistemasGestion() {
    const router = useRouter();
    const { can, isLoaded } = usePermissions();
    // Estados de Datos
    const [systems, setSystems] = useState([]);
    const [servers, setServers] = useState([]);
    const [options, setOptions] = useState({
        statuses: [],
        criticalities: [],
        areas: [],
    });
    const [loading, setLoading] = useState(true);

    // Estados de Filtros
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterArea, setFilterArea] = useState('all');
    const [filterServer, setFilterServer] = useState('all');

    // Estados para Modal
    const [openModal, setOpenModal] = useState(false);
    const [selectedSystem, setSelectedSystem] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sysRes, optionsRes, srvRes] = await Promise.all([
                    api.get('/systems'),
                    api.get('/options'),
                    api.get('/server-devices')
                ]);

                setSystems(sysRes.data.data || []);
                setServers(srvRes.data.data || []);

                const groupedOptions = (optionsRes.data || []).reduce((acc, item) => {
                    const group = item.type;
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(item);
                    return acc;
                }, {});

                setOptions({
                    statuses: groupedOptions.system_status || [],
                    criticalities: groupedOptions.criticality || [],
                    areas: groupedOptions.departments || [],
                });
            } catch (error) {
                console.error("Error al cargar datos de sistemas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Lógica de Filtrado combinada
    const filteredSystems = useMemo(() => {
        return systems.filter(sys => {
            const matchesSearch = sys.name.toLowerCase().includes(search.toLowerCase()) ||
                (sys.description && sys.description.toLowerCase().includes(search.toLowerCase()));
            const matchesStatus = filterStatus === 'all' || sys.status?.slug === filterStatus;
            const matchesArea = filterArea === 'all' || sys.area_id === filterArea;
            const matchesServer = filterServer === 'all' || sys.server_device_id === filterServer;

            return matchesSearch && matchesStatus && matchesArea && matchesServer;
        });
    }, [systems, search, filterStatus, filterArea, filterServer]);

    // Colores dinámicos para la criticidad (Basado en Slugs ingleses)
    const getPriorityStyle = (slug) => {
        const styles = {
            'critical': { bg: '#fef2f2', text: '#ef4444', border: '#fee2e2' },
            'high': { bg: '#fff7ed', text: '#f97316', border: '#ffedd5' },
            'medium': { bg: '#eff6ff', text: '#3b82f6', border: '#dbeafe' },
            'low': { bg: '#f0fdf4', text: '#22c55e', border: '#dcfce7' }
        };
        return styles[slug] || { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
    };

    const handleSaveSystem = async (formData) => {
        try {
            if (selectedSystem) {
                const res = await api.put(`/systems/${selectedSystem.id}`, formData);
                setSystems(prev => prev.map(s => s.id === selectedSystem.id ? res.data.data : s));
            } else {
                const res = await api.post('/systems', formData);
                setSystems(prev => [res.data.data, ...prev]);
            }
            setOpenModal(false);
        } catch (error) {
            console.error("Error saving system:", error);
            throw error;
        }
    };

    if (!isLoaded) return null;

    if (!can('systems', 'view_menu')) {
        return (
            <Box p={4}>
                <Typography>No tienes acceso a Sistemas</Typography>
            </Box>
        );
    }

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Box className="bg-white p-6 rounded-lg shadow-sm" sx={{ p: 4, bgcolor: '#fff', minHeight: '100vh' }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#1e293b">Sistemas</Typography>
                    <Typography color="text.secondary">Inventario de aplicaciones y servicios críticos</Typography>
                </Box>
                {can('systems', 'create') && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => router.push('/sistemas/new')}
                        sx={{ borderRadius: 1, textTransform: 'none', px: 3, bgcolor: '#3b82f6' }}
                    >
                        Nuevo Sistema
                    </Button>
                )}
            </Box>

            {/* Filtros */}
            <Stack direction="row" spacing={2} mb={4} flexWrap="wrap" useFlexGap>
                <TextField
                    placeholder="Buscar sistemas..."
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ bgcolor: 'white', borderRadius: 1, width: 300 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
                />
                <TextField select size="small" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ bgcolor: 'white', minWidth: 160 }}>
                    <MenuItem value="all">Todos los estados</MenuItem>
                    {options.statuses.map(st => <MenuItem key={st.id} value={st.slug}>{st.name}</MenuItem>)}
                </TextField>
                <TextField select size="small" value={filterArea} onChange={(e) => setFilterArea(e.target.value)} sx={{ bgcolor: 'white', minWidth: 180 }}>
                    <MenuItem value="all">Todas las áreas</MenuItem>
                    {options.areas.map(area => <MenuItem key={area.id} value={area.id}>{area.name}</MenuItem>)}
                </TextField>
                <TextField select size="small" value={filterServer} onChange={(e) => setFilterServer(e.target.value)} sx={{ bgcolor: 'white', minWidth: 200 }}>
                    <MenuItem value="all">Todos los servidores</MenuItem>
                    {servers.map(srv => <MenuItem key={srv.id} value={srv.id}>{srv.name}</MenuItem>)}
                </TextField>
            </Stack>

            {/* Grid de Sistemas - CORREGIDO */}
            <Grid
                container
                spacing={3}
                alignItems="stretch"
                sx={{
                    // Fuerza que todos los items se alineen correctamente
                    '& > .MuiGrid-item': {
                        display: 'flex',  // ← Cada item es un flex container
                    }
                }}
            >
                {filteredSystems.map((sys) => {
                    const pStyle = getPriorityStyle(sys.priority?.slug);
                    return (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            key={sys.id}
                            sx={{
                                display: 'flex',           // ← Flex para que ocupe todo el espacio
                                minWidth: 0,               // ← CRÍTICO: permite que el item se encoja
                                flexBasis: '20%',          // ← Fuerza exactamente 25% de ancho
                                maxWidth: '20%',           // ← Nunca más del 25%
                            }}
                        >
                            <Card sx={{
                                borderRadius: 1,
                                border: '1px solid #e2e8f0',
                                boxShadow: 'none',
                                width: '100%',             // ← OCUPA 100% del ancho del Grid item
                                minWidth: 0,               // ← Permite que se encoja si el contenido es grande
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: '0.2s',
                                '&:hover': { borderColor: '#3b82f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                            }}>
                                <CardContent sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexGrow: 1,
                                    width: '100%',         // ← Asegura que el contenido no desborde
                                    minWidth: 0,           // ← CRÍTICO para text-overflow
                                    p: 3,
                                    '&:last-child': { pb: 3 }
                                }}>
                                    {/* Header de la tarjeta */}
                                    <Box display="flex" justifyContent="space-between" mb={2} alignItems="flex-start" sx={{ width: '100%', minWidth: 0 }}>
                                        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
                                            <Box sx={{ bgcolor: '#eff6ff', p: 1, borderRadius: 1, display: 'flex', flexShrink: 0 }}>
                                                <Language sx={{ color: '#3b82f6' }} />
                                            </Box>
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="bold"
                                                    sx={{
                                                        cursor: can('systems_detail', 'view') ? 'pointer' : 'default',
                                                        '&:hover': can('systems_detail', 'view') ? { color: 'primary.main' } : {},
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        width: '100%',     // ← Necesario para text-overflow
                                                        display: 'block'   // ← Necesario para text-overflow
                                                    }}
                                                    onClick={() => {
                                                        if (!can('systems_detail', 'view')) return;
                                                        router.push(`/sistemas/${sys.id}`);
                                                    }}
                                                >
                                                    {sys.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                                                    <Storage sx={{ fontSize: 14, mr: 0.5 }} /> {sys.server?.name || 'No asignado'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <Chip
                                            label={sys.status?.name}
                                            size="small"
                                            sx={{
                                                bgcolor: sys.status?.slug === 'active' ? '#f0fdf4' : '#f1f5f9',
                                                color: sys.status?.slug === 'active' ? '#16a34a' : '#64748b',
                                                fontWeight: 'bold',
                                                fontSize: 11,
                                                flexShrink: 0,
                                                ml: 1
                                            }}
                                        />
                                    </Box>

                                    {/* Descripción */}
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mb: 2,
                                            flexGrow: 1,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: 1.5
                                        }}
                                    >
                                        {sys.description || 'Sin descripción técnica.'}
                                    </Typography>

                                    {/* Botón siempre al fondo */}
                                    {sys.url && (
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<OpenInNew />}
                                            href={sys.url}
                                            target="_blank"
                                            sx={{
                                                mt: 'auto',
                                                borderRadius: 1,
                                                textTransform: 'none',
                                                color: '#1e293b',
                                                borderColor: '#e2e8f0',
                                                py: 1
                                            }}
                                        >
                                            Ir al Sistema
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}