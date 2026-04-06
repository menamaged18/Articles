import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/navbar/NavBar' 
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Article from './pages/Article/Article'
import UserArticles from './pages/ArticlesUser/ArticlesUser'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar /> 
      
      <main className="bg-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/articles/:id" element={<Article />} />
          <Route path="/userArticles" element={<UserArticles />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App