import { Link } from "@inertiajs/react";

export default function Sidebar() {
    return (
        <div className="w-64 bg-blue-900 text-white min-h-screen p-5">

            <h1 className="text-2xl font-bold mb-8">
                Pharmacy
            </h1>

            <ul className="space-y-4">

                <li><Link href="/dashboard">Dashboard</Link></li>

                <li><Link href="/medicines">Medicines</Link></li>

                <li><Link href="/categories">Categories</Link></li>

                <li><Link href="/suppliers">Suppliers</Link></li>

                <li><Link href="/purchases">Purchases</Link></li>

                <li><Link href="/sales">Sales</Link></li>

                <li><Link href="/reports">Reports</Link></li>

                <li><Link href="/settings">Settings</Link></li>

            </ul>

        </div>
    );
}
