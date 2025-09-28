import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Context
import { SiteContentProvider } from './context/SiteContentContext'
import { AuthProvider } from './context/AuthContext'

// Layouts
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Components
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ContentManagerPage from './pages/content/ContentManagerPage'
import UsersPage from './pages/users/UsersPage'
import StudentsPage from './pages/students/StudentsPage'
import TeachersPage from './pages/teachers/TeachersPage'
import ClassesPage from './pages/classes/ClassesPage'
import FinancialPage from './pages/financial/FinancialPage'
import SettingsPage from './pages/settings/SettingsPage'

function App() {
  return (
    <AuthProvider>
      <SiteContentProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="usuarios" element={
              <ProtectedRoute requiredType="admin">
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="alunos" element={<StudentsPage />} />
            <Route path="professores" element={<TeachersPage />} />
            <Route path="turmas" element={<ClassesPage />} />
            <Route path="financeiro" element={<FinancialPage />} />
            <Route path="configuracoes" element={
              <ProtectedRoute requiredType="admin">
                <SettingsPage />
              </ProtectedRoute>
            } />
          </Route>
          <Route path="/gerenciar-conteudo" element={
            <ProtectedRoute requiredLevel="administrador">
              <ContentManagerPage />
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Página não encontrada</p>
                <a href="/" className="btn btn-primary">
                  Voltar ao Início
                </a>
              </div>
            </div>
          } />
        </Routes>
        <Toaster position="top-right" />
      </SiteContentProvider>
    </AuthProvider>
  )
}

export default App