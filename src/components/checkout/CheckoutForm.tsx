import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Truck,
  CreditCard,
  QrCode,
  Check,
  Users,
  Loader2,
  Star,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { maskCPF, maskWhatsApp, maskCEP } from "@/lib/masks";

interface ShippingOption {
  name: string;
  price: number;
}

interface OrderBump {
  product_id: string;
  discount_percent: number;
  title?: string;
  description?: string;
}

interface BumpProduct {
  id: string;
  name: string;
  price_sale: number;
  image_url: string | null;
}

interface CustomerReview {
  name: string;
  photo_url: string;
  text: string;
  rating: number;
}

interface CheckoutFormProps {
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
  shippingOptions: ShippingOption[];
  orderBumps: OrderBump[];
  bumpProducts: BumpProduct[];
  primaryColor: string;
  actionColor: string;
  orderBumpColor: string;
  orderBumpHeadline: string;
  showSocialProof: boolean;
  socialProofCount: number;
  socialProofMin?: number;
  socialProofMax?: number;
  reviews?: CustomerReview[];
  showReviews?: boolean;
  footerText?: string;
  customFooterImage?: string | null;
  onContinueToStep2: () => void;
  onCepLookup: () => void;
  onPayment: () => void;
  processingPayment: boolean;
  formatPrice: (value: number) => string;
}

export function CheckoutForm({
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
  primaryColor,
  actionColor,
  orderBumpColor,
  orderBumpHeadline,
  showSocialProof,
  socialProofCount,
  socialProofMin = 20,
  socialProofMax = 50,
  reviews = [],
  showReviews = true,
  footerText,
  customFooterImage,
  onContinueToStep2,
  onCepLookup,
  onPayment,
  processingPayment,
  formatPrice,
}: CheckoutFormProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Social Proof Logic
  const [displayCount, setDisplayCount] = useState(socialProofCount);

  useEffect(() => {
    if (showSocialProof) {
      const min = Math.max(0, socialProofMin);
      const max = Math.max(min, socialProofMax);
      // Generate random number between min and max
      const random = Math.floor(Math.random() * (max - min + 1)) + min;
      setDisplayCount(random);
    }
  }, [showSocialProof, socialProofMin, socialProofMax]);

  // Ensure primary color has good contrast
  const getContrastColor = (color: string) => {
    // Simple contrast check - if color is too light, darken it
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 200 ? '#CC0854' : color;
  };

  const safePrimaryColor = getContrastColor(primaryColor);
  const safeBumpColor = getContrastColor(orderBumpColor || '#10B981');

  return (
    <div className="w-full">
        <AnimatePresence mode="wait">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                {/* Name */}
                <div className="relative">
                  <label
                    htmlFor="name"
                    className={cn(
                      "absolute left-4 transition-all duration-200 pointer-events-none",
                      focusedField === "name" || formData.name
                        ? "top-2 text-xs font-medium"
                        : "top-4 text-base",
                      focusedField === "name" || formData.name
                        ? "text-gray-700"
                        : "text-gray-400"
                    )}
                  >
                    Nome Completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full h-14 px-4 pt-6 pb-2 bg-transparent border-0 border-b-2 text-gray-900 placeholder-transparent focus:outline-none transition-all"
                    style={{
                      borderBottomColor: formData.name || focusedField === "name" ? primaryColor : "#D1D5DB",
                    }}
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <label
                    htmlFor="email"
                    className={cn(
                      "absolute left-4 transition-all duration-200 pointer-events-none",
                      focusedField === "email" || formData.email
                        ? "top-2 text-xs font-medium"
                        : "top-4 text-base",
                      focusedField === "email" || formData.email
                        ? "text-gray-700"
                        : "text-gray-400"
                    )}
                  >
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full h-14 px-4 pt-6 pb-2 bg-transparent border-0 border-b-2 text-gray-900 placeholder-transparent focus:outline-none transition-all"
                    style={{
                      borderBottomColor: formData.email || focusedField === "email" ? primaryColor : "#D1D5DB",
                    }}
                  />
                </div>

                {/* WhatsApp */}
                <div className="relative">
                  <label
                    htmlFor="whatsapp"
                    className={cn(
                      "absolute left-4 transition-all duration-200 pointer-events-none",
                      focusedField === "whatsapp" || formData.whatsapp
                        ? "top-2 text-xs font-medium"
                        : "top-4 text-base",
                      focusedField === "whatsapp" || formData.whatsapp
                        ? "text-gray-700"
                        : "text-gray-400"
                    )}
                  >
                    WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: maskWhatsApp(e.target.value) })}
                    onFocus={() => setFocusedField("whatsapp")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full h-14 px-4 pt-6 pb-2 bg-transparent border-0 border-b-2 text-gray-900 placeholder-transparent focus:outline-none transition-all"
                    style={{
                      borderBottomColor: formData.whatsapp || focusedField === "whatsapp" ? primaryColor : "#D1D5DB",
                    }}
                  />
                </div>

                {/* CPF */}
                <div className="relative">
                  <label
                    htmlFor="cpf"
                    className={cn(
                      "absolute left-4 transition-all duration-200 pointer-events-none",
                      focusedField === "cpf" || formData.cpf
                        ? "top-2 text-xs font-medium"
                        : "top-4 text-base",
                      focusedField === "cpf" || formData.cpf
                        ? "text-gray-700"
                        : "text-gray-400"
                    )}
                  >
                    CPF
                  </label>
                  <input
                    id="cpf"
                    type="text"
                    name="cpf"
                    autoComplete="off"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                    onFocus={() => setFocusedField("cpf")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full h-14 px-4 pt-6 pb-2 bg-transparent border-0 border-b-2 text-gray-900 placeholder-transparent focus:outline-none transition-all"
                    style={{
                      borderBottomColor: formData.cpf || focusedField === "cpf" ? primaryColor : "#D1D5DB",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={onContinueToStep2}
                className="w-full h-14 rounded-xl text-white font-bold text-lg transition-all hover:opacity-90 shadow-lg"
                style={{
                  backgroundColor: safePrimaryColor,
                  boxShadow: `0 4px 14px ${safePrimaryColor}40`,
                }}
              >
                Continuar
              </button>
            </motion.div>
          )}

          {/* Step 2: Shipping */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* CEP */}
                <div className="relative">
                  <label
                    htmlFor="cep"
                    className={cn(
                      "absolute left-4 transition-all duration-200 pointer-events-none",
                      focusedField === "cep" || formData.cep
                        ? "top-2 text-xs font-medium"
                        : "top-4 text-base",
                      focusedField === "cep" || formData.cep
                        ? "text-gray-700"
                        : "text-gray-400"
                    )}
                  >
                    CEP
                  </label>
                  <input
                    id="cep"
                    type="text"
                    name="postal-code"
                    autoComplete="postal-code"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: maskCEP(e.target.value) })}
                    onFocus={() => setFocusedField("cep")}
                    onBlur={(e) => {
                      setFocusedField(null);
                      onCepLookup();
                    }}
                    className="w-full h-14 px-4 pt-6 pb-2 bg-transparent border-0 border-b-2 text-gray-900 placeholder-transparent focus:outline-none transition-all"
                    style={{
                      borderBottomColor: formData.cep || focusedField === "cep" ? primaryColor : "#D1D5DB",
                    }}
                  />
                </div>

                {/* Shipping Options */}
                {shippingOptions.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Escolha o Frete
                    </label>
                    {shippingOptions.map((option, index) => (
                      <label
                        key={index}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          selectedShipping === index
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping === index}
                          onChange={() => setSelectedShipping(index)}
                          className="w-5 h-5"
                          style={{ accentColor: safePrimaryColor }}
                        />
                        <Truck className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{option.name}</p>
                        </div>
                        <span
                          className={cn(
                            "font-semibold text-lg",
                            option.price === 0 ? "" : "text-gray-900"
                          )}
                          style={{ color: option.price === 0 ? safePrimaryColor : undefined }}
                        >
                          {option.price === 0 ? "GRÁTIS" : formatPrice(option.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Address Fields */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 relative">
                    <label
                      htmlFor="street"
                      className={cn(
                        "absolute left-4 transition-all duration-200 pointer-events-none",
                        focusedField === "street" || formData.street
                          ? "top-2 text-xs font-medium"
                          : "top-4 text-base",
                        focusedField === "street" || formData.street
                          ? "text-gray-700"
                          : "text-gray-400"
                      )}
                    >
                      Rua
                    </label>
                    <input
                      id="street"
                      type="text"
                      name="street-address"
                      autoComplete="street-address"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      onFocus={() => setFocusedField("street")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full h-14 px-4 pt-6 pb-2 bg-transparent border-0 border-b-2 text-gray-900 placeholder-transparent focus:outline-none transition-all"
                      style={{
                        borderBottomColor: formData.street || focusedField === "street" ? primaryColor : "#D1D5DB",
                      }}
                    />
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="number"
                      className={cn(
                        "absolute left-4 transition-all duration-200 pointer-events-none",
                        focusedField === "number" || formData.number
                          ? "top-2 text-xs font-medium"
                          : "top-4 text-base",
                        focusedField === "number" || formData.number
                          ? "text-gray-700"
                          : "text-gray-400"
                      )}
                    >
                      Nº
                    </label>
                    <input
                      id="number"
                      type="text"
                      name="address-line2"
                      autoComplete="address-line2"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      onFocus={() => setFocusedField("number")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full h-14 px-4 pt-6 pb-2 bg-transparent border-0 border-b-2 text-gray-900 placeholder-transparent focus:outline-none transition-all"
                      style={{
                        borderBottomColor: formData.number || focusedField === "number" ? primaryColor : "#D1D5DB",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label
                      htmlFor="city"
                      className={cn(
                        "absolute left-4 transition-all duration-200 pointer-events-none",
                        focusedField === "city" || formData.city
                          ? "top-2 text-xs font-medium"
                          : "top-4 text-base",
                        focusedField === "city" || formData.city
                          ? "text-gray-700"
                          : "text-gray-400"
                      )}
                    >
                      Cidade
                    </label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      autoComplete="address-level2"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      onFocus={() => setFocusedField("city")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full h-14 px-4 pt-6 pb-2 bg-transparent border-0 border-b-2 text-gray-900 placeholder-transparent focus:outline-none transition-all"
                      style={{
                        borderBottomColor: formData.city || focusedField === "city" ? primaryColor : "#D1D5DB",
                      }}
                    />
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="state"
                      className={cn(
                        "absolute left-4 transition-all duration-200 pointer-events-none",
                        focusedField === "state" || formData.state
                          ? "top-2 text-xs font-medium"
                          : "top-4 text-base",
                        focusedField === "state" || formData.state
                          ? "text-gray-700"
                          : "text-gray-400"
                      )}
                    >
                      Estado
                    </label>
                    <input
                      id="state"
                      type="text"
                      name="state"
                      autoComplete="address-level1"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      onFocus={() => setFocusedField("state")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full h-14 px-4 pt-6 pb-2 bg-transparent border-0 border-b-2 text-gray-900 placeholder-transparent focus:outline-none transition-all"
                      style={{
                        borderBottomColor: formData.state || focusedField === "state" ? primaryColor : "#D1D5DB",
                      }}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="complement"
                    className={cn(
                      "absolute left-4 transition-all duration-200 pointer-events-none",
                      focusedField === "complement" || formData.complement
                        ? "top-2 text-xs font-medium"
                        : "top-4 text-base",
                      focusedField === "complement" || formData.complement
                        ? "text-gray-700"
                        : "text-gray-400"
                    )}
                  >
                    Complemento (opcional)
                  </label>
                  <input
                    id="complement"
                    type="text"
                    name="address-line3"
                    autoComplete="address-line3"
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    onFocus={() => setFocusedField("complement")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full h-14 px-4 pt-6 pb-2 bg-transparent border-0 border-b-2 text-gray-900 placeholder-transparent focus:outline-none transition-all"
                    style={{
                      borderBottomColor: formData.complement || focusedField === "complement" ? primaryColor : "#D1D5DB",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(3)}
                className="w-full h-14 rounded-xl text-white font-bold text-lg transition-all hover:opacity-90 shadow-lg"
                style={{
                  backgroundColor: safePrimaryColor,
                  boxShadow: `0 4px 14px ${safePrimaryColor}40`,
                }}
              >
                Continuar para Pagamento
              </button>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("pix")}
                  className={cn(
                    "p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all",
                    paymentMethod === "pix"
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {/* PIX Icon */}
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg
                      viewBox="0 0 48 48"
                      className="w-full h-full"
                      fill="#4DB6AC"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M11.9,12h-0.68l8.04-8.04c2.62-2.61,6.86-2.61,9.48,0L36.78,12H36.1c-1.6,0-3.11,0.62-4.24,1.76
                        l-6.8,6.77c-0.59,0.59-1.53,0.59-2.12,0l-6.8-6.77C15.01,12.62,13.5,12,11.9,12z"/>
                      <path d="M36.1,36h0.68l-8.04,8.04c-2.62,2.61-6.86,2.61-9.48,0L11.22,36h0.68c1.6,0,3.11-0.62,4.24-1.76
                        l6.8-6.77c0.59-0.59,1.53-0.59,2.12,0l6.8,6.77C32.99,35.38,34.5,36,36.1,36z"/>
                      <path d="M44.04,28.74L38.78,34H36.1c-1.07,0-2.07-0.42-2.83-1.17l-6.8-6.78c-1.36-1.36-3.58-1.36-4.94,0
                        l-6.8,6.78C13.97,33.58,12.97,34,11.9,34H9.22l-5.26-5.26c-2.61-2.62-2.61-6.86,0-9.48L9.22,14h2.68c1.07,0,2.07,0.42,2.83,1.17
                        l6.8,6.78c0.68,0.68,1.58,1.02,2.47,1.02s1.79-0.34,2.47-1.02l6.8-6.78C34.03,14.42,35.03,14,36.1,14h2.68l5.26,5.26
                        C46.65,21.88,46.65,26.12,44.04,28.74z"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-sm text-gray-700">
                    Pix
                  </span>
                  <span className="text-xs text-gray-500">Aprovação imediata</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={cn(
                    "p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all",
                    paymentMethod === "card"
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <CreditCard
                    className="w-10 h-10"
                    style={{ color: paymentMethod === "card" ? safePrimaryColor : "#9CA3AF" }}
                  />
                  <span
                    className="font-semibold text-sm"
                    style={{ color: paymentMethod === "card" ? safePrimaryColor : "#4B5563" }}
                  >
                    Cartão
                  </span>
                  <span className="text-xs text-gray-500">Até 12x sem juros</span>
                </button>
              </div>

              {/* Card Form */}
              {paymentMethod === "card" && (
                <div className="space-y-4 animate-fade-in">
                  <input
                    type="text"
                    placeholder="Número do cartão"
                    className="w-full h-14 px-4 bg-transparent border-0 border-b-2 text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all"
                    style={{
                      borderBottomColor: "#D1D5DB",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderBottomColor = primaryColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderBottomColor = e.target.value ? primaryColor : "#D1D5DB";
                    }}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="w-full h-14 px-4 bg-transparent border-0 border-b-2 text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all"
                      style={{
                        borderBottomColor: "#D1D5DB",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderBottomColor = primaryColor;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderBottomColor = e.target.value ? primaryColor : "#D1D5DB";
                      }}
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="w-full h-14 px-4 bg-transparent border-0 border-b-2 text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all"
                      style={{
                        borderBottomColor: "#D1D5DB",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderBottomColor = primaryColor;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderBottomColor = e.target.value ? primaryColor : "#D1D5DB";
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Nome no cartão"
                    className="w-full h-14 px-4 bg-transparent border-0 border-b-2 text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all"
                    style={{
                      borderBottomColor: "#D1D5DB",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderBottomColor = primaryColor;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderBottomColor = e.target.value ? primaryColor : "#D1D5DB";
                    }}
                  />
                </div>
              )}

              {/* Order Bump - Before Final Button */}
              {bumpProducts.length > 0 && orderBumps.length > 0 && (
                <div className="space-y-3">
                  {bumpProducts.map((bumpProduct) => {
                    const bumpConfig = orderBumps.find(
                      (b) => b.product_id === bumpProduct.id
                    );
                    if (!bumpConfig) return null;

                    const discountedPrice =
                      bumpProduct.price_sale * (1 - bumpConfig.discount_percent / 100);
                    const isSelected = selectedBumps.has(bumpProduct.id);

                    return (
                      <div
                        key={bumpProduct.id}
                        className={cn(
                          "p-5 rounded-xl border-2 border-dashed transition-all",
                          isSelected
                            ? "bg-gray-50"
                            : "bg-white"
                        )}
                        style={{
                          borderColor: isSelected ? safeBumpColor : `${safeBumpColor}40`,
                          backgroundColor: isSelected ? `${safeBumpColor}08` : undefined,
                        }}
                      >
                        <label className="flex items-start gap-4 cursor-pointer">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleBump(bumpProduct.id)}
                              className="w-6 h-6 rounded border-2 border-gray-300 checked:bg-white checked:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 cursor-pointer appearance-none transition-all"
                              style={{
                                backgroundColor: isSelected ? safeBumpColor : undefined,
                                borderColor: isSelected ? safeBumpColor : undefined,
                              }}
                            />
                            {isSelected && (
                              <Check className="w-4 h-4 text-white absolute left-1 pointer-events-none" />
                            )}
                          </div>
                          {bumpProduct.image_url && (
                            <img
                              src={bumpProduct.image_url}
                              alt={bumpProduct.name}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <span
                              className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full inline-block mb-2"
                              style={{
                                color: safeBumpColor,
                                backgroundColor: `${safeBumpColor}15`,
                              }}
                            >
                              {orderBumpHeadline}
                            </span>
                            <p className="font-semibold text-gray-900">{bumpProduct.name}</p>
                            {bumpConfig.description && (
                              <p className="text-sm text-gray-600 mt-1">{bumpConfig.description}</p>
                            )}
                            <p className="mt-2">
                              {bumpConfig.discount_percent > 0 && (
                                <span className="text-sm text-gray-400 line-through mr-2">
                                  {formatPrice(bumpProduct.price_sale)}
                                </span>
                              )}
                              <span className="text-xl font-bold" style={{ color: safeBumpColor }}>
                                {formatPrice(discountedPrice)}
                              </span>
                            </p>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Final Payment Button - Action Color (Verde Esmeralda) */}
              <button
                onClick={onPayment}
                disabled={processingPayment}
                className="w-full h-14 rounded-xl text-white font-bold text-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
                style={{
                  backgroundColor: actionColor || "#10B981",
                  boxShadow: `0 4px 14px ${actionColor || "#10B981"}40`,
                }}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Gerando PIX...
                  </>
                ) : paymentMethod === "pix" ? (
                  <>
                    <QrCode className="w-6 h-6" />
                    GERAR PIX E FINALIZAR
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    PAGAR COM CARTÃO
                  </>
                )}
              </button>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Proof - Below Form */}
        {showSocialProof && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black tabular-nums" style={{ color: primaryColor }}>
                  {displayCount}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                pessoas estão finalizando a compra agora
              </span>
            </div>
          </div>
        )}



    </div>
  );
}
