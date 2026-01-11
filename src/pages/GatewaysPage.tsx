import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Save, 
  Loader2,
  CheckCircle,
  Key,
  Shield,
  Zap
} from "lucide-react";

interface GatewaySettings {
  id: string;
  gateway_name: string;
  api_key: string;
  is_active: boolean;
}

export default function GatewaysPage() {
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [formData, setFormData] = useState({
    gateway_name: "duttyfy",
    api_key: "f622106dcaad42988d5ad465472010d1",
    is_active: true,
  });

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gateway_settings")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching gateway settings:", error);
    } else if (data) {
      setSettings(data);
      setFormData({
        gateway_name: data.gateway_name,
        api_key: data.api_key,
        is_active: data.is_active,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    if (settings?.id) {
      const { error } = await supabase
        .from("gateway_settings")
        .update({
          gateway_name: formData.gateway_name,
          api_key: formData.api_key,
          is_active: formData.is_active,
        })
        .eq("id", settings.id);

      if (error) {
        toast.error("Erro ao salvar configurações do gateway");
        console.error(error);
      } else {
        toast.success("Configurações do gateway salvas!");
        fetchSettings();
      }
    } else {
      const { error } = await supabase
        .from("gateway_settings")
        .insert({
          gateway_name: formData.gateway_name,
          api_key: formData.api_key,
          is_active: formData.is_active,
        });

      if (error) {
        toast.error("Erro ao criar configurações do gateway");
        console.error(error);
      } else {
        toast.success("Configurações do gateway salvas!");
        fetchSettings();
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary" />
            Gateways de Pagamento
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1.5">
            Configure suas integrações de pagamento PIX
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Alterações
        </Button>
      </div>

      <div className="grid gap-6 max-w-3xl">
        {/* Duttyfy Gateway */}
        <Card className="premium-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Duttyfy
                    <Badge className="bg-primary/20 text-primary border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Recomendado
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Gateway nativo com PIX instantâneo e taxas competitivas
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Chave da API
              </Label>
              <div className="flex gap-2">
                <Input
                  type={showKey ? "text" : "password"}
                  value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="Sua chave de API"
                  className="bg-muted/50 border-white/[0.06] font-mono"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Obtenha sua chave em app.duttyfy.com.br
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Como funciona a integração
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• PIX gerado instantaneamente via API</li>
                    <li>• QR Code e código Copia & Cola</li>
                    <li>• Confirmação automática de pagamento</li>
                    <li>• Webhooks para atualização de status</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${formData.is_active ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                <span className="text-sm text-foreground">
                  Status: {formData.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              {formData.is_active && (
                <Badge variant="outline" className="border-primary/50 text-primary">
                  Pronto para receber
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="premium-card border-border opacity-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg text-muted-foreground">
                  Outros Gateways
                </CardTitle>
                <CardDescription>
                  Mercado Pago, PagSeguro, Stripe - Em breve
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </AdminLayout>
  );
}
