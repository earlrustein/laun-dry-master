import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Navbar from './components/Navbar/Navbar';
import './App.css';
import Expenses from './pages/Expenses/Expenses';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Navigate to='/dashboard' />} />
          <Route path="/dashboard" element={<Dashboard />} />'
          <Route path="/expenses" element={<Expenses />} />'
        </Routes>
      </div>
    </Router>
  );
}

export default App;
