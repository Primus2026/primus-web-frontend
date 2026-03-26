import { useRacks } from "@/hooks/useRacks";
import { useAuth } from "@/context/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Warehouse, FileText, Grip, Grid3x3, Gamepad2, QrCode, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const WorkerDashboard = () => {
    const { token } = useAuth();
    const { data: racks = [], error } = useRacks({ token });

    // Basic Stats
    const totalRacks = racks.length;
    const activeRacks = racks.filter(r => (r.active_slots?.length || 0) > 0).length;

    if (error) {
        return (
             <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
                Nie udało się załadować regałów. Proszę spróbować ponownie później.
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel Pracownika</h1>
                    <p className="text-muted-foreground mt-2">
                         Operacje magazynowe i stan systemu.
                    </p>
                </div>
            </div>

            {/* Operational Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stan Magazynu</CardTitle>
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeRacks} / {totalRacks}</div>
                        <p className="text-xs text-muted-foreground">Regały z załadowanym towarem</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Raporty</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Dostępne</div>
                        <p className="text-xs text-muted-foreground mb-4">Przeglądaj i pobieraj raporty</p>
                         <Button variant="outline" size="sm" className="w-full h-8 text-xs" asChild>
                            <Link to="/reports">Przejdź do Raportów</Link>
                        </Button>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Produkty</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Katalog</div>
                        <p className="text-xs text-muted-foreground mb-4">Sprawdź informacje o produktach</p>
                         <Button variant="outline" size="sm" className="w-full h-8 text-xs" asChild>
                            <Link to="/product-definitions">Przejdź do Produktów</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default WorkerDashboard;
