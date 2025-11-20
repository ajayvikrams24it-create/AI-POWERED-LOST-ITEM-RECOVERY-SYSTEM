export interface User {
  id: string;
  email: string;
  name: string;
  rollNo: string;
  institution: string;
  phone?: string;
  createdAt: string;
}

export interface Item {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  location: string;
  dateReported: string;
  status: 'active' | 'matched' | 'returned' | 'deleted';
  reportedBy: string;
  reporterName?: string;
  reporterRollNo?: string;
  reporterInstitution?: string;
  matchedWith?: string;
  aiAnalysis?: {
    detectedText: string[];
    itemType: string;
    confidence: number;
    extractedInfo: {
      names?: string[];
      ids?: string[];
      brands?: string[];
    };
  };
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  itemId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Match {
  id: string;
  lostItemId: string;
  foundItemId: string;
  confidence: number;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}