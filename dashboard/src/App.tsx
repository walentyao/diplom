import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LogsPage from './pages/LogsPage';
import AlertsPage from './pages/AlertsPage';
import StatsPage from './pages/StatsPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LogsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
