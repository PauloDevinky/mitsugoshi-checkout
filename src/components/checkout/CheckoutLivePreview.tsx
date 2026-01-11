import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Shield, 
  Truck, 
  CreditCard, 
  QrCode, 
  Check,
  Users,
  Star,
  ChevronLeft,
  Award,
  BadgeCheck,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckoutConfig } from "@/pages/CheckoutBuilderPage";
import type { Product } from "@/hooks/useProducts";

interface CheckoutLivePreviewProps {
  config: CheckoutConfig;
  product?: Product;
}

export function CheckoutLivePreview({ config, product }: CheckoutLivePreviewProps) {
  const template = config.checkout_template || "template-a";
  
  if (template === "template-b") {
    return <TemplateTikTok config={config} product={product} />;
  }
  
  if (template === "template-c") {
    return <TemplateMinimal config={config} product={product} />;
  }
  
  return <TemplateEnterprise config={config} product={product} />;
}

// ============================================
// TEMPLATE A - Enterprise Grade (Premium Design)
// ============================================
function TemplateEnterprise({ config, product }: CheckoutLivePreviewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [selectedBumps, setSelectedBumps] = useState<number[]>([]);
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "", cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" });

  // Prova Social: número aleatório entre 10 e o máximo definido
  const socialProofCount = useMemo(() => {
    const max = config.checkout_social_proof_max || 50;
    return Math.floor(Math.random() * (max - 10)) + 10;
  }, [config.checkout_social_proof_max]);

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
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const productName = product?.name || "Produto Demo";
  const productPrice = product?.price_sale || 197;
  const productOriginalPrice = product?.price_original || 297;
  const productImage = product?.image_url;
  const shippingOptions = product?.shipping_options || [];
  const orderBumps = product?.order_bumps || [];

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const stepLabels = ["Dados", "Entrega", "Pagamento"];

  const toggleBump = (index: number) => {
    setSelectedBumps(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Calculate total with bumps and shipping
  const shippingCost = shippingOptions.length > 0 ? (shippingOptions[selectedShipping]?.price || 0) : 0;
  const bumpsTotal = selectedBumps.reduce((acc, idx) => acc + ((orderBumps[idx] as any)?.price || 19.90), 0);
  const total = productPrice + shippingCost + bumpsTotal;

  // Premium page background - Clean White Mode
  const pageBackground = "#F3F5F8";

  // Input focus ring color with opacity
  const focusRingColor = `${config.checkout_color}33`;

  return (
    <div 
      className="min-h-full"
      style={{ 
        backgroundColor: pageBackground,
        fontFamily: config.checkout_font_family,
      }}
    >
      {/* Urgency Top Bar - Full Width */}
      {config.checkout_urgency_text && (
        <motion.div
          className="w-full py-3 px-4 text-center font-semibold text-sm flex items-center justify-center gap-2"
          style={{ 
            backgroundColor: config.checkout_urgency_bar_bg_color || config.checkout_color,
            color: config.checkout_timer_text_color || "#ffffff"
          }}
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {config.checkout_show_timer_countdown && (
            <>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                {formatTimer(timerSeconds)}
              </span>
            </>
          )}
          <span>{config.checkout_urgency_text}</span>
        </motion.div>
      )}

      {/* Promotional Banner */}
      {config.checkout_banner_url && (
        <motion.img 
          src={config.checkout_banner_url} 
          alt="Banner Promocional" 
          className="w-full object-cover max-h-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        />
      )}

      {/* Main Container - Centered Premium Card */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* The Premium Card */}
        <motion.div 
          className="bg-white overflow-hidden"
          style={{ 
            borderRadius: `${Math.min(config.checkout_border_radius + 8, 32)}px`,
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)"
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Card Header with Logo */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.checkout_logo_url ? (
                <img src={config.checkout_logo_url} alt="Logo" className="h-9 object-contain" />
              ) : (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" 
                  style={{ backgroundColor: config.checkout_color }}
                >
                  <span className="text-white text-sm font-bold">{productName.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900 text-sm">Checkout Seguro</p>
                <p className="text-xs text-slate-500">Pagamento 100% protegido</p>
              </div>
            </div>
            
            {/* Cart Summary Button */}
            <button 
              onClick={() => setCartOpen(!cartOpen)} 
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span 
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white" 
                  style={{ backgroundColor: config.checkout_color }}
                >
                  1
                </span>
              </div>
              {cartOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Cart Summary Dropdown */}
          <AnimatePresence>
            {cartOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                className="border-b border-slate-100 bg-slate-50/80 overflow-hidden"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
                      {productImage ? (
                        <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{productName}</p>
                      {productOriginalPrice > productPrice && (
                        <p className="text-xs text-slate-400 line-through">{formatPrice(productOriginalPrice)}</p>
                      )}
                      <p className="text-lg font-bold" style={{ color: config.checkout_color }}>
                        {formatPrice(productPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Stepper */}
          <div className="px-6 py-5 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              {stepLabels.map((label, index) => {
                const step = index + 1;
                const isActive = currentStep === step;
                const isComplete = currentStep > step;
                return (
                  <div key={label} className="flex-1 flex flex-col items-center relative">
                    {/* Connector Line */}
                    {index < stepLabels.length - 1 && (
                      <div 
                        className="absolute top-4 left-1/2 w-full h-0.5"
                        style={{ 
                          backgroundColor: isComplete ? config.checkout_color : "#e2e8f0"
                        }}
                      />
                    )}
                    <button
                      onClick={() => step <= currentStep && setCurrentStep(step)}
                      disabled={step > currentStep}
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all mb-2 relative z-10",
                        !isComplete && !isActive && "bg-slate-100 text-slate-400"
                      )}
                      style={{ 
                        backgroundColor: isComplete || isActive ? config.checkout_color : undefined,
                        color: isComplete || isActive ? "#ffffff" : undefined,
                        boxShadow: isActive ? `0 0 0 4px ${focusRingColor}` : undefined 
                      }}
                    >
                      {isComplete ? <Check className="w-4 h-4" /> : step}
                    </button>
                    <span className={cn(
                      "text-xs font-medium",
                      isActive ? "text-slate-900" : "text-slate-400"
                    )}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full" 
                style={{ backgroundColor: config.checkout_color }} 
                initial={{ width: "0%" }} 
                animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            {/* Step 1 - Personal Data */}
            {currentStep === 1 && (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="p-6 space-y-5"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Seus Dados</h2>
                  <p className="text-sm text-slate-500 mt-1">Preencha para continuar a compra</p>
                </div>
                
                <div className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Digite seu nome completo" 
                      value={formData.name} 
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                      className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base transition-all bg-slate-50/50"
                      style={{
                        borderColor: formData.name ? config.checkout_color : undefined,
                        boxShadow: formData.name ? `0 0 0 3px ${focusRingColor}` : undefined
                      }}
                    />
                  </div>
                  
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">E-mail</label>
                    <input 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={formData.email} 
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
                      className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base transition-all bg-slate-50/50"
                      style={{
                        borderColor: formData.email ? config.checkout_color : undefined,
                        boxShadow: formData.email ? `0 0 0 3px ${focusRingColor}` : undefined
                      }}
                    />
                  </div>
                  
                  {/* WhatsApp Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp</label>
                    <input 
                      type="tel" 
                      placeholder="(00) 00000-0000" 
                      value={formData.whatsapp} 
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))} 
                      className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base transition-all bg-slate-50/50"
                      style={{
                        borderColor: formData.whatsapp ? config.checkout_color : undefined,
                        boxShadow: formData.whatsapp ? `0 0 0 3px ${focusRingColor}` : undefined
                      }}
                    />
                  </div>
                </div>

                {/* Continue Button */}
                <motion.button 
                  onClick={() => setCurrentStep(2)} 
                  className="w-full h-14 rounded-xl text-white font-bold text-base transition-transform hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: config.checkout_color,
                    boxShadow: `0 10px 25px ${config.checkout_color}40`
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continuar
                </motion.button>
              </motion.div>
            )}

            {/* Step 2 - Shipping */}
            {currentStep === 2 && (
              <motion.div 
                key="step2" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="p-6 space-y-5"
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentStep(1)} 
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Endereço de Entrega</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Para onde enviamos seu pedido?</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* CEP */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">CEP</label>
                    <input 
                      type="text" 
                      placeholder="00000-000" 
                      value={formData.cep}
                      onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                      className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base transition-all bg-slate-50/50"
                      style={{
                        borderColor: formData.cep ? config.checkout_color : undefined,
                        boxShadow: formData.cep ? `0 0 0 3px ${focusRingColor}` : undefined
                      }}
                    />
                  </div>
                  
                  {/* Street + Number */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Rua</label>
                      <input 
                        type="text" 
                        placeholder="Nome da rua" 
                        value={formData.street}
                        onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                        className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base transition-all bg-slate-50/50" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nº</label>
                      <input 
                        type="text" 
                        placeholder="123" 
                        value={formData.number}
                        onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                        className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base transition-all bg-slate-50/50" 
                      />
                    </div>
                  </div>

                  {/* Complement */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Complemento (opcional)</label>
                    <input 
                      type="text" 
                      placeholder="Apto, bloco, etc." 
                      value={formData.complement}
                      onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                      className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base transition-all bg-slate-50/50" 
                    />
                  </div>

                  {/* Neighborhood + City + State */}
                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Bairro</label>
                      <input 
                        type="text" 
                        placeholder="Bairro" 
                        value={formData.neighborhood}
                        onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                        className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base transition-all bg-slate-50/50" 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Cidade</label>
                      <input 
                        type="text" 
                        placeholder="Cidade" 
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base transition-all bg-slate-50/50" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">UF</label>
                      <input 
                        type="text" 
                        placeholder="SP" 
                        maxLength={2}
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                        className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base transition-all bg-slate-50/50 text-center uppercase" 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Shipping Options */}
                {shippingOptions.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-900">Escolha o Frete</label>
                    {shippingOptions.map((option, index) => (
                      <label 
                        key={index} 
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          selectedShipping === index ? "shadow-md" : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                        )} 
                        style={{ 
                          borderColor: selectedShipping === index ? config.checkout_color : undefined, 
                          backgroundColor: selectedShipping === index ? `${config.checkout_color}08` : undefined 
                        }}
                      >
                        <input 
                          type="radio" 
                          name="shipping" 
                          checked={selectedShipping === index} 
                          onChange={() => setSelectedShipping(index)} 
                          className="w-5 h-5" 
                          style={{ accentColor: config.checkout_color }} 
                        />
                        <Truck className="w-5 h-5 text-slate-400" />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{option.name}</p>
                          <p className="text-xs text-slate-500">Entrega estimada: 3-7 dias</p>
                        </div>
                        <span 
                          className="font-bold text-base" 
                          style={{ color: option.price === 0 ? config.checkout_color : "#334155" }}
                        >
                          {option.price === 0 ? "GRÁTIS" : formatPrice(option.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => setCurrentStep(1)} 
                    className="px-5 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <motion.button 
                    onClick={() => setCurrentStep(3)} 
                    className="flex-1 h-14 rounded-xl text-white font-bold text-base transition-transform hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: config.checkout_color,
                      boxShadow: `0 10px 25px ${config.checkout_color}40`
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continuar para Pagamento
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3 - Payment */}
            {currentStep === 3 && (
              <motion.div 
                key="step3" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="p-6 space-y-5"
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentStep(2)} 
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Pagamento</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Escolha como deseja pagar</p>
                  </div>
                </div>

                {/* Order Bumps */}
                {orderBumps.length > 0 && orderBumps.map((bump, index) => (
                  <motion.div 
                    key={index} 
                    className="p-4 rounded-xl border-2 border-dashed"
                    style={{ 
                      borderColor: config.checkout_order_bump_color || "#86efac",
                      backgroundColor: `${config.checkout_order_bump_color || "#10b981"}08`
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedBumps.includes(index)}
                        onChange={() => toggleBump(index)}
                        className="mt-1 w-6 h-6 rounded-lg border-2" 
                        style={{ 
                          accentColor: config.checkout_order_bump_color || "#10b981",
                          borderColor: config.checkout_order_bump_color || "#10b981"
                        }}
                      />
                      {productImage && (
                        <div className="w-14 h-14 rounded-xl bg-white flex-shrink-0 overflow-hidden border shadow-sm" style={{ borderColor: `${config.checkout_order_bump_color || "#10b981"}40` }}>
                          <img src={productImage} alt="Bump" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <span 
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ 
                            color: config.checkout_order_bump_color || "#10b981",
                            backgroundColor: `${config.checkout_order_bump_color || "#10b981"}20`
                          }}
                        >
                          {config.checkout_order_bump_headline || bump.title || "🎁 Oferta Especial"}
                        </span>
                        <p className="font-bold text-slate-900 text-base mt-1.5">Adicione por apenas mais</p>
                        {bump.description && (
                          <p className="text-sm text-slate-600 mt-1">{bump.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-slate-400 line-through">R$ 47,00</span>
                          <span className="text-lg font-black" style={{ color: config.checkout_order_bump_color || "#10b981" }}>
                            + R$ {((bump as any).price || 19.90).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </label>
                  </motion.div>
                ))}

                {/* Payment Methods */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPaymentMethod("pix")} 
                    className={cn(
                      "p-5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                      paymentMethod === "pix" ? "shadow-lg" : "border-slate-200 hover:border-slate-300"
                    )} 
                    style={{ 
                      borderColor: paymentMethod === "pix" ? config.checkout_color : undefined, 
                      backgroundColor: paymentMethod === "pix" ? `${config.checkout_color}08` : undefined 
                    }}
                  >
                    <QrCode 
                      className="w-8 h-8" 
                      style={{ color: paymentMethod === "pix" ? config.checkout_color : "#94a3b8" }} 
                    />
                    <span 
                      className="font-bold text-base" 
                      style={{ color: paymentMethod === "pix" ? config.checkout_color : "#475569" }}
                    >
                      Pix
                    </span>
                    <span className="text-xs text-slate-500">Aprovação imediata</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("card")} 
                    className={cn(
                      "p-5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                      paymentMethod === "card" ? "shadow-lg" : "border-slate-200 hover:border-slate-300"
                    )} 
                    style={{ 
                      borderColor: paymentMethod === "card" ? config.checkout_color : undefined, 
                      backgroundColor: paymentMethod === "card" ? `${config.checkout_color}08` : undefined 
                    }}
                  >
                    <CreditCard 
                      className="w-8 h-8" 
                      style={{ color: paymentMethod === "card" ? config.checkout_color : "#94a3b8" }} 
                    />
                    <span 
                      className="font-bold text-base" 
                      style={{ color: paymentMethod === "card" ? config.checkout_color : "#475569" }}
                    >
                      Cartão
                    </span>
                    <span className="text-xs text-slate-500">Até 12x sem juros</span>
                  </button>
                </div>

                {/* Card Fields */}
                <AnimatePresence>
                  {paymentMethod === "card" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      exit={{ opacity: 0, height: 0 }} 
                      className="space-y-3 overflow-hidden"
                    >
                      <input 
                        type="text" 
                        placeholder="Número do cartão" 
                        className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base bg-slate-50/50" 
                      />
                      <input 
                        type="text" 
                        placeholder="Nome no cartão" 
                        className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base bg-slate-50/50" 
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="MM/AA" 
                          className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base bg-slate-50/50" 
                        />
                        <input 
                          type="text" 
                          placeholder="CVV" 
                          className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none text-base bg-slate-50/50" 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Order Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-900 font-medium">{formatPrice(productPrice)}</span>
                  </div>
                  {selectedBumps.length > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Ofertas adicionais</span>
                      <span className="text-emerald-600 font-medium">+ {formatPrice(bumpsTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-600">Frete</span>
                    <span className="font-semibold" style={{ color: shippingCost === 0 ? config.checkout_color : "#334155" }}>
                      {shippingCost === 0 ? "GRÁTIS" : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="text-2xl font-black text-slate-900">{formatPrice(total)}</span>
                    </div>
                    {paymentMethod === "card" && (
                      <p className="text-xs text-slate-500 text-right mt-1">
                        ou 12x de {formatPrice(total / 12)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => setCurrentStep(2)} 
                    className="px-5 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <motion.button 
                    className="flex-1 h-14 rounded-xl text-white font-bold flex items-center justify-center gap-2 text-base transition-transform hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: config.checkout_color,
                      boxShadow: `0 10px 25px ${config.checkout_color}40`
                    }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {paymentMethod === "pix" ? (
                      <>
                        <QrCode className="w-5 h-5" />
                        GERAR PIX
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        FINALIZAR PAGAMENTO
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Prova Social - Logo abaixo do CTA */}
                {config.checkout_show_social_proof && (
                  <motion.div 
                    className="flex items-center justify-center gap-2 text-xs py-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-slate-500">
                      🟢 <strong className="text-slate-700">{socialProofCount}</strong> pessoas estão finalizando a compra agora.
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trust Section - Below Card (Garantias) */}
        {config.checkout_show_security_badges && (
          <motion.div 
            className="mt-6 p-5 rounded-2xl bg-white border border-slate-100"
            style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {config.checkout_security_badges_type === "custom" && config.checkout_security_badges_custom_url ? (
              <div className="flex items-center justify-center">
                <img 
                  src={config.checkout_security_badges_custom_url} 
                  alt="Selos de Segurança" 
                  className="max-w-full h-auto"
                />
              </div>
            ) : (
              <div className="flex items-center justify-around">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">Compra Segura</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">Dados Protegidos</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">Garantia 7 dias</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Reviews Section */}
        {config.showReviews && config.checkout_reviews && config.checkout_reviews.length > 0 && (
          <motion.div 
            className="mt-6 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-bold text-slate-700 text-center">O que nossos clientes dizem</h3>
            {config.checkout_reviews.slice(0, 3).map((review, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-start gap-3">
                  {review.photo_url ? (
                    <img src={review.photo_url} alt={review.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-slate-500 text-sm font-bold">{review.name?.charAt(0)?.toUpperCase() || "?"}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900 text-sm">{review.name || "Cliente"}</p>
                      <BadgeCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={cn(
                            "w-3.5 h-3.5", 
                            star <= (review.rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
                          )} 
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">{review.text || "Excelente produto!"}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Footer */}
        {(config.checkout_footer_text || config.customFooterImage) && (
          <motion.footer
            className="mt-6 px-4 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {/* Custom Footer Image (Selos de Pagamento) */}
            {config.customFooterImage && (
              <div className="flex items-center justify-center">
                <img
                  src={config.customFooterImage}
                  alt="Selos de Pagamento"
                  className="max-w-full h-auto opacity-70"
                />
              </div>
            )}
            {/* Footer Text */}
            {config.checkout_footer_text && (
              <p className="text-center text-xs text-slate-400 leading-relaxed">
                {config.checkout_footer_text}
              </p>
            )}
          </motion.footer>
        )}
      </main>
    </div>
  );
}

// ============================================
// TEMPLATE B - TikTok Style (Dark/Bold)
// ============================================
function TemplateTikTok({ config, product }: CheckoutLivePreviewProps) {
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "" });

  useEffect(() => {
    setTimerSeconds(config.checkout_timer_minutes * 60);
  }, [config.checkout_timer_minutes]);

  useEffect(() => {
    if (timerSeconds <= 0 || !config.checkout_show_timer) return;
    const interval = setInterval(() => setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [timerSeconds, config.checkout_show_timer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const productName = product?.name || "Produto Demo";
  const productPrice = product?.price_sale || 197;
  const productOriginalPrice = product?.price_original || 297;

  const formatPrice = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <div className="min-h-full bg-black text-white" style={{ fontFamily: config.checkout_font_family }}>
      {/* Urgency Bar */}
      {config.checkout_show_timer && (
        <div className="w-full py-3 px-4 text-center font-bold text-sm" style={{ backgroundColor: config.checkout_color }}>
          ⏰ {config.checkout_urgency_text} — {formatTimer(timerSeconds)}
        </div>
      )}

      {/* Banner */}
      {config.checkout_banner_url && <img src={config.checkout_banner_url} alt="Banner" className="w-full object-cover max-h-40" />}

      {/* Header */}
      <header className="py-6 px-6 border-b border-white/10">
        <div className="flex items-center justify-center gap-3">
          {config.checkout_logo_url ? (
            <img src={config.checkout_logo_url} alt="Logo" className="h-10 object-contain" />
          ) : (
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: config.checkout_color }}>
              <span className="text-white text-xl font-black">{productName.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
      </header>

      {/* Product */}
      <div className="px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black mb-2">{productName}</h1>
          <div className="flex items-center justify-center gap-3">
            {productOriginalPrice > productPrice && <span className="text-lg text-gray-500 line-through">{formatPrice(productOriginalPrice)}</span>}
            <span className="text-3xl font-black" style={{ color: config.checkout_color }}>{formatPrice(productPrice)}</span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-8">
          <input type="text" placeholder="Seu nome" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 outline-none text-base" />
          <input type="email" placeholder="seu@email.com" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 outline-none text-base" />
          <input type="tel" placeholder="(00) 00000-0000" value={formData.whatsapp} onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 outline-none text-base" />
        </div>

        {/* Payment */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => setPaymentMethod("pix")} className={cn("p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all", paymentMethod === "pix" ? "text-white" : "border-white/10 text-gray-400")} style={{ borderColor: paymentMethod === "pix" ? config.checkout_color : undefined, backgroundColor: paymentMethod === "pix" ? `${config.checkout_color}20` : undefined }}>
            <QrCode className="w-8 h-8" />
            <span className="font-bold">Pix</span>
          </button>
          <button onClick={() => setPaymentMethod("card")} className={cn("p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all", paymentMethod === "card" ? "text-white" : "border-white/10 text-gray-400")} style={{ borderColor: paymentMethod === "card" ? config.checkout_color : undefined, backgroundColor: paymentMethod === "card" ? `${config.checkout_color}20` : undefined }}>
            <CreditCard className="w-8 h-8" />
            <span className="font-bold">Cartão</span>
          </button>
        </div>

        {/* CTA */}
        <button className="w-full py-5 rounded-2xl text-white font-black text-lg shadow-2xl" style={{ backgroundColor: config.checkout_color }}>
          {paymentMethod === "pix" ? "GERAR PIX AGORA" : "PAGAR AGORA"} 🔥
        </button>

        {/* Trust */}
        {config.checkout_show_security_badges && (
          <div className="mt-8 flex items-center justify-center gap-4 text-gray-500 text-xs">
            <div className="flex items-center gap-1"><Lock className="w-4 h-4" /><span>Seguro</span></div>
            <div className="flex items-center gap-1"><Shield className="w-4 h-4" /><span>Protegido</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// TEMPLATE C - Minimal (Ultra Clean)
// ============================================
function TemplateMinimal({ config, product }: CheckoutLivePreviewProps) {
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "" });

  const productName = product?.name || "Produto Demo";
  const productPrice = product?.price_sale || 197;

  const formatPrice = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <div className="min-h-full bg-white" style={{ fontFamily: config.checkout_font_family, backgroundColor: config.checkout_bg_color }}>
      {/* Logo */}
      <div className="py-8 px-6 flex justify-center">
        {config.checkout_logo_url ? (
          <img src={config.checkout_logo_url} alt="Logo" className="h-8 object-contain" />
        ) : (
          <div className="text-xl font-bold text-gray-900">{productName}</div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-sm mx-auto px-6 pb-8">
        {/* Price */}
        <div className="text-center mb-10">
          <p className="text-sm text-gray-500 mb-1">Total a pagar</p>
          <p className="text-4xl font-bold text-gray-900">{formatPrice(productPrice)}</p>
        </div>

        {/* Form - Ultra minimal */}
        <div className="space-y-6 mb-10">
          <div>
            <label className="block text-sm text-gray-500 mb-2">Nome</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 text-gray-900 focus:border-gray-900 outline-none text-lg bg-transparent" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-2">E-mail</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 text-gray-900 focus:border-gray-900 outline-none text-lg bg-transparent" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-2">WhatsApp</label>
            <input type="tel" value={formData.whatsapp} onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))} className="w-full px-0 py-3 border-0 border-b-2 border-gray-200 text-gray-900 focus:border-gray-900 outline-none text-lg bg-transparent" />
          </div>
        </div>

        {/* Payment - Simple toggle */}
        <div className="flex rounded-full bg-gray-100 p-1 mb-8">
          <button onClick={() => setPaymentMethod("pix")} className={cn("flex-1 py-3 rounded-full text-sm font-medium transition-all", paymentMethod === "pix" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}>Pix</button>
          <button onClick={() => setPaymentMethod("card")} className={cn("flex-1 py-3 rounded-full text-sm font-medium transition-all", paymentMethod === "card" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}>Cartão</button>
        </div>

        {/* CTA */}
        <button className="w-full py-4 rounded-full text-white font-semibold text-base" style={{ backgroundColor: config.checkout_color }}>
          Finalizar Compra
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          <Lock className="w-3 h-3 inline mr-1" />
          Pagamento 100% seguro
        </p>
      </div>
    </div>
  );
}
