import { DuttyfyAdapter } from "./duttyfy";
import { PaymentGateway, PaymentRequest, PaymentResponse } from "./types";

class PaymentEngineService {
  private gateway: PaymentGateway;

  constructor() {
    // Aqui no futuro podemos ter uma lógica para escolher o gateway
    // Por enquanto, hardcoded para Duttyfy como solicitado
    this.gateway = new DuttyfyAdapter();
  }

  /**
   * Processa um pagamento usando o gateway ativo.
   */
  async process(request: PaymentRequest): Promise<PaymentResponse> {
    console.log(`[PaymentEngine] Iniciando processamento via ${this.gateway.name}...`);
    return this.gateway.processPayment(request);
  }

  /**
   * Método para trocar de gateway em tempo de execução (útil para testes ou painel admin)
   */
  setGateway(gateway: PaymentGateway) {
    this.gateway = gateway;
  }
}

export const PaymentEngine = new PaymentEngineService();
