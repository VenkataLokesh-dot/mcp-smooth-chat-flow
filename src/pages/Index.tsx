
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import TypingIndicator from '@/components/TypingIndicator';
import ChatSidebar, { ChatSession } from '@/components/ChatSidebar';
import { aiService, AIProvider } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';
import { Menu } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<AIProvider>('openai');
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

  // Load sessions and API key from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('chat_sessions');
    const savedApiKey = localStorage.getItem('ai_api_key');
    const savedProvider = localStorage.getItem('ai_provider') as AIProvider;
    const savedModel = localStorage.getItem('ai_model');
    
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setSessions(parsedSessions);
    }
    
    if (savedApiKey && savedProvider) {
      const provider = savedProvider || 'openai';
      const model = savedModel || (provider === 'openai' ? 'gpt-4.1-2025-04-14' : 'gemini-1.5-pro');
      
      aiService.initialize(provider, savedApiKey, model);
      setHasApiKey(true);
      setCurrentProvider(provider);
      setCurrentModel(model);
    }

    // Create initial session if none exist
    if (!savedSessions || JSON.parse(savedSessions || '[]').length === 0) {
      createNewSession(true);
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const createNewSession = (isInitial = false) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: isInitial ? 'Welcome Chat' : 'New Chat',
      messages: isInitial ? [{
        id: '1',
        text: hasApiKey 
          ? `Hello! I'm MCP Bot, your intelligent AI assistant powered by ${currentProvider === 'openai' ? 'OpenAI' : 'Gemini'}. How can I help you today?`
          : "Hello! I'm MCP Bot, your intelligent AI assistant. Please configure your API key to start chatting!",
        isBot: true,
        timestamp: new Date(),
      }] : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages(newSession.messages);
  };

  const handleApiKeySet = (provider: AIProvider, apiKey: string, model: string) => {
    try {
      aiService.initialize(provider, apiKey, model);
      localStorage.setItem('ai_api_key', apiKey);
      localStorage.setItem('ai_provider', provider);
      localStorage.setItem('ai_model', model);
      setHasApiKey(true);
      setCurrentProvider(provider);
      setCurrentModel(model);
      
      toast({
        title: "API Key Set Successfully",
        description: `Now using ${provider === 'openai' ? 'OpenAI' : 'Gemini'} - ${model}`,
      });

      // Update current session welcome message
      const welcomeMessage = {
        id: '1',
        text: `Hello! I'm MCP Bot, your intelligent AI assistant powered by ${provider === 'openai' ? 'OpenAI' : 'Gemini'}. How can I help you today?`,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      
      if (currentSessionId) {
        updateCurrentSession([welcomeMessage]);
      }
    } catch (error) {
      toast({
        title: "Configuration Error",
        description: "Failed to configure AI service. Please check your API key.",
        variant: "destructive",
      });
    }
  };

  const updateCurrentSession = (newMessages: Message[]) => {
    if (!currentSessionId) return;
    
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const title = newMessages.length > 1 
          ? newMessages.find(m => !m.isBot)?.text.substring(0, 50) + '...' || session.title
          : session.title;
        
        return {
          ...session,
          title,
          messages: newMessages,
          updatedAt: new Date()
        };
      }
      return session;
    }));
  };

  const handleSendMessage = async (text: string) => {
    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your API key first.",
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

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const conversationHistory = newMessages.map(msg => ({
        role: msg.isBot ? 'assistant' as const : 'user' as const,
        content: msg.text
      }));

      const response = await aiService.sendMessage(conversationHistory);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      updateCurrentSession(finalMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and try again.`,
        isBot: true,
        timestamp: new Date(),
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      updateCurrentSession(finalMessages);
      
      toast({
        title: "Error",
        description: "Failed to get response from AI service",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        handleSelectSession(remainingSessions[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const handleNewChat = () => {
    createNewSession();
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : ''}`}>
        {/* Header */}
        <Header 
          onApiKeySet={handleApiKeySet}
          currentProvider={currentProvider}
          currentModel={currentModel}
          hasApiKey={hasApiKey}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        {/* Toggle sidebar button for desktop */}
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-20 z-20 hidden lg:flex bg-card border border-border shadow-sm"
          >
            <Menu className="w-4 h-4" />
          </Button>
        )}
        
        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Welcome Section - only show if no messages */}
              {messages.length === 0 && (
                <div className="text-center py-12 px-4 animate-fade-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-bot">
                    <div className="text-3xl">🤖</div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome to MCP Bot
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your advanced AI assistant powered by {currentProvider === 'openai' ? 'OpenAI' : 'Gemini'}. {hasApiKey ? 'Ready to chat!' : 'Configure your API key to get started.'}
                  </p>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-1 pb-4">
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

        {/* Chat Input */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping || !hasApiKey} />
      </div>
    </div>
  );
};

export default Index;
