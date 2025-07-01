
import { Bot, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApiKeyDialog from './ApiKeyDialog';
import { AIProvider } from '@/services/aiService';

interface HeaderProps {
  onApiKeySet: (provider: AIProvider, apiKey: string, model: string) => void;
  currentProvider: AIProvider;
  currentModel: string;
  hasApiKey: boolean;
  onToggleSidebar: () => void;
}

const Header = ({ onApiKeySet, currentProvider, currentModel, hasApiKey, onToggleSidebar }: HeaderProps) => {
  const getProviderDisplay = () => {
    if (!hasApiKey) return 'Configure API to start';
    return `Using ${currentProvider === 'openai' ? 'OpenAI' : 'Gemini'} - ${currentModel}`;
  };

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse-bot">
                <Bot className="w-6 h-6 text-white animate-bounce" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
                MCP Bot
              </h1>
              <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {getProviderDisplay()}
              </p>
            </div>
          </div>
          <ApiKeyDialog 
            onApiKeySet={onApiKeySet}
            currentProvider={currentProvider}
            currentModel={currentModel}
            hasApiKey={hasApiKey}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
