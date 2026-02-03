
import type { FC } from "react";
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useBackups, useCreateBackup, useRestoreBackup } from "@/hooks/useBackups";
import type { IBackupResponse } from "@/hooks/useBackups";
import { Button } from "@/components/ui/button";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { toast } from "react-toastify";
import { Database, RotateCw, ArchiveRestore, Loader2 } from "lucide-react";

const ConfirmationModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    isDestructive?: boolean;
}> = ({ isOpen, onClose, onConfirm, title, description, confirmText = "Potwierdź", isDestructive = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg border relative">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground mb-6 text-sm">{description}</p>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Anuluj
                    </Button>
                    <Button 
                        variant={isDestructive ? "destructive" : "default"} 
                        onClick={onConfirm}
                        className={isDestructive ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const BackupsManager: FC = () => {
    const { token } = useAuth();
    
    // Queries & Mutations
    const { data: backups, isLoading, refetch } = useBackups(token);
    const createMutation = useCreateBackup(token);
    const restoreMutation = useRestoreBackup(token);

    // State
    const [isCreating, setIsCreating] = useState(false);
    const [restoreTarget, setRestoreTarget] = useState<string | null>(null);

    const handleCreateBackup = async () => {
        setIsCreating(true);
        try {
            await createMutation.mutateAsync();
            toast.success("Tworzenie kopii zapasowej rozpoczęte. Wkrótce pojawi się na liście.");
            
            // Poll for a few seconds to try update list automatically
            let attempts = 0;
            const interval = setInterval(() => {
                refetch();
                attempts++;
                if (attempts > 5) {
                    clearInterval(interval);
                    setIsCreating(false);
                }
            }, 2000);
            
        } catch (error) {
            toast.error("Nie udało się rozpocząć tworzenia kopii zapasowej");
            setIsCreating(false);
        }
    };

    const handleRestoreClick = (filename: string) => {
        setRestoreTarget(filename);
    };

    const confirmRestore = async () => {
        if (!restoreTarget) return;
        try {
            await restoreMutation.mutateAsync(restoreTarget);
            toast.info(`Zadanie przywracania rozpoczęte dla ${restoreTarget}.`);
            setRestoreTarget(null);
        } catch (error) {
            toast.error("Nie udało się rozpocząć przywracania");
        }
    };

    const renderBackupRow = (backup: IBackupResponse) => {
        // Format Size
        const sizeMB = (backup.size / (1024 * 1024)).toFixed(2);
        // Format Date
        const date = new Date(backup.modified * 1000).toLocaleString();

        return (
            <TableRow key={backup.name}>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-slate-500" />
                        {backup.name}
                    </div>
                </TableCell>
                <TableCell>{date}</TableCell>
                <TableCell>{sizeMB} MB</TableCell>
                <TableCell className="text-right">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRestoreClick(backup.name)}
                    >
                        <ArchiveRestore className="h-4 w-4 mr-1" />
                        Przywróć
                    </Button>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <div className="space-y-6">
            <ConfirmationModal 
                isOpen={!!restoreTarget}
                onClose={() => setRestoreTarget(null)}
                onConfirm={confirmRestore}
                title="Przywrócić Kopię Zapasową?"
                description="Czy na pewno? Przywrócenie tej kopii zapasowej nadpisze istniejące dane i stan bazy danych zawartością tej kopii. Tej operacji nie można cofnąć."
                confirmText="Tak, Przywróć Kopię"
                isDestructive={true}
            />

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Kopie Zapasowe Systemu</CardTitle>
                    <CardDescription>Twórz i zarządzaj kopiami zapasowymi systemu.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleCreateBackup} disabled={isCreating || createMutation.isPending}>
                        {isCreating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Tworzenie...
                            </>
                        ) : (
                            "Utwórz Kopię Zapasową"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* List */}
            <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Dostępne Kopie Zapasowe</h2>
                    <Button variant="outline" size="icon" onClick={() => refetch()}>
                         <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nazwa pliku</TableHead>
                                <TableHead>Data Utworzenia</TableHead>
                                <TableHead>Rozmiar</TableHead>
                                <TableHead className="text-right">Akcje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Ładowanie kopii zapasowych...
                                    </TableCell>
                                </TableRow>
                            ) : backups && backups.length > 0 ? (
                                backups.map(renderBackupRow)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Nie znaleziono kopii zapasowych.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};
