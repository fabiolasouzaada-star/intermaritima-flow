import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CRMLayout } from "./components/CRMLayout";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import ClienteDetalhes from "./pages/ClienteDetalhes";
import Pipeline from "./pages/Pipeline";
import Contratos from "./pages/Contratos";
import Calendario from "./pages/Calendario";
import Visitas from "./pages/Visitas";
import Tarefas from "./pages/Tarefas";
import Matriz from "./pages/Matriz";
import PosVenda from "./pages/PosVenda";
import Relatorios from "./pages/Relatorios";
import Propostas from "./pages/Propostas";
import CarteiraFS from "./pages/CarteiraFS";
import PipelineRetomada from "./pages/PipelineRetomada";
import DashboardFS from "./pages/DashboardFS";

import FSConcorrentes from "./pages/FSConcorrentes";
import FSMultiterminal from "./pages/FSMultiterminal";
import FSImportadores from "./pages/FSImportadores";
import FSExportadores from "./pages/FSExportadores";
import FSLogistica from "./pages/FSLogistica";
import FSFreightForwarders from "./pages/FSFreightForwarders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><CRMLayout><Dashboard /></CRMLayout></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><CRMLayout><Clientes /></CRMLayout></ProtectedRoute>} />
            <Route path="/cliente/:id" element={<ProtectedRoute><CRMLayout><ClienteDetalhes /></CRMLayout></ProtectedRoute>} />
            <Route path="/pipeline" element={<ProtectedRoute><CRMLayout><Pipeline /></CRMLayout></ProtectedRoute>} />
            <Route path="/contratos" element={<ProtectedRoute><CRMLayout><Contratos /></CRMLayout></ProtectedRoute>} />
            <Route path="/calendario" element={<ProtectedRoute><CRMLayout><Calendario /></CRMLayout></ProtectedRoute>} />
            <Route path="/visitas" element={<ProtectedRoute><CRMLayout><Visitas /></CRMLayout></ProtectedRoute>} />
            <Route path="/tarefas" element={<ProtectedRoute><CRMLayout><Tarefas /></CRMLayout></ProtectedRoute>} />
            <Route path="/matriz" element={<ProtectedRoute><CRMLayout><Matriz /></CRMLayout></ProtectedRoute>} />
            <Route path="/pos-venda" element={<ProtectedRoute><CRMLayout><PosVenda /></CRMLayout></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><CRMLayout><Relatorios /></CRMLayout></ProtectedRoute>} />
            <Route path="/propostas" element={<ProtectedRoute><CRMLayout><Propostas /></CRMLayout></ProtectedRoute>} />
            <Route path="/carteira-fs" element={<ProtectedRoute><CRMLayout><CarteiraFS /></CRMLayout></ProtectedRoute>} />
            <Route path="/pipeline-retomada" element={<ProtectedRoute><CRMLayout><PipelineRetomada /></CRMLayout></ProtectedRoute>} />
            <Route path="/dashboard-fs" element={<ProtectedRoute><CRMLayout><DashboardFS /></CRMLayout></ProtectedRoute>} />
            
            <Route path="/fs-concorrentes" element={<ProtectedRoute><CRMLayout><FSConcorrentes /></CRMLayout></ProtectedRoute>} />
            <Route path="/fs-multiterminal" element={<ProtectedRoute><CRMLayout><FSMultiterminal /></CRMLayout></ProtectedRoute>} />
            <Route path="/fs-importadores" element={<ProtectedRoute><CRMLayout><FSImportadores /></CRMLayout></ProtectedRoute>} />
            <Route path="/fs-exportadores" element={<ProtectedRoute><CRMLayout><FSExportadores /></CRMLayout></ProtectedRoute>} />
            <Route path="/fs-logistica" element={<ProtectedRoute><CRMLayout><FSLogistica /></CRMLayout></ProtectedRoute>} />
            <Route path="/fs-freight-forwarders" element={<ProtectedRoute><CRMLayout><FSFreightForwarders /></CRMLayout></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
