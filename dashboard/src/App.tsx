import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import LogsPage from './pages/LogsPage';
import AlertsPage from './pages/AlertsPage';
import StatsPage from './pages/StatsPage';
import LoginPage from './pages/LoginPage';

function App() {
  const isDevMode = import.meta.env.VITE_NODE_ENV === 'development';
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isDevMode) {
      console.log(`App initialized. Environment: ${import.meta.env.VITE_NODE_ENV}, Version: ${appVersion}`);
    }
    // Проверяем наличие токена при загрузке
    const token = localStorage.getItem('jwt');
    if (token) {
      setIsAuthenticated(true);
      // Устанавливаем токен по умолчанию для axios
      import('axios').then(({ default: axios }) => {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      });
    }
    // Устанавливаем глобальный интерцептор для всех запросов
    import('axios').then(({ default: axios }) => {
      axios.interceptors.request.use(
        (config) => {
          const jwt = localStorage.getItem('jwt');
          if (jwt) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${jwt}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );
    });
  }, [isDevMode, appVersion]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<StatsPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
