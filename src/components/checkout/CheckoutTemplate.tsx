import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ChevronDown,
  Check,
  Clock,
  Star,
  BadgeCheck,
  ShoppingBag,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckoutConfig } from "@/pages/CheckoutBuilderPage";
import type { Product } from "@/hooks/useProducts";

interface CheckoutTemplateProps {
  config: CheckoutConfig;
  product?: Product;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: {
    name: string;
    email: string;
    whatsapp: string;
    cpf: string;
    cep: string;
    street: string;
    number: string;
    complement: string;
    city: string;
    state: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    whatsapp: string;
    cpf: string;
    cep: string;
    street: string;
    number: string;
    complement: string;
    city: string;
    state: string;
  }>>;
  selectedShipping: number;
  setSelectedShipping: (index: number) => void;
  paymentMethod: "pix" | "card";
  setPaymentMethod: (method: "pix" | "card") => void;
  selectedBumps: Set<string>;
  toggleBump: (productId: string) => void;
  shippingOptions: Array<{ name: string; price: number }>;
  orderBumps: Array<{ product_id: string; discount_percent: number; title?: string; description?: string }>;
  bumpProducts: Array<{ id: string; name: string; price_sale: number; image_url: string | null }>;
  totals: {
    subtotal: number;
    shipping: number;
    bumps: number;
    total: number;
  };
  formatPrice: (value: number) => string;
  onContinueToStep2?: () => void;
  onCepLookup?: () => void;
  onPayment?: () => void;
  processingPayment?: boolean;
  showSocialProof?: boolean;
  socialProofCount?: number;
  children?: React.ReactNode;
}

