import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PaymentRequest } from '../types';

const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    console.warn("A chave de API do Gemini (VITE_GEMINI_API_KEY) não foi encontrada. As funcionalidades de IA estarão desativadas.");
}

export const isGeminiAvailable = !!ai;

export async function extractInvoiceDetails(base64Data: string, mimeType: string): Promise<{ recipientName: string, amount: number, description: string } | null> {
    if (!ai) {
        console.warn("Gemini API key not configured. Skipping invoice extraction.");
        return null;
    }
    const prompt = "A partir da imagem da fatura, extraia as seguintes informações em formato JSON: o nome do beneficiário (recipientName), o valor total (amount como um número), e uma breve descrição do serviço/produto (description).";
    
    const imagePart = { inlineData: { data: base64Data, mimeType } };
    const textPart = { text: prompt };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
        });
        const responseText = response.text ?? '';
        const jsonText = responseText.trim().replace(/^```json\n?/, '').replace(/```$/, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API error (extractInvoiceDetails):", error);
        return null;
    }
}

export async function suggestCategory(description: string): Promise<string | null> {
    if (!ai) {
        console.warn("Gemini API key not configured. Skipping category suggestion.");
        return null;
    }
    const prompt = `Sugira uma categoria de despesa única e concisa para a seguinte descrição: "${description}". Responda apenas com o nome da categoria. Exemplos: 'Software', 'Viagens e Hospedagem', 'Material de Escritório', 'Serviços de Terceiros'.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return (response.text ?? '').trim();
    } catch (error) {
        console.error("Gemini API error (suggestCategory):", error);
        return null;
    }
}

export async function analyzeRisk(request: PaymentRequest): Promise<string> {
    if (!ai) {
        console.warn("Gemini API key not configured. Skipping risk analysis.");
        return "Funcionalidade de IA indisponível. Chave de API não configurada.";
    }
    const prompt = `Analise a seguinte solicitação de pagamento para potenciais riscos de fraude ou erros e forneça um breve resumo. Considere o valor, o beneficiário e a descrição.
    - Valor: ${request.amount.toFixed(2)} BRL
    - Beneficiário: ${request.recipientFullName}
    - Descrição: ${request.description}
    - Categoria: ${request.category || 'N/A'}
    
    Seja conciso na sua análise.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return (response.text ?? '').trim();
    } catch (error) {
        console.error("Gemini API error (analyzeRisk):", error);
        return "Não foi possível realizar a análise de risco.";
    }
}

export async function generateSummary(requests: PaymentRequest[]): Promise<string> {
    if (!ai) {
        console.warn("Gemini API key not configured. Skipping summary generation.");
        return "Funcionalidade de IA indisponível. Chave de API não configurada.";
    }
    if (requests.length === 0) {
        return "Nenhum dado disponível para gerar um resumo.";
    }
    const simplifiedRequests = requests.map(r => ({ amount: r.amount, status: r.status, category: r.category || 'Outros' }));
    const prompt = `Com base nos seguintes dados de transações (valores em BRL), gere um resumo executivo em 2-3 frases curtas sobre a saúde financeira do período. Destaque os principais pontos, como a categoria com mais gastos e a proporção de pagamentos pendentes.
    Dados: ${JSON.stringify(simplifiedRequests)}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return (response.text ?? '').trim();
    } catch (error) {
        console.error("Gemini API error (generateSummary):", error);
        return "Não foi possível gerar o resumo.";
    }
}