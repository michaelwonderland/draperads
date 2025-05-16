import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Initialize Anthropic client
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to convert file to base64
const readFileAsync = promisify(fs.readFile);

export async function analyzeImage(filePath: string): Promise<{
  suggestedHeadline: string;
  suggestedPrimaryText: string;
  suggestedDescription: string;
  suggestedCta: string;
}> {
  try {
    const fullPath = path.resolve(filePath);
    const fileBuffer = await readFileAsync(fullPath);
    const base64Image = fileBuffer.toString('base64');
    
    // Make request to Anthropic API for image analysis
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Based on the uploaded file shown below, write corresponding ad copy using 2025 Meta Ads best practices for the product or service shown.

              Output only a JSON object with the following fields:
              - suggestedHeadline: A short, attention-grabbing headline (max 40 characters)
              - suggestedPrimaryText: Compelling main ad text (2-3 sentences) following Meta's 2025 best practices
              - suggestedDescription: A brief description expanding on the product/service (1 sentence)
              - suggestedCta: Select the most relevant call-to-action from these options only: "learn_more", "sign_up", "shop_now", "download", "get_offer"
              
              Focus on the specific product/service shown in the image. Write in a direct, engaging style that highlights key benefits and creates urgency.
              Output ONLY the JSON object with no additional text or commentary.`
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    // TypeScript handling for Anthropic API response content
    const contentBlock = response.content[0] as { type: string, text: string };
    
    if (contentBlock && contentBlock.type === 'text') {
      const resultText = contentBlock.text;
      const jsonMatch = resultText.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch && jsonMatch[0]) {
        const jsonResult = JSON.parse(jsonMatch[0]);
        return {
          suggestedHeadline: jsonResult.suggestedHeadline || '',
          suggestedPrimaryText: jsonResult.suggestedPrimaryText || '',
          suggestedDescription: jsonResult.suggestedDescription || '',
          suggestedCta: jsonResult.suggestedCta || 'learn_more'
        };
      }
    }
    
    throw new Error('Could not parse JSON response from AI');
  } catch (error) {
    console.error('Error analyzing image:', error);
    // Return default values if analysis fails
    return {
      suggestedHeadline: 'Create stunning ads in minutes!',
      suggestedPrimaryText: 'Transform your social media presence with our AI-powered design tools. No design skills needed!',
      suggestedDescription: 'Try it today and see the difference.',
      suggestedCta: 'sign_up'
    };
  }
}