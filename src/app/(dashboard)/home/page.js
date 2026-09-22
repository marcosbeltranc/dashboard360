import DevicesDashboard from "@/components/DevicesDashboard";
import { Box, Typography } from "@mui/material";

export default function HomePage() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="#1e293b">Dashboard</Typography>
                <Typography color="text.secondary">Panel de visibilidad general de los servidores</Typography>
            </Box>

            <DevicesDashboard filter="all" />
        </div>
    );
}