export function CheckoutTemplate({
  config,
  product,
  currentStep,
  setCurrentStep,
  formData,
  setFormData,
  selectedShipping,
  setSelectedShipping,
  paymentMethod,
  setPaymentMethod,
  selectedBumps,
  toggleBump,
  shippingOptions,
  orderBumps,
  bumpProducts,
  totals,
  formatPrice,
  onContinueToStep2,
  onCepLookup,
  onPayment,
  processingPayment = false,
  showSocialProof = false,
  socialProofCount = 0,
  children,
}: CheckoutTemplateProps) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const primaryColor = config.checkout_color || "#CC0854";
  const urgencyBarColor = config.checkout_urgency_bar_bg_color || primaryColor;
  const timerTextColor = config.checkout_timer_text_color || "#ffffff";
  const logoWidth = config.logoWidth || 120;
  const showReviews = config.showReviews ?? true;
  const customFooterImage = config.customFooterImage;
  const footerText = config.checkout_footer_text || null; // Removido valor padrão - só mostra se configurado

  const productName = product?.name || "Produto Demo";
  const productPrice = product?.price_sale || 197;
  const productOriginalPrice = product?.price_original || 297;
  const productImage = product?.image_url;

  useEffect(() => {
    setTimerSeconds(config.checkout_timer_minutes * 60);
  }, [config.checkout_timer_minutes]);

  useEffect(() => {
    if (timerSeconds <= 0 || !config.checkout_show_timer_countdown) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds, config.checkout_show_timer_countdown]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  const stepLabels = ["Dados", "Entrega", "Pagamento"];

  return (
    <div className="font-satoshi antialiased text-slate-900 bg-gray-50 min-h-screen checkout-container">
      {/* 1. Barra de Aviso com Timer */}
      {config.checkout_urgency_text && (
        <div
          className="w-full py-3 px-4 text-sm font-semibold flex items-center justify-center gap-3"
          style={{ backgroundColor: urgencyBarColor, color: timerTextColor }}
        >
          <span>{config.checkout_urgency_text}</span>
          {config.checkout_show_timer_countdown && (
            <div className="flex items-center gap-1">
              <span className="font-mono font-bold bg-white/20 px-2 py-1 rounded text-sm">
                {formatTimer(timerSeconds).minutes}
              </span>
              <span className="text-white/60">:</span>
              <span className="font-mono font-bold bg-white/20 px-2 py-1 rounded text-sm">
                {formatTimer(timerSeconds).seconds}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 overflow-hidden"
        >
          {/* 2. Cabeçalho - Logo + Valor/Carrinho + Sacola */}
          <header className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                {config.checkout_logo_url ? (
                  <img
                    src={config.checkout_logo_url}
                    alt="Logo"
                    style={{ width: `${logoWidth}px`, height: 'auto' }}
                    className="object-contain"
                  />
                ) : (
                  <h1 className="text-lg font-medium" style={{ color: primaryColor }}>
                    {productName.split(' ')[0]}
                  </h1>
                )}
              </div>

              {/* Valor + Ver Carrinho + Sacola */}
              <div className="flex items-center gap-3">
                {/* Valor e Ver Carrinho */}
                <button
                  onClick={() => setSummaryOpen(!summaryOpen)}
                  className="flex flex-col items-end hover:opacity-80 transition-opacity"
                >
                  <span className="text-base font-bold text-gray-900">
                    {formatPrice(totals.total)}
                  </span>
                  <span className="text-xs text-gray-500">ver carrinho</span>
                </button>

                {/* Sacola com Contador e Seta */}
                <button
                  onClick={() => setSummaryOpen(!summaryOpen)}
                  className="relative flex flex-col items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="relative">
                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 text-gray-400 transition-transform duration-300",
                      summaryOpen && "rotate-180"
                    )}
                  />
                </button>
              </div>
            </div>
          </header>

          {/* Resumo do Pedido - Aparece abaixo do cabeçalho quando clicado */}
          <AnimatePresence>
            {summaryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden border-b border-gray-200 bg-gray-50"
              >
                <div className="px-6 pb-5 pt-4 space-y-4">
                  {/* Product Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{productName}</p>
                      {productOriginalPrice > productPrice && (
                        <p className="text-xs text-gray-400 line-through mt-0.5">
                          {formatPrice(productOriginalPrice)}
                        </p>
                      )}
                      <p className="text-base mt-1" style={{ color: primaryColor }}>
                        {formatPrice(productPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="pt-3 border-t border-gray-100 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="text-gray-900">{formatPrice(totals.subtotal)}</span>
                    </div>
                    {totals.shipping > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Frete</span>
                        <span className="text-gray-900">{formatPrice(totals.shipping)}</span>
                      </div>
                    )}
                    {totals.shipping === 0 && shippingOptions.length > 0 && (
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Frete</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
                          GRÁTIS
                        </span>
                      </div>
                    )}
                    {totals.bumps > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Adicionais</span>
                        <span className="text-gray-900">{formatPrice(totals.bumps)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-gray-700">Total</span>
                        <span className="text-xl text-gray-900">
                          {formatPrice(totals.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Banner */}
          {config.checkout_banner_url && (
            <div className="w-full block">
              <img
                src={config.checkout_banner_url}
                alt="Banner Promocional"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* 4. Barra de Progresso e Steps - Abaixo do Banner */}
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-center gap-3 mb-3">
              {/* Steps Numerados (sem títulos) */}
              {stepLabels.map((label, index) => {
                const step = index + 1;
                const isActive = currentStep === step;
                const isComplete = currentStep > step;
                return (
                  <div key={label} className="flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                        isComplete
                          ? "bg-emerald-500 text-white"
                          : isActive
                          ? "text-white"
                          : "bg-gray-200 text-gray-400"
                      )}
                      style={{
                        backgroundColor: isComplete ? undefined : isActive ? primaryColor : undefined,
                      }}
                    >
                      {isComplete ? <Check className="w-4 h-4" /> : step}
                    </div>
                    {index < stepLabels.length - 1 && (
                      <div
                        className={cn(
                          "w-12 h-0.5 mx-2 transition-all",
                          isComplete ? "bg-emerald-500" : "bg-gray-200"
                        )}
                        style={{
                          backgroundColor: isComplete ? undefined : isActive ? primaryColor : undefined,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Barra de Progresso */}
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: primaryColor }}
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep - 1) / (stepLabels.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* 5. Formulário com Abas Numeradas e Animações */}
          <div className="px-6 pt-4 pb-6 bg-gray-50">
            {/* Título da Etapa + Ambiente 100% Seguro - Mesma Linha */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {stepLabels[currentStep - 1]}
              </h2>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded text-gray-600">
                <span className="text-xs">Ambiente 100% Seguro</span>
                <Shield className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              </div>
            </div>

            {/* Form Content - Largura total alinhada */}
            <div className="w-full">
              {children}
            </div>
          </div>

          {/* F. ZONA DE CONFIANÇA - Reviews (Condicional) */}
          {showReviews && config.checkout_reviews && config.checkout_reviews.length > 0 && (
            <div className="px-6 py-8 border-t border-gray-200 bg-gray-50">
              <h3 className="text-center text-lg font-black text-gray-900 mb-6">
                O que nossos clientes dizem
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.checkout_reviews.map((review, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start gap-3">
                      {review.photo_url ? (
                        <img
                          src={review.photo_url}
                          alt={review.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm font-bold">
                            {review.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{review.name || "Cliente"}</span>
                          <BadgeCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-3.5 h-3.5",
                                star <= (review.rating || 5)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{review.text || "Excelente produto!"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Caixa de Segurança de Dados (após reviews) */}
          <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
            <div className="space-y-3">
              {/* Header com ícone de cadeado */}
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  Usamos seus dados de forma segura para garantir a sua satisfação:
                </p>
              </div>

              {/* Lista de benefícios com selos de verificado */}
              <div className="space-y-2 pl-6">
                <div className="flex items-start gap-2">
                  <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <p className="text-sm text-gray-600">
                    Enviar o seu comprovante de compra e pagamento;
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <p className="text-sm text-gray-600">
                    Ativar sua devolução caso não fique satisfeito;
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <p className="text-sm text-gray-600">
                    Acompanhar o andamento do seu pedido.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Rodapé (por último) */}
          <footer className="px-6 py-5 border-t border-gray-200 bg-gray-50">
            <div className="space-y-3">
              {/* Custom Footer Images (Selos de Pagamento) */}
              {((config.customFooterImages && config.customFooterImages.length > 0) || config.customFooterImage) && (
                <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
                  {config.customFooterImages && config.customFooterImages.length > 0 ? (
                    config.customFooterImages.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Selo ${idx + 1}`}
                        className="h-8 object-contain opacity-70"
                      />
                    ))
                  ) : (
                    <img
                      src={config.customFooterImage || ""}
                      alt="Selos de Pagamento"
                      className="max-w-full h-auto opacity-70"
                    />
                  )}
                </div>
              )}

              {/* Footer Text */}
              {config.checkout_footer_text && (
                <p className="text-xs text-gray-400 text-center">
                  {config.checkout_footer_text}
                </p>
              )}
            </div>
          </footer>
        </motion.div>
      </div>

      {/* Social Proof Notification */}
    </div>
  );
}
