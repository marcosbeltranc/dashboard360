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
                    name: server.name,
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
                        stat.name.toLowerCase() === device.name.toLowerCase()
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
        // const ws = new WebSocket("ws://localhost:8088/app/jjkdu8flmgs4xvwctbss");
        const ws = new WebSocket("wss://gaiaws.grupomepiel.com.mx/app/jjkdu8flmgs4xvwctbss");
        ws.onmessage = (event) => {
            try {
                const response = JSON.parse(event.data);
                const newData = response.data;

                setDevices((prev) => prev.map((d) =>
                    d.name.toLowerCase() === newData.hostname.toLowerCase()
                        ? { ...d, stats: newData, isOnline: true, isSyncing: false }
                        : d
                ));
            } catch (e) { console.error("WS parse error:", e); }
        };
        return () => ws.close();
    }, []);

    const filtered = filter === "all"
        ? devices
        : devices.filter((d) => d.name === filter);

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