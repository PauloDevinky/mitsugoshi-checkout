import { supabase } from "@/integrations/supabase/client";
import { PaymentGateway, PaymentRequest, PaymentResponse } from "./types";

export class DuttyfyAdapter implements PaymentGateway {
  name = "duttyfy";

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // 1. Obter configuração do gateway (API Key)
      const { data: gatewaySettings, error: gatewayError } = await supabase
        .from("gateway_settings")
        .select("api_key")
        .eq("is_active", true)
        .eq("gateway_name", "duttyfy") // Garante que pegamos especificamente o Duttyfy
        .limit(1)
        .maybeSingle(); // Use maybeSingle to avoid errors if not found, handle below

      // Fallback: se não encontrar por nome, tenta pegar qualquer ativo (comportamento legado, mas seguro)
      let apiKey = gatewaySettings?.api_key;
      
      if (!apiKey && !gatewaySettings) {
         const { data: fallbackSettings } = await supabase
        .from("gateway_settings")
        .select("api_key")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
        apiKey = fallbackSettings?.api_key;
      }

      if (!apiKey) {
        throw new Error("Duttyfy: Chave de API não configurada no painel administrativo.");
      }

      // 2. Chamar a Edge Function existente
      // Nota: Mantemos a chamada via Edge Function para não expor a API Key no client-side
      const { data, error } = await supabase.functions.invoke("generate-pix", {
        body: {
          amount: request.amount,
          description: request.description,
          customer: request.customer,
          item: request.item,
          utm: request.utm || "",
          apiKey: apiKey,
        },
      });

      if (error) {
        console.error("Duttyfy Edge Function Error:", error);
        throw new Error("Falha na comunicação com o servidor de pagamentos.");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.pixCode) {
        throw new Error("O gateway não retornou um código PIX válido.");
      }

      return {
        transactionId: data.transactionId,
        pixCode: data.pixCode,
        status: "pending",
        rawResponse: data,
      };

    } catch (error: any) {
      // Tratamento de erro amigável
      console.error("Duttyfy Adapter Error:", error);
      
      // Se for um erro conhecido, repassa a mensagem. Se não, mensagem genérica.
      const message = error.message || "Não foi possível processar seu pagamento no momento.";
      
      throw new Error(message);
    }
  }
}
