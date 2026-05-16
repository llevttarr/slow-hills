import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'

import About from './pages/about/About.jsx'
import Menu from './pages/menu/Menu.jsx'
import Loading from './pages/fallback/Loading.jsx'

const App = lazy(() => import('./pages/app/App.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<Loading/>}>
          <Routes>
            <Route path='/' element={<Menu />} />
            <Route path='/about' element={<About />} />
            <Route path='/placeholder' element={<App />}/>
          </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)