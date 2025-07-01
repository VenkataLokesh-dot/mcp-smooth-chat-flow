
import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import TypingIndicator from '@/components/TypingIndicator';
import { openAIService } from '@/services/openai';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm MCP Bot, your intelligent AI assistant. Please configure your OpenAI API key to start chatting!",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentModel, setCurrentModel] = useState('gpt-4.1-2025-04-14');
  const [hasApiKey, setHasApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Check for saved API key on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    const savedModel = localStorage.getItem('openai_model');
    
    if (savedApiKey) {
      openAIService.initialize(savedApiKey, savedModel || currentModel);
      setHasApiKey(true);
      if (savedModel) setCurrentModel(savedModel);
    }
  }, []);

  const handleApiKeySet = (apiKey: string, model: string) => {
    try {
      openAIService.initialize(apiKey, model);
      localStorage.setItem('openai_api_key', apiKey);
      localStorage.setItem('openai_model', model);
      setHasApiKey(true);
      setCurrentModel(model);
      
      toast({
        title: "API Key Set Successfully",
        description: `Now using ${model}`,
      });

      // Update the welcome message
      setMessages([{
        id: '1',
        text: `Hello! I'm MCP Bot, your intelligent AI assistant powered by ${model}. How can I help you today?`,
        isBot: true,
        timestamp: new Date(),
      }]);
    } catch (error) {
      toast({
        title: "Configuration Error",
        description: "Failed to configure OpenAI. Please check your API key.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenAI API key first.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Prepare conversation history for OpenAI
      const conversationHistory = messages.map(msg => ({
        role: msg.isBot ? 'assistant' as const : 'user' as const,
        content: msg.text
      }));
      
      // Add the new user message
      conversationHistory.push({
        role: 'user' as const,
        content: text
      });

      const response = await openAIService.sendMessage(conversationHistory);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and try again.`,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get response from OpenAI",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col">
      <Header 
        onApiKeySet={handleApiKeySet}
        currentModel={currentModel}
        hasApiKey={hasApiKey}
      />
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center py-12 px-4 animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-bot">
                <div className="text-3xl">🤖</div>
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to MCP Bot
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your advanced AI assistant powered by OpenAI. {hasApiKey ? 'Ready to chat!' : 'Configure your API key to get started.'}
              </p>
            </div>

            {/* Messages */}
            <div className="space-y-1">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isBot={message.isBot}
                  timestamp={message.timestamp}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping || !hasApiKey} />
    </div>
  );
};

export default Index;
