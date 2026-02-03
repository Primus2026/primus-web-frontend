import { useAuth } from "@/context/AuthProvider";
import { 
    LayoutDashboard, 
    Users, 
    Warehouse, 
    FileChartColumn, 
    DatabaseBackup, 
    User,
    LogOut,
    Package
} from "lucide-react";
import type { FC } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigationItems = [
    {to: "", label: "Panel", icon: <LayoutDashboard size={20} />},
    {to: "users-manager", label: "Użytkownicy", icon: <Users size={20} />},
    {to: "warehouse-definition", label: "Magazyn", icon: <Warehouse size={20} />},
    {to: "product-definitions", label: "Produkty", icon: <Package size={20} />},
    {to: "reports", label: "Raporty", icon: <FileChartColumn size={20} />},
    {to: "backups", label: "Kopie Zapasowe", icon: <DatabaseBackup size={20} />},
    {to: "profile", label: "Profil", icon: <User size={20} />},
]

const Navigation: FC = () => {
    const {canAccess, logout, user} = useAuth();
    
    // Get user data from auth context
    const userName = user?.login || "Użytkownik"; 
    const userRole = user?.role || "GOŚĆ";
    const userInitials = userName.slice(0, 2).toUpperCase();

    const visibleItems = navigationItems.filter((item) => canAccess(item.to));
    
    return (
        <aside className="h-full w-72 flex flex-col bg-card border rounded-xl shadow-sm transition-all duration-300">
            <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="font-bold text-lg tracking-tight">Primus</h2>
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
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                ${isActive 
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }
                            `}
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))
                }
            </nav>
            
            <div className="p-4 border-t text-xs text-center text-muted-foreground">
                <p>v1.0.0</p>
            </div>
        </aside>
    )
}
export default Navigation;