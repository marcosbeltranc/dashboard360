'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import { Box, Button, Chip, CircularProgress, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Add, OpenInNew, PauseCircleOutline, Search } from '@mui/icons-material';

const TYPES = { api: 'API (REST / SOAP)', webhook: 'Webhook', etl: 'ETL', file_exchange: 'FTP / CSV' };
const STATUS = { active: 'Activa', paused: 'Pausada', maintenance: 'En Mantenimiento', deprecated: 'Depreciada' };
const CRITICALITY = { critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja' };
const statusColor = { active: 'success', paused: 'warning', maintenance: 'info', deprecated: 'default' };
const criticalityColor = { critical: '#dc2626', high: '#ea580c', medium: '#2563eb', low: '#16a34a' };

export default function IntegracionesPage() {
    const router = useRouter();
    const { can, isLoaded } = usePermissions();
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState({ types: [], statuses: [] });
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [type, setType] = useState('all');

    const loadIntegrations = async () => {
        try {
            const [response, optionResponse] = await Promise.all([api.get('/integrations'), api.get('/options')]);
            setIntegrations(response.data.data || response.data || []);
            const grouped = (optionResponse.data.data || optionResponse.data || []).reduce((groups, option) => ({ ...groups, [option.type]: [...(groups[option.type] || []), option] }), {});
            setOptions({ types: grouped.integration_type || [], statuses: grouped.integration_status || [] });
        }
        catch (error) {
            console.error('No se pudieron cargar las integraciones:', error);
            toast.error('No se pudieron cargar las integraciones');
        }
        finally { setLoading(false); }
    };

    useEffect(() => { loadIntegrations(); }, []);

    const filtered = useMemo(() => integrations.filter(item => {
        const itemStatusSlug = item.status?.slug || item.status;
        const itemTypeSlug = item.integration_type?.slug || item.integration_type;
        const text = `${item.name} ${item.description} ${item.source_system?.name || ''} ${item.destination_system?.name || ''}`.toLowerCase();

        return text.includes(search.toLowerCase()) &&
            (status === 'all' || itemStatusSlug === status) &&
            (type === 'all' || itemTypeSlug === type);
    }), [integrations, search, status, type]);

    const deactivate = async (event, integration) => {
        event.stopPropagation();
        if (!window.confirm(`¿Cambiar el estado de “${integration.name}”?`)) return;
        try {
            const response = await api.patch(`/integrations/${integration.id}/deactivate`, { status: 'paused' });
            const updated = response.data.data || response.data;
            setIntegrations(current => current.map(item => item.id === updated.id ? updated : item));
            toast.success('Integración pausada');
        } catch (error) {
            toast.error(error.response?.data?.message || 'No se pudo actualizar el estado');
        }
    };

    if (!isLoaded) return null;
    if (!can('integrations', 'view_menu')) return <Box p={4}><Typography>No tienes acceso a Integraciones.</Typography></Box>;

    return (
        <Box sx={{ minHeight: '100%', bgcolor: '#fff', p: { xs: 2, md: 4 }, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Integraciones</Typography>
                    <Typography color="text.secondary">Inventario técnico y trazabilidad del intercambio de datos.</Typography>
                </Box>
                {can('integrations', 'create') && <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/integraciones/new')}>Nueva Integración</Button>}
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={4}>
                <TextField size="small" placeholder="Buscar por nombre, sistema o descripción..." value={search} onChange={event => setSearch(event.target.value)} sx={{ minWidth: { md: 320 } }} slotProps={{ input: { startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> } }} />
                <TextField size="small" select label="Estado" value={status} onChange={event => setStatus(event.target.value)} sx={{ minWidth: 180 }}>
                    <MenuItem value="all">Todos los estados</MenuItem>
                    {(options.statuses.length ? options.statuses.map(option => [option.slug, option.name]) : Object.entries(STATUS)).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                </TextField>
                <TextField size="small" select label="Tipo" value={type} onChange={event => setType(event.target.value)} sx={{ minWidth: 220 }}>
                    <MenuItem value="all">Todos los tipos</MenuItem>
                    {(options.types.length ? options.types.map(option => [option.slug, option.name]) : Object.entries(TYPES)).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                </TextField>
            </Stack>

            {loading ? (
                <Box textAlign="center" pt={8}><CircularProgress /></Box>
            ) : filtered.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}><Typography color="text.secondary">No se encontraron integraciones.</Typography></Paper>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2.5 }}>
                    {filtered.map(item => {
                        // Extracción segura de valores
                        const currentTypeSlug = item.integration_type?.slug || item.integration_type;
                        const typeName = item.integration_type?.name || TYPES[currentTypeSlug] || currentTypeSlug;
                        const typeColor = item.integration_type?.color;

                        const currentStatusSlug = item.status?.slug || item.status;
                        const statusName = item.status?.name || STATUS[currentStatusSlug] || currentStatusSlug;
                        const statusColor = item.status?.color;

                        const currentCriticalitySlug = item.criticality?.slug || item.criticality;
                        const criticalityName = item.criticality?.name || CRITICALITY[currentCriticalitySlug] || currentCriticalitySlug;


                        return (
                            <Paper key={item.id} variant="outlined" role="button" tabIndex={0} onClick={() => router.push(`/integraciones/${item.id}`)} onKeyDown={event => event.key === 'Enter' && router.push(`/integraciones/${item.id}`)} sx={{ p: 2.5, cursor: 'pointer', transition: '.2s', '&:hover': { borderColor: 'primary.main', boxShadow: 2 } }}>
                                <Stack direction="row" justifyContent="space-between" spacing={1} mb={2}>
                                    <Chip size="small" label={typeName} style={{ color: typeColor, borderColor: typeColor, backgroundColor: typeColor + '1A' }} />
                                    <Chip size="small" label={statusName} style={{ color: statusColor, borderColor: statusColor, backgroundColor: statusColor + '1A' }} />
                                </Stack>
                                <Typography variant="h6" fontWeight={700} mb={1}>{item.name}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</Typography>
                                <Box sx={{ my: 2, py: 1.5, borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                                    <Typography variant="caption" color="text.secondary">FLUJO DE DATOS</Typography>
                                    <Typography variant="body2" fontWeight={600} noWrap>{item.source_system?.name || 'Sistema eliminado'} → {item.destination_system?.name || 'Sistema eliminado'}</Typography>
                                </Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" fontWeight={700} color={criticalityColor[currentCriticalitySlug] || 'text.primary'}>
                                        {criticalityName}
                                    </Typography>
                                    <Stack direction="row">
                                        {can('integrations', 'deactivate') && currentStatusSlug === 'active' && (
                                            <Button size="small" color="warning" startIcon={<PauseCircleOutline />} onClick={event => deactivate(event, item)}>Pausar</Button>
                                        )}
                                        <Button size="small" endIcon={<OpenInNew />}>Ver</Button>
                                    </Stack>
                                </Stack>
                            </Paper>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
}