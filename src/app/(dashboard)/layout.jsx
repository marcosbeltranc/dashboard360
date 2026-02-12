import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar Fijo */}
            <aside className="w-64 bg-white border-r">
                <Sidebar />
            </aside>

            {/* Área de contenido que cambia */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}