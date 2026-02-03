import { ReportsManager } from "@/components/features/Reports/ReportsManager";
import type { FC } from "react";

const ReportsPage: FC = () => {
    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Raporty</h1>
                    <p className="text-muted-foreground mt-2">
                        Przeglądaj i eksportuj statystyki magazynowe.
                    </p>
                </div>
            </div>

            <ReportsManager />
        </div>
    )
}
export default ReportsPage;