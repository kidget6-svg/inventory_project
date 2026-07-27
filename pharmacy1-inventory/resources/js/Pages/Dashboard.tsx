import AppLayout from "@/Layouts/AppLayout";
import DashboardCard from "@/Components/DashboardCard";

interface Sale {
    
    id: number;
    invoice_no: string;
    total_amount: number;
    created_at: string;
    customer?: {
        name: string;
    };
}

interface Stats {
    totalMedicines: number;
    totalCategories: number;
    totalSuppliers: number;
    lowStock: number;
}

interface DashboardProps {
    stats: Stats;
    recentSales: Sale[];
}

export default function Dashboard({ stats, recentSales }: DashboardProps) {
    return (
        <AppLayout>
            <h1 className="text-3xl font-bold mb-6">
                Pharmacy Dashboard
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <DashboardCard title="Total Medicines" value={stats.totalMedicines} />
                <DashboardCard title="Categories" value={stats.totalCategories} />
                <DashboardCard title="Suppliers" value={stats.totalSuppliers} />
                <DashboardCard title="Low Stock" value={stats.lowStock} />
            </div>

            {/* Recent Sales */}
            <div className="bg-white shadow rounded-lg p-5">
                <h2 className="text-xl font-bold mb-4">
                    Recent Sales
                </h2>

                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left">Invoice</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {recentSales.map((sale) => (
                            <tr key={sale.id} className="border-b">
                                <td>{sale.invoice_no}</td>
                                <td>{sale.customer?.name}</td>
                                <td>{sale.total_amount}</td>
                                <td>{sale.created_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
