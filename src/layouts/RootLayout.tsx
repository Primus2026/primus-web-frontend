import Navigation from "@/components/Navigation/Navigation";
import type { FC } from "react";
import { Outlet } from "react-router-dom";

const RootLayout: FC = () => {
    return (
        <div className="flex h-screen bg-muted/40 p-4 gap-4 overflow-hidden">
            <Navigation/>
            <main className="flex-1 overflow-y-auto bg-background rounded-xl border shadow-sm relative">
                <div className="p-6 h-full">
                    <Outlet/>
                </div>
            </main>
        </div>
    )
}
export default RootLayout;