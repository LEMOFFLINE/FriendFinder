// Utility functions for message handling

export function formatMessageTime(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

export interface MessageSplit {
  type: 'text' | 'image';
  content: string;
}

// Split message into text and image parts if both are provided
export function splitMessage(text: string | null, imageUrl: string | null): MessageSplit[] {
  const messages: MessageSplit[] = [];
  
  if (text && text.trim()) {
    messages.push({ type: 'text', content: text.trim() });
  }
  
  if (imageUrl) {
    messages.push({ type: 'image', content: imageUrl });
  }
  
  return messages;
}

// Validate message content
export function validateMessage(type: 'text' | 'image', content: string): { valid: boolean; error?: string } {
  if (!content) {
    return { valid: false, error: 'Content cannot be empty' };
  }
  
  if (type === 'text' && content.length > 200) {
    return { valid: false, error: 'Text message cannot exceed 200 characters' };
  }
  
  return { valid: true };
}

// Generate preview text for conversation list
export function generateMessagePreview(messageType: 'text' | 'image', content: string, maxLength: number = 50): string {
  if (messageType === 'image') {
    return '[Image]';
  }
  
  if (content.length <= maxLength) {
    return content;
  }
  
  return content.substring(0, maxLength) + '...';
}
