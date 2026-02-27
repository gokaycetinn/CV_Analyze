import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnalysisProvider } from './context/AnalysisContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import ResultsPage from './pages/ResultsPage';
import './App.css';

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <Navbar />
      <main className={isHome ? '' : 'main-content'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </main>
      {!isHome && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AnalysisProvider>
        <AppLayout />
      </AnalysisProvider>
    </Router>
  );
}

export default App;
