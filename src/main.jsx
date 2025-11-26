import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Init from './pages/Init'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Init />,
    loader: async () => {
      //wake service with emtpy http call
      const status = await fetch('https://image-converter-k56z.onrender.com/api/ping',{
        method: 'GET',
      })
      return null;
    }
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
