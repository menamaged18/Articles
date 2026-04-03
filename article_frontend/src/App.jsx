import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/navbar/NavBar' 
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar /> 
      
      <main className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App