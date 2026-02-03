import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { IUser } from "@/types/User";
import { type FC } from "react";

interface ProfileSecurityCardProps {
    user: IUser;
    setIsPasswordModalOpen: (open: boolean) => void;
    handleEnable2FA: () => void;
}

const ProfileSecurityCard: FC<ProfileSecurityCardProps> = ({ user, setIsPasswordModalOpen, handleEnable2FA }) => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Bezpieczeństwo</CardTitle>
                    <CardDescription>
                        Zarządzaj bezpieczeństwem swojego konta.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setIsPasswordModalOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Zmień Hasło
                    </Button>
                    
                    <Button
                        className={`w-full justify-start ${user.is_2fa_enabled ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        variant={user.is_2fa_enabled ? "default" : "secondary"}
                        onClick={handleEnable2FA}
                    >
                        {user.is_2fa_enabled ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                        ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                        )}
                        {user.is_2fa_enabled ? '2FA Włączone' : 'Włącz 2FA'}
                    </Button>
                </CardContent>
            </Card>
        </div>  
    )
}
export default ProfileSecurityCard;