import React, { useState } from 'react';
import { Sidebar } from '@/features/layout/components/Sidebar';
import { ChatWindow } from '@/features/layout/components/ChatWindow';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal';
import { ProjectSettingsModal } from '@/features/projects/components/ProjectSettingsModal';
import { useProjects } from '@/features/projects';

export const Dashboard: React.FC = () => {
  const [showNewProject, setShowNewProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { currentProject } = useProjects();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onNewProject={() => setShowNewProject(true)} onSettings={() => setShowSettings(true)} />
      <ChatWindow onOpenSettings={() => setShowSettings(true)} />
      <CreateProjectModal open={showNewProject} onOpenChange={setShowNewProject} />
      {currentProject && <ProjectSettingsModal open={showSettings} onOpenChange={setShowSettings} />}
    </div>
  );
};

export default Dashboard;
