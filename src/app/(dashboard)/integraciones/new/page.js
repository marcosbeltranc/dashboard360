'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import api from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import IntegrationFormView from '@/components/IntegrationFormView';

export default function NuevaIntegracionPage() {
    const router = useRouter();
    const { can, isLoaded } = usePermissions();
    const [data, setData] = useState({ systems: [], servers: [], users: [], options: {} });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                // Agregamos api.get('/server-devices') al Promise.all
                const [systems, servers, users, optionResponse] = await Promise.all([
                    api.get('/systems'),
                    api.get('/server-devices'),
                    api.get('/users/responsibles'),
                    api.get('/options')
                ]);

                const grouped = (optionResponse.data.data || optionResponse.data || []).reduce((groups, option) => ({
                    ...groups,
                    [option.type]: [...(groups[option.type] || []), option]
                }), {});

                setData({
                    systems: systems.data.data || systems.data || [],
                    servers: servers.data.data || servers.data || [], // <- Guardamos los servidores
                    users: users.data.data || users.data || [],
                    options: {
                        types: grouped.integration_type || [],
                        criticalities: grouped.criticality || [],
                        statuses: grouped.integration_status || [],
                        authenticationMethods: grouped.authentication_method || [],
                        triggers: grouped.integration_trigger || []
                    }
                });
            } catch (error) {
                console.error('Error al obtener datos iniciales:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (!isLoaded || loading) return <Box textAlign="center" pt={10}><CircularProgress /></Box>;
    if (!can('integrations', 'create')) { router.replace('/integraciones'); return null; }

    return (
        <IntegrationFormView
            mode="create"
            systems={data.systems}
            servers={data.servers} // <- Le pasamos la lista de servidores al formulario
            users={data.users}
            options={data.options}
            canEdit
            onSave={async values => {
                await api.post('/integrations', values);
                router.push('/integraciones');
            }}
        />
    );
}