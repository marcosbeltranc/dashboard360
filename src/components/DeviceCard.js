import {
    Paper,
    Typography,
    Box,
    Chip,
    LinearProgress,
    Stack
} from "@mui/material";

const getColor = (value) => {
    if (value > 85) return "error";
    if (value > 60) return "warning";
    return "success";
};

const getAlertColor = (alert) => {
    if (alert.includes("CPU")) return "error";
    if (alert.includes("RAM")) return "warning";
    if (alert.includes("DISK")) return "warning";
    if (alert.includes("CONNECTION")) return "info";
    return "default";
};

export default function DeviceCard({ device }) {
    const stats = device.stats || {};

    const cpu = stats.cpu_percent ?? 0;
    const ram = stats.ram_percent ?? 0;
    const alerts = stats.alerts || [];
    const disk = stats.disks?.[0];

    return (
        <Paper
            sx={{
                p: 2.5,
                borderRadius: 3,
                height: 240, // 🔥 altura fija
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: "1px solid #e5e7eb",
                outline: alerts.length ? "2px solid #ef4444" : "none",
                transition: "all 0.2s ease",
                "&:hover": {
                    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                    transform: "translateY(-2px)"
                }
            }}
        >
            {/* HEADER */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                height={32}
            >
                <Typography fontWeight="bold">
                    {device.name}
                </Typography>

                <Box width={70} textAlign="right">
                    {alerts.length > 0 && (
                        <Chip label="ALERTA" color="error" size="small" />
                    )}
                </Box>
            </Box>

            {/* METRICS */}
            <Box>
                {/* CPU */}
                <Box mb={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption">CPU</Typography>
                        <Typography variant="caption">{cpu}%</Typography>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={cpu}
                        color={getColor(cpu)}
                        sx={{ height: 6, borderRadius: 5 }}
                    />
                </Box>

                {/* RAM */}
                <Box mb={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption">RAM</Typography>
                        <Typography variant="caption">{ram}%</Typography>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={ram}
                        color={getColor(ram)}
                        sx={{ height: 6, borderRadius: 5 }}
                    />
                </Box>

                {/* DISK */}
                {disk && (
                    <Box mb={1.5}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption">
                                Disco ({disk.device})
                            </Typography>
                            <Typography variant="caption">
                                {disk.percent}%
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={disk.percent}
                            color={getColor(disk.percent)}
                            sx={{ height: 6, borderRadius: 5 }}
                        />
                    </Box>
                )}

                {/* NETWORK */}
                <Typography variant="caption" color="text.secondary">
                    Conexiones: {stats.network?.connections ?? 0}
                </Typography>
            </Box>

            {/* ALERTS (espacio reservado SIEMPRE) */}
            <Box minHeight={32} mt={1}>
                {alerts.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {alerts.map((a, i) => (
                            <Chip
                                key={i}
                                label={a}
                                size="small"
                                color={getAlertColor(a)}
                                variant="outlined"
                            />
                        ))}
                    </Stack>
                )}
            </Box>

            {/* FOOTER */}
            <Typography
                variant="caption"
                color="text.secondary"
                textAlign="right"
            >
            </Typography>
        </Paper>
    );
}