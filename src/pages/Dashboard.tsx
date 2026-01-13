import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { ProjectSettingsModal } from '@/components/project/ProjectSettingsModal';
import { useProjects } from '@/contexts/ProjectContext';

export const Dashboard: React.FC = () => {
  const [showNewProject, setShowNewProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { currentProject } = useProjects();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        onNewProject={() => setShowNewProject(true)}
        onSettings={() => setShowSettings(true)}
      />
      
      <ChatWindow onOpenSettings={() => setShowSettings(true)} />

      <CreateProjectModal 
        open={showNewProject} 
        onOpenChange={setShowNewProject} 
      />
      
      {currentProject && (
        <ProjectSettingsModal 
          open={showSettings} 
          onOpenChange={setShowSettings} 
        />
      )}
    </div>
  );
};

export default Dashboard;
