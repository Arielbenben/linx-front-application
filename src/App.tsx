import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './pages/Login/LoginScreen';
import Dashboard from './pages/Dashboard';
import ComparisonScreen from './pages/ComparisonScreen';
import NewReturningCustomers from './pages/NewReturningCustomersVsOthers';
import SelfSalesComprison from './pages/SelfSalesComprison';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/comparison" element={<ComparisonScreen />} />
          <Route path="/NewReturning" element={<NewReturningCustomers />} />
          <Route path="/SelfSalesComprison" element={<SelfSalesComprison />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
