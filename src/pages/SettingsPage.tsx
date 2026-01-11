import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { 
  Settings, 
  Save, 
  Globe, 
  Image, 
  Building2,
  Loader2,
  ExternalLink
} from "lucide-react";

interface PlatformSettings {
  id: string;
  platform_name: string;
  platform_logo_url: string | null;
  page_title: string;
  dashboard_banner_url: string | null;
  custom_domain: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    platform_name: "NEXUS",
    platform_logo_url: "" as string | null,
    page_title: "NEXUS Checkout",
    dashboard_banner_url: "" as string | null,
    custom_domain: "",
  });

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching settings:", error);
      toast.error("Erro ao carregar configurações");
    } else if (data) {
      setSettings(data);
      setFormData({
        platform_name: data.platform_name || "NEXUS",
        platform_logo_url: data.platform_logo_url,
        page_title: data.page_title || "NEXUS Checkout",
        dashboard_banner_url: data.dashboard_banner_url,
        custom_domain: data.custom_domain || "",
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
        .from("platform_settings")
        .update({
          platform_name: formData.platform_name,
          platform_logo_url: formData.platform_logo_url || null,
          page_title: formData.page_title,
          dashboard_banner_url: formData.dashboard_banner_url || null,
          custom_domain: formData.custom_domain || null,
        })
        .eq("id", settings.id);

      if (error) {
        toast.error("Erro ao salvar configurações");
        console.error(error);
      } else {
        toast.success("Configurações salvas!");
        fetchSettings();
      }
    } else {
      const { error } = await supabase
        .from("platform_settings")
        .insert({
          platform_name: formData.platform_name,
          platform_logo_url: formData.platform_logo_url || null,
          page_title: formData.page_title,
          dashboard_banner_url: formData.dashboard_banner_url || null,
          custom_domain: formData.custom_domain || null,
        });

      if (error) {
        toast.error("Erro ao criar configurações");
        console.error(error);
      } else {
        toast.success("Configurações salvas!");
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
            <Settings className="w-6 h-6 text-primary" />
            Configurações
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1.5">
            Personalize sua plataforma de checkout
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
        {/* Identity */}
        <Card className="premium-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5 text-primary" />
              Identidade da Plataforma
            </CardTitle>
            <CardDescription>
              Configure o nome e a identidade visual da sua plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo da Plataforma</Label>
              <ImageUpload
                value={formData.platform_logo_url}
                onChange={(url) => setFormData(prev => ({ ...prev, platform_logo_url: url }))}
                folder="logos"
                aspectRatio="logo"
              />
            </div>

            <div className="space-y-2">
              <Label>Nome da Plataforma</Label>
              <Input
                value={formData.platform_name}
                onChange={(e) => setFormData(prev => ({ ...prev, platform_name: e.target.value }))}
                placeholder="NEXUS"
                className="bg-muted border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Título da Página (SEO)</Label>
              <Input
                value={formData.page_title}
                onChange={(e) => setFormData(prev => ({ ...prev, page_title: e.target.value }))}
                placeholder="NEXUS Checkout"
                className="bg-muted border-border"
              />
              <p className="text-xs text-muted-foreground">
                Este título aparecerá na aba do navegador
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Banner */}
        <Card className="premium-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="w-5 h-5 text-primary" />
              Banner do Dashboard
            </CardTitle>
            <CardDescription>
              Adicione um banner promocional ou anúncio no topo do dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Imagem do Banner</Label>
              <ImageUpload
                value={formData.dashboard_banner_url}
                onChange={(url) => setFormData(prev => ({ ...prev, dashboard_banner_url: url }))}
                folder="banners"
                aspectRatio="banner"
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 1200x200 pixels
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custom Domain */}
        <Card className="premium-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-primary" />
              Domínio Personalizado
            </CardTitle>
            <CardDescription>
              Configure seu próprio domínio para a plataforma de checkout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>CNAME / Domínio</Label>
              <Input
                value={formData.custom_domain}
                onChange={(e) => setFormData(prev => ({ ...prev, custom_domain: e.target.value }))}
                placeholder="checkout.minhaloja.com"
                className="bg-muted border-border"
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-3 border border-border">
              <p className="text-sm font-medium text-foreground">
                Instruções de Configuração DNS:
              </p>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>1. Acesse o painel DNS do seu provedor de domínio</p>
                <p>2. Adicione um registro CNAME apontando para:</p>
                <code className="block bg-muted p-2 rounded text-primary font-mono border border-border">
                  checkout.mitsugoshi.app
                </code>
                <p>3. Aguarde a propagação do DNS (até 48h)</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 mt-2">
                <ExternalLink className="w-3 h-3" />
                Ver documentação completa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
