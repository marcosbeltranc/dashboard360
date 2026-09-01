'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    Box, Typography, Paper, Button, Stack,
    Chip, IconButton, TextField, LinearProgress, Autocomplete
} from '@mui/material';
import {
    UploadFile, Delete, Download, InsertDriveFile
} from '@mui/icons-material';

export default function SystemFilesManager({ systemId, isEditing }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [tags, setTags] = useState([]);
    const [uploading, setUploading] = useState(false);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/files?system_id=${systemId}`);
            setFiles(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (systemId) fetchFiles();
    }, [systemId]);

    // 👉 seleccionar archivo (NO sube aún)
    const handleSelectFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setFileName(file.name);
        setTags([]);
    };

    // 👉 subir manual
    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('system_id', systemId);
        formData.append('name', fileName);
        formData.append('tags', JSON.stringify(tags));

        try {
            setUploading(true);
            await api.post('/files', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // reset
            setSelectedFile(null);
            setFileName('');
            setTags([]);

            fetchFiles();
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar archivo?')) return;

        try {
            await api.delete(`/files/${id}`);
            fetchFiles();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDownload = (id) => {
        window.open(`${process.env.NEXT_PUBLIC_API_URL}/files/${id}/download`);
    };

    return (
        <Paper sx={{ borderRadius: 1, p: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>
                Archivos del Sistema
            </Typography>

            {/* ===================== */}
            {/* UPLOAD CONTROLADO */}
            {/* ===================== */}
            {isEditing && (
                <Box mb={3}>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadFile />}
                    >
                        Seleccionar archivo
                        <input type="file" hidden onChange={handleSelectFile} />
                    </Button>

                    {selectedFile && (
                        <Box mt={2} p={2} border="1px solid #e2e8f0" borderRadius={1}>
                            <Typography fontWeight="bold">
                                Archivo seleccionado
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                label="Nombre"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                sx={{ mt: 2 }}
                            />

                            {/* TAGS estilo tu sistema */}
                            <Autocomplete
                                multiple
                                freeSolo
                                options={[]}
                                value={tags}
                                onChange={(e, newValue) => setTags(newValue)}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, i) => {
                                        const { key, ...tagProps } = getTagProps({ index: i });
                                        return <Chip key={key} label={option} {...tagProps} />;
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        label="Tags"
                                        sx={{ mt: 2 }}
                                    />
                                )}
                            />

                            <Button
                                variant="contained"
                                sx={{ mt: 2 }}
                                onClick={handleUpload}
                                disabled={uploading}
                            >
                                Subir archivo
                            </Button>

                            {uploading && <LinearProgress sx={{ mt: 2 }} />}
                        </Box>
                    )}
                </Box>
            )}

            {/* ===================== */}
            {/* LISTADO */}
            {/* ===================== */}
            {loading ? (
                <Typography>Cargando...</Typography>
            ) : files.length === 0 ? (
                <Typography color="text.secondary">
                    No hay archivos
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {files.map(file => (
                        <Box
                            key={file.id}
                            sx={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 1,
                                p: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <InsertDriveFile fontSize="small" />
                                    <Typography fontWeight="bold">
                                        {file.name}
                                    </Typography>
                                </Stack>

                                <Stack direction="row" spacing={1} mt={1}>
                                    {(file.tags || []).map((tag, i) => (
                                        <Chip key={i} label={tag} size="small" />
                                    ))}
                                </Stack>
                            </Box>

                            <Stack direction="row">
                                <IconButton onClick={() => handleDownload(file.id)}>
                                    <Download />
                                </IconButton>

                                {isEditing && (
                                    <IconButton color="error" onClick={() => handleDelete(file.id)}>
                                        <Delete />
                                    </IconButton>
                                )}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            )}
        </Paper>
    );
}