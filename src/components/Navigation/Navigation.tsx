import { useAuth } from "@/context/AuthProvider";
import { 
    LayoutDashboard, 
    Users, 
    Warehouse, 
    FileChartColumn, 
    DatabaseBackup, 
    User,
    LogOut,
    Package,
    Bell,
    Brain,
    Gamepad2,
    QrCode,
    Grip,
    Grid3x3,
    ChevronDown,
    ChevronUp,
    Layers,
    LayoutGrid
} from "lucide-react";
import { useState, type FC } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUnsentAlertsCount } from "@/hooks/useAlerts";

const navigationItems = [
    {to: "", label: "Panel", icon: <LayoutDashboard size={20} />},
    {to: "users-manager", label: "Użytkownicy", icon: <Users size={20} />},
    {to: "warehouse-definition", label: "Magazyn", icon: <Warehouse size={20} />},
    {to: "product-definitions", label: "Produkty", icon: <Package size={20} />},
    {to: "reports", label: "Raporty", icon: <FileChartColumn size={20} />},
    {to: "alerts", label: "Alerty", icon: <Bell size={20} />},
    {to: "backups", label: "Kopie Zapasowe", icon: <DatabaseBackup size={20} />},
    {to: "admin/ai", label: "Model AI", icon: <Brain size={20} />},
    {to: "profile", label: "Profil", icon: <User size={20} />},
];

const extraItems = [
    {to: "printer-control", label: "Plansza Magazynu", icon: <Grip size={20} />},
    {to: "chess-setup", label: "Szachownica", icon: <Grid3x3 size={20} />},
    {to: "tictactoe", label: "Kółko i Krzyżyk", icon: <Gamepad2 size={20} />},
    {to: "qr-generator", label: "Generowanie QR", icon: <QrCode size={20} />},
    {to: "logo-ozt", label: "Budowa Logo OZT", icon: <LayoutGrid size={20} />},
    {to: "warehouse-inventory", label: "Inwentaryzacja Magazynu", icon: <LayoutGrid size={20} />},
];

const Navigation: FC = () => {
    const {canAccess, logout, user, token} = useAuth();
    
    // Get user data from auth context
    const userName = user?.login || "Użytkownik"; 
    const userRole = user?.role || "GOŚĆ";
    const userInitials = userName.slice(0, 2).toUpperCase();
    const location = useLocation();

    // Fetch unread alerts count using hook
    const { data: unreadCount = 0 } = useUnsentAlertsCount(token || undefined);

    const visibleItems = navigationItems.filter((item) => canAccess(item.to));
    const visibleExtraItems = extraItems.filter((item) => canAccess(item.to));

    // Automatically open 'Dodatkowe' if user is currently on one of the extra routes
    const isExtraActive = visibleExtraItems.some(item => location.pathname.includes(item.to));
    const [isExtraOpen, setIsExtraOpen] = useState(isExtraActive);
    
    return (
        <aside className="h-full w-72 flex flex-col bg-card border rounded-xl shadow-sm transition-all duration-300">
            <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <img src="/logo.png" alt="Primus Logo" className="h-12 w-auto mb-1" />
                        <p className="text-xs text-muted-foreground">System Magazynowy</p>
                    </div>
                </div>
            </div>

            <div className="p-4 flex items-center gap-3 mx-2 mt-2 mb-4 bg-muted/50 rounded-lg border border-border/50">
                 <Avatar className="h-9 w-9 border">
                    <AvatarFallback className="bg-background text-primary text-xs font-bold">
                        {userInitials}
                    </AvatarFallback>
                 </Avatar>
                 <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate capitalize">{userRole.toLowerCase()}</p>
                 </div>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={logout}>
                    <LogOut size={16} />
                 </Button>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2">
                {
                    visibleItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === ""}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative
                                ${isActive 
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }
                            `}
                        >
                            {item.icon}
                            {item.label}
                            {item.to === 'alerts' && unreadCount > 0 && (
                                <span className="absolute right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </NavLink>
                    ))
                }

                {visibleExtraItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-1">
                        <button 
                            onClick={() => setIsExtraOpen(!isExtraOpen)} 
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
                                ${isExtraActive && !isExtraOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Layers size={20} />
                                Dodatkowe (Etap 3)
                            </div>
                            {isExtraOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        
                        {isExtraOpen && (
                            <div className="pl-6 pr-2 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200 fade-in">
                                {visibleExtraItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative
                                            ${isActive 
                                                ? "bg-primary/10 text-primary font-semibold" 
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }
                                        `}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </nav>
            
            <div className="p-4 border-t text-xs text-center text-muted-foreground">
                <p>v1.0.0</p>
            </div>
        </aside>
    )
}
export default Navigation;