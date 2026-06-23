import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/customer/Home';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/AdminOrders';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />

        <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;