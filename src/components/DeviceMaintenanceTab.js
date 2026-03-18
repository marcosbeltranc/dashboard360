'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem, Stack, Checkbox, FormControlLabel,
    Alert, Card, CardContent
} from '@mui/material';
import { Visibility, Delete, Add, ListAlt, AssignmentTurnedIn, Settings } from '@mui/icons-material';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function DeviceMaintenanceTab({ deviceId, deviceType, maintenanceNotes, options, isEditingServer, onMaintenanceNotesChange }) {
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [selectedMaint, setSelectedMaint] = useState(null);

    const [newMaint, setNewMaint] = useState({
        title: '',
        maintenance_type_id: '',
        responsible_id: '',
        completion_date: new Date().toISOString().split('T')[0],
        details: '',
        validation_checklist: {}
    });

    // 1. Definición estable de la función de carga
    const fetchMaintenances = useCallback(async () => {
        if (!deviceId) return;
        try {
            setLoading(true);
            const response = await api.get(`/device-maintenances`, {
                params: { device_id: deviceId, device_type: deviceType }
            });
            setMaintenances(response.data.data);
        } catch (error) {
            console.error("Error Gaia Maintenance:", error);
        } finally {
            setLoading(false);
        }
    }, [deviceId, deviceType]);

    // 2. Efecto de carga inicial (Dependencias constantes)
    useEffect(() => {
        fetchMaintenances();
    }, [fetchMaintenances]);

    // 3. Inicializar checklist cuando se abre el modal
    useEffect(() => {
        if (maintenanceNotes && openModal) {
            const lines = maintenanceNotes.split('\n').filter(line => line.trim() !== '');
            const initialChecklist = {};
            lines.forEach(line => { initialChecklist[line.trim()] = false; });
            setNewMaint(prev => ({
                ...prev,
                validation_checklist: initialChecklist,
                title: '', // Reset campos al abrir
                details: ''
            }));
        }
    }, [maintenanceNotes, openModal]);

    const handleCheckChange = (task) => {
        setNewMaint(prev => ({
            ...prev,
            validation_checklist: {
                ...prev.validation_checklist,
                [task]: !prev.validation_checklist[task]
            }
        }));
    };

    const handleSave = async () => {
        const tasks = Object.keys(newMaint.validation_checklist);
        const allChecked = tasks.every(t => newMaint.validation_checklist[t] === true);

        if (tasks.length > 0 && !allChecked) {
            return toast.error("Debe completar todos los puntos del checklist post-reinicio");
        }

        if (!newMaint.title || !newMaint.maintenance_type_id || !newMaint.responsible_id) {
            return toast.error("Por favor complete los campos obligatorios");
        }

        try {
            await api.post('/device-maintenances', {
                ...newMaint,
                device_id: deviceId,
                device_type: deviceType
            });
            toast.success("Mantenimiento registrado correctamente");
            setOpenModal(false);
            fetchMaintenances();
        } catch (error) {
            toast.error("Error al guardar en el servidor");
        }
    };

    if (isEditingServer) {
        return (
            <Box sx={{ p: 1 }}>
                <Alert
                    severity="info"
                    icon={<Settings />}
                    sx={{ mb: 3, borderRadius: 1, '& .MuiAlert-message': { width: '100%' } }}
                >
                    <Typography variant="subtitle2" fontWeight="bold">
                        Configuración del Checklist
                    </Typography>
                    <Typography variant="body2">
                        Escriba los puntos que el técnico debe revisar después de reiniciar el servidor (una tarea por línea).
                    </Typography>
                </Alert>

                <Card variant="outlined" sx={{ borderRadius: 1, borderStyle: 'dashed', bgcolor: '#f8fafc' }}>
                    <CardContent>
                        <Stack spacing={2}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                NOTAS DE MANTENIMIENTO (CHECKLIST)
                            </Typography>
                            <TextField
                                id="maintenance-notes-editor"
                                label="NOTAS DE MANTENIMIENTO (CHECKLIST)"
                                fullWidth
                                multiline
                                rows={6}
                                variant="outlined"
                                placeholder="Ejemplo:&#10;Verificar servicio de SQL Server&#10;Validar acceso a carpeta compartida&#10;Revisar visor de eventos"
                                value={maintenanceNotes || ''}
                                onChange={(e) => onMaintenanceNotesChange(e.target.value)}
                                autoComplete="off"
                                helperText="Cada línea se convertirá en un checkbox obligatorio al registrar un mantenimiento."
                                sx={{ bgcolor: 'white' }}
                            />
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    if (!maintenanceNotes || maintenanceNotes.trim() === "") {
        return (
            <Box sx={{
                textAlign: 'center', py: 10, bgcolor: '#fff5f5',
                borderRadius: 1, border: '1px dashed #feb2b2',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <ListAlt sx={{ fontSize: 60, color: '#fc8181', mb: 2 }} />
                <Typography variant="h6" color="#c53030" fontWeight="bold">Checklist no configurado</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mt: 1 }}>
                    Este servidor no tiene "Notas de Mantenimiento". Edite el servidor y agregue las tareas de verificación (una por línea) para habilitar esta pestaña.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">Actualizaciones y Mantenimiento</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenModal(true)}
                    sx={{ textTransform: 'none', borderRadius: 1 }}
                >
                    Registrar Mantenimiento
                </Button>
            </Stack>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actividad</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Responsable</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {maintenances.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                                    No se han registrado mantenimientos para este equipo.
                                </TableCell>
                            </TableRow>
                        ) : (
                            maintenances.map((m) => (
                                <TableRow key={m.id} hover>
                                    <TableCell>{m.completion_date}</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{m.title}</TableCell>
                                    <TableCell>
                                        <Chip label={m.maintenance_type?.name} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                    </TableCell>
                                    <TableCell>{m.responsible?.name}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => { setSelectedMaint(m); setViewModal(true); }}>
                                            <Visibility fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => {
                                            if (confirm("¿Eliminar este registro?")) {
                                                api.delete(`/device-maintenances/${m.id}`).then(() => fetchMaintenances());
                                            }
                                        }}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* MODAL: REGISTRO CON CHECKLIST */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>Nueva Actualización Realizada</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} mt={1}>
                        <TextField id="maint-title" label="Título / Descripción breve" fullWidth size="small" required
                            value={newMaint.title}
                            onChange={(e) => setNewMaint({ ...newMaint, title: e.target.value })} />

                        <Stack direction="row" spacing={2}>
                            <TextField
                                select
                                label="Categoría"
                                fullWidth
                                size="small"
                                required
                                id="select-maintenance-category"
                                value={newMaint.maintenance_type_id || ''}
                                onChange={(e) => setNewMaint({ ...newMaint, maintenance_type_id: e.target.value })}
                            >
                                {options?.maintenance_type && options.maintenance_type.length > 0 ? (
                                    options.maintenance_type.map((opt) => (
                                        <MenuItem key={opt.id} value={opt.id}>
                                            {opt.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled value="">
                                        No hay categorías disponibles
                                    </MenuItem>
                                )}
                            </TextField>
                            <TextField select label="Ejecutado por" fullWidth size="small" required
                                value={newMaint.responsible_id}
                                onChange={(e) => setNewMaint({ ...newMaint, responsible_id: e.target.value })}>
                                {options.responsibles?.map(opt => (
                                    <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                                ))}
                            </TextField>
                        </Stack>

                        <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 1, border: '1px solid #bae6fd' }}>
                            <Typography variant="caption" fontWeight="bold" color="primary.main" display="block" mb={1}>
                                VALIDACIÓN POST-MANTENIMIENTO
                            </Typography>
                            {Object.keys(newMaint.validation_checklist).map((task) => (
                                <FormControlLabel
                                    key={task}
                                    sx={{ width: '100%', mb: 0.5 }}
                                    control={<Checkbox size="small" checked={newMaint.validation_checklist[task]} onChange={() => handleCheckChange(task)} />}
                                    label={<Typography variant="body2">{task}</Typography>}
                                />
                            ))}
                        </Box>

                        <TextField label="Notas técnicas detalladas" multiline rows={3} fullWidth
                            value={newMaint.details}
                            onChange={(e) => setNewMaint({ ...newMaint, details: e.target.value })} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
                    <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none' }}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} sx={{ textTransform: 'none', borderRadius: 1 }}>
                        Guardar Registro
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL: VISTA DE DETALLE */}
            <Dialog open={viewModal} onClose={() => setViewModal(false)} fullWidth maxWidth="xs">
                {selectedMaint && (
                    <>
                        <DialogTitle sx={{ fontWeight: 'bold' }}>Resumen de Mantenimiento</DialogTitle>
                        <DialogContent dividers>
                            <Typography variant="caption" color="text.secondary">Actividad:</Typography>
                            <Typography variant="body1" fontWeight="bold" mb={2}>{selectedMaint.title}</Typography>

                            <Typography variant="caption" color="text.secondary">Notas del técnico:</Typography>
                            <Typography variant="body2" mb={2} sx={{ whiteSpace: 'pre-line', bgcolor: '#f1f5f9', p: 1.5, borderRadius: 1 }}>
                                {selectedMaint.details || "Sin notas adicionales."}
                            </Typography>

                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>Checklist verificado:</Typography>
                            {selectedMaint.validation_checklist && Object.entries(selectedMaint.validation_checklist).map(([task, status]) => (
                                <Box key={task} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                                    <AssignmentTurnedIn sx={{ fontSize: 18, color: 'success.main' }} />
                                    <Typography variant="body2" color="text.primary">{task}</Typography>
                                </Box>
                            ))}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setViewModal(false)} fullWidth variant="contained" sx={{ textTransform: 'none' }}>
                                Entendido
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}