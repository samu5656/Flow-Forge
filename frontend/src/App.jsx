import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { WorkspaceProvider } from './context/WorkspaceContext';

import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Issues } from './pages/Issues';
import { Milestones } from './pages/Milestones';
import { Labels } from './pages/Labels';
import { Teams } from './pages/Teams';
import { GithubHub } from './pages/GithubHub';
import { AiAssistant } from './pages/AiAssistant';
import { Deployments } from './pages/Deployments';
import { Observability } from './pages/Observability';
import { Profile } from './pages/Profile';
import { GithubCallback } from './pages/GithubCallback';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <WorkspaceProvider>
            <Routes>
              {/* Public Authentication routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/github/callback" element={<GithubCallback />} />

              {/* Protected App Shell */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects/issues" element={<Issues />} />
                  <Route path="/milestones" element={<Milestones />} />
                  <Route path="/labels" element={<Labels />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/github" element={<GithubHub />} />
                  <Route path="/ai-assistant" element={<AiAssistant />} />
                  <Route path="/deployments" element={<Deployments />} />
                  <Route path="/observability" element={<Observability />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </WorkspaceProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
