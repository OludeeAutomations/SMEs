export interface PaystackTransactionParams {
  email: string;
  amount: number; // in Kobo (e.g., 10000 Kobo = 100 NGN)
  reference?: string;
  metadata?: Record<string, any>;
}

export interface PaystackVerificationResult {
  status: 'success' | 'failed' | 'ongoing';
  amount: number;
  reference: string;
  gatewayResponse: string;
}

export const paystackService = {
  /**
   * Initializes a Paystack transaction by calling a backend server-less function
   * which interfaces with Paystack's API securely using secret API keys.
   */
  initializeTransaction: async (params: PaystackTransactionParams): Promise<{
    authorizationUrl: string;
    accessCode: string;
    reference: string;
  }> => {
    const reference = params.reference || `EASE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Simulate API round-trip delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock authorization checkout page URL
    const mockAuthUrl = `https://checkout.paystack.com/mock-gateway?ref=${reference}&email=${encodeURIComponent(params.email)}&amount=${params.amount}`;
    
    return {
      authorizationUrl: mockAuthUrl,
      accessCode: `mst_code_${reference}`,
      reference,
    };
  },

  /**
   * Verifies the status of a transaction on the backend using its reference.
   */
  verifyTransaction: async (reference: string): Promise<PaystackVerificationResult> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    return {
      status: 'success',
      amount: 1500000, // mock amount (15,000 NGN in Kobo)
      reference,
      gatewayResponse: 'Approved',
    };
  },
};
export default paystackService;
