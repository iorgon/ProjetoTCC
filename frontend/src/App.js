import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import CreateTicket from './pages/CreateTicket';
import TicketDetails from './pages/TicketDetails';
import PrivateRoute from './routes/PrivateRoute';
import Navbar from './components/Navbar';
import EditTicket from './pages/EditTicket'; 
import ClientList from './pages/ClientList';
import InventoryList from './pages/InventoryList';
import ClientDocuments from './pages/ClientDocuments';
import TicketReports from './pages/TicketReports';
import SLAConfig from './pages/SLAConfig';



function App() {
  return (
    <Routes>
      {/* Rota pública de login */}
      <Route path="/login" element={<Login />} />

      {/* Área privada com Navbar visível */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <>
              <Navbar />
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tickets" element={<TicketList />} />
                <Route path="/create-ticket" element={<CreateTicket />} />
                <Route path="/tickets/:id" element={<TicketDetails />} />
                <Route path="/tickets/:id/edit" element={<EditTicket />} />
                <Route path="/clients" element={<ClientList />} />
                <Route path="/clients/:clientId/inventory" element={<InventoryList />} />
                <Route path="/clients/:clientId/documents" element={<ClientDocuments />} />
                <Route path="/reports" element={<TicketReports />} />
                <Route path="/sla-config" element={<SLAConfig />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
