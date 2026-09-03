'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, CircularProgress } from '@mui/material';
import api from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import IntegrationFormView from '@/components/IntegrationFormView';

export default function DetalleIntegracionPage({ params: paramsPromise }) {
    const { id } = use(paramsPromise);
    const router = useRouter();
    const { can, isLoaded } = usePermissions();
    const [data, setData] = useState({ integration: null, systems: [], servers: [], users: [], options: {} });
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                // Agregamos api.get('/server-devices') a la carga en paralelo
                const [integration, systems, servers, users, optionResponse] = await Promise.all([
                    api.get(`/integrations/${id}`),
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
                    integration: integration.data.data || integration.data,
                    systems: systems.data.data || systems.data || [],
                    servers: servers.data.data || servers.data || [], // <- Almacenamos la lista de servidores
                    users: users.data.data || users.data || [],
                    options: {
                        types: grouped.integration_type || [],
                        criticalities: grouped.criticality || [],
                        statuses: grouped.integration_status || [],
                        authenticationMethods: grouped.authentication_method || [],
                        triggers: grouped.integration_trigger || []
                    }
                });
            } catch {
                setError('No se pudo cargar la integración.');
            }
        })();
    }, [id]);

    if (!isLoaded) return null;
    if (!can('integrations', 'view')) { router.replace('/integraciones'); return null; }
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!data.integration) return <Box textAlign="center" pt={10}><CircularProgress /></Box>;

    return (
        <IntegrationFormView
            initialData={data.integration}
            systems={data.systems}
            servers={data.servers} // <- Pasamos los servidores al formulario
            users={data.users}
            options={data.options}
            canEdit={can('integrations', 'edit')}
            onSave={values => api.put(`/integrations/${id}`, values)}
        />
    );
}