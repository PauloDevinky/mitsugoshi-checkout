import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProducts, Product, CustomerReview } from "@/hooks/useProducts";
import { Json } from "@/integrations/supabase/types";
import { StudioHeader } from "@/components/checkout-builder/StudioHeader";
import { StudioSidebarNew } from "@/components/checkout-builder/StudioSidebarNew";
import { StudioCanvasNew } from "@/components/checkout-builder/StudioCanvasNew";
import { StudioWelcome } from "@/components/checkout-builder/StudioWelcome";

export interface CheckoutConfig {
  checkout_color: string;
  checkout_bg_color: string;
  checkout_banner_url: string | null;
  checkout_logo_url: string | null;
  logoWidth: number; // Nova: Largura do logo em px
  checkout_urgency_text: string;
  checkout_timer_minutes: number;
  checkout_timer_bg_color: string;
  checkout_timer_text_color: string;
  checkout_urgency_bar_bg_color: string;
  checkout_show_timer_countdown: boolean;
  checkout_template: string;
  checkout_show_timer: boolean;
  checkout_show_security_badges: boolean;
  checkout_show_social_proof: boolean;
  checkout_social_proof_count: number;
  checkout_social_proof_min: number; // Nova: Mínimo para prova social
  checkout_social_proof_max: number;
  checkout_order_bump_headline: string;
  checkout_order_bump_color: string;
  checkout_reviews: CustomerReview[];
  showReviews: boolean; // Nova: Toggle para mostrar reviews
  checkout_footer_text: string;
  customFooterImage: string | null; // Mantido para compatibilidade
  customFooterImages: string[]; // Nova: Array de imagens do rodapé
  checkout_font_family: string;
  checkout_border_radius: number;
  checkout_security_badges_type: "default" | "custom";
  checkout_security_badges_custom_url: string | null;
  shipping_options: Array<{ name: string; price: number }>;
}

export const defaultConfig: CheckoutConfig = {
  checkout_color: "#CC0854",
  checkout_bg_color: "#F3F5F8",
  checkout_banner_url: null,
  checkout_logo_url: null,
  logoWidth: 120,
  checkout_urgency_text: "OFERTA POR TEMPO LIMITADO!",
  checkout_timer_minutes: 15,
  checkout_timer_bg_color: "#CC0854",
  checkout_timer_text_color: "#ffffff",
  checkout_urgency_bar_bg_color: "#CC0854",
  checkout_show_timer_countdown: true,
  checkout_template: "template-a",
  checkout_show_timer: true,
  checkout_show_security_badges: true,
  checkout_show_social_proof: true,
  checkout_social_proof_count: 23,
  checkout_social_proof_min: 20,
  checkout_social_proof_max: 50,
  checkout_order_bump_headline: "Leve também...",
  checkout_order_bump_color: "#CC0854",
  checkout_reviews: [],
  showReviews: true,
  checkout_footer_text: "© 2026 Oferta Exclusiva. Todos os direitos reservados.",
  customFooterImage: null,
  customFooterImages: [],
  checkout_font_family: "Inter",
  checkout_border_radius: 12,
  checkout_security_badges_type: "default",
  checkout_security_badges_custom_url: null,
  shipping_options: [],
};

export type DeviceMode = "mobile" | "tablet" | "desktop";

export default function CheckoutBuilderPage() {
  const navigate = useNavigate();
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const { products, loading, fetchProducts } = useProducts();
  const [config, setConfig] = useState<CheckoutConfig>(defaultConfig);

  // Load product config when selected
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        setConfig({
          checkout_color: product.checkout_color || defaultConfig.checkout_color,
          checkout_bg_color: product.checkout_bg_color || defaultConfig.checkout_bg_color,
          checkout_banner_url: product.checkout_banner_url || null,
          checkout_logo_url: product.checkout_logo_url || null,
          logoWidth: (product as any).logoWidth || defaultConfig.logoWidth,
          checkout_urgency_text: product.checkout_urgency_text || defaultConfig.checkout_urgency_text,
          checkout_timer_minutes: product.checkout_timer_minutes || defaultConfig.checkout_timer_minutes,
          checkout_timer_bg_color: product.checkout_timer_bg_color || defaultConfig.checkout_timer_bg_color,
          checkout_timer_text_color: product.checkout_timer_text_color || defaultConfig.checkout_timer_text_color,
          checkout_urgency_bar_bg_color: (product as any).checkout_urgency_bar_bg_color || defaultConfig.checkout_urgency_bar_bg_color,
          checkout_show_timer_countdown: (product as any).checkout_show_timer_countdown ?? defaultConfig.checkout_show_timer_countdown,
          checkout_template: product.checkout_template || defaultConfig.checkout_template,
          checkout_show_timer: product.checkout_show_timer ?? defaultConfig.checkout_show_timer,
          checkout_show_security_badges: product.checkout_show_security_badges ?? defaultConfig.checkout_show_security_badges,
          checkout_show_social_proof: product.checkout_show_social_proof ?? defaultConfig.checkout_show_social_proof,
          checkout_social_proof_count: product.checkout_social_proof_count || defaultConfig.checkout_social_proof_count,
          checkout_social_proof_max: (product as any).checkout_social_proof_max || defaultConfig.checkout_social_proof_max,
          checkout_order_bump_headline: (product as any).checkout_order_bump_headline || defaultConfig.checkout_order_bump_headline,
          checkout_order_bump_color: (product as any).checkout_order_bump_color || defaultConfig.checkout_order_bump_color,
          checkout_reviews: product.checkout_reviews || [],
          showReviews: (product as any).showReviews ?? defaultConfig.showReviews,
          checkout_footer_text: product.checkout_footer_text || defaultConfig.checkout_footer_text,
          customFooterImage: (product as any).customFooterImage || null,
          checkout_font_family: defaultConfig.checkout_font_family,
          checkout_border_radius: defaultConfig.checkout_border_radius,
          checkout_security_badges_type: (product as any).checkout_security_badges_type || defaultConfig.checkout_security_badges_type,
          checkout_security_badges_custom_url: (product as any).checkout_security_badges_custom_url || null,
          shipping_options: product.shipping_options || [],
        });
      }
    }
  }, [selectedProductId, products]);

  const handleSave = async () => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
      return;
    }

    setSaving(true);
    
    try {
      // Preparar dados para salvar - todos os campos do checkout builder
      const updateData: Record<string, unknown> = {
        checkout_color: config.checkout_color,
        checkout_bg_color: config.checkout_bg_color,
        checkout_banner_url: config.checkout_banner_url,
        checkout_logo_url: config.checkout_logo_url,
        checkout_urgency_text: config.checkout_urgency_text,
        checkout_timer_minutes: config.checkout_timer_minutes,
        checkout_timer_bg_color: config.checkout_timer_bg_color,
        checkout_timer_text_color: config.checkout_timer_text_color,
        checkout_template: config.checkout_template,
        checkout_show_timer: config.checkout_show_timer,
        checkout_show_security_badges: config.checkout_show_security_badges,
        checkout_show_social_proof: config.checkout_show_social_proof,
        checkout_social_proof_count: config.checkout_social_proof_count,
        checkout_footer_text: config.checkout_footer_text,
        // Campos adicionados pela migration
        checkout_order_bump_headline: config.checkout_order_bump_headline,
        checkout_order_bump_color: config.checkout_order_bump_color,
        checkout_urgency_bar_bg_color: config.checkout_urgency_bar_bg_color,
        checkout_show_timer_countdown: config.checkout_show_timer_countdown,
        checkout_social_proof_max: config.checkout_social_proof_max,
        logoWidth: config.logoWidth,
        checkout_security_badges_type: config.checkout_security_badges_type,
        checkout_security_badges_custom_url: config.checkout_security_badges_custom_url,
        showReviews: config.showReviews,
        customFooterImage: config.customFooterImage,
      };

      // Converter arrays para JSON se necessário
      if (config.checkout_reviews && Array.isArray(config.checkout_reviews)) {
        updateData.checkout_reviews = config.checkout_reviews as unknown as Json;
      }
      
      // Salvar shipping_options e order_bumps do produto (se existirem no config)
      if (config.shipping_options && Array.isArray(config.shipping_options)) {
        updateData.shipping_options = config.shipping_options as unknown as Json;
      }
      
      // Order bumps são gerenciados na aba de produtos, não no checkout builder
      // Mas garantimos que as configurações de order bump sejam salvas

      const { error, data } = await supabase
        .from("products")
        .update(updateData as any)
        .eq("id", selectedProductId)
        .select();

      if (error) {
        console.error("Erro ao salvar checkout:", error);
        console.error("Erro completo:", JSON.stringify(error, null, 2));
        console.error("Dados tentados:", updateData);
        
        // Verificar se o erro é sobre coluna faltando
        const errorMessage = error.message || error.details || error.hint || JSON.stringify(error) || "Erro desconhecido";
        
        // Tentar diferentes padrões para encontrar o nome da coluna
        let columnName: string | null = null;
        
        // Padrão 1: "Could not find the 'columnName' column of 'products'"
        const pattern1 = /Could not find the ['"]([^'"]+)['"]\s+column/i;
        const match1 = errorMessage.match(pattern1);
        if (match1 && match1[1]) {
          columnName = match1[1];
        }
        
        // Padrão 2: "'columnName' column of 'products'"
        if (!columnName) {
          const pattern2 = /['"]([^'"]+)['"]\s+column\s+of/i;
          const match2 = errorMessage.match(pattern2);
          if (match2 && match2[1]) {
            columnName = match2[1];
          }
        }
        
        // Padrão 3: "column 'columnName'"
        if (!columnName) {
          const pattern3 = /column\s+['"]([^'"]+)['"]/i;
          const match3 = errorMessage.match(pattern3);
          if (match3 && match3[1]) {
            columnName = match3[1];
          }
        }
        
        // Padrão 4: "'columnName' of 'products'"
        if (!columnName) {
          const pattern4 = /['"]([^'"]+)['"]\s+of\s+['"]products['"]/i;
          const match4 = errorMessage.match(pattern4);
          if (match4 && match4[1]) {
            columnName = match4[1];
          }
        }
        
        if (errorMessage.includes("Could not find") || errorMessage.includes("column") || columnName) {
          const missingColumns = [
            'customFooterImage',
            'logoWidth', 
            'showReviews',
            'checkout_security_badges_type',
            'checkout_security_badges_custom_url',
            'checkout_order_bump_headline',
            'checkout_order_bump_color',
            'checkout_urgency_bar_bg_color',
            'checkout_show_timer_countdown',
            'checkout_social_proof_max'
          ];
          
          if (columnName) {
            toast.error(
              `Coluna '${columnName}' não existe no banco de dados.\n\nExecute o script SQL COMPLETE_FIX_CHECKOUT_COLUMNS.sql no Supabase SQL Editor para adicionar todas as 10 colunas necessárias.`,
              { duration: 15000 }
            );
          } else {
            toast.error(
              `Colunas faltando no banco de dados.\n\nExecute COMPLETE_FIX_CHECKOUT_COLUMNS.sql no Supabase SQL Editor.\n\nColunas necessárias: ${missingColumns.slice(0, 3).join(', ')}... (10 no total)`,
              { duration: 15000 }
            );
          }
        } else {
          toast.error(`Erro ao salvar: ${errorMessage.substring(0, 200)}`);
        }
      } else {
        console.log("Checkout salvo com sucesso:", data);
        toast.success("Design do checkout atualizado!");
        await fetchProducts();
      }
    } catch (err) {
      console.error("Erro inesperado ao salvar:", err);
      toast.error(`Erro inesperado: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const updateConfig = <K extends keyof CheckoutConfig>(key: K, value: CheckoutConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const selectProduct = (product: Product) => {
    setSelectedProductId(product.id);
  };

  const clearSelection = () => {
    setSelectedProductId("");
    setConfig(defaultConfig);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewLive = () => {
    if (selectedProduct) {
      window.open(`/pay/${selectedProduct.slug}`, "_blank");
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-neutral-950 flex flex-col">
      {/* Header Superior Fixo */}
      <StudioHeader
        productName={selectedProduct?.name}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
        onSave={handleSave}
        onViewLive={handleViewLive}
        onBack={handleBack}
        saving={saving}
        hasProduct={!!selectedProductId}
      />

      {/* Container Principal - Sidebar + Preview */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar Esquerda - Largura flexível para menu + conteúdo */}
        <div className="w-[600px] border-r border-white/10 bg-[#0A0A0A] flex-shrink-0 flex flex-col min-h-0">
          <StudioSidebarNew
            config={config}
            updateConfig={updateConfig}
            products={products}
            selectedProduct={selectedProduct}
            onSelectProduct={selectProduct}
            onClearSelection={clearSelection}
            loading={loading}
          />
        </div>

        {/* Canvas Central - Restante da tela */}
        <div className="flex-1 relative bg-[#111] overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        />
          <AnimatePresence mode="wait">
            {!selectedProductId ? (
              <StudioWelcome key="welcome" />
            ) : (
              <StudioCanvasNew
                key="canvas"
                config={config}
                product={selectedProduct}
                products={products}
                deviceMode={deviceMode}
                onDeviceModeChange={setDeviceMode}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
