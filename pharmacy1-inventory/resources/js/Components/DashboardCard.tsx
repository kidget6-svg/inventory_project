type DashboardCardProps = {
    title: string;
    value: string | number;
};

export default function DashboardCard({
    title,
    value,
}: DashboardCardProps) {
    return (
        <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-gray-500 text-sm font-medium">
                {title}
            </h2>

            <p className="text-3xl font-bold mt-2">
                {value}
            </p>
        </div>
    );
}
