import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload as UploadIcon } from "lucide-react";
import { toast } from "react-toastify";
import type { IRack, RackCreate, RackUpdate } from "@/types/Rack";
import RackCardGrid from "@/components/features/Dashboard/RackCardGrid";
import RackFormModal from "@/components/features/Dashboard/RackFormModal";
import ImportRacksModal from "@/components/features/Dashboard/ImportRacksModal";
import { useRackMutations } from "@/hooks/useRackMutations";
import { useImportRacks } from "@/hooks/useImportRacks";
import { useRacks } from "@/hooks/useRacks";
import { useAuth } from "@/context/AuthProvider";

const RackManagement = () => {
    const { token, isAdmin } = useAuth();
    const { data: racks = [], isLoading, error } = useRacks({ token });
    const { createRack, updateRack, deleteRack } = useRackMutations({ token });
    const { uploadCsv, importStatus, resetImport } = useImportRacks({ token });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRack, setEditingRack] = useState<IRack | undefined>(undefined);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Mutations handlers
    const handleCreate = (data: RackCreate) => {
        createRack.mutate(data, {
            onSuccess: () => {
                toast.success("Rack created successfully");
                setIsCreateModalOpen(false);
            },
            onError: (err) => {
                toast.error(`Failed to create rack: ${err.message}`);
            }
        });
    };

    const handleUpdate = (data: RackCreate) => {
        if (!editingRack || isReadOnly) return;
        const updateData: RackUpdate = { ...data, id: editingRack.id };
        
        updateRack.mutate(updateData, {
             onSuccess: () => {
                toast.success("Rack updated successfully");
                setEditingRack(undefined);
            },
             onError: (err) => {
                toast.error(`Failed to update rack: ${err.message}`);
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this rack?")) {
             deleteRack.mutate(id, {
                onSuccess: () => {
                    toast.success("Rack deleted successfully");
                },
                onError: (err) => {
                    toast.error(`Failed to delete rack: ${err.message}`);
                }
            });
        }
    };

    const handleImportUpload = (file: File) => {
        uploadCsv.mutate(file, {
            onError: (err) => {
                 toast.error(`Import failed to start: ${err.message}`);
            }
        });
    };

    const handleEdit = (rack: IRack) => {
        setEditingRack(rack);
        setIsReadOnly(false);
    };

    const handleView = (rack: IRack) => {
        setEditingRack(rack);
        setIsReadOnly(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Rack Management</h2>
                <div className="flex items-center gap-4">
                     <span className="text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-md border">
                        Total Racks: <span className="font-medium text-foreground ml-1">{racks.length}</span>
                    </span>
                    {isAdmin && (
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                                <UploadIcon className="mr-2 h-4 w-4" /> Import CSV
                            </Button>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> New Rack
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {error ? (
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
                    Error loading racks: {error.message}
                </div>
            ) : (
                <RackCardGrid 
                    racks={racks} 
                    isLoading={isLoading} 
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    isAdmin={isAdmin}
                />
            )}

            {/* Modals */}
            <RackFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={createRack.isPending}
            />

            <RackFormModal
                isOpen={!!editingRack}
                onClose={() => setEditingRack(undefined)}
                onSubmit={handleUpdate}
                initialData={editingRack}
                isLoading={updateRack.isPending}
                readOnly={isReadOnly || !isAdmin}
            />

            <ImportRacksModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onUpload={handleImportUpload}
                importState={importStatus.data}
                isUploading={uploadCsv.isPending}
                onReset={resetImport}
            />
        </div>
    );
};

export default RackManagement;
