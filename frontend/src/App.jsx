import React, { useEffect, useRef } from 'react'
import { Routes, Route} from 'react-router-dom'
import { Navigate } from 'react-router-dom'

import useAuthStore from './store/useAuthStore.js'
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import MessagePage from './pages/MessagePage.jsx'
import ErrorPage from './pages/ErrorPage.jsx' 


function App() {

  const {isAuthenticated, authenticate} = useAuthStore();

  useEffect(() => {
    authenticate();
    console.log("Authentication status:", isAuthenticated);
  }, []);

  return (
    <>

      <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 box-border overflow-hidden">
        {/* Background Blurs */}
        <div className="relative">
          <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
          <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />
        </div>
        <Toaster />

        <Routes>

          <Route path="/" 
          element={isAuthenticated ? <MessagePage /> : <LoginPage />} />

          <Route path="/signup" 
          element={isAuthenticated ? <Navigate to={"/"} /> : <SignupPage />} />

         
          <Route path="/login" 
          element={isAuthenticated ? <Navigate to={"/"} /> : <LoginPage />} /> 
        

          <Route path="*" element={<ErrorPage />} />
          
        </Routes>
      </div>

    </>
  )
}

export default App
