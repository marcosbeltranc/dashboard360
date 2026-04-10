"use client";

import { useEffect, useState } from "react";
import DeviceCard from '@/components/DeviceCard';
import api from "@/lib/api";
import {
    Box, Grid, Paper, Typography, Chip
} from "@mui/material";

export default function DevicesDashboard({ filter = "all" }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔹 1. GET inicial
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                setLoading(true);

                const res = await api.get("/devices");

                setDevices(res.data);
            } catch (err) {
                console.error("Devices error:", err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    // 🔹 2. WebSocket realtime
    useEffect(() => {
        const ws = new WebSocket(
            // "ws://172.16.101.119:8088/app/jjkdu8flmgs4xvwctbss"
            "ws://localhost:8088/app/jjkdu8flmgs4xvwctbss"
        );

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    event: "pusher:subscribe",
                    data: { channel: "servers" },
                })
            );
        };

        ws.onmessage = (msg) => {
            try {
                const parsed = JSON.parse(msg.data);

                if (parsed.event === "metrics.updated") {
                    const payload = JSON.parse(parsed.data);
                    const newData = payload.data;

                    setDevices((prev) => {
                        const exists = prev.find(
                            (d) => d.name === newData.hostname
                        );

                        if (exists) {
                            // 🔥 update existing
                            return prev.map((d) =>
                                d.name === newData.hostname
                                    ? { ...d, stats: newData }
                                    : d
                            );
                        }

                        // 🔥 new device
                        return [
                            ...prev,
                            {
                                name: newData.hostname,
                                stats: newData,
                            },
                        ];
                    });
                }
            } catch (e) {
                console.error("WS parse error:", e);
            }
        };

        ws.onerror = (e) => console.error("WS error:", e);

        return () => ws.close();
    }, []);

    // 🔹 3. filtro
    const filtered =
        filter === "all"
            ? devices
            : devices.filter((d) => d.name === filter);

    // 🔹 4. UI
    if (loading) {
        return <Typography>Cargando dispositivos...</Typography>;
    }

    if (filtered.length === 0) {
        return <Typography>No hay dispositivos</Typography>;
    }

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