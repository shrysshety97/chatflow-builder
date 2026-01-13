import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProjects } from '@/contexts/ProjectContext';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { createProject, selectProject, isLoading } = useProjects();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful AI assistant. Be concise, accurate, and friendly in your responses.'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      const project = await createProject(name.trim(), description.trim() || undefined, systemPrompt.trim());
      selectProject(project.id);
      toast.success('Project created successfully!');
      onOpenChange(false);
      setName('');
      setDescription('');
      setSystemPrompt('You are a helpful AI assistant. Be concise, accurate, and friendly in your responses.');
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Set up a new AI agent with custom behavior and personality.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="My AI Assistant"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="A brief description of your agent"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              placeholder="Define your agent's behavior..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="bg-secondary border-border min-h-[120px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              This prompt defines how your AI agent will behave and respond.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
