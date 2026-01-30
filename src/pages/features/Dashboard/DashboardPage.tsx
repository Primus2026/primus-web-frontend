import type { FC } from "react";

const DashboardPage: FC = () => {
    
    // Fetch data at page level to potentially pass down, or let components fetch.
    // Fetching here avoids double fetching if we switch logic, but fine to pass data down.
    return (
        <div className="container mx-auto p-6 animate-in fade-in duration-500">
             <div className="flex justify-center items-center h-64 border rounded-lg border-dashed text-muted-foreground">
                Dashboard Placeholder
            </div>
        </div>
    )
}
export default DashboardPage;
