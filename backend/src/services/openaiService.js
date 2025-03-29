import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Classify a document type based on its filename
 * @param {string} filename - The name of the file
 * @returns {Promise<string>} The classified document type
 */
export const classifyDocument = async (filename) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a document classifier. Classify the given filename into one of these categories: 'bill_of_lading', 'invoice', 'packing_list', 'other'. Respond with just the category name."
        },
        {
          role: "user",
          content: filename
        }
      ],
      temperature: 0.3,
      max_tokens: 10
    });

    const classification = response.choices[0].message.content.trim().toLowerCase();
    
    // Validate classification
    const validTypes = ['bill_of_lading', 'invoice', 'packing_list', 'other'];
    return validTypes.includes(classification) ? classification : 'other';
  } catch (error) {
    console.error('Error classifying document:', error);
    return 'other'; // Fallback to 'other' on error
  }
}; 