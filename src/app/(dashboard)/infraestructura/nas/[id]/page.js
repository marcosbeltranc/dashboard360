'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import NasFormView from '@/components/NasFormView';
import { Box, CircularProgress } from '@mui/material';

export default function ViewNasPage() {
    const { id } = useParams();
    const [nas, setNas] = useState(null);
    const [options, setOptions] = useState({ statuses: [], locations: [], nasTypes: [], responsibles: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [srvRes, optRes, respRes] = await Promise.all([
                    api.get(`/nas-devices/${id}`),
                    api.get('/options'),
                    api.get('/users/responsibles')
                ]);
                const raw = optRes.data.data || optRes.data;
                const grouped = (raw || []).reduce((acc, item) => {
                    if (!acc[item.type]) acc[item.type] = [];
                    acc[item.type].push(item);
                    return acc;
                }, {});
                setNas(srvRes.data.data || srvRes.data);
                setOptions({
                    statuses: grouped.status_type || [],
                    locations: grouped.location || [],
                    nasTypes: grouped.nas_type || [],
                    responsibles: respRes.data.data || respRes.data || []
                });
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        if (id) fetchData();
    }, [id]);

    const handleUpdate = async (formData) => {
        try { await api.put(`/nas-devices/${id}`, formData); }
        catch (e) { console.error(e); }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return <NasFormView mode="view" initialData={nas} options={options} onSave={handleUpdate} />;
}