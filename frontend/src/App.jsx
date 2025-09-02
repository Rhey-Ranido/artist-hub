// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Tutorials from "./pages/Tutorials";
import TutorialDetail from "./pages/TutorialDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminArtworkDetail from "./pages/AdminArtworkDetail";
import AdminTutorialDetail from "./pages/AdminTutorialDetail";
import MyArtworks from "./pages/MyArtworks";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create" element={<Create />} />
            <Route path="/artwork/:id" element={<ArtworkDetails />} />
            <Route path="/artwork/:id/edit" element={<EditArtwork />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/search" element={<Search />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/tutorials/:id" element={<TutorialDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/user/:id" element={<AdminUserDetail />} />
            <Route path="/admin/artwork/:id" element={<AdminArtworkDetail />} />
            <Route path="/admin/tutorial/:id" element={<AdminTutorialDetail />} />
            <Route path="/my-artworks" element={<MyArtworks />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </Router>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
