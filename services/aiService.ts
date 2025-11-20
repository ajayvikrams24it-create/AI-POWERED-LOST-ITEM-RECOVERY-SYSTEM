import { Item } from '../types';

export interface AIAnalysisResult {
  detectedText: string[];
  itemType: string;
  confidence: number;
  extractedInfo: {
    names?: string[];
    ids?: string[];
    brands?: string[];
  };
}

// Simulate AI image analysis
export const analyzeImage = async (imageFile: File): Promise<AIAnalysisResult> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  const fileName = imageFile.name.toLowerCase();
  const fileSize = imageFile.size;

  // Mock AI analysis based on file characteristics
  let itemType = 'unknown';
  let detectedText: string[] = [];
  let extractedInfo: AIAnalysisResult['extractedInfo'] = {};
  let confidence = 0.85;

  // Simulate different item types based on filename or other characteristics
  if (fileName.includes('id') || fileName.includes('card')) {
    itemType = 'ID Card';
    detectedText = ['STUDENT ID', 'John Doe', 'ID: 12345678', 'University Name'];
    extractedInfo = {
      names: ['John Doe'],
      ids: ['12345678']
    };
    confidence = 0.95;
  } else if (fileName.includes('phone') || fileName.includes('mobile')) {
    itemType = 'Mobile Phone';
    detectedText = ['iPhone', 'Model: iPhone 13'];
    extractedInfo = {
      brands: ['Apple']
    };
    confidence = 0.90;
  } else if (fileName.includes('book') || fileName.includes('textbook')) {
    itemType = 'Textbook';
    detectedText = ['Mathematics', 'Property of: Jane Smith'];
    extractedInfo = {
      names: ['Jane Smith']
    };
    confidence = 0.88;
  } else if (fileName.includes('wallet') || fileName.includes('purse')) {
    itemType = 'Wallet';
    detectedText = ['Driver License', 'Michael Johnson'];
    extractedInfo = {
      names: ['Michael Johnson']
    };
    confidence = 0.92;
  } else if (fileName.includes('key') || fileName.includes('keys')) {
    itemType = 'Keys';
    detectedText = ['Room 205', 'Keychain: Sarah'];
    extractedInfo = {
      names: ['Sarah']
    };
    confidence = 0.80;
  } else {
    // Generic item analysis
    const genericItems = ['Backpack', 'Laptop', 'Water Bottle', 'Headphones', 'Notebook'];
    itemType = genericItems[Math.floor(Math.random() * genericItems.length)];
    detectedText = [`${itemType} detected`];
    confidence = 0.75;
  }

  return {
    detectedText,
    itemType,
    confidence,
    extractedInfo
  };
};

// Find potential matches between lost and found items
export const findMatches = (lostItems: Item[], foundItems: Item[]): Array<{
  lostItem: Item;
  foundItem: Item;
  confidence: number;
}> => {
  const matches: Array<{ lostItem: Item; foundItem: Item; confidence: number }> = [];

  lostItems.forEach(lostItem => {
    foundItems.forEach(foundItem => {
      let confidence = 0;

      // Match by item type
      if (lostItem.aiAnalysis?.itemType === foundItem.aiAnalysis?.itemType) {
        confidence += 0.3;
      }

      // Match by extracted names
      const lostNames = lostItem.aiAnalysis?.extractedInfo.names || [];
      const foundNames = foundItem.aiAnalysis?.extractedInfo.names || [];
      const nameMatches = lostNames.some(name => foundNames.includes(name));
      if (nameMatches) {
        confidence += 0.4;
      }

      // Match by extracted IDs
      const lostIds = lostItem.aiAnalysis?.extractedInfo.ids || [];
      const foundIds = foundItem.aiAnalysis?.extractedInfo.ids || [];
      const idMatches = lostIds.some(id => foundIds.includes(id));
      if (idMatches) {
        confidence += 0.5;
      }

      // Match by category
      if (lostItem.category === foundItem.category) {
        confidence += 0.2;
      }

      // Match by description keywords
      const lostWords = lostItem.description.toLowerCase().split(' ');
      const foundWords = foundItem.description.toLowerCase().split(' ');
      const commonWords = lostWords.filter(word => foundWords.includes(word) && word.length > 3);
      confidence += Math.min(commonWords.length * 0.1, 0.3);

      if (confidence >= 0.6) {
        matches.push({ lostItem, foundItem, confidence });
      }
    });
  });

  return matches.sort((a, b) => b.confidence - a.confidence);
};