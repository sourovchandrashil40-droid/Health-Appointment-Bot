import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getListOpenaiMessagesQueryKey } from '@workspace/api-client-react';

export type ChatMessage = {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export function useChatStream(conversationId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const queryClient = useQueryClient();

  const addSystemMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, { role: 'system', content }]);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId) return;
    
    // Optimistic user message
    setMessages(prev => [...prev, { role: 'user', content }]);
    setIsStreaming(true);
    
    // Placeholder for assistant response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Failed to send message');
      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || ''; 
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              const dataStr = trimmedLine.slice(6);
              if (dataStr === '[DONE]') continue;
              
              try {
                const data = JSON.parse(dataStr);
                if (data.done) {
                  done = true;
                } else if (data.content) {
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 1];
                    if (lastMsg.role === 'assistant') {
                      lastMsg.content += data.content;
                    }
                    return newMsgs;
                  });
                }
              } catch (e) {
                console.error('Error parsing SSE JSON:', e);
              }
            }
          }
        }
      }
      
      // Invalidate message history query to sync with backend
      queryClient.invalidateQueries({
        queryKey: getListOpenaiMessagesQueryKey(conversationId)
      });
      
    } catch (error) {
      console.error('Chat stream error:', error);
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg.role === 'assistant' && !lastMsg.content) {
          lastMsg.content = "I'm sorry, I encountered a network error. Please try again.";
        }
        return newMsgs;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [conversationId, queryClient]);

  return { 
    messages, 
    setMessages, 
    sendMessage, 
    isStreaming,
    addSystemMessage
  };
}
