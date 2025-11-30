import { GoogleGenAI } from "@google/genai";
import { Custodian, Invoice } from "../types";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeFinancialStatus = async (
  custodians: Custodian[],
  invoices: Invoice[]
): Promise<string> => {
  const client = getGeminiClient();
  if (!client) return "Error: No se ha configurado la API Key.";

  const receivables = invoices.filter(i => i.type === 'RECEIVABLE' && i.status === 'PENDING');
  const payables = invoices.filter(i => i.type === 'PAYABLE' && i.status === 'PENDING');
  const totalCash = custodians.reduce((acc, c) => acc + c.balance, 0);
  const totalReceivableAmount = receivables.reduce((acc, i) => acc + i.amount, 0);
  const totalPayableAmount = payables.reduce((acc, i) => acc + i.amount, 0);

  const prompt = `
    Actúa como un analista financiero experto para una pequeña empresa.
    Analiza los siguientes datos financieros y proporciona un resumen breve de 3 puntos clave y una recomendación estratégica.
    Responde en formato Markdown simple.
    
    Datos Actuales:
    - Efectivo Total Disponible en Custodios: $${totalCash.toFixed(2)}
    - Total por Cobrar (CXC): $${totalReceivableAmount.toFixed(2)} (${receivables.length} facturas)
    - Total por Pagar (CXP): $${totalPayableAmount.toFixed(2)} (${payables.length} facturas)
    
    Detalle de Custodios:
    ${custodians.map(c => `- ${c.name}: $${c.balance}`).join('\n')}
    
    Proximos vencimientos de pagos (CXP):
    ${payables.slice(0, 3).map(p => `- ${p.entityName}: $${p.amount} vence el ${p.dueDate}`).join('\n')}

    Instrucciones:
    1. Evalúa la liquidez inmediata.
    2. Identifica riesgos en cuentas por pagar.
    3. Sugiere acciones para mejorar el flujo de caja.
    Mantén el tono profesional pero directo.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Ocurrió un error al conectar con el asistente financiero.";
  }
};