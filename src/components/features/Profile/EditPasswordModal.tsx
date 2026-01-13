import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import type { FC } from "react";

interface EditPasswordModalProps {
    setIsPasswordModalOpen: (open: boolean) => void;
}

const EditPasswordModal: FC<EditPasswordModalProps> = ({ setIsPasswordModalOpen }) => {
    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Update password submitted")
        setIsPasswordModalOpen(false)
    }
    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-center justify-center p-4">
                <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 relative animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">Update Password</h3>
                        <p className="text-sm text-muted-foreground">
                            Enter your current password and a new one to update.
                        </p>
                    </div>
                    <form onSubmit={handleUpdatePassword}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="old-pass">Current Password</Label>
                                <Input id="old-pass" type="password" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-pass">New Password</Label>
                                <Input id="new-pass" type="password" />
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="mt-2 sm:mt-0"
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Update Password
                        </Button>
                        </div>
                    </form>
                </div>
        </div>
    )

}

export default EditPasswordModal;