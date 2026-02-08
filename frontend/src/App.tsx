import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import ProjectsPage from './pages/Projects/ProjectsPage'
import ProjectDetailsPage from './pages/Projects/ProjectDetailsPage'
import ModulesPage from './pages/Modules/ModulesPage'
import ModuleDetailsPage from './pages/Modules/ModuleDetailsPage'
import KnowledgeBasePage from './pages/Knowledge/KnowledgeBasePage'
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage'
import ProfilePage from './pages/Profile/ProfilePage'

function App() {
  const { token } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/" replace />} />

      <Route path="/" element={token ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailsPage />} />
        <Route path="modules" element={<ModulesPage />} />
        <Route path="modules/:id" element={<ModuleDetailsPage />} />
        <Route path="knowledge" element={<KnowledgeBasePage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

export default App
