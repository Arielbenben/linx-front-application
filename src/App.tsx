import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './pages/Login/LoginScreen';
import Dashboard from './pages/Dashboard';
import ComparisonScreen from './pages/ComparisonScreen';
import SalesForecast from './pages/SalesForecast';
import NewReturningCustomers from './pages/NewReturningCustomersVsOthers';
import SelfSalesComprison from './pages/SelfSalesComprison';
import Profile from './pages/Profile';
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
          <Route path="/SalesForecast" element={<SalesForecast />} />
          <Route path="/SelfSalesComprison" element={<SelfSalesComprison />} />
          <Route path="/Profile" element={<Profile />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
