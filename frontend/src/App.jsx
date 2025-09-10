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
  { path: "/notifications", element: <Notifications /> }
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
