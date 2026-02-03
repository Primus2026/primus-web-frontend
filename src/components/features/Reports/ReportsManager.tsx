
import type { FC } from "react";
import { useState } from "react";
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
import { FileText, Download, RotateCw, Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthProvider";
import { 
    useReports, 
    useGenerateReport, 
    useDownloadReport 
} from "@/hooks/useReports";
import type { ReportType, IReportResponse } from "@/hooks/useReports";
import { toast } from "react-toastify";

export const ReportsManager: FC = () => {
    const { token } = useAuth();
    const [selectedGenerateType, setSelectedGenerateType] = useState<ReportType>("expiry");
    const [filterType, setFilterType] = useState<string>("all");

    // Fetch reports
    const { 
        data: reports, 
        isLoading: isLoadingReports, 
        refetch 
    } = useReports(token, filterType === "all" ? undefined : filterType);

    // Generate Report
    const generateMutation = useGenerateReport(token);
    const [isGenerating, setIsGenerating] = useState(false);

    // Download Report
    const downloadMutation = useDownloadReport(token);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await generateMutation.mutateAsync(selectedGenerateType);
            toast.success("Generowanie raportu rozpoczęte.");
            
            // Refetch after delay
            setTimeout(() => {
                refetch();
                setIsGenerating(false);
            }, 3000); 
        } catch (error) {
            toast.error("Nie udało się rozpocząć generowania");
            setIsGenerating(false);
        }
    };

    const handleDownload = async (filename: string) => {
        try {
            toast.info("Pobieranie...");
            await downloadMutation.mutateAsync(filename);
            toast.success("Pobieranie rozpoczęte");
        } catch (err) {
            toast.error("Pobieranie nie powiodło się");
        }
    };

    const renderReportRow = (report: IReportResponse) => {
        return (
            <TableRow key={report.filename}>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        {report.filename}
                    </div>
                </TableCell>
                <TableCell>
                    {new Date(report.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                    {(report.size_bytes / 1024).toFixed(2)} KB
                </TableCell>
                <TableCell className="text-right">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownload(report.filename)}
                        disabled={downloadMutation.isPending}
                    >
                        <Download className="h-4 w-4 mr-1" />
                        Pobierz
                    </Button>
                </TableCell>
            </TableRow>
        );
    };

    // Sort reports: Younger (newer) to Oldest
    const sortedReports = reports?.slice().sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return (
        <div className="space-y-6">
            
            {/* Control Panel */}
            <Card>
                <CardHeader>
                    <CardTitle>Wygeneruj Nowy Raport</CardTitle>
                    <CardDescription>Wybierz typ raportu, który chcesz wygenerować.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <label htmlFor="report-type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Typ Raportu
                        </label>
                        <select
                            id="report-type"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedGenerateType}
                            onChange={(e) => setSelectedGenerateType(e.target.value as ReportType)}
                        >
                            <option value="expiry">Raport Ważności</option>
                            <option value="audit">Raport Audytu</option>
                            <option value="temp">Raport Temperatury</option>
                        </select>
                    </div>
                    <Button onClick={handleGenerate} disabled={isGenerating || generateMutation.isPending}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generowanie...
                            </>
                        ) : (
                            "Wygeneruj Raport"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* List and Filter */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Wygenerowane Raporty</h2>
                    <div className="flex items-center gap-2">
                        <select
                            className="flex h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">Wszystkie Raporty</option>
                            <option value="expiry">Ważność</option>
                            <option value="audit">Audyt</option>
                            <option value="temp">Temperatura</option>
                        </select>
                        <Button variant="outline" size="icon" onClick={() => refetch()}>
                            <RotateCw className={`h-4 w-4 ${isLoadingReports ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nazwa pliku</TableHead>
                                <TableHead>Data utworzenia</TableHead>
                                <TableHead>Rozmiar</TableHead>
                                <TableHead className="text-right">Akcja</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingReports ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Ładowanie raportów...
                                    </TableCell>
                                </TableRow>
                            ) : sortedReports && sortedReports.length > 0 ? (
                                sortedReports.map(renderReportRow)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Nie znaleziono raportów.
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
