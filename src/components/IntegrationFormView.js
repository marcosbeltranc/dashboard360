'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    Alert, Autocomplete, Box, Button, Chip, Grid, IconButton, MenuItem, Paper, Stack, TextField, Typography
} from '@mui/material';
import { ArrowBack, EditOutlined, SaveOutlined } from '@mui/icons-material';
import IntegrationFilesManager from '@/components/IntegrationFilesManager';

const initialValues = {
    name: '',
    description: '',
    integration_type_id: '',
    criticality_id: '',
    status_id: '',
    source_system_id: '',
    destination_system_id: '',
    responsible_id: '',
    external_support_contact: '',
    endpoint_url: '',
    test_endpoint_url: '',
    repository_url: '',
    server_device_id: '',
    authentication_method_id: '',
    trigger_type_id: '',
    frequency_detail: '',
    technical_notes: [],
    logs_location: '',
    alerts_channel: ''
};

export default function IntegrationFormView({
    initialData,
    systems = [],
    servers = [],
    users = [],
    options = {},
    onSave,
    canEdit = false,
    mode = 'view'
}) {
    const router = useRouter();
    const [editing, setEditing] = useState(mode === 'create');
    const [formData, setFormData] = useState({ ...initialValues, ...initialData });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const systemNames = useMemo(() => new Map(systems.map(system => [String(system.id), system.name])), [systems]);
    const serverNames = useMemo(() => new Map(servers.map(server => [String(server.id), server.name])), [servers]);

    const isCreate = mode === 'create';
    const optionPairs = (catalog = []) => catalog.map(option => [String(option.id), option.name]);
    const typeOptions = optionPairs(options.types);
    const criticalityOptions = optionPairs(options.criticalities);
    const statusOptions = optionPairs(options.statuses);
    const authenticationOptions = optionPairs(options.authenticationMethods);
    const triggerOptions = optionPairs(options.triggers);

    const selectedTrigger = options.triggers?.find(option => String(option.id) === String(formData.trigger_type_id));
    const isScheduled = selectedTrigger?.slug === 'scheduled';

    const updateField = event => {
        const { name, value } = event.target;
        const trigger = name === 'trigger_type_id'
            ? options.triggers?.find(option => String(option.id) === String(value))
            : null;
        setFormData(current => ({
            ...current,
            [name]: value,
            ...(name === 'trigger_type_id' && trigger?.slug !== 'scheduled' ? { frequency_detail: '' } : {})
        }));
        setErrors(current => ({ ...current, [name]: undefined }));
    };

    const validate = () => {
        const nextErrors = {};
        ['name', 'description', 'integration_type_id', 'criticality_id', 'status_id', 'source_system_id', 'destination_system_id', 'authentication_method_id', 'trigger_type_id'].forEach(name => {
            if (!String(formData[name] ?? '').trim()) nextErrors[name] = 'Este campo es obligatorio.';
        });
        if (isScheduled && !formData.frequency_detail?.trim()) nextErrors.frequency_detail = 'Indica la frecuencia programada.';
        if (String(formData.source_system_id) === String(formData.destination_system_id) && formData.source_system_id !== '') nextErrors.destination_system_id = 'El sistema receptor debe ser distinto al emisor.';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) { toast.error('Completa los campos obligatorios antes de guardar.'); return; }
        try {
            setSaving(true);
            await onSave({
                ...formData,
                integration_type_id: Number(formData.integration_type_id),
                criticality_id: Number(formData.criticality_id),
                status_id: Number(formData.status_id),
                authentication_method_id: Number(formData.authentication_method_id),
                trigger_type_id: Number(formData.trigger_type_id),
                source_system_id: Number(formData.source_system_id),
                destination_system_id: Number(formData.destination_system_id),
                server_device_id: formData.server_device_id ? Number(formData.server_device_id) : null,
                responsible_id: formData.responsible_id ? Number(formData.responsible_id) : null,
                technical_notes: formData.technical_notes || []
            });
            toast.success(isCreate ? 'Integración registrada' : 'Cambios guardados');
            if (!isCreate) setEditing(false);
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo guardar la integración.';
            toast.error(message);
            if (error.response?.data?.errors) setErrors(error.response.data.errors);
        } finally { setSaving(false); }
    };

    const field = (label, name, options = {}) => {
        const { select = false, items = [], multiline = false, required = false, type = 'text', helperText } = options;
        if (!editing) {
            const optionLabel = items.find(([value]) => String(value) === String(formData[name]))?.[1];
            const displayValue = optionLabel || formData[name] || '—';
            return <Box mb={2.5}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography sx={{ whiteSpace: multiline ? 'pre-wrap' : 'normal' }}>{displayValue}</Typography></Box>;
        }
        return <TextField fullWidth required={required} select={select} type={type} multiline={multiline} minRows={multiline ? 3 : undefined} label={label} name={name} value={formData[name] ?? ''} onChange={updateField} error={Boolean(errors[name])} helperText={errors[name] || helperText} sx={{ mb: 2.5 }}>
            {select && <MenuItem value="">Selecciona una opción</MenuItem>}
            {select && items.map(([value, text]) => <MenuItem key={value} value={value}>{text}</MenuItem>)}
        </TextField>;
    };

    return <Box sx={{ p: 4, minHeight: '100vh' }} className="bg-white p-6 rounded-lg shadow-sm">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={4}>
            <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={() => router.push('/integraciones')} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 1 }}>
                    <ArrowBack fontSize="small" />
                </IconButton>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#1e293b">{isCreate ? 'Nueva Integración' : formData.name}</Typography>
                    <Typography color="text.secondary">{isCreate ? 'Documenta el flujo y soporte técnico de una nueva integración.' : 'Detalle, configuración y trazabilidad de la integración.'}</Typography>
                </Box>
            </Box>
            {!isCreate && !editing && canEdit && <Button variant="contained" startIcon={<EditOutlined />} onClick={() => setEditing(true)}>Editar</Button>}
            {editing && <Stack direction="row" spacing={1}>
                <Button variant="outlined" color="inherit" onClick={() => isCreate ? router.push('/integraciones') : (setFormData({ ...initialValues, ...initialData }), setErrors({}), setEditing(false))}>Cancelar</Button>
                <Button variant="contained" startIcon={<SaveOutlined />} disabled={saving} onClick={handleSave}>Guardar</Button>
            </Stack>}
        </Stack>

        {editing && <Alert severity="info" sx={{ mb: 3 }}>Los campos marcados con * son obligatorios.</Alert>}

        <Stack spacing={3}>
            {/* Información General */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, borderColor: '#e2e8f0', boxShadow: 'none' }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Información general</Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>{field('Nombre de la Integración', 'name', { required: true })}</Grid>
                    <Grid size={{ xs: 12, md: 3 }}>{field('Tipo de Integración', 'integration_type_id', { required: true, select: true, items: typeOptions })}</Grid>
                    <Grid size={{ xs: 12, md: 3 }}>{field('Criticidad', 'criticality_id', { required: true, select: true, items: criticalityOptions })}</Grid>
                    <Grid size={{ xs: 12, md: 3 }}>{field('Estado', 'status_id', { required: true, select: true, items: statusOptions })}</Grid>
                    <Grid size={{ xs: 12 }}>{field('Descripción / Objetivo', 'description', { required: true, multiline: true })}</Grid>
                </Grid>
            </Paper>

            {/* Flujo y Participantes */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, borderColor: '#e2e8f0', boxShadow: 'none' }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Flujo y participantes</Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        {editing ? <TextField fullWidth required select label="Sistema Emisor (Origen)" name="source_system_id" value={formData.source_system_id} onChange={updateField} error={Boolean(errors.source_system_id)} helperText={errors.source_system_id} sx={{ mb: 2.5 }}>
                            <MenuItem value="">Selecciona un sistema</MenuItem>{systems.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                        </TextField> : <Box mb={2.5}><Typography variant="caption" color="text.secondary">Sistema Emisor (Origen)</Typography><Typography>{formData.source_system?.name || systemNames.get(String(formData.source_system_id)) || '—'}</Typography></Box>}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        {editing ? <TextField fullWidth required select label="Sistema Receptor (Destino)" name="destination_system_id" value={formData.destination_system_id} onChange={updateField} error={Boolean(errors.destination_system_id)} helperText={errors.destination_system_id} sx={{ mb: 2.5 }}>
                            <MenuItem value="">Selecciona un sistema</MenuItem>{systems.map(s => <MenuItem key={s.id} value={s.id} disabled={String(s.id) === String(formData.source_system_id)}>{s.name}</MenuItem>)}
                        </TextField> : <Box mb={2.5}><Typography variant="caption" color="text.secondary">Sistema Receptor (Destino)</Typography><Typography>{formData.destination_system?.name || systemNames.get(String(formData.destination_system_id)) || '—'}</Typography></Box>}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        {editing ? <TextField fullWidth select label="Responsable Técnico Interno" name="responsible_id" value={formData.responsible_id || ''} onChange={updateField} sx={{ mb: 2.5 }}>
                            <MenuItem value="">Sin asignar</MenuItem>{users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                        </TextField> : <Box mb={2.5}><Typography variant="caption" color="text.secondary">Responsable Técnico Interno</Typography><Typography>{formData.responsible?.name || '—'}</Typography></Box>}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>{field('Contacto de Soporte Externo', 'external_support_contact', { multiline: true })}</Grid>
                </Grid>
            </Paper>

            {/* Configuración Técnica y Credenciales */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, borderColor: '#e2e8f0', boxShadow: 'none' }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Configuración técnica y credenciales</Typography>
                <Grid container spacing={2}>
                    {/* 1. URL Base */}
                    <Grid size={{ xs: 12, md: 6 }}>{field('URL / Endpoint Base (Producción)', 'endpoint_url')}</Grid>

                    {/* 2. URL de Pruebas (agregado después de URL base) */}
                    <Grid size={{ xs: 12, md: 6 }}>{field('URL / Endpoint Base (Pruebas / QA)', 'test_endpoint_url')}</Grid>

                    {/* 3. Repositorio GIT */}
                    <Grid size={{ xs: 12, md: 6 }}>{field('Repositorio (GIT)', 'repository_url', { helperText: editing ? 'Incluye una URL válida si se captura.' : undefined })}</Grid>

                    {/* 4. Servidor (agregado después del repositorio git) */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        {editing ? <TextField fullWidth select label="Servidor de Alojamiento" name="server_device_id" value={formData.server_device_id || ''} onChange={updateField} sx={{ mb: 2.5 }}>
                            <MenuItem value="">Sin asignar / Servidor Externo</MenuItem>{servers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                        </TextField> : <Box mb={2.5}><Typography variant="caption" color="text.secondary">Servidor de Alojamiento</Typography><Typography>{formData.server?.name || serverNames.get(String(formData.server_device_id)) || '—'}</Typography></Box>}
                    </Grid>

                    {/* 5. Autenticación y Trigger */}
                    <Grid size={{ xs: 12, md: 6 }}>{field('Método de Autenticación', 'authentication_method_id', { required: true, select: true, items: authenticationOptions })}</Grid>
                    <Grid size={{ xs: 12, md: 6 }}>{field('Frecuencia / Gatillo (Trigger)', 'trigger_type_id', { required: true, select: true, items: triggerOptions })}</Grid>
                    {isScheduled && <Grid size={{ xs: 12, md: 6 }}>{field('Detalle de Frecuencia', 'frequency_detail', { required: true, helperText: editing ? 'Ej. Cada 5 minutos o Diario a las 11:00 PM.' : undefined })}</Grid>}

                    {/* 6. Tags / Notas Técnicas (agregados al final de la configuración técnica) */}
                    <Grid size={{ xs: 12 }}>
                        {editing ? (
                            <Autocomplete
                                multiple
                                freeSolo
                                options={[]}
                                value={formData.technical_notes || []}
                                onChange={(e, newValue) => setFormData(prev => ({ ...prev, technical_notes: newValue }))}
                                renderTags={(value, getTagProps) => value.map((option, i) => {
                                    const { key, ...tagProps } = getTagProps({ index: i });
                                    return <Chip key={key} label={option} size="small" {...tagProps} />;
                                })}
                                renderInput={(params) => (
                                    <TextField {...params} label="Detalles Técnicos / Tags" placeholder="Agrega tecnologías (Lenguaje, BD, Framework)" sx={{ mb: 2.5 }} />
                                )}
                            />
                        ) : (
                            <Box mb={2.5}>
                                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Detalles Técnicos / Tags</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {(formData.technical_notes || []).length > 0 ? (
                                        formData.technical_notes.map((tech, i) => <Chip key={i} label={tech} size="small" />)
                                    ) : <Typography>—</Typography>}
                                </Box>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            {/* Monitoreo y Documentación */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, borderColor: '#e2e8f0', boxShadow: 'none' }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Monitoreo y documentación</Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>{field('Ubicación de Logs', 'logs_location', { multiline: true })}</Grid>
                    <Grid size={{ xs: 12, md: 6 }}>{field('Canal de Alertas', 'alerts_channel', { multiline: true })}</Grid>
                </Grid>
            </Paper>

            {!isCreate && <IntegrationFilesManager integrationId={formData.id} canEdit={canEdit && editing} />}
        </Stack>
    </Box>;
}