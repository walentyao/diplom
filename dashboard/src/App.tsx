import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import LogsPage from './pages/LogsPage';
import AlertsPage from './pages/AlertsPage';
import StatsPage from './pages/StatsPage';

function App() {
  const isDevMode = import.meta.env.VITE_NODE_ENV === 'development';
  const appVersion = import.meta.env.VITE_APP_VERSION;
  
  useEffect(() => {
    if (isDevMode) {
      console.log(`App initialized. Environment: ${import.meta.env.VITE_NODE_ENV}, Version: ${appVersion}`);
    }
  }, [isDevMode, appVersion]);
  
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
