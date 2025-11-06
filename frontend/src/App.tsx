import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Layouts
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Components
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import FirstAccessPage from './pages/auth/FirstAccessPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ContentManagerPage from './pages/content/ContentManagerPage'
import UsersPage from './pages/users/UsersPage'
import StudentsPage from './pages/students/StudentsPage'
import TeachersPage from './pages/teachers/TeachersPage'
import TeacherDashboardPage from './pages/teachers/TeacherDashboardPage'
import ParentDashboardPage from './pages/parents/ParentDashboardPage'
import ResponsavelDashboard from './pages/parents/ResponsavelDashboard'
import ClassesPage from './pages/classes/ClassesPage'
import ClassDetailPage from './pages/classes/ClassDetailPage'
import FinancialPage from './pages/financial/FinancialPage'
import SettingsPage from './pages/settings/SettingsPage'
import DevTasksPage from './pages/devtasks/DevTasksPage'
import TestDevTasksPage from './pages/devtasks/TestDevTasksPage'
import CompletedTasksPage from './pages/devtasks/CompletedTasksPage'

function App() {
  return (
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/first-access" element={
            <ProtectedRoute>
              <FirstAccessPage />
            </ProtectedRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <ProtectedRoute excludedTypes={['professor', 'responsavel']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="usuarios" element={
              <ProtectedRoute requiredType="admin">
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="devtasks" element={
              <ProtectedRoute requiredType="admin">
                <DevTasksPage />
              </ProtectedRoute>
            } />
            <Route path="devtasks/completed" element={
              <ProtectedRoute requiredType="admin">
                <CompletedTasksPage />
              </ProtectedRoute>
            } />
            <Route path="alunos" element={
              <ProtectedRoute excludedTypes={['professor', 'responsavel']}>
                <StudentsPage />
              </ProtectedRoute>
            } />
            <Route path="professores" element={
              <ProtectedRoute excludedTypes={['professor', 'responsavel']}>
                <TeachersPage />
              </ProtectedRoute>
            } />
            <Route path="professor-dashboard" element={
              <ProtectedRoute requiredType="professor">
                <TeacherDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="responsavel-dashboard" element={
              <ProtectedRoute requiredType="responsavel">
                <ResponsavelDashboard />
              </ProtectedRoute>
            } />
            <Route path="turmas" element={
              <ProtectedRoute excludedTypes={['professor', 'responsavel']}>
                <ClassesPage />
              </ProtectedRoute>
            } />
            <Route path="turmas/:id" element={
              <ProtectedRoute excludedTypes={['professor', 'responsavel']}>
                <ClassDetailPage />
              </ProtectedRoute>
            } />
            <Route path="financeiro" element={
              <ProtectedRoute excludedTypes={['professor', 'responsavel']}>
                <FinancialPage />
              </ProtectedRoute>
            } />
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
  )
}

export default App