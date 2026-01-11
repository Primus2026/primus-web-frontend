import Navigation from "@/components/Natigation/Navigation";
import type { FC } from "react";
import { Outlet } from "react-router-dom";

const RootLayout: FC = () => {
    return (
        <div className="flex h-screen bg-gray-50">
            <Navigation/>
            <main className="flex-1 overflow-y-auto ml-64">
                <div className="p-4">
                    <Outlet/>
                </div>
            </main>
        </div>
    )
}
export default RootLayout;