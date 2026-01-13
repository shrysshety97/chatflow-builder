import React from 'react';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Bot, 
  Settings, 
  LogOut, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onNewProject: () => void;
  onSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewProject, onSettings }) => {
  const { projects, currentProject, selectProject } = useProjects();
  const { user, logout } = useAuth();

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">ChatForge</span>
        </div>
      </div>

      {/* New Project Button */}
      <div className="p-4">
        <Button 
          onClick={onNewProject} 
          variant="gradient" 
          className="w-full"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        <div className="text-xs font-medium text-muted-foreground px-2 py-2">
          PROJECTS
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Bot className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No projects yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => selectProject(project.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                  currentProject?.id === project.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{project.name}</p>
                  {project.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {project.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border p-4 space-y-2">
        <button
          onClick={onSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm">Settings</span>
        </button>
        
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground transition-all"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
