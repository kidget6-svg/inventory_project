import { ReactNode } from "react";
import Sidebar from "@/Components/Sidebar";
import Navbar from "@/Components/Navbar";

interface Props {
    children: ReactNode;
}

export default function AppLayout({ children }: Props) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex-1">
                <Navbar />

                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
