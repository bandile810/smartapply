import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import CreateResume from './pages/CreateResume'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<Jobs />} />
          <Route path="/resume" element={<CreateResume />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat/:chatId" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App