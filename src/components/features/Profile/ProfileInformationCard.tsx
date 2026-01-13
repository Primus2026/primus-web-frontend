import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useState, type FC } from "react";
import type { IUser } from "@/types/User";
import { Button } from "@/components/ui/button";

interface ProfileInformationCardProps {
    user: IUser
}

const ProfileInformationCard: FC<ProfileInformationCardProps> = ({
    user
}) => {
        const [isEditing, setIsEditing] = useState(false)
        const [login, setLogin] = useState(user?.login || "")

    const handleUpdateProfile = (e: React.FormEvent) => {
            e.preventDefault()
            console.log("Update profile submitted")
            setIsEditing(false)
        }

    const handleCancelEditClick = () => {
        setIsEditing(false)
        setLogin(user?.login || "")
    }
    return (
        <div className="space-y-6">
                    {/* Role & Status Card - Quick Overview */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Account Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                                    {user.role}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Update your personal details properly.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="login">Login</Label>
                                        <Input
                                            id="login"
                                            value={login}
                                            onChange={(e) => setLogin(e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <p className="text-muted-foreground px-2 py-1 rounded">{user.email}</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Role</Label>
                                         <p className="text-muted-foreground px-2 py-1 rounded">{user.role}</p>
                                        
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancelEditClick}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit">
                                                Save Changes
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
    )
}
export default ProfileInformationCard;