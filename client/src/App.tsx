import { Routes, Route, Navigate } from "react-router-dom";
//import ProtectedRoute from "./components/layout/ProtectedRoute";
//import AuthLayout from "./components/layout/AuthLayout";
//import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
  return (
    <Routes>
      {/* ====== Public Routes (Auth) ====== */}
      {/*<Route element={<AuthLayout />}> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      {/*</Route>*/}

      {/* ====== Protected Routes ====== */}
      {/*<Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>*/}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
       { /*</Route>
      </Route>*/}

      {/* ====== Redirects ====== */}
      <Route path="/" element={<Navigate to="/chat" replace />} />

      {/* ====== 404 ====== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;