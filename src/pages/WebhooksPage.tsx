import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Edit2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Send,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
}

const availableEvents = [
  { value: "payment.approved", label: "Pagamento Aprovado" },
  { value: "payment.refused", label: "Pagamento Recusado" },
  { value: "payment.refunded", label: "Reembolso" },
  { value: "payment.pending", label: "Pagamento Pendente" },
  { value: "lead.created", label: "Lead Criado" },
  { value: "lead.recovered", label: "Lead Recuperado" },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [sendingTest, setSendingTest] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: ["payment.approved"] as string[],
    is_active: true,
    product_filter: "all" as string, // "all" or product id
  });

  const fetchWebhooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("webhooks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching webhooks:", error);
      toast.error("Erro ao carregar webhooks");
    } else {
      setWebhooks(data || []);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name")
      .eq("status", "active")
      .order("name");
    setProducts(data || []);
  };

  useEffect(() => {
    fetchWebhooks();
    fetchProducts();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingWebhook) {
      const { error } = await supabase
        .from("webhooks")
        .update({
          name: formData.name,
          url: formData.url,
          events: formData.events,
          is_active: formData.is_active,
        })
        .eq("id", editingWebhook.id);

      if (error) {
        toast.error("Erro ao atualizar webhook");
      } else {
        toast.success("Webhook atualizado!");
        setSheetOpen(false);
        fetchWebhooks();
      }
    } else {
      const { error } = await supabase
        .from("webhooks")
        .insert({
          name: formData.name,
          url: formData.url,
          events: formData.events,
          is_active: formData.is_active,
        });

      if (error) {
        toast.error("Erro ao criar webhook");
      } else {
        toast.success("Webhook criado!");
        setSheetOpen(false);
        fetchWebhooks();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este webhook?")) return;

    const { error } = await supabase
      .from("webhooks")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao excluir webhook");
    } else {
      toast.success("Webhook excluído!");
      fetchWebhooks();
    }
  };

  const toggleActive = async (webhook: WebhookConfig) => {
    const { error } = await supabase
      .from("webhooks")
      .update({ is_active: !webhook.is_active })
      .eq("id", webhook.id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      fetchWebhooks();
    }
  };

  const sendTestWebhook = async (webhook: WebhookConfig) => {
    setSendingTest(webhook.id);
    
    const mockPayload = {
      event: "payment.approved",
      transaction_id: "test-" + Date.now(),
      customer_name: "Cliente Teste",
      customer_email: "teste@exemplo.com",
      customer_whatsapp: "(11) 99999-9999",
      product_name: "Produto de Teste",
      amount: 19700,
      payment_method: "pix",
      utm_source: "test",
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.functions.invoke("webhook-dispatcher", {
        body: {
          webhook_url: webhook.url,
          payload: mockPayload,
        },
      });

      if (error) throw error;

      toast.success("Teste enviado com sucesso!");
      
      // Update last_triggered_at
      await supabase
        .from("webhooks")
        .update({ last_triggered_at: new Date().toISOString() })
        .eq("id", webhook.id);
      
      fetchWebhooks();
    } catch (error) {
      console.error("Error sending test:", error);
      toast.error("Erro ao enviar teste");
    } finally {
      setSendingTest(null);
    }
  };

  const openNewSheet = () => {
    setEditingWebhook(null);
    setFormData({
      name: "",
      url: "",
      events: ["payment.approved"],
      is_active: true,
      product_filter: "all",
    });
    setSheetOpen(true);
  };

  const openEditSheet = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      is_active: webhook.is_active,
      product_filter: "all",
    });
    setSheetOpen(true);
  };

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-3">
            <Webhook className="w-6 h-6 text-primary" />
            Webhooks
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1.5">
            Configure endpoints para receber notificações de eventos
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={fetchWebhooks} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
          <Button onClick={openNewSheet} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Webhook
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium">Nome</TableHead>
              <TableHead className="text-muted-foreground font-medium">URL</TableHead>
              <TableHead className="text-muted-foreground font-medium">Eventos</TableHead>
              <TableHead className="text-muted-foreground font-medium">Último Disparo</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Carregando webhooks...
                </TableCell>
              </TableRow>
            ) : webhooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Nenhum webhook configurado
                </TableCell>
              </TableRow>
            ) : (
              webhooks.map((webhook) => (
                <TableRow key={webhook.id} className="border-white/[0.06]">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={webhook.is_active}
                        onCheckedChange={() => toggleActive(webhook)}
                      />
                      {webhook.is_active ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {webhook.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                    {webhook.url}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.slice(0, 2).map(event => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                      {webhook.events.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{webhook.events.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {webhook.last_triggered_at
                      ? format(new Date(webhook.last_triggered_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : "—"
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => sendTestWebhook(webhook)}
                        disabled={sendingTest === webhook.id}
                        title="Enviar Teste"
                      >
                        {sendingTest === webhook.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditSheet(webhook)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(webhook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sheet for create/edit */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-card border-border w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editingWebhook ? "Editar Webhook" : "Novo Webhook"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Meu Webhook"
                className="admin-input"
              />
            </div>

            <div className="space-y-2">
              <Label>URL do Endpoint *</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://seu-servidor.com/webhook"
                className="admin-input"
              />
            </div>

            <div className="space-y-2">
              <Label>Filtrar por Produto</Label>
              <Select 
                value={formData.product_filter} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, product_filter: value }))}
              >
                <SelectTrigger className="admin-input h-auto">
                  <SelectValue placeholder="Todos os produtos" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Dispara apenas para vendas deste produto
              </p>
            </div>

            <div className="space-y-3">
              <Label>Eventos</Label>
              <div className="space-y-2">
                {availableEvents.map(event => (
                  <div key={event.value} className="flex items-center gap-3">
                    <Checkbox
                      id={event.value}
                      checked={formData.events.includes(event.value)}
                      onCheckedChange={() => toggleEvent(event.value)}
                    />
                    <label 
                      htmlFor={event.value}
                      className="text-sm text-foreground cursor-pointer"
                    >
                      {event.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Webhook ativo</Label>
            </div>

            <Button onClick={handleSave} className="w-full">
              {editingWebhook ? "Salvar Alterações" : "Criar Webhook"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
