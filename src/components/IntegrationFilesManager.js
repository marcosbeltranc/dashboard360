'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
    Box, Button, Chip, CircularProgress, IconButton, Paper, Stack, Typography
} from '@mui/material';
import { DeleteOutline, DownloadOutlined, InsertDriveFileOutlined, UploadFileOutlined } from '@mui/icons-material';

const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'xlsx', 'json', 'zip'];
const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.map(extension => `.${extension}`).join(',');

export default function IntegrationFilesManager({ integrationId, canEdit }) {
    const inputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // 1. CARGAR ARCHIVOS (Cambiado a /integration-files?integration_id=...)
    const loadFiles = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/integration-files', {
                params: { integration_id: integrationId }
            });
            setFiles(response.data.data || response.data || []);
        } catch (error) {
            console.error('No se pudieron cargar los adjuntos de la integración:', error);
            toast.error('No se pudieron cargar los archivos adjuntos');
        } finally {
            setLoading(false);
        }
    }, [integrationId]);

    useEffect(() => {
        if (integrationId) loadFiles();
    }, [integrationId, loadFiles]);

    // 2. SUBIR ARCHIVO (Cambiado a POST /integration-files)
    const handleUpload = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!ACCEPTED_EXTENSIONS.includes(extension)) {
            toast.error('Formato no permitido. Usa PDF, DOCX, XLSX, JSON o ZIP.');
            return;
        }

        const payload = new FormData();
        payload.append('file', file);
        payload.append('integration_id', integrationId); // <- Pasamos el ID en el body/form-data

        try {
            setUploading(true);
            await api.post('/integration-files', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Archivo adjuntado');
            loadFiles();
        } catch (error) {
            console.error('No se pudo adjuntar el archivo:', error);
            toast.error('No se pudo adjuntar el archivo');
        } finally {
            setUploading(false);
        }
    };

    // 3. DESCARGAR ARCHIVO (Cambiado a /integration-files/{id}/download)
    const handleDownload = async (file) => {
        try {
            const response = await api.get(`/integration-files/${file.id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('No se pudo descargar el archivo:', error);
            toast.error('No se pudo descargar el archivo');
        }
    };

    // 4. ELIMINAR ARCHIVO (Cambiado a DELETE /integration-files/{id})
    const handleDelete = async (file) => {
        if (!window.confirm(`¿Eliminar el archivo “${file.name}”?`)) return;
        try {
            await api.delete(`/integration-files/${file.id}`);
            setFiles(currentFiles => currentFiles.filter(currentFile => currentFile.id !== file.id));
            toast.success('Archivo eliminado');
        } catch (error) {
            console.error('No se pudo eliminar el archivo:', error);
            toast.error('No se pudo eliminar el archivo');
        }
    };

    return (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={2}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Archivos adjuntos</Typography>
                    <Typography variant="body2" color="text.secondary">Diccionarios de datos, documentación técnica, Postman o Swagger.</Typography>
                </Box>
                {canEdit && (
                    <>
                        <input ref={inputRef} hidden type="file" accept={ACCEPT_ATTRIBUTE} onChange={handleUpload} />
                        <Button variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <UploadFileOutlined />} disabled={uploading} onClick={() => inputRef.current?.click()}>
                            Adjuntar archivo
                        </Button>
                    </>
                )}
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>Formatos permitidos: PDF, DOCX, XLSX, JSON y ZIP.</Typography>
            {loading ? <CircularProgress size={24} /> : files.length === 0 ? (
                <Typography color="text.secondary">No hay archivos adjuntos.</Typography>
            ) : (
                <Stack spacing={1}>
                    {files.map(file => (
                        <Stack key={file.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, p: 1.5 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5} minWidth={0}>
                                <InsertDriveFileOutlined color="action" />
                                <Box minWidth={0}><Typography noWrap fontWeight={600}>{file.name}</Typography><Chip size="small" label={(file.file_type || file.name.split('.').pop() || '').toUpperCase()} /></Box>
                            </Stack>
                            <Stack direction="row">
                                <IconButton aria-label="Descargar archivo" onClick={() => handleDownload(file)}><DownloadOutlined /></IconButton>
                                {canEdit && <IconButton aria-label="Eliminar archivo" color="error" onClick={() => handleDelete(file)}><DeleteOutline /></IconButton>}
                            </Stack>
                        </Stack>
                    ))}
                </Stack>
            )}
        </Paper>
    );
}