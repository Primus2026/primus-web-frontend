import { useRacks } from "@/hooks/useRacks";
import { useAuth } from "@/context/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Warehouse, FileText, Printer, Grid3x3, Gamepad2, QrCode, LayoutGrid } from "lucide-react";
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

            <div className="space-y-4 pt-4">
                <h2 className="text-xl font-semibold tracking-tight">Obsługa Magazynu (Etap 3)</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-primary/20">
                        <Link to="/printer-control">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Sterowanie</CardTitle>
                                <Printer className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Drukarka</div>
                                <p className="text-xs text-muted-foreground">Oś XYZ i Magnes</p>
                            </CardContent>
                        </Link>
                    </Card>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-primary/20">
                        <Link to="/chess-setup">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Szachownica 8x8</CardTitle>
                                <Grid3x3 className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Wizualizacja</div>
                                <p className="text-xs text-muted-foreground">Stan i układ figur</p>
                            </CardContent>
                        </Link>
                    </Card>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-primary/20">
                        <Link to="/tictactoe">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Gra</CardTitle>
                                <Gamepad2 className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">TicTacToe</div>
                                <p className="text-xs text-muted-foreground">Zagraj z maszyną</p>
                            </CardContent>
                        </Link>
                    </Card>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-primary/20">
                        <Link to="/qr-generator">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Zarządzanie QR</CardTitle>
                                <QrCode className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Etykiety</div>
                                <p className="text-xs text-muted-foreground">Kody dla bloków</p>
                            </CardContent>
                        </Link>
                    </Card>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-primary/20">
                        <Link to="/logo-ozt">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Robotyka</CardTitle>
                                <LayoutGrid className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Logo OZT</div>
                                <p className="text-xs text-muted-foreground">Wzorzec AI</p>
                            </CardContent>
                        </Link>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;
