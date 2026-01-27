
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import type { ImportSummary, ImportStatusResponse } from "@/types/Import";
import { Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";

interface ImportRacksModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => void;
    importState: ImportStatusResponse | undefined;
    isUploading: boolean;
    onReset: () => void;
}

// Reuse Simple Modal
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>X</Button>
                </div>
                {children}
            </div>
        </div>
    );
};

const ImportRacksModal = ({ isOpen, onClose, onUpload, importState, isUploading, onReset }: ImportRacksModalProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            onUpload(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    const StatusView = () => {
        if (!importState) return null;

        if (importState.status === 'processing' || importState.status === 'pending') {
            return (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-medium">Processing CSV...</p>
                    <p className="text-sm text-muted-foreground">This may take a few moments.</p>
                </div>
            );
        }

        if (importState.status === 'failed') {
            return (
                <div className="space-y-4">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-3">
                        <AlertCircle className="h-6 w-6" />
                        <div>
                            <h3 className="font-semibold">Import Failed</h3>
                            <p>{importState.error || "An unknown error occurred."}</p>
                        </div>
                    </div>
                    <Button onClick={onReset} className="w-full">Try Again</Button>
                </div>
            );
        }

        if (importState.status === 'completed' && importState.summary) {
            const { summary } = importState;
            return (
                <div className="space-y-6">
                    <div className="bg-green-500/10 text-green-600 p-4 rounded-md flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6" />
                        <div>
                            <h3 className="font-semibold">Import Completed Successfully</h3>
                            <p>Processed {summary.total_processed} items.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-secondary/50 p-3 rounded-md">
                            <div className="text-2xl font-bold">{summary.created_count}</div>
                            <div className="text-xs text-muted-foreground uppercase">Created</div>
                        </div>
                         <div className="bg-secondary/50 p-3 rounded-md">
                            <div className="text-2xl font-bold">{summary.updated_count}</div>
                            <div className="text-xs text-muted-foreground uppercase">Updated</div>
                        </div>
                         <div className="bg-secondary/50 p-3 rounded-md">
                            <div className="text-2xl font-bold">{summary.skipped_count}</div>
                            <div className="text-xs text-muted-foreground uppercase">Skipped</div>
                        </div>
                    </div>

                    {summary.skipped_details.length > 0 && (
                        <div className="border rounded-md p-4">
                            <h4 className="font-medium mb-2">Skipped Items</h4>
                            <div className="max-h-40 overflow-y-auto text-sm space-y-1">
                                {summary.skipped_details.map((detail, idx) => (
                                    <div key={idx} className="text-muted-foreground">
                                        Row {detail.row}: {detail.reason}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                     
                    <Button onClick={() => { onReset(); onClose(); }} className="w-full">Close</Button>
                </div>
            );
        }
        
        return null;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Racks from CSV">
            {!importState && !isUploading ? (
                <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center hover:bg-secondary/50 transition-colors cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">Drop CSV file here</h3>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </div>
            ) : (
                <StatusView />
            )}
        </Modal>
    );
};

export default ImportRacksModal;
