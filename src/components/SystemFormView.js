'use client';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import {
    Box, Grid, Typography, Card, CardContent, TextField, Button,
    Chip, Divider, Stack, IconButton, MenuItem, Paper, Avatar, Autocomplete,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
    Edit, Save, Dns, Person, Settings, ArrowBack,
    Storage, Terminal, Language, Code,
    Description, Business, Notes, Lan, Update
} from '@mui/icons-material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RichTextEditor from '@/components/RichTextEditor';
import SystemFilesManager from '@/components/SystemFilesManager';
import { usePermissions } from '@/hooks/usePermissions';
import toast from 'react-hot-toast';

export default function SystemFormView({
    mode = 'view',
    initialData,
    options = { areas: [], priorities: [], statuses: [] },
    servers = [],
    users = [],
    onSave
}) {
    const { can, isLoaded } = usePermissions();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
    const [formData, setFormData] = useState(initialData || {});
    const [faqSearch, setFaqSearch] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                areas: initialData.areas?.map(a => a.id) || []
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (formData.faqs && formData.faqs.length > 0) {
            const hasEmptyFaq = formData.faqs.some(
                faq => !faq.question?.trim() || !faq.answer?.trim()
            );

            if (hasEmptyFaq) {
                // Usando el toast que ya tienes en otros componentes de Gaia
                toast.error('Por favor, completa todas las preguntas y respuestas de las FAQs o elimina las vacías.');
                return;
            }
        }
        onSave(formData);
        if (mode !== 'create') setIsEditing(false);
    };

    const handleCancel = () => {
        if (mode === 'create') {
            router.back();
        } else {
            setFormData({
                ...initialData,
                areas: initialData.areas?.map(a => a.id) || []
            });
            setIsEditing(false);
        }
    };
    const DataField = ({ label, name, value, icon: IconComponent, select = false, optionsArray = [], multiline = false, rows = 1, type = 'text', multiple = false }) => (
        // const DataField = ({ label, name, value, icon: IconComponent, select = false, optionsArray = [], multiline = false, rows = 1, type = 'text' }) => (
        <Box sx={{ mb: 2, display: 'flex', alignItems: isEditing ? 'flex-start' : 'center', gap: 2 }}>
            {!isEditing && IconComponent && (
                <Avatar variant="rounded" sx={{ bgcolor: 'rgba(37, 99, 235, 0.08)', color: 'primary.main', width: 42, height: 42 }}>
                    <IconComponent sx={{ fontSize: 20 }} />
                </Avatar>
            )}

            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {isEditing && IconComponent && <IconComponent sx={{ fontSize: 14, mr: 0.5 }} />} {label}
                </Typography>

                {isEditing ? (
                    <TextField
                        fullWidth size="small"
                        name={name}
                        value={multiple ? (value || []) : (value || '')}
                        onChange={handleChange}
                        select={select}
                        type={type}
                        variant="outlined"
                        multiline={multiline}
                        rows={rows}
                        sx={{ bgcolor: '#fff' }}
                        SelectProps={{
                            multiple
                        }}
                    >
                        {optionsArray.map(opt => (
                            <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                        ))}
                    </TextField>
                ) : (
                    <Typography variant="body1" fontWeight="600" color="#1e293b" sx={{ minHeight: '24px', lineHeight: 1.2 }}>
                        {select
                            ? multiple
                                ? optionsArray
                                    ?.filter(opt => value?.includes(opt.id))
                                    .map(opt => opt.name)
                                    .join(', ')
                                : (optionsArray?.find(opt => opt.id === value)?.name || 'No asignado')
                            : (value || '—')
                        }
                    </Typography>
                )}
            </Box>
        </Box>
    );

    console.log(options?.priorities);
    const status = options?.statuses?.find(s => s.id === formData.status_id);
    const selectedServer = servers?.find(
        s => s.id === formData.server_device_id
    );
    console.log(selectedServer);
    const filteredFaqs = (formData.faqs || []).filter(faq => {
        const search = faqSearch.toLowerCase();

        const questionMatch = faq.question?.toLowerCase().includes(search);

        const answerMatch = faq.answer
            ?.replace(/<[^>]+>/g, '')
            .toLowerCase()
            .includes(search);

        const tagsMatch = (faq.tags || []).some(tag =>
            tag.toLowerCase().includes(search)
        );

        return questionMatch || answerMatch || tagsMatch;
    });

    return (
        <Box sx={{ p: 4, minHeight: '100vh' }} className="bg-white p-6 rounded-lg shadow-sm">
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={() => router.back()} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 1 }}>
                        <ArrowBack fontSize="small" />
                    </IconButton>
                    <Box>
                        <Stack direction="row" spacing={2} alignItems="center" mb={1}>

                            {isEditing ? (
                                <TextField
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    placeholder="Nombre del Sistema"
                                    variant="standard"
                                    fullWidth
                                    InputProps={{ style: { fontSize: '1.5rem', fontWeight: 'bold' } }}
                                />
                            ) : (
                                <Typography variant="h4" fontWeight="bold" color="#1e293b">
                                    {formData.name || 'Sin Nombre'}
                                </Typography>
                            )}

                            {isEditing ? (
                                <Box sx={{ minWidth: 200 }}>
                                    <TextField
                                        select
                                        size="small"
                                        name="status_id"
                                        value={formData.status_id || ''}
                                        onChange={handleChange}
                                        label="Estado"
                                        sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 1 }, minWidth: 100 }}
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
                                    label={status?.name || 'Sin estado'}
                                    size="small"
                                    sx={{
                                        bgcolor: `${status?.color}20`,
                                        color: status?.color || '#64748b',
                                        fontWeight: 'bold',
                                        borderRadius: 1
                                    }}
                                />
                            )}

                        </Stack>

                        {isEditing ? (
                            <TextField
                                name="description" value={formData.description || ''} onChange={handleChange}
                                placeholder="Descripcion del Sistema" variant="standard"
                                size="small"
                                InputProps={{
                                    style: { fontSize: '0.875rem', color: '#64748b' },
                                    disableUnderline: true,
                                }}
                            />
                        ) : (
                            <Typography color="text.secondary">{formData.description || 'Detalle del sistema'}</Typography>
                        )}


                    </Box>
                </Box>
                <Stack direction="row" spacing={2}>
                    {!isEditing ? (
                        can('systems_detail', 'edit') && (
                            <Button
                                variant="contained"
                                startIcon={<Edit />}
                                onClick={() => setIsEditing(true)}
                                sx={{ borderRadius: 1, textTransform: 'none', px: 3 }}
                            >Editar</Button>
                        )
                    ) : (
                        <>
                            <Button variant="outlined" color="inherit" onClick={handleCancel} sx={{ borderRadius: 1, textTransform: 'none', bgcolor: '#fff' }}>
                                Cancelar
                            </Button>
                            <Button variant="contained" startIcon={<Save />} onClick={handleSave} sx={{ borderRadius: 1, textTransform: 'none', px: 3 }} >Guardar</Button>
                        </>
                    )}
                </Stack>
            </Box>
            <Stack
                direction="row"
                spacing={3}
                mb={4}
                sx={{ width: '100%', alignItems: 'stretch' }}
            >
                {[
                    { label: "Servidor", name: "server_device_id", value: formData.server_device_id, select: true, icon: Dns, options: servers },
                    { label: "Criticidad", name: "priority_id", value: formData.priority_id, select: true, icon: Settings, options: options?.priorities },
                    { label: "Responsable", name: "responsible_id", value: formData.responsible_id, select: true, icon: Person, options: users },
                    { label: "Últ. Actualización", name: "last_update", value: formData.last_update, type: "date", icon: Update }
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
                                type={item.type}
                                select={item.select}
                                optionsArray={item.options}
                            />

                            {
                                item.name === "server_device_id" && selectedServer?.ip_address && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            mt: -2,
                                            display: "block",
                                            color: "text.secondary",
                                            fontFamily: "monospace"
                                        }}
                                    >
                                        {selectedServer.ip_address}
                                    </Typography>
                                )
                            }
                        </CardContent>
                    </Card>
                ))}
            </Stack>

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
                    <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                        <Business color="primary" /> Áreas que usan el sistema
                    </Typography>

                    {isEditing ? (
                        <Autocomplete
                            multiple
                            options={options?.areas || []}
                            getOptionLabel={(option) => option.name}
                            value={options?.areas?.filter(opt => formData.areas?.includes(opt.id)) || []}
                            onChange={(event, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    areas: newValue.map(v => v.id)
                                }));
                            }}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip key={option.id} label={option.name} {...getTagProps({ index })} />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Áreas que usan el sistema"
                                    placeholder="Selecciona áreas"
                                    size="small"
                                />
                            )}
                        />
                    ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {options?.areas
                                ?.filter(opt => formData.areas?.includes(opt.id))
                                .map(opt => (
                                    <Chip key={opt.id} label={opt.name} />
                                ))
                            }
                        </Box>
                    )}
                </Paper>

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
                    <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                        <Notes color="primary" /> Notas Técnicas
                    </Typography>

                    {isEditing ? (
                        <Autocomplete
                            multiple
                            freeSolo
                            options={[]}
                            value={formData.technical_notes || []}
                            onChange={(e, newValue) =>
                                setFormData(prev => ({
                                    ...prev,
                                    technical_notes: newValue
                                }))
                            }
                            renderTags={(value, getTagProps) =>
                                value.map((option, i) => {
                                    const { key, ...tagProps } = getTagProps({ index: i });

                                    return (
                                        <Chip
                                            key={key}
                                            label={option}
                                            {...tagProps}
                                        />
                                    );
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Agregar tecnología"
                                />
                            )}
                        />
                    ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {(formData.technical_notes || []).map((tech, i) => (
                                <Chip key={i} label={tech} />
                            ))}
                        </Box>
                    )}
                </Paper>
            </Stack>

            <Divider sx={{ mb: 4 }} />

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
                    <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                        <Language color="primary" /> Accesos y Repositorios
                    </Typography>

                    <DataField label="URL de Acceso" name="url" value={formData.url} icon={Language} />
                    <DataField label="Repositorio (Git)" name="repository_url" value={formData.repository_url} icon={Terminal} />
                    <DataField label="Documentación API" name="api_doc_url" value={formData.api_doc_url} icon={Description} />
                </Paper>

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
                    <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                        <Storage color="primary" /> Base de Datos
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <DataField label="Motor BD" name="db_engine" value={formData.db_engine} icon={Settings} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <DataField label="Nombre BD" name="db_name" value={formData.db_name} icon={Code} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <DataField label="Host / IP" name="db_host" value={formData.db_host} icon={Lan} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <DataField label="Puerto" name="db_port" value={formData.db_port} type="number" icon={Settings} />
                        </Grid>
                    </Grid>
                </Paper>
            </Stack>

            <Divider sx={{ mb: 4 }} />

            <Paper
                variant="outlined"
                sx={{
                    borderRadius: 1,
                    p: 3,
                    bgcolor: '#fff',
                    mb: 4
                }}
            >
                <Typography variant="h6" fontWeight="bold" mb={3}>
                    Preguntas Frecuentes
                </Typography>

                <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar en FAQs..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    sx={{ mb: 2 }}
                />

                {filteredFaqs.map((faq, index) => (
                    <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e2e8f0', borderRadius: 1 }}>

                        {isEditing ? (
                            <>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Pregunta"
                                    value={faq.question || ''}
                                    onChange={(e) => {
                                        const newFaqs = [...formData.faqs];
                                        newFaqs[index].question = e.target.value;
                                        setFormData(prev => ({ ...prev, faqs: newFaqs }));
                                    }}
                                    sx={{ mb: 2 }}
                                />

                                <RichTextEditor
                                    value={faq.answer}
                                    onChange={(html) => {
                                        const newFaqs = [...formData.faqs];
                                        newFaqs[index].answer = html;
                                        setFormData(prev => ({ ...prev, faqs: newFaqs }));
                                    }}
                                />

                                {/* TAGS */}
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    options={[]}
                                    value={faq.tags || []}
                                    onChange={(e, newValue) => {
                                        const newFaqs = [...formData.faqs];
                                        newFaqs[index].tags = newValue;
                                        setFormData(prev => ({ ...prev, faqs: newFaqs }));
                                    }}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, i) => {
                                            const { key, ...tagProps } = getTagProps({ index: i });

                                            return (
                                                <Chip
                                                    key={key}
                                                    label={option}
                                                    {...tagProps}
                                                />
                                            );
                                        })
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} size="small" placeholder="Tags" />
                                    )}
                                />

                                <Button
                                    color="error"
                                    size="small"
                                    sx={{ mt: 1 }}
                                    onClick={() => {
                                        const newFaqs = formData.faqs.filter((_, i) => i !== index);
                                        setFormData(prev => ({ ...prev, faqs: newFaqs }));
                                    }}
                                >
                                    Eliminar
                                </Button>
                            </>
                        ) : (
                            <>
                                <Accordion sx={{ mb: 1, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography fontWeight="bold">
                                            {faq.question}
                                        </Typography>
                                    </AccordionSummary>

                                    <AccordionDetails>
                                        <div dangerouslySetInnerHTML={{ __html: faq.answer }} />

                                        <Stack direction="row" spacing={1} mt={2}>
                                            {(faq.tags || []).map((tag, i) => (
                                                <Chip key={i} label={tag} size="small" />
                                            ))}
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            </>
                        )}
                    </Box>
                ))}

                {isEditing && (
                    <Button
                        variant="outlined"
                        onClick={() =>
                            setFormData(prev => ({
                                ...prev,
                                faqs: [...(prev.faqs || []), { question: '', answer: '', tags: [] }]
                            }))
                        }
                    >
                        + Agregar FAQ
                    </Button>
                )}
            </Paper>

            <Divider sx={{ mb: 4 }} />

            <SystemFilesManager
                systemId={formData.id}
                isEditing={isEditing}
            />
        </Box>
    );
}