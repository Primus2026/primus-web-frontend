import type { FC } from "react";

const BackupsPage: FC = () => {
    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Backups</h1>
                    <p className="text-muted-foreground mt-2">
                         Manage system backups and restores.
                    </p>
                </div>
            </div>

            <div className="flex justify-center items-center h-64 border rounded-lg border-dashed text-muted-foreground">
                Backups content placeholder
            </div>
        </div>
    )
}
export default BackupsPage;