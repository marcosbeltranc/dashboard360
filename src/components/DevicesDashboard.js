"use client";

import { useEffect, useState } from "react";
import DeviceCard from '@/components/DeviceCard';
import api from "@/lib/api";
import { Box, Grid, Typography } from "@mui/material";
import toast from "react-hot-toast";

export default function DevicesDashboard({ filter = "all" }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // FASE 1: Cargar la lista base de 10 servidores inmediatamente
                const resServers = await api.get("/server-devices");
                const serverBase = resServers.data.data;

                const initialSetup = serverBase.map(server => ({
                    id: server.id,
                    name: server.name || "Unknown",
                    sku: server.sku,
                    created_at: server.created_at,
                    serverDetails: server,
                    stats: null,
                    isOnline: false,
                    isSyncing: true // Activamos estado de carga individual
                }));

                setDevices(initialSetup);
                setLoading(false); // Quitamos el loading global para mostrar las tarjetas

                // FASE 2: Cargar datos en tiempo real (los 2 que reportan)
                const resStats = await api.get("/devices");
                const realTimeStats = resStats.data;

                setDevices(prev => prev.map(device => {
                    const liveData = realTimeStats.find(stat =>
                        stat?.name?.toLowerCase() === device.sku?.toLowerCase()
                    );
                    return {
                        ...device,
                        stats: liveData ? liveData.stats : null,
                        isOnline: !!liveData,
                        isSyncing: false // Finaliza la sincronización
                    };
                }));

            } catch (err) {
                console.error("Error cargando datos:", err);
                toast.error("Error al sincronizar servidores");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const ws = new WebSocket(
            "wss://gaiaws.grupomepiel.com.mx/app/jjkdu8flmgs4xvwctbss?protocol=7&client=js&version=8.4.0&flash=false"
        );

        ws.onopen = () => {
            console.log("WebSocket abierto");
        };

        ws.onmessage = (event) => {
            try {
                const response = JSON.parse(event.data);

                console.log("Mensaje WebSocket:", response);

                // Esperamos a que Reverb confirme la conexión
                if (response.event === "pusher:connection_established") {
                    ws.send(JSON.stringify({
                        event: "pusher:subscribe",
                        data: {
                            channel: "servers"
                        }
                    }));

                    return;
                }

                // Confirmación de suscripción
                if (
                    response.event === "pusher_internal:subscription_succeeded"
                ) {
                    console.log("Suscrito al canal servers");
                    return;
                }

                // Reverb puede enviar ping para mantener viva la conexión
                if (response.event === "pusher:ping") {
                    ws.send(JSON.stringify({
                        event: "pusher:pong",
                        data: {}
                    }));

                    return;
                }

                // Ignorar cualquier otro evento
                if (response.event !== "metrics.updated") {
                    return;
                }

                const payload =
                    typeof response.data === "string"
                        ? JSON.parse(response.data)
                        : response.data;

                /*
                * Laravel probablemente manda:
                *
                * {
                *   data: {
                *     hostname: "...",
                *     ...
                *   }
                * }
                */
                const newData = payload.data ?? payload;

                if (!newData?.hostname) {
                    console.warn("Evento sin hostname:", payload);
                    return;
                }

                setDevices((prev) =>
                    prev.map((device) =>
                        device.sku?.toLowerCase() ===
                            newData.hostname.toLowerCase()
                            ? {
                                ...device,
                                stats: newData,
                                isOnline: true,
                                isSyncing: false
                            }
                            : device
                    )
                );
            } catch (error) {
                console.error(
                    "Error procesando WebSocket:",
                    error,
                    event.data
                );
            }
        };

        ws.onerror = (error) => {
            console.error("Error WebSocket:", error);
        };

        ws.onclose = (event) => {
            console.log(
                "WebSocket cerrado:",
                event.code,
                event.reason
            );
        };

        return () => {
            ws.close();
        };
    }, []);

    let filtered = filter === "all"
        ? devices
        : devices.filter((d) => d.name?.toLowerCase() === filter.toLowerCase());

    filtered.forEach(element => {
        console.log(element.stats?.timestamp);
    });

    // Ordenar primero fecha mas reciente, luego fecha mas vieja y por ultimo sin fecha
    filtered.sort((a, b) => {
        const dateA = a.stats?.timestamp ? new Date(a.stats.timestamp).getTime() : null;
        const dateB = b.stats?.timestamp ? new Date(b.stats.timestamp).getTime() : null;

        if (dateA && dateB) {
            return dateB - dateA;
        }

        if (dateA) return -1;
        if (dateB) return 1;

        return a.name.localeCompare(b.name);
    });

    if (loading) return <Box p={4}><Typography>Cargando lista base...</Typography></Box>;
    if (filtered.length === 0) return <Typography>No hay dispositivos</Typography>;

    return (
        <Grid container spacing={2}>
            {filtered.map((device) => (
                <Grid item xs={12} md={4} key={device.name}>
                    <DeviceCard device={device} />
                </Grid>
            ))}
        </Grid>
    );
}