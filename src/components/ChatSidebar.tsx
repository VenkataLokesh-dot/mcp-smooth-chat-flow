
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export interface ChatSession {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onNewChat: () => void;
}

const ChatSidebar = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat
}: ChatSidebarProps) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-lg">Chat History</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onNewChat}
                className="text-xs"
              >
                New Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Sessions */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chat history yet</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                      currentSessionId === session.id
                        ? 'bg-muted border-primary'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {session.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(session.updatedAt, 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.messages.length} messages
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
