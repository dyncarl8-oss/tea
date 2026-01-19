import { GoogleGenAI, Type } from "@google/genai";
import { Product, Recommendation } from "../types";

// Initialize Gemini Client
// In a real app, ensure process.env.API_KEY is set.
// For this demo, we assume the environment is set up correctly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartRecommendation = async (
  symptomText: string,
  selectedSymptoms: string[],
  availableProducts: Product[]
): Promise<Recommendation | null> => {
  
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Returning mock fallback.");
    // Fallback logic for when API key is missing in demo
    const product = availableProducts[0];
    return {
      product,
      ritual: "Steep 1 tsp in 8oz hot water for 5 minutes. Breathe deeply while waiting.",
      whyItWorks: "The selected herbs are known for their calming properties."
    };
  }

  const model = "gemini-3-flash-preview";

  // Create a context string of available products to help the AI match
  const productContext = availableProducts.map(p => 
    `ID: ${p.id}, Name: ${p.name}, Ingredients: ${p.ingredients.join(', ')}, Benefits: ${p.benefits.join(', ')}`
  ).join('\n');

  const prompt = `
    You are an expert herbalist for a Caribbean-inspired wellness brand.
    
    User Symptoms: ${selectedSymptoms.join(', ')}
    Additional Context: "${symptomText}"
    
    Available Products:
    ${productContext}
    
    Task:
    1. Select the BEST single product from the list above that matches the symptoms.
    2. Write a short "Why it works" explanation (max 2 sentences).
    3. Create a unique, calming "Brewing Ritual" specific to these symptoms (max 2 sentences).
    
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productId: { type: Type.STRING, description: "The ID of the matching product" },
            whyItWorks: { type: Type.STRING },
            ritual: { type: Type.STRING }
          },
          required: ["productId", "whyItWorks", "ritual"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");

    const resultJson = JSON.parse(resultText);
    const matchedProduct = availableProducts.find(p => p.id === resultJson.productId);

    if (!matchedProduct) return null;

    return {
      product: matchedProduct,
      ritual: resultJson.ritual,
      whyItWorks: resultJson.whyItWorks
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback
    const product = availableProducts[0];
    return {
      product,
      ritual: "Steep carefully and enjoy the warmth.",
      whyItWorks: "We are having trouble connecting to our herbalist AI, but this blend is our top recommendation."
    };
  }
};