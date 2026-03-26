import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useRacks } from "@/hooks/useRacks";
import { useWareHouseWorkers, useUserSignUpRequests } from "@/hooks/useUsers";
import { useBackups } from "@/hooks/useBackups";
import { useReports } from "@/hooks/useReports";
import { useProductDefinitions } from "@/hooks/useProductDefinitions";
import { useAuth } from "@/context/AuthProvider";
import { Users, Package, FileText, Database, ShieldAlert, ArrowRight, Loader2, Warehouse, Grip, Grid3x3, Gamepad2, QrCode, LayoutGrid } from "lucide-react";

interface DashboardCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
    to: string;
    loading?: boolean;
    trend?: string;
    trendUp?: boolean;
}

const DashboardCard = ({ title, value, description, icon, to, loading }: DashboardCardProps) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
                {title}
            </CardTitle>
            <div className="text-muted-foreground">
                {icon}
            </div>
        </CardHeader>
        <CardContent>
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground mb-4">
                        {description}
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                        <Link to={to}>
                            Zobacz Szczegóły <ArrowRight className="ml-2 h-3 w-3" />
                        </Link>
                    </Button>
                </>
            )}
        </CardContent>
    </Card>
);

const AdminDashboard = () => {
    const { token } = useAuth();
    
    // Data Fetching
    const { data: racks = [], isLoading: racksLoading } = useRacks({ token });
    const { data: workers = [], isLoading: workersLoading } = useWareHouseWorkers(token || undefined);
    const { data: requests = [], isLoading: requestsLoading } = useUserSignUpRequests(token || undefined);
    const { data: backups = [], isLoading: backupsLoading } = useBackups(token || undefined);
    const { data: products = [], isLoading: productsLoading } = useProductDefinitions({ token });
    const { data: reports = [], isLoading: reportsLoading } = useReports(token || undefined);

    // Calculations
    const totalRacks = racks.length;
    const fullRacks = racks.filter(r => (r.active_slots?.length || 0) > 0).length; // Simplified occupancy
    
    // Latest backup
    const lastBackup = backups.length > 0 
        ? new Date(backups.sort((a,b) => b.modified - a.modified)[0].modified * 1000).toLocaleDateString()
        : "None";


    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel Administratora</h1>
                    <p className="text-muted-foreground mt-2">
                        Dane systemu i status magazynu w skrócie.
                    </p>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard 
                    title="Stan Magazynu" 
                    value={`${fullRacks}/${totalRacks}`}
                    description="Regały z załadowanym towarem"
                    icon={<Warehouse className="h-4 w-4" />}
                    to="/warehouse-definition"
                    loading={racksLoading}
                />
                <DashboardCard 
                    title="Katalog Produktów" 
                    value={products.length}
                    description="Definicje produktów"
                    icon={<Package className="h-4 w-4" />}
                    to="/product-definitions"
                    loading={productsLoading}
                />
                <DashboardCard 
                    title="Zarządzanie Użytkownikami" 
                    value={workers.length}
                    description={`${requests.length} oczekujących zgłoszeń`}
                    icon={<Users className="h-4 w-4" />}
                    to="/users-manager"
                    loading={workersLoading || requestsLoading}
                />
                <DashboardCard 
                    title="Stan Systemu" 
                    value={backups.length}
                    description={`Ostatnia kopia: ${lastBackup}`}
                    icon={<Database className="h-4 w-4" />}
                    to="/backups"
                    loading={backupsLoading}
                />
            </div>

            {/* Nowe kafelki Finałowe */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Funkcje Finałowe (Magazyn 2026)</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <DashboardCard 
                        title="Plansza Magazynu" 
                        value="Joystick"
                        description="Fizyczne sterowanie osiami"
                        icon={<Grip className="h-4 w-4" />}
                        to="/printer-control"
                    />
                    <DashboardCard 
                        title="Szachownica" 
                        value="8x8 Grid"
                        description="Wizualizacja układu figur"
                        icon={<Grid3x3 className="h-4 w-4" />}
                        to="/chess-setup"
                    />
                    <DashboardCard 
                        title="Kółko i Krzyżyk" 
                        value="Bitwa z Robotem"
                        description="Tryb AI i manualny"
                        icon={<Gamepad2 className="h-4 w-4" />}
                        to="/tictactoe"
                    />
                    <DashboardCard 
                        title="Generowanie QR" 
                        value="Etykiety"
                        description="Kody dla nowych obiektów"
                        icon={<QrCode className="h-4 w-4" />}
                        to="/qr-generator"
                    />
                    <DashboardCard 
                        title="Budowa LOGO OZT" 
                        value="Automatyzacja"
                        description="Robotyka edukacyjna"
                        icon={<LayoutGrid className="h-4 w-4" />}
                        to="/logo-ozt"
                    />
                </div>
            </div>

            {/* Secondary Sections */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                
                {/* Pending Requests Panel */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Rejestracja Pracowników</CardTitle>
                        <CardDescription>Prośby oczekujące na zatwierdzenie</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {requestsLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : requests.length > 0 ? (
                            <div className="space-y-4">
                                {requests.slice(0, 5).map(req => (
                                    <div key={req.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium">{req.login}</p>
                                            <p className="text-sm text-muted-foreground">{req.email}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to="/users-manager">Przejrzyj</Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-8 text-muted-foreground">
                                <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                <p>Brak oczekujących zgłoszeń</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Reports Panel */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Ostatnie Raporty</CardTitle>
                        <CardDescription>Ostatnio wygenerowane raporty systemowe</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {reportsLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : reports.length > 0 ? (
                            <div className="space-y-4">
                                {reports.slice(0, 5).map((rep, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText className="h-4 w-4 text-primary shrink-0" />
                                            <span className="text-sm truncate" title={rep.filename}>{rep.filename}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {new Date(rep.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full mt-4" asChild>
                                    <Link to="/reports">Zobacz Wszystkie Raporty</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                <p>Nie znaleziono raportów</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
