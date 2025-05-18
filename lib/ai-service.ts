import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateTherapyResponse(
  prompt: string,
  aiResponseStyle: string
) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

    if (!apiKey) {
      console.error("Google AI API key is missing");
      return "I'm sorry, there's a configuration issue. Please contact support.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    const therapyPrompt = `As an AI therapist, respond to the following message with empathy, 
    insight, and therapeutic techniques. Maintain a supportive tone and offer thoughtful 
    perspectives. Keep responses concise but meaningful, without any additional text.
    Response style: "${aiResponseStyle}"
    User message: "${prompt}"`;

    // Generate content with safety settings
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: therapyPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });

    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error("Error generating therapy response:", error);

    if (error?.message?.includes("authentication")) {
      console.error("Authentication error - check API key");
      return "I'm experiencing connection issues. This may be due to an API configuration problem.";
    }

    return "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
  }
}

export async function analyzeJournalEntry(entry: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

    if (!apiKey) {
      console.error("Google AI API key is missing");
      return "I'm sorry, there's a configuration issue. Please contact support.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    const analysisPrompt = `As a therapeutic AI assistant, please analyze the following journal entry 
    and provide thoughtful, empathetic insights. Focus on emotional patterns, potential areas for 
    growth, and positive observations:
    
    "${entry}"
    
    Provide a single, specific insight that might be helpful for reflection, without any additional text.`;

    // Generate content with safety settings
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing journal entry:", error);
    return "I couldn't analyze your journal entry right now. Please try again later.";
  }
}
