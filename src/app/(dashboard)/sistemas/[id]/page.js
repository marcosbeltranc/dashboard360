'use client';
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import SystemFormView from '@/components/SystemFormView';
import { Box, CircularProgress, Alert } from '@mui/material';

export default function SystemDetailPage({ params: paramsPromise }) {
    const router = useRouter();
    const params = use(paramsPromise);
    const { id } = params;

    const [data, setData] = useState({
        system: null,
        options: { statuses: [], priorities: [], areas: [] },
        servers: [],
        responsibles: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Ejecutamos las 4 peticiones en paralelo
                const [sysRes, optRes, srvRes, respRes] = await Promise.all([
                    api.get(`/systems/${id}`),
                    api.get('/options'),
                    api.get('/server-devices'),
                    api.get('/users/responsibles')
                ]);

                // Procesar opciones (system_status, criticality, departments)
                const rawOptions = optRes.data.data || optRes.data || [];
                const grouped = rawOptions.reduce((acc, item) => {
                    if (!acc[item.type]) acc[item.type] = [];
                    acc[item.type].push(item);
                    return acc;
                }, {});

                setData({
                    system: sysRes.data.data || sysRes.data,
                    servers: srvRes.data.data || srvRes.data || [],
                    options: {
                        statuses: grouped.system_status || [],
                        priorities: grouped.criticality || [],
                        areas: grouped.departments || [],
                    },
                    responsibles: respRes.data.data || respRes.data || []
                });
            } catch (e) {
                console.error("Error cargando el sistema:", e);
                setError("No se pudo cargar la información del sistema.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleUpdate = async (formData) => {
        try {
            await api.put(`/systems/${id}`, formData);
            // Opcional: Mostrar un mensaje de éxito o refrescar datos
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Error al actualizar el sistema");
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <SystemFormView
            mode="view" // Iniciamos en modo vista
            initialData={data.system}
            options={data.options}
            servers={data.servers}
            users={data.responsibles}
            onSave={handleUpdate}
        />
    );
}