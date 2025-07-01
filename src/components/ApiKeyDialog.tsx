
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, Settings } from 'lucide-react';

interface ApiKeyDialogProps {
  onApiKeySet: (apiKey: string, model: string) => void;
  currentModel: string;
  hasApiKey: boolean;
}

const ApiKeyDialog = ({ onApiKeySet, currentModel, hasApiKey }: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim(), selectedModel);
      setIsOpen(false);
      setApiKey('');
    }
  };

  const models = [
    { value: 'gpt-4.1-2025-04-14', label: 'GPT-4.1 (Flagship)' },
    { value: 'o3-2025-04-16', label: 'O3 (Reasoning)' },
    { value: 'o4-mini-2025-04-16', label: 'O4 Mini (Fast)' },
    { value: 'gpt-4.1-mini-2025-04-14', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4o', label: 'GPT-4o' },
  ];

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
            OpenAI Configuration
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">API Key</label>
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your API key is stored locally and never shared.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} className="w-full" disabled={!apiKey.trim()}>
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
