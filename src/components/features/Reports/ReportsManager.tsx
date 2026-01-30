
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
            toast.success("Report generation started. Please wait for it to appear.");
            
            // Refetch after delay
            setTimeout(() => {
                refetch();
                setIsGenerating(false);
            }, 3000); 
        } catch (error) {
            toast.error("Failed to start generation");
            setIsGenerating(false);
        }
    };

    const handleDownload = async (filename: string) => {
        try {
            toast.info("Downloading...");
            await downloadMutation.mutateAsync(filename);
            toast.success("Download started");
        } catch (err) {
            toast.error("Download failed");
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
                        Download
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
                    <CardTitle>Generate New Report</CardTitle>
                    <CardDescription>Select the type of report you want to generate.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <label htmlFor="report-type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Report Type
                        </label>
                        <select
                            id="report-type"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedGenerateType}
                            onChange={(e) => setSelectedGenerateType(e.target.value as ReportType)}
                        >
                            <option value="expiry">Expiry Report</option>
                            <option value="audit">Audit Report</option>
                            <option value="temp">Temperature Report</option>
                        </select>
                    </div>
                    <Button onClick={handleGenerate} disabled={isGenerating || generateMutation.isPending}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            "Generate Report"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* List and Filter */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Generated Reports</h2>
                    <div className="flex items-center gap-2">
                        <select
                            className="flex h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Reports</option>
                            <option value="expiry">Expiry</option>
                            <option value="audit">Audit</option>
                            <option value="temp">Temperature</option>
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
                                <TableHead>Filename</TableHead>
                                <TableHead>Date Created</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingReports ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Loading reports...
                                    </TableCell>
                                </TableRow>
                            ) : sortedReports && sortedReports.length > 0 ? (
                                sortedReports.map(renderReportRow)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No reports found.
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
