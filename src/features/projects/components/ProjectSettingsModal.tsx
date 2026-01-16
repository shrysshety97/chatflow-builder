import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useProjects } from '../context/ProjectContext';
import { Settings, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectSettingsModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ open, onOpenChange }) => {
  const { currentProject, updateProject, deleteProject } = useProjects();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => { if (currentProject) { setName(currentProject.name); setDescription(currentProject.description || ''); setSystemPrompt(currentProject.systemPrompt); } }, [currentProject]);

  const handleSave = () => { if (!currentProject || !name.trim()) return; updateProject(currentProject.id, { name: name.trim(), description: description.trim() || undefined, systemPrompt: systemPrompt.trim() }); toast.success('Updated'); onOpenChange(false); };
  const handleDelete = () => { if (!currentProject) return; deleteProject(currentProject.id); toast.success('Deleted'); onOpenChange(false); setShowDelete(false); };

  if (!currentProject) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary" />Settings</DialogTitle><DialogDescription>Update project configuration.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="bg-secondary border-border" /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} className="bg-secondary border-border" /></div>
            <div className="space-y-2"><Label>System Prompt</Label><Textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} className="bg-secondary border-border min-h-[150px]" /></div>
            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="destructive" onClick={() => setShowDelete(true)}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
              <div className="flex gap-3"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="gradient" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save</Button></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="bg-card border-border"><AlertDialogHeader><AlertDialogTitle>Delete Project</AlertDialogTitle><AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
};
