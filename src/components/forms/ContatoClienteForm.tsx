import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Contato } from "@/hooks/useClientes";

interface ContatoClienteFormProps {
  clienteId: string;
  contatos: Contato[];
  onContatosChange: () => void;
}

export function ContatoClienteForm({ clienteId, contatos, onContatosChange }: ContatoClienteFormProps) {
  const [novoContato, setNovoContato] = useState({
    nome: "",
    email: "",
    telefone: "",
    sede: "",
    cargo: "",
    is_principal: false,
  });

  const handleAddContato = async () => {
    if (!novoContato.nome) {
      toast.error("Nome do contato é obrigatório");
      return;
    }

    const { error } = await supabase
      .from("contatos_cliente")
      .insert({
        cliente_id: clienteId,
        ...novoContato,
      });

    if (error) {
      toast.error("Erro ao adicionar contato");
      return;
    }

    toast.success("Contato adicionado");
    setNovoContato({
      nome: "",
      email: "",
      telefone: "",
      sede: "",
      cargo: "",
      is_principal: false,
    });
    onContatosChange();
  };

  const handleDeleteContato = async (contatoId: string) => {
    const { error } = await supabase
      .from("contatos_cliente")
      .delete()
      .eq("id", contatoId);

    if (error) {
      toast.error("Erro ao excluir contato");
      return;
    }

    toast.success("Contato excluído");
    onContatosChange();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contatos do Cliente</h3>
      
      {contatos.map((contato) => (
        <Card key={contato.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1 flex-1">
                <div className="font-medium">{contato.nome}</div>
                {contato.cargo && <div className="text-sm text-muted-foreground">{contato.cargo}</div>}
                {contato.email && <div className="text-sm">{contato.email}</div>}
                {contato.telefone && <div className="text-sm">{contato.telefone}</div>}
                {contato.sede && <div className="text-sm text-muted-foreground">Sede: {contato.sede}</div>}
                {contato.is_principal && (
                  <div className="text-xs text-primary font-medium">Contato Principal</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteContato(contato.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h4 className="font-medium">Adicionar Novo Contato</h4>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={novoContato.nome}
                  onChange={(e) => setNovoContato({ ...novoContato, nome: e.target.value })}
                  placeholder="Nome do contato"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={novoContato.email}
                  onChange={(e) => setNovoContato({ ...novoContato, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={novoContato.telefone}
                  onChange={(e) => setNovoContato({ ...novoContato, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <Label htmlFor="sede">Sede (Cidade/Estado)</Label>
                <Input
                  id="sede"
                  value={novoContato.sede}
                  onChange={(e) => setNovoContato({ ...novoContato, sede: e.target.value })}
                  placeholder="São Paulo/SP"
                />
              </div>

              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={novoContato.cargo}
                  onChange={(e) => setNovoContato({ ...novoContato, cargo: e.target.value })}
                  placeholder="Gerente Comercial"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_principal"
                  checked={novoContato.is_principal}
                  onCheckedChange={(checked) =>
                    setNovoContato({ ...novoContato, is_principal: checked as boolean })
                  }
                />
                <Label htmlFor="is_principal" className="font-normal">
                  Contato Principal
                </Label>
              </div>

              <Button onClick={handleAddContato} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Contato
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
