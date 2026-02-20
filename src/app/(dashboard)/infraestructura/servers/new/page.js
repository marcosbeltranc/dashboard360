'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ServerFormView from '@/components/ServerFormView';
import { Box, CircularProgress } from '@mui/material';

export default function NewServerPage() {
    const router = useRouter();
    const [options, setOptions] = useState({ statuses: [], locations: [], serverTypes: [], responsibles: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [optRes, respRes] = await Promise.all([api.get('/options'), api.get('/users/responsibles')]);
                const raw = optRes.data.data || optRes.data;
                const grouped = (raw || []).reduce((acc, item) => {
                    if (!acc[item.type]) acc[item.type] = [];
                    acc[item.type].push(item);
                    return acc;
                }, {});
                setOptions({
                    statuses: grouped.status_type || [],
                    locations: grouped.location || [],
                    serverTypes: grouped.server_type || [],
                    responsibles: respRes.data.data || respRes.data || []
                });
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchOptions();
    }, []);

    const handleCreate = async (formData) => {
        try {
            await api.post('/server-devices', { ...formData, device_type_id: 6 });
            router.push('/infrastructure/servers');
        } catch (e) { alert("Error al crear"); }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <ServerFormView
            mode="create" options={options} onSave={handleCreate}
            initialData={{ name: '', status_id: 10, server_type_id: 1, brand: 'Dell', os: 'Windows Server 2022' }}
        />
    );
}