
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, Settings } from 'lucide-react';
import { AIProvider, OpenAIModel, GeminiModel } from '@/services/aiService';

interface ApiKeyDialogProps {
  onApiKeySet: (provider: AIProvider, apiKey: string, model: string) => void;
  currentProvider: AIProvider;
  currentModel: string;
  hasApiKey: boolean;
}

const ApiKeyDialog = ({ onApiKeySet, currentProvider, currentModel, hasApiKey }: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(currentProvider);
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      onApiKeySet(selectedProvider, apiKey.trim(), selectedModel);
      setIsOpen(false);
      setApiKey('');
    }
  };

  const openaiModels: Array<{ value: OpenAIModel; label: string }> = [
    { value: 'gpt-4.1-2025-04-14', label: 'GPT-4.1 (Flagship)' },
    { value: 'o3-2025-04-16', label: 'O3 (Reasoning)' },
    { value: 'o4-mini-2025-04-16', label: 'O4 Mini (Fast)' },
    { value: 'gpt-4.1-mini-2025-04-14', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4o', label: 'GPT-4o' },
  ];

  const geminiModels: Array<{ value: GeminiModel; label: string }> = [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro' },
  ];

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    // Set default model for the provider
    if (provider === 'openai') {
      setSelectedModel('gpt-4.1-2025-04-14');
    } else {
      setSelectedModel('gemini-1.5-pro');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`animate-fade-in ${hasApiKey ? 'bg-green-50 border-green-200 hover:bg-green-100' : ''}`}
        >
          <Settings className="w-4 h-4 mr-2" />
          {hasApiKey ? 'Settings' : 'Set API Key'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            AI Configuration
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Tabs value={selectedProvider} onValueChange={handleProviderChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="gemini">Gemini</TabsTrigger>
            </TabsList>
            
            <TabsContent value="openai" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">OpenAI API Key</label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {openaiModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="gemini" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Gemini API Key</label>
                <Input
                  type="password"
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {geminiModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally and never shared.
          </p>
          
          <Button onClick={handleSave} className="w-full" disabled={!apiKey.trim()}>
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
