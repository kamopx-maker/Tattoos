import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function refineTattooPrompt(userPrompt: string, style: string) {
  const prompt = `Profesyonel bir dövme sanatçısı olarak, bir yapay zeka görsel oluşturucu için bu kullanıcı istemini geliştir.
  Kullanıcı isteği: "${userPrompt}", Stil: "${style}".
  Işıklandırma, gölgeleme, çizgi ağırlığı ve yerleşim detaylarını içeren teknik bir istem sağla.
  100 kelimenin altında tut.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });
  
  return response.text || "";
}

export async function triggerN8NWorkflow(bodyImageUrl: string, refinedPrompt: string, style: string, tattooImageUrl?: string) {
  const meta = import.meta as any;
  const webhookUrl = meta.env.VITE_N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("N8N_WEBHOOK_URL ayarlanmamış. İş akışı tetikleme simüle ediliyor.");
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: "Simüle edildi" }), 2000));
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      bodyImageUrl, 
      tattooImageUrl,
      prompt: refinedPrompt, 
      style, 
      timestamp: new Date().toISOString() 
    }),
  });

  return response.json();
}
