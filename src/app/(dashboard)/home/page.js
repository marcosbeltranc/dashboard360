import DevicesDashboard from "@/components/DevicesDashboard";

export default function HomePage() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                Panel de Control
            </h1>

            <DevicesDashboard filter="all" />
        </div>
    );
}