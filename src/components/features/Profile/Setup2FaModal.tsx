import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDisable2FA, useVerify2FA } from "@/hooks/use2FA";
import { Label } from "@radix-ui/react-label";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FC } from "react"
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthProvider";

interface Setup2FaModalProps {
    token: string;
    qrCodeImage: string;
    setIs2FAModalOpen: (open: boolean) => void;
    isEnabled?: boolean;
}

const Setup2FaModal: FC<Setup2FaModalProps> = ({ token, qrCodeImage, setIs2FAModalOpen, isEnabled }) => {
    const queryClient = useQueryClient();
    const { refreshProfile } = useAuth();
    const [step, setStep] = useState<1 | 2>(1)
    const [verificationCode, setVerificationCode] = useState("")
    
    const verify2FAMutation = useVerify2FA(token || "")
    const disable2FAMutation = useDisable2FA(token || "")

    const handleVerifyCode = () => {
        verify2FAMutation.mutate(verificationCode, {
            onSuccess: (data) => {
                console.log("Verification successful", data)
                setIs2FAModalOpen(false)
                queryClient.invalidateQueries({ queryKey: ["user"] })
                toast.success("2FA enabled successfully");
            },
            onError: (error) => {
                console.error("Verification failed", error)
                toast.error("Invalid verification code");
            }
        })
    }

    const handleDisable2FA = () => {
        if(confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) {
            disable2FAMutation.mutate(undefined, {
                onSuccess: () => {
                    toast.success("2FA disabled successfully");
                    refreshProfile();
                    setIs2FAModalOpen(false);
                },
                onError: (error) => {
                    toast.error(`Failed to disable 2FA: ${error.message}`);
                }
            });
        }
    };

    if (isEnabled) {
        return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-center justify-center p-4">
                <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 relative animate-in fade-in-0 zoom-in-95 duration-200">
                     <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">
                            Manage 2FA
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Two-factor authentication is currently enabled on your account.
                        </p>
                    </div>
                    <div className="flex justify-center py-6">
                        <div className="p-4 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 mt-4">
                        <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={handleDisable2FA}
                            disabled={disable2FAMutation.isPending}
                        >
                            {disable2FAMutation.isPending ? "Disabling..." : "Disable 2FA"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIs2FAModalOpen(false)}
                            className="w-full"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-center justify-center p-4">
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 relative animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                    <h3 className="text-lg font-semibold leading-none tracking-tight">
                        {step === 1 ? "Enable 2FA" : "Verify 2FA"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {step === 1 
                            ? "Scan the QR code below with your authenticator app to enable 2-Factor Authentication." 
                            : "Enter the code generated by your authenticator app."}
                    </p>
                </div>
                <div className="flex justify-center py-4 flex-col items-center gap-4">
                {step === 1 ? (
                    qrCodeImage ? (
                        <img src={qrCodeImage} alt="2FA QR Code" className="w-48 h-48 border rounded-md" />
                    ) : (
                        <p>Loading QR Code...</p>
                    )
                ) : (
                    <div className="w-full max-w-xs">
                        <Label htmlFor="verification-code" className="sr-only">Verification Code</Label>
                        <Input 
                            id="verification-code" 
                            placeholder="Enter 6-digit code" 
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="text-center text-lg tracking-widest"
                        />
                    </div>
                )}
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIs2FAModalOpen(false)}
                    className="mt-2 sm:mt-0"
                >
                    Cancel
                </Button>
                {step === 1 ? (
                    <Button type="button" onClick={() => setStep(2)}>
                        Next
                    </Button>
                ) : (
                    <Button type="button" onClick={handleVerifyCode} disabled={!verificationCode}>
                        Done
                    </Button>
                )}
                </div>
            </div>
        </div>
    )
}
export default Setup2FaModal;