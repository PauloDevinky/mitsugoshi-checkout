import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckoutTemplate } from "@/components/checkout/CheckoutTemplate";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import type { CheckoutConfig, DeviceMode } from "@/pages/CheckoutBuilderPage";
import type { Product } from "@/hooks/useProducts";

interface StudioCanvasNewProps {
  config: CheckoutConfig;
  product?: Product;
  products?: Product[]; // Lista de todos os produtos para buscar bumps
  deviceMode: DeviceMode;
  onDeviceModeChange?: (mode: DeviceMode) => void;
}

type ZoomLevel = 50 | 75 | 100;

export function StudioCanvasNew({ config, product, products = [], deviceMode, onDeviceModeChange }: StudioCanvasNewProps) {
  const [zoom, setZoom] = useState<ZoomLevel>(100);
  const [currentStep, setCurrentStep] = useState(3); // Mostrar step 3 (pagamento) por padrão para ver order bump
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    cpf: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
  });

  const zoomScale = zoom / 100;
  const isMobile = deviceMode === "mobile";

  // iPhone dimensions
  const phoneWidth = 375;
  const phoneHeight = 812;

  // Calcular totais
  const shippingOptions = product?.shipping_options || config.shipping_options || [];
  const orderBumps = product?.order_bumps || [];
  
  // Buscar produtos reais de bump da lista de produtos
  const bumpProducts = useMemo(() => {
    return orderBumps.map(bump => {
      const bumpProduct = products.find(p => p.id === bump.product_id);
      if (bumpProduct) {
        return {
          id: bumpProduct.id,
          name: bump.title || bumpProduct.name,
          price_sale: bumpProduct.price_sale,
          image_url: bumpProduct.image_url,
        };
      }
      // Fallback se produto não encontrado
      return {
        id: bump.product_id,
        name: bump.title || `Produto Adicional`,
        price_sale: 50,
        image_url: null,
      };
    });
  }, [orderBumps, products]);

  const totals = useMemo(() => {
    const subtotal = product?.price_sale || 0;
    const shipping = shippingOptions[selectedShipping]?.price || 0;
    const bumps = Array.from(selectedBumps).reduce((acc, bumpId) => {
      const bump = orderBumps.find(b => b.product_id === bumpId);
      if (bump) {
        const bumpProduct = bumpProducts.find(p => p.id === bump.product_id);
        if (bumpProduct) {
          const discount = (bumpProduct.price_sale * bump.discount_percent) / 100;
          acc += bumpProduct.price_sale - discount;
        }
      }
      return acc;
    }, 0);
    return {
      subtotal,
      shipping,
      bumps,
      total: subtotal + shipping + bumps,
    };
  }, [product, shippingOptions, selectedShipping, selectedBumps, orderBumps, bumpProducts]);

  const formatPrice = (value: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const toggleBump = (productId: string) => {
    setSelectedBumps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Controles acima do canvas */}
      <motion.div 
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#0A0A0A]/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Device Toggle */}
        {onDeviceModeChange && (
          <>
            <button
              onClick={() => onDeviceModeChange("mobile")}
              className={cn(
                "p-2 rounded transition-colors",
                deviceMode === "mobile" 
                  ? "bg-[#CC0854] text-white" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              )}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeviceModeChange("desktop")}
              className={cn(
                "p-2 rounded transition-colors",
                deviceMode === "desktop" 
                  ? "bg-[#CC0854] text-white" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              )}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
          </>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(50)}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              zoom === 50 
                ? "bg-[#CC0854] text-white" 
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            )}
          >
            50%
          </button>
          <button
            onClick={() => setZoom(75)}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              zoom === 75 
                ? "bg-[#CC0854] text-white" 
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            )}
          >
            75%
          </button>
          <button
            onClick={() => setZoom(100)}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              zoom === 100 
                ? "bg-[#CC0854] text-white" 
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            )}
          >
            100%
          </button>
        </div>
      </motion.div>

      {/* Preview Container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-[#1a1a1a]">
        {/* Simulação de navegador no desktop */}
        {!isMobile && (
          <div className="absolute top-4 left-4 right-4 h-12 bg-[#2a2a2a] rounded-t-lg border-b border-white/10 flex items-center gap-2 px-4 z-10">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 mx-4 h-7 bg-[#1a1a1a] rounded-lg border border-white/10 flex items-center px-3">
              <span className="text-xs text-zinc-400 truncate">https://checkout.exemplo.com/pay/produto</span>
            </div>
          </div>
        )}
        
        <motion.div
          className={cn(
            "relative flex items-center justify-center",
            isMobile && "pt-12", // Espaço para não cobrir o notch
            !isMobile && "w-full h-full mt-16" // Espaço para barra do navegador
          )}
          style={{
            transform: isMobile ? `scale(${zoomScale})` : "none",
            transformOrigin: "center center",
            width: isMobile ? `${phoneWidth}px` : "100%",
            height: isMobile ? `${phoneHeight}px` : "calc(100% - 4rem)",
            maxWidth: isMobile ? `${phoneWidth}px` : "100%",
            maxHeight: isMobile ? `${phoneHeight}px` : "calc(100% - 4rem)",
          }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: isMobile ? zoomScale : 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
        >
          {/* iPhone Frame - apenas no mobile */}
          {isMobile && (
            <div 
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                width: `${phoneWidth + 40}px`,
                height: `${phoneHeight + 80}px`,
                margin: "-20px -20px -40px -20px",
              }}
            >
              {/* Notch */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0A0A0A] rounded-b-2xl z-20"
                style={{ boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.3)" }}
              />
              
              {/* Frame Border */}
              <div 
                className="absolute inset-0 rounded-[3rem] border-8 border-[#0A0A0A] z-10"
                style={{
                  boxShadow: `
                    0 0 0 1px rgba(255,255,255,0.1),
                    0 25px 50px -12px rgba(0, 0, 0, 0.8),
                    inset 0 0 0 1px rgba(255,255,255,0.05)
                  `
                }}
              />
            </div>
          )}

          {/* Preview Content - Componente REAL */}
          <div 
            className={cn(
              "bg-white overflow-hidden relative",
              isMobile ? "rounded-[2.5rem]" : "rounded-xl w-full h-full"
            )}
            style={{
              width: isMobile ? `${phoneWidth}px` : "100%",
              height: isMobile ? `${phoneHeight}px` : "100%",
              maxHeight: isMobile ? `${phoneHeight}px` : "100%",
              boxShadow: isMobile 
                ? undefined 
                : "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Scrollable Inner Container */}
            <div className="h-full overflow-y-auto overflow-x-hidden">
              <CheckoutTemplate
                key={`${config.checkout_color}-${config.checkout_order_bump_color}-${config.checkout_order_bump_headline}`}
                config={config}
                product={product}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                formData={formData}
                setFormData={setFormData}
                selectedShipping={selectedShipping}
                setSelectedShipping={setSelectedShipping}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                selectedBumps={selectedBumps}
                toggleBump={toggleBump}
                shippingOptions={shippingOptions}
                orderBumps={orderBumps}
                bumpProducts={bumpProducts}
                totals={totals}
                formatPrice={formatPrice}
                showSocialProof={config.checkout_show_social_proof}
                socialProofCount={config.checkout_social_proof_count}
              >
                <CheckoutForm
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  formData={formData}
                  setFormData={setFormData}
                  selectedShipping={selectedShipping}
                  setSelectedShipping={setSelectedShipping}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  selectedBumps={selectedBumps}
                  toggleBump={toggleBump}
                  shippingOptions={shippingOptions}
                  orderBumps={orderBumps}
                  bumpProducts={bumpProducts}
                  primaryColor={config.checkout_color}
                  actionColor={config.checkout_color}
                  orderBumpColor={config.checkout_order_bump_color}
                  orderBumpHeadline={config.checkout_order_bump_headline}
                  showSocialProof={config.checkout_show_social_proof}
                  socialProofCount={config.checkout_social_proof_count}
                  socialProofMin={(config as any).checkout_social_proof_min}
                  socialProofMax={config.checkout_social_proof_max}
                  reviews={config.checkout_reviews}
                  showReviews={config.showReviews ?? true}
                  footerText={config.checkout_footer_text}
                  customFooterImage={config.customFooterImage}
                  onContinueToStep2={() => setCurrentStep(2)}
                  onCepLookup={() => {}}
                  onPayment={() => {}}
                  processingPayment={false}
                  formatPrice={formatPrice}
                />
              </CheckoutTemplate>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
