import type { FC } from "react";
import { Outlet } from "react-router-dom";

const AuthLayout: FC = () => (
    <div>
        <Outlet/>
    </div>
)
export default AuthLayout;