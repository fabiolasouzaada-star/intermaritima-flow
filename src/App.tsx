import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CRMLayout><Dashboard /></CRMLayout>} />
        <Route path="/clientes" element={<CRMLayout><Clientes /></CRMLayout>} />
        <Route path="/cliente/:id" element={<CRMLayout><ClienteDetalhes /></CRMLayout>} />
          <Route path="/pipeline" element={<CRMLayout><Pipeline /></CRMLayout>} />
          <Route path="/contratos" element={<CRMLayout><Contratos /></CRMLayout>} />
          <Route path="/calendario" element={<CRMLayout><Calendario /></CRMLayout>} />
          <Route path="/visitas" element={<CRMLayout><Visitas /></CRMLayout>} />
          <Route path="/tarefas" element={<CRMLayout><Tarefas /></CRMLayout>} />
          <Route path="/matriz" element={<CRMLayout><Matriz /></CRMLayout>} />
          <Route path="/pos-venda" element={<CRMLayout><PosVenda /></CRMLayout>} />
          <Route path="/relatorios" element={<CRMLayout><Relatorios /></CRMLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
