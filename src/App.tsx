
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import { AuthProvider } from "./context/AuthProvider";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedRoute from "./layouts/ProtectedRoute";
import {ToastContainer} from "react-toastify";
import AuthPage from "./pages/Authentication/AuthPage";
import WarehouseDefinitionPage from "./pages/features/WarehouseDefinition/WarehouseDefinitionPage";
import WarehouseUsersPage from "./pages/features/WarehouseUsers/WarehouseUsersPage";
import DashboardPage from "./pages/features/Dashboard/DashboardPage";
import ReportsPage from "./pages/features/Reports/ReportsPage";
import BackupsPage from "./pages/features/Backups/BackupsPage";
import ProfilePage from "./pages/features/Profile/ProfilePage";
import ProductDefinitionsPage from "./pages/features/ProductDefinitions/ProductDefinitionsPage";
import PrinterControlPage from "./pages/features/PrinterControl/PrinterControlPage";
import ChessSetupPage from "./pages/features/ChessSetup/ChessSetupPage";
import TicTacToePage from "./pages/features/TicTacToe/TicTacToePage";
import QRGeneratorPage from "./pages/features/QRGenerator/QRGeneratorPage";
import LogoOztPage from "./pages/features/LogoOzt/LogoOztPage";
import AlertsPage from "./pages/AlertsPage";
import AdminAIPage from "./pages/AdminAIPage";

const queryClient =  new QueryClient();

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AuthProvider><AuthLayout/></AuthProvider>,
      children: [
        {path: 'signin', element: <AuthPage/>}
      ]
    },
    {
      path: '/',
      element: <AuthProvider><ProtectedRoute/></AuthProvider>,
      children: [
        {
          path: '/',
          element: <RootLayout/>,
          children: [
            {
              index: true,
              element: <DashboardPage/>
            },
            {
              path: 'signin',
              element: <AuthPage/>
            },
            {
              path: 'users-manager',
              element: <WarehouseUsersPage/>
            },
            {
              path: 'warehouse-definition',
              element: <WarehouseDefinitionPage/>
            },
            {
              path: "product-definitions",
              element: <ProductDefinitionsPage/>
            },
            {
              path: "reports",
              element: <ReportsPage/>
            },
            {
              path: "backups",
              element: <BackupsPage/>
            },
            {
              path: "profile",
              element: <ProfilePage/>
            },
            {
              path: "printer-control",
              element: <PrinterControlPage/>
            },
            {
              path: "chess-setup",
              element: <ChessSetupPage/>
            },
            {
              path: "tictactoe",
              element: <TicTacToePage/>
            },
            {
              path: "qr-generator",
              element: <QRGeneratorPage/>
            },
            {
               path: "logo-ozt",
               element: <LogoOztPage/>
            },
            {
               path: "alerts",
               element: <AlertsPage/>
            },
            {
               path: "admin/ai",
               element: <AdminAIPage/>
            }
          ]
        }
      ]
    }
  ]
)

function App() {

  return (
    <QueryClientProvider client={queryClient} >
      <RouterProvider router={router}/>
      <ToastContainer autoClose={6000} />
    </QueryClientProvider>
  )
}

export default App
