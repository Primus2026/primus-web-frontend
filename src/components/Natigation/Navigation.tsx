import { useAuth } from "@/context/AuthProvider";
import type { FC } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/button";

const navigationItems = [
    {to: "", label: "Dashboard"},
    {to: "users-manager", label: "Warehouse users"},
    {to: "warehouse-definition", label: "Warehouse Definition"},
    {to: "reports", label: "Reports"},
    {to: "backups", label: "Backups"},
    {to: "profile", label: "Profile"},
]

const Navigation: FC = () => {
    const {canAccess, logout} = useAuth();
    const visibleItems = navigationItems.filter((item) => canAccess(item.to));
    return (
        <aside className="fixed top-0 left-0 h-full bg-gray-100 border-r border-gray-200 z-20 w-64">
            <div className="p-4">
                <h2 className="text-lg font-semibold">Web Panel</h2>
            </div>
            <nav className="p-4 space-y-2">
                {
                    visibleItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className="block py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            {item.label}
                        </NavLink>
                    ))
                }
            </nav>
            <Button className="hover:bg-red-600 mt-10 px-10 mx-5 bg-red-500 cursor-pointer" onClick={logout}>Logout</Button>
        </aside>
    )
}
export default Navigation;