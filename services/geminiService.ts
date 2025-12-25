import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ContentRequest, ContentType, SlideData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema Definition for Text Output
const slideSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Catchy title for the slide" },
    mainText: { type: Type.STRING, description: "The core educational content (examples, words, etc.) or the Main Message for announcements." },
    contentList: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "A list of strings. Use this for specific announcement fields (e.g. Time, Date, Location) or bullet points. Do NOT put these in mainText." 
    },
    secondaryText: { type: Type.STRING, description: "Translations, explanations, or meanings. For announcements, this is the Additional Details." },
    visualPrompt: { type: Type.STRING, description: "A detailed description for an AI image generator to create a vector/cartoon style illustration representing this content. Minimalist background." }
  },
  required: ["title", "mainText", "visualPrompt"]
};

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: slideSchema
};

/**
 * Generates the text content for the slides.
 */
export const generateSlideText = async (request: ContentRequest): Promise<SlideData[]> => {
  const { type, topic, slideCount } = request;

  let promptContext = "";

  switch (type) {
    case ContentType.GRAMMAR:
      promptContext = `Create ${slideCount} slides about Grammar focused on: "${topic}". Provide 2-3 correct sentence examples and a brief explanation of the rule.`;
      break;
    case ContentType.VOCABULARY:
      promptContext = `Create ${slideCount} slides teaching Vocabulary about: "${topic}". Each slide should have a new word/phrase and its Indonesian translation.`;
      break;
    case ContentType.SLANG:
      promptContext = `Create ${slideCount} slides about English Slang Words regarding: "${topic}". Include the slang, an example sentence, and Indonesian meaning.`;
      break;
    case ContentType.IDIOMS:
      promptContext = `Create ${slideCount} slides about English Idioms regarding: "${topic}". Include the idiom, usage example, and Indonesian meaning.`;
      break;
    case ContentType.ANNOUNCEMENT:
      // Pass the raw fields to the prompt context
      const highlights = request.announcementFields 
        ? request.announcementFields.filter(f => f.trim() !== '')
        : [];
      const highlightsJson = JSON.stringify(highlights);

      promptContext = `Create 1 slide for an Announcement.
      Title: "${request.announcementTitle}"
      Main Message: "${request.announcementBody1}"
      Highlights/Fields: ${highlightsJson}
      Additional Details: "${request.announcementBody2 || ''}"
      
      Instructions:
      1. Use the provided Title as the slide title.
      2. Use the Main Message as the 'mainText'. Do NOT include the highlights here.
      3. STRICTLY put the items from 'Highlights/Fields' into the 'contentList' array. Keep them exactly as provided or slightly formatted for clarity.
      4. Use Additional Details as the 'secondaryText' (if empty, leave empty).
      5. Generate a 'visualPrompt' describing a professional, modern, flat vector illustration suitable for this announcement (e.g., megaphone, calendar, notification bell).`;
      break;
  }

  const prompt = `
    You are an expert English teacher for "Impact", an English course. 
    ${promptContext}
    
    Ensure the tone is modern, educational, and fun.
    Generate a strictly JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a specialized content generator for an English Education brand. Your output is always valid JSON."
      }
    });

    const textData = JSON.parse(response.text || "[]");
    
    // Map to internal SlideData structure with IDs
    return textData.map((item: any, index: number) => ({
      id: index + 1,
      title: item.title,
      mainText: item.mainText,
      contentList: item.contentList || [],
      secondaryText: item.secondaryText || "",
      visualPrompt: item.visualPrompt,
      footer: "Impact English Course"
    }));

  } catch (error) {
    console.error("Text Gen Error:", error);
    throw error;
  }
};

/**
 * Generates an image for a specific slide if requested.
 */
export const generateSlideImage = async (visualPrompt: string, aspectRatio: string): Promise<string | undefined> => {
  try {
    // Determine strict AR for the model
    let ar = "1:1";
    if (aspectRatio === "4:3") ar = "4:3";
    if (aspectRatio === "9:16") ar = "9:16";

    // Switch to gemini-2.5-flash-image
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A clean, modern flat vector or cartoon style illustration. ${visualPrompt}. White or soft colored solid background. High quality, educational context. Do not include text in the image.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: ar as any
        }
      }
    });

    // Extract base64
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return undefined; 
  }
};