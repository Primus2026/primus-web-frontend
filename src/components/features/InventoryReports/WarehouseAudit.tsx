import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Database, ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthProvider";

// --- Typy danych dla Raportu ---
interface AuditDetail {
    row: number;
    col: number;
    db_barcode: string | null;
    physical_barcode: string | null;
    is_correct: boolean;
    error_message: string | null;
}

interface AuditReport {
    status: string;
    timestamp: string;
    summary: {
        total_slots: number;
        errors_found: number;
    };
    details: AuditDetail[];
}

const WarehouseAudit = () => {
    const { token } = useAuth();
    
    // Stany operacji
    const [isImporting, setIsImporting] = useState(false);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditReport, setAuditReport] = useState<AuditReport | null>(null);

    // --- Funkcja 1: Import Początkowy (run-inventory-start) ---
    const handleStartInitialImport = async () => {
        if (!confirm("To zaktualizuje bazę danych na podstawie skanu kamery. Kontynuować?")) return;
        
        setIsImporting(true);
        setAuditReport(null);
        try {
            const response = await fetch('/api/v1/inventory/run-inventory-start', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Błąd podczas importu stanu");

            toast.success("Początkowy stan magazynu został zapisany w bazie danych.");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsImporting(false);
        }
    };

    // --- Funkcja 2: Audyt Magazynu (run-audit) ---
    const handleRunAudit = async () => {
        setIsAuditing(true);
        try {
            const response = await fetch('/api/v1/inventory/run-audit', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Błąd podczas audytu");

            const data: AuditReport = await response.json();
            setAuditReport(data);
            
            if (data.summary.errors_found > 0) {
                toast.warning(`Audyt zakończony: znaleziono ${data.summary.errors_found} rozbieżności!`);
            } else {
                toast.success("Audyt zakończony: stan bazy jest zgodny z rzeczywistością.");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsAuditing(false);
        }
    };

    // Pomocnicze generowanie siatki dla widoku
    const rows = Array.from({ length: 8 }, (_, i) => 8 - i); // 8 down to 1
    const cols = Array.from({ length: 8 }, (_, i) => i + 1); // 1 to 8

    const getSlotData = (r: number, c: number) => {
        return auditReport?.details.find(d => d.row === r && d.col === c);
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-6 w-6 text-primary" />
                        Zarządzanie Inwentaryzacją 3D
                    </CardTitle>
                    <CardDescription>
                        Wybierz etap operacji: importowanie fizycznego stanu do systemu lub weryfikacja zgodności (Audyt).
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Button 
                        onClick={handleStartInitialImport} 
                        disabled={isImporting || isAuditing}
                        variant="outline"
                        className="flex gap-2 h-12 px-6"
                    >
                        {isImporting ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                        Odczytaj stan początkowy (Zapis do bazy)
                    </Button>

                    <Button 
                        onClick={handleRunAudit} 
                        disabled={isImporting || isAuditing}
                        className="flex gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-700"
                    >
                        {isAuditing ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                        Inwentaryzacja / Audyt (Raport różnic)
                    </Button>
                </CardContent>
            </Card>

            {/* --- Wizualizacja Raportu --- */}
            {auditReport && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="bg-muted/30">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Wynik Audytu</CardTitle>
                                <CardDescription>{new Date(auditReport.timestamp).toLocaleString()}</CardDescription>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-center px-4 py-2 bg-background rounded-lg border shadow-sm">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Błędy</p>
                                    <p className={`text-2xl font-black ${auditReport.summary.errors_found > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                        {auditReport.summary.errors_found}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-8 gap-1 bg-muted border-2 p-1 rounded-md overflow-auto min-w-[800px]">
                            {rows.map(r => (
                                cols.map(c => {
                                    const slot = getSlotData(r, c);
                                    const hasError = slot && !slot.is_correct;
                                    const isEmpty = slot?.error_message === "Puste";

                                    return (
                                        <div 
                                            key={`${r}-${c}`}
                                            className={`
                                                relative h-24 p-1 flex flex-col justify-between text-[10px] border transition-all
                                                ${isEmpty ? 'bg-background opacity-50' : 'bg-card'}
                                                ${hasError ? 'border-red-500 bg-red-50 ring-2 ring-red-200 z-10' : 'border-border'}
                                            `}
                                        >
                                            <div className="flex justify-between font-mono opacity-40">
                                                <span>R{r}C{c}</span>
                                                {hasError && <AlertTriangle className="h-3 w-3 text-red-500" />}
                                                {!hasError && !isEmpty && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                            </div>

                                            {slot && !isEmpty && (
                                                <div className="space-y-1">
                                                    <div className="flex flex-col">
                                                        <span className="text-muted-foreground">DB:</span>
                                                        <span className="font-bold truncate">{slot.db_barcode || "—"}</span>
                                                    </div>
                                                    <div className="flex flex-col border-t pt-1">
                                                        <span className="text-muted-foreground">REAL:</span>
                                                        <span className={`font-bold truncate ${hasError ? 'text-red-600' : 'text-green-700'}`}>
                                                            {slot.physical_barcode || "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {hasError && (
                                                <div className="absolute inset-0 bg-red-500/10 pointer-events-none" />
                                            )}
                                            
                                            {isEmpty && (
                                                <div className="flex-1 flex items-center justify-center text-muted-foreground/20 italic">
                                                    empty
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ))}
                        </div>

                        {/* Legenda błędu */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {auditReport.details.filter(d => !d.is_correct).map((err, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg bg-red-50">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-sm text-red-800">
                                            Rząd {err.row}, Kolumna {err.col}
                                        </p>
                                        <p className="text-xs text-red-600 font-medium">{err.error_message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default WarehouseAudit;