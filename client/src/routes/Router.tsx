import { createBrowserRouter } from "react-router";
import App from "../App";
import Dashboard from "../components/Dashboard";
import Login from "../components/pages/Login";
import Register from "../components/pages/Register";
import Profile from "../components/pages/Profile";
import { ProtectedRoute } from "../components/ProtectedRoute";

const Router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: "profile",
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                ),
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "register",
                element: <Register />,
            },
        ],
    },
]);

export default Router;
