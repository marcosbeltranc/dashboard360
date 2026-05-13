import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar Fijo */}
            <aside className="h-full bg-white transition-all duration-300 ease-in-out">
                <Sidebar />
            </aside>

            {/* Área de contenido que cambia */}
            <main className="flex-1 overflow-y-auto p-8 transition-all duration-300 ease-in-out">
                {children}
            </main>
        </div>
    );
}