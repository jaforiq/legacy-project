import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router"
import './index.css'
import App from './App.tsx'
import Layout from './Layout.tsx'
import Login from './Login.tsx'
import ContextProvider from './UserContext.tsx'
import Registration from './Registration.tsx'
import Details from './Details.tsx'
import '@smastrom/react-rating/style.css'
import User from './User.tsx'

createRoot(document.getElementById('root')!).render(
    <ContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<App />} />
            <Route path="details/:id" element={<Details />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Registration />} />
            <Route path="user" element={<User />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ContextProvider>
)
