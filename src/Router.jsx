import Main, { API_URL_BASE } from './pages/Main'

const router = [
  {
    path: '',
    element: <Main />,
    loader: async () => {
      const STATUS_PATH = '/api/ping'
      const status = await fetch(API_URL_BASE+STATUS_PATH)
      return null
    }
  }
]

export { router as Routes }
