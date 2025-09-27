// src/App.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider } from './contexts/AuthContext';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Create from "./pages/Create";
import ArtworkDetails from "./pages/ArtworkDetails";
import EditArtwork from "./pages/EditArtwork";
import Profile from "./pages/Profile";
import UserSettings from "./pages/UserSettings";
import Messages from "./pages/Messages";
import Search from "./pages/Search";
import Artworks from "./pages/Artworks";
import Tutorials from "./pages/Tutorials";
import TutorialDetail from "./pages/TutorialDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminArtworkDetail from "./pages/AdminArtworkDetail";
import AdminTutorialDetail from "./pages/AdminTutorialDetail";
import MyArtworks from "./pages/MyArtworks";
import Notifications from "./pages/Notifications";

// 404 Not Found component
const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
        <p className="text-muted-foreground mb-6">Page not found</p>
        <a href="/" className="text-primary hover:underline">
          Go back to home
        </a>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/create", element: <Create /> },
  { path: "/artwork/:id", element: <ArtworkDetails /> },
  { path: "/artwork/:id/edit", element: <EditArtwork /> },
  { path: "/profile/:username", element: <Profile /> },
  { path: "/settings", element: <UserSettings /> },
  { path: "/messages", element: <Messages /> },
  { path: "/search", element: <Search /> },
  { path: "/artworks", element: <Artworks /> },
  { path: "/tutorials", element: <Tutorials /> },
  { path: "/tutorials/:id", element: <TutorialDetail /> },
  { path: "/admin", element: <AdminDashboard /> },
  { path: "/admin/user/:id", element: <AdminUserDetail /> },
  { path: "/admin/artwork/:id", element: <AdminArtworkDetail /> },
  { path: "/admin/tutorial/:id", element: <AdminTutorialDetail /> },
  { path: "/my-artworks", element: <MyArtworks /> },
  { path: "/notifications", element: <Notifications /> },
  { path: "*", element: <NotFound /> }
]);

function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <RouterProvider router={router} />
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
