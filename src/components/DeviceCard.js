// DeviceCard.js (Versión con ancho fijo y títulos truncados)
import { Paper, Typography, Box, Chip, LinearProgress, Stack, Divider } from "@mui/material";
import { Schedule, CloudOff, FiberManualRecord } from "@mui/icons-material";

export default function DeviceCard({ device }) {
    const { isOnline, stats, name, created_at } = device;

    const cpu = stats?.cpu_percent ?? 0;
    const ram = stats?.ram_percent ?? 0;
    const dateFormatted = created_at ? new Date(created_at).toLocaleDateString() : '---';

    return (
        <Paper
            sx={{
                p: 2.5,
                height: 300,     // altura total fija
                width: 250,      // ancho fijo
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: isOnline ? "#e5e7eb" : "#fee2e2",
                bgcolor: isOnline ? "#fff" : "#fcfcfc",
                borderRadius: 3,
                transition: "all 0.3s ease"
            }}
        >
            {/* 1. HEADER */}
            <Box sx={{ minHeight: 50, mb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography
                        fontWeight="bold"
                        sx={{
                            fontSize: '1rem',
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap', // corta en una línea si es muy largo
                            maxWidth: '70%'       // espacio máximo para no chocar con el chip
                        }}
                    >
                        {name}
                    </Typography>
                    <Chip
                        icon={isOnline ?
                            <FiberManualRecord sx={{ fontSize: '0.8rem !important', color: 'green !important' }} /> :
                            <CloudOff sx={{ fontSize: '0.8rem !important', color: 'red !important' }} />
                        }
                        variant="outlined"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: '0.65rem',
                            height: 24,
                            px: 0.5,
                            border: 'none',
                            color: isOnline ? 'success.main' : 'error.main',
                            bgcolor: isOnline ? 'success.lighter' : 'error.lighter',
                            '& .MuiChip-icon': {
                                marginLeft: '4px'
                            }
                        }}
                    />
                </Box>
                <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary" mt={0.5}>
                    <Schedule sx={{ fontSize: 14 }} />
                    <Typography variant="caption">Creado: {dateFormatted}</Typography>
                </Stack>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* 2. CONTENIDO */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {isOnline ? (
                    <Stack spacing={3}>
                        <MetricBar label="CPU" value={cpu} />
                        <MetricBar label="RAM" value={ram} />
                    </Stack>
                ) : (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ opacity: 0.4, py: 2 }}
                    >
                        <CloudOff sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="body2" fontWeight="500">
                            Sin datos del agente
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* 3. FOOTER */}
            <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #f0f0f0' }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                    IP: {device.serverDetails?.ip_address || '---'}
                </Typography>
            </Box>
        </Paper>
    );
}

// Subcomponente de barra refinado
function MetricBar({ label, value }) {
    const getColor = (v) => v > 85 ? "error" : v > 60 ? "warning" : "success";
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" fontWeight="bold" color="text.primary">{label}</Typography>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">{value}%</Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={value}
                color={getColor(value)}
                sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': { borderRadius: 4 }
                }}
            />
        </Box>
    );
}