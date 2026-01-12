export interface PaymentCustomer {
  name: string;
  document: string; // CPF/CNPJ
  email: string;
  phone: string;
}

export interface PaymentItem {
  title: string;
  price: number; // em centavos
  quantity: number;
}

export interface PaymentRequest {
  amount: number; // em centavos
  description: string;
  customer: PaymentCustomer;
  item: PaymentItem;
  utm?: string;
}

export interface PaymentResponse {
  transactionId: string;
  pixCode: string; // Copia e Cola
  qrCodeUrl?: string; // Opcional
  status: 'pending' | 'approved' | 'rejected' | 'failed';
  rawResponse?: any;
}

export interface PaymentGateway {
  name: string;
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
}
