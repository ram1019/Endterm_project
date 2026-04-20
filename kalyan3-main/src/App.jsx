import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/ui/Layout';

// Lazily load pages (Advanced React Concept Requirement)
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Clients = React.lazy(() => import('./pages/Clients'));
const Invoices = React.lazy(() => import('./pages/Invoices'));
const CreateInvoice = React.lazy(() => import('./pages/CreateInvoice'));
const Expenses = React.lazy(() => import('./pages/Expenses'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <React.Suspense fallback={
          <div className="h-screen w-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        }>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="invoices/new" element={<CreateInvoice />} />
              <Route path="expenses" element={<Expenses />} />
            </Route>
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
