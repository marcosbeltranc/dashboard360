'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import ServerFormView from '@/components/ServerFormView';
import { Box, CircularProgress } from '@mui/material';

export default function ViewServerPage() {
    const { id } = useParams();
    const [server, setServer] = useState(null);
    const [options, setOptions] = useState({ statuses: [], locations: [], serverTypes: [], responsibles: [], maintenance_type: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [srvRes, optRes, respRes] = await Promise.all([
                    api.get(`/server-devices/${id}`),
                    api.get('/options'),
                    api.get('/users/responsibles')
                ]);
                const raw = optRes.data.data || optRes.data;
                const grouped = (raw || []).reduce((acc, item) => {
                    if (!acc[item.type]) acc[item.type] = [];
                    acc[item.type].push(item);
                    return acc;
                }, {});
                setServer(srvRes.data.data || srvRes.data);
                setOptions({
                    statuses: grouped.status_type || [],
                    locations: grouped.location || [],
                    serverTypes: grouped.server_type || [],
                    responsibles: respRes.data.data || respRes.data || [],
                    maintenance_type: grouped.maintenance_type || [],
                });
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        if (id) fetchData();
    }, [id]);
    console.log(options);
    const handleUpdate = async (formData) => {
        try { await api.put(`/server-devices/${id}`, formData); }
        catch (e) { console.error(e); }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return <ServerFormView mode="view" initialData={server} options={options} onSave={handleUpdate} />;
}