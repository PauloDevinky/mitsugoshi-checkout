import { useState, useEffect } from "react";
import { ShoppingBag, ChevronDown, ChevronUp, Lock, Shield, Truck, CreditCard, QrCode, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeads } from "@/hooks/useLeads";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CheckoutPreview() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [showCardError, setShowCardError] = useState(false);
  const [showPixSuccess, setShowPixSuccess] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const { captureLead } = useLeads();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  // Capture lead when user fills name and whatsapp
  const handleLeadCapture = async () => {
    if (formData.name && formData.whatsapp && !leadCaptured) {
      const success = await captureLead({
        name: formData.name,
        whatsapp: formData.whatsapp,
        email: formData.email,
        step_abandoned: currentStep,
      });
      if (success) {
        setLeadCaptured(true);
      }
    }
  };

  const handleContinueToStep2 = async () => {
    await handleLeadCapture();
    setCurrentStep(2);
  };

  const handlePayment = () => {
    if (paymentMethod === "card") {
      setShowCardError(true);
    } else {
      setShowPixSuccess(true);
    }
  };

  return (
    <div className="checkout-page">
      {/* Urgency Banner - Refined */}
      <div className="urgency-banner">
        <span>🔥 RESTAM 23 UNIDADES — </span>
        <span className="font-mono font-semibold">09:47</span>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-checkout-border sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <span className="font-semibold text-gray-900">Loja Demo</span>
          </div>
          
          <button 
            onClick={() => setCartOpen(!cartOpen)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 -mr-2"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm font-medium">1 item</span>
            {cartOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Cart Summary Accordion */}
        {cartOpen && (
          <div className="border-t border-checkout-border bg-gray-50/80 animate-fade-in">
            <div className="max-w-lg mx-auto px-5 py-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop" 
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Kit Premium Emagrecimento</p>
                  <p className="text-sm text-gray-400 line-through mt-1">R$ 297,00</p>
                  <p className="text-xl font-bold text-checkout-success">R$ 197,00</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-5 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step)}
                className={cn(
                  currentStep > step 
                    ? "checkout-step-complete" 
                    : currentStep === step 
                      ? "checkout-step-active"
                      : "checkout-step-inactive"
                )}
              >
                {currentStep > step ? <Check className="w-5 h-5" /> : step}
              </button>
              {step < 3 && (
                <div className={cn(
                  "w-20 h-0.5 mx-3 rounded-full transition-all duration-300",
                  currentStep > step ? "bg-primary" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="checkout-card p-7 animate-fade-in">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Seus Dados</h2>
                <p className="text-sm text-gray-500 mt-1">Preencha para continuar</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    placeholder="Digite seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={handleLeadCapture}
                    className="checkout-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                  <input 
                    type="email" 
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="checkout-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <input 
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    onBlur={handleLeadCapture}
                    className="checkout-input"
                  />
                </div>
              </div>
              
              <button 
                onClick={handleContinueToStep2}
                className="checkout-btn-primary"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Step 2: Shipping */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Endereço de Entrega</h2>
                <p className="text-sm text-gray-500 mt-1">Para onde enviamos?</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                  <input 
                    type="text" 
                    placeholder="00000-000"
                    className="checkout-input"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
                    <input 
                      type="text" 
                      placeholder="Nome da rua"
                      className="checkout-input bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nº</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      className="checkout-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                  <input 
                    type="text" 
                    placeholder="Apto, Bloco (opcional)"
                    className="checkout-input"
                  />
                </div>
              </div>

              {/* Shipping Options */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Frete</label>
                {[
                  { label: "Frete Grátis", time: "7-10 dias úteis", price: 0 },
                  { label: "Expresso", time: "3-5 dias úteis", price: 1990 },
                ].map((option) => (
                  <label 
                    key={option.label}
                    className="flex items-center gap-4 p-4 rounded-xl border border-checkout-border hover:border-primary/50 cursor-pointer transition-all bg-white"
                  >
                    <input type="radio" name="shipping" className="w-4 h-4 accent-primary" defaultChecked={option.price === 0} />
                    <Truck className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{option.time}</p>
                    </div>
                    <span className={cn(
                      "font-semibold",
                      option.price === 0 ? "text-checkout-success" : "text-gray-900"
                    )}>
                      {option.price === 0 ? "GRÁTIS" : `R$ ${(option.price / 100).toFixed(2).replace('.', ',')}`}
                    </span>
                  </label>
                ))}
              </div>
              
              <button 
                onClick={() => setCurrentStep(3)}
                className="checkout-btn-primary"
              >
                Continuar para Pagamento
              </button>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pagamento</h2>
                <p className="text-sm text-gray-500 mt-1">Escolha como pagar</p>
              </div>

              {/* Order Bump */}
              <div className="order-bump">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-4 h-4 accent-checkout-warning rounded" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-checkout-warning uppercase tracking-wide">Oferta Especial</span>
                    </div>
                    <p className="font-semibold text-gray-900">+ Ebook Receitas Fitness</p>
                    <p className="text-sm text-gray-600 mt-1">50 receitas para acelerar seus resultados</p>
                    <p className="mt-2">
                      <span className="text-sm text-gray-400 line-through">R$ 47,00</span>
                      <span className="ml-2 text-lg font-bold text-checkout-warning">R$ 19,90</span>
                    </p>
                  </div>
                </label>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("pix")}
                  className={paymentMethod === "pix" ? "payment-method-active" : "payment-method"}
                >
                  <QrCode className={cn("w-8 h-8", paymentMethod === "pix" ? "text-checkout-success" : "text-gray-400")} />
                  <span className={cn("font-semibold", paymentMethod === "pix" ? "text-checkout-success" : "text-gray-600")}>Pix</span>
                  <span className="text-xs text-gray-500">Aprovação imediata</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={paymentMethod === "card" ? "payment-method-active" : "payment-method"}
                >
                  <CreditCard className={cn("w-8 h-8", paymentMethod === "card" ? "text-checkout-success" : "text-gray-400")} />
                  <span className={cn("font-semibold", paymentMethod === "card" ? "text-checkout-success" : "text-gray-600")}>Cartão</span>
                  <span className="text-xs text-gray-500">Até 12x</span>
                </button>
              </div>

              {/* Card Form (visual only - triggers error) */}
              {paymentMethod === "card" && (
                <div className="space-y-4 animate-fade-in">
                  <input
                    type="text"
                    placeholder="Número do cartão"
                    className="checkout-input"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="checkout-input"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="checkout-input"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Nome no cartão"
                    className="checkout-input"
                  />
                </div>
              )}

              {/* Total */}
              <div className="p-5 rounded-xl bg-gray-50 border border-checkout-border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-medium">R$ 197,00</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-600">Frete</span>
                  <span className="text-checkout-success font-semibold">GRÁTIS</span>
                </div>
                <div className="border-t border-checkout-border pt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">R$ 197,00</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handlePayment}
                className="checkout-btn-primary flex items-center justify-center gap-3"
              >
                {paymentMethod === "pix" ? (
                  <>
                    <QrCode className="w-5 h-5" />
                    GERAR PIX E FINALIZAR
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    PAGAR COM CARTÃO
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Trust Section */}
        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-gray-400">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Compra Segura</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Dados Protegidos</span>
            </div>
          </div>
          
          <p className="text-xs text-center text-gray-400 max-w-sm mx-auto leading-relaxed">
            Usamos seus dados de forma 100% segura para: Enviar comprovante, Ativar garantia, Acompanhar pedido.
          </p>
        </div>
      </main>

      {/* Card Error Dialog */}
      <Dialog open={showCardError} onOpenChange={setShowCardError}>
        <DialogContent className="sm:max-w-md bg-white border-gray-200">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl text-gray-900">Transação não autorizada</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              A operadora do seu cartão não autorizou esta transação para o valor promocional.
              <br /><br />
              <strong className="text-gray-900">Tente via PIX para aprovação imediata.</strong>
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => {
              setShowCardError(false);
              setPaymentMethod("pix");
            }}
            className="w-full mt-4 py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            PAGAR COM PIX
          </button>
        </DialogContent>
      </Dialog>

      {/* Pix Success Dialog */}
      <Dialog open={showPixSuccess} onOpenChange={setShowPixSuccess}>
        <DialogContent className="sm:max-w-md bg-white border-gray-200">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <DialogTitle className="text-xl text-gray-900">Pix Gerado com Sucesso!</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Escaneie o QR Code abaixo ou copie o código Pix
            </DialogDescription>
          </DialogHeader>
          
          {/* Mock QR Code */}
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 mt-4">
            <div className="w-48 h-48 mx-auto bg-white rounded-xl p-4 shadow-sm">
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                <QrCode className="w-20 h-20 text-gray-500" />
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">Código Pix válido por 30 minutos</p>
          </div>

          <button
            className="w-full mt-4 py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors"
          >
            COPIAR CÓDIGO PIX
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
