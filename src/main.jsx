import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'

import About from './pages/about/About.jsx'
import App from './pages/app/App.jsx'
import Menu from './pages/menu/Menu.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route path='/' element={<PageTransition><Menu /></PageTransition>} />
          <Route path='/about' element={<PageTransition><About /></PageTransition>} />
          <Route path='/placeholder' element={<PageTransition><App /></PageTransition>}/>
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)