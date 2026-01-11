import { useAuth } from "@/context/AuthProvider";
import { useUserSignUpRequests, useWareHouseWorkers } from "@/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FC } from "react";
import { WarehouseUsers } from "@/components/features/WarehouseUsers/WarehouseUsers";
import { UserRegisterRequests } from "@/components/features/WarehouseUsers/UserRegisterRequests";
import type { IUser } from "@/types/User";

const WarehouseUsersPage: FC = () => {
    const { token } = useAuth();
    const { data: activeUsers,
        isLoading: activeUsersIsLoading,
        isError: activeUsersIsError,
        error: activeUsersError 
        } = useWareHouseWorkers(token || "");
    const {
        data: signUpRequests,
        isLoading: signUpRequestsIsLoading,
        isError: signUpRequestsIsError,
        error: signUpRequestsError
    } = useUserSignUpRequests(token || "");


    if(activeUsersIsLoading || signUpRequestsIsLoading) {
        return <p>loading...</p>
    }
    if(activeUsersIsError) {
        return <p>{activeUsersError.message || "Something went wrong"}</p>
    }
    if(signUpRequestsIsError) {
        return <p>{signUpRequestsError.message || "Something went wrong"}</p>
    }




    return (
        <div className="container mx-auto py-10 space-y-8">
            <header className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Zarządzanie Użytkownikami</h1>
                <p className="text-muted-foreground">Zarządzaj dostępem do magazynu i wnioskami o rejestrację.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sekcja Aktywnych Użytkowników */}
                <Card>
                    <CardHeader>
                        <CardTitle>Aktywni Pracownicy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <WarehouseUsers users={activeUsers as IUser[]} />
                    </CardContent>
                </Card>

                {/* Sekcja Wniosków */}
                <Card>
                    <CardHeader>
                        <CardTitle>Wnioski o Rejestrację</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UserRegisterRequests
                            requests={signUpRequests as IUser[]} 
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default WarehouseUsersPage;