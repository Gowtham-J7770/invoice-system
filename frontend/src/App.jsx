import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Layout from "./components/layout/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />

      <Route
        path="/clients"
        element={
          <Layout>
            <Clients />
          </Layout>
        }
      />

      <Route
        path="/products"
        element={
          <Layout>
            <Products />
          </Layout>
        }
      />

      <Route
        path="/invoices"
        element={
          <Layout>
            <Invoices />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
