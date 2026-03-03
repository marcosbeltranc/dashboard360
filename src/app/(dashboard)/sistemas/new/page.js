'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import SystemFormView from '@/components/SystemFormView';
import { Box, CircularProgress } from '@mui/material';

export default function NewSystemPage() {
    const router = useRouter();
    // Estado inicial con estructuras vacías para evitar errores de renderizado
    const [data, setData] = useState({
        options: { statuses: [], priorities: [], areas: [] },
        servers: [],
        responsibles: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. CORRECCIÓN: Definir las 3 variables para las 3 promesas
                const [optRes, srvRes, respRes] = await Promise.all([
                    api.get('/options'),
                    api.get('/server-devices'),
                    api.get('/users/responsibles')
                ]);

                // 2. Procesar las opciones generales (estados, criticidades, departamentos)
                const rawOptions = optRes.data.data || optRes.data || [];
                const grouped = rawOptions.reduce((acc, item) => {
                    if (!acc[item.type]) acc[item.type] = [];
                    acc[item.type].push(item);
                    return acc;
                }, {});

                // 3. CORRECCIÓN: Sincronizar nombres de propiedades con SystemFormView
                setData({
                    servers: srvRes.data.data || srvRes.data || [],
                    options: {
                        statuses: grouped.system_status || [],
                        // SystemFormView espera 'priorities', la API manda 'criticality'
                        priorities: grouped.criticality || [],
                        // SystemFormView espera 'areas', la API manda 'departments'
                        areas: grouped.departments || [],
                    },
                    // Ahora respRes ya está definido correctamente
                    responsibles: respRes.data.data || respRes.data || []
                });
            } catch (e) {
                console.error("Error cargando datos para el formulario:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreate = async (formData) => {
        try {
            // Limpiamos los datos antes de enviar (ej. convertir IDs a números si es necesario)
            await api.post('/systems', formData);
            router.push('/sistemas');
        } catch (e) {
            console.error("Error al guardar:", e);
            alert("Error al crear el sistema");
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 10 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <SystemFormView
            mode="create"
            options={data.options}      // Manda: statuses, priorities, areas
            servers={data.servers}      // Manda: lista de servidores
            users={data.responsibles}   // Manda: lista de responsables (mapeado como 'users')
            onSave={handleCreate}
            initialData={{
                name: '',
                status_id: 10, // O el ID por defecto para 'Nuevo' o 'Activo'
                server_device_id: '',
                db_engine: 'SQL Server',
                area_id: '',
                responsible_id: '',
                priority_id: ''
            }}
        />
    );
}