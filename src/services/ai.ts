export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface BusinessContext {
  revenueToday: number;
  inventoryCount: number;
  lowStockItemsCount: number;
  activeInvoices: number;
}

export const aiService = {
  /**
   * Sends a message to the AI operating assistant.
   * Connects to our backend Gemini AI engine or Supabase Edge function.
   */
  sendMessage: async (
    chatHistory: ChatMessage[],
    newMessage: string,
    context?: BusinessContext
  ): Promise<ChatMessage> => {
    // Simulate latency of processing LLM query
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simple response router to act as a realistic mock assistant
    let aiResponse = "I am processing your business data. Ask me things like 'Generate a sales report' or 'Show my low-stock items'.";
    
    const query = newMessage.toLowerCase();
    if (query.includes('sales') || query.includes('revenue') || query.includes('report')) {
      aiResponse = `Your business has generated ₦286,000 today across 84 orders. This is a 12% increase compared to yesterday. Top-moving items are Premium Rice and Cooking Oil.`;
    } else if (query.includes('stock') || query.includes('inventory') || query.includes('low')) {
      aiResponse = `You currently have 18 low-stock items. I recommend reordering Premium Rice from Supplier 'Amina Foods' as it's projected to run out in 3 days.`;
    } else if (query.includes('invoice') || query.includes('debt') || query.includes('owed')) {
      aiResponse = `You have ₦1.2M in unpaid invoices. The largest outstanding invoice is POS-2041 for Blue Nile Foods (₦82,000) which was due 2 days ago.`;
    } else if (query.includes('hello') || query.includes('hi')) {
      aiResponse = `Hello! I am Ease AI, your business operating assistant. How can I help you manage sales, inventory, or billing today?`;
    }

    return {
      id: `AI-${Date.now()}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Generates predictive analysis on sales and stock trends.
   */
  getBusinessInsights: async (context: BusinessContext): Promise<{
    cashFlowForecast: string;
    inventoryRiskAlert: string;
    optimizationTip: string;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return {
      cashFlowForecast: "Cash flow is projected to remain positive for the next 14 days based on steady weekly wholesale patterns.",
      inventoryRiskAlert: `Alert: ${context.lowStockItemsCount} items are below safe thresholds. High risk of stockouts in Groceries category.`,
      optimizationTip: "Tip: Cash transactions account for 48% of sales. Setting up automatic WhatsApp reminders for debtors could speed up invoicing collection by 4 days.",
    };
  },
};

export default aiService;
