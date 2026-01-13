import React, { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { Sparkles, MessageSquare, Bot, Zap } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const features = [
    {
      icon: Bot,
      title: 'Custom AI Agents',
      description: 'Create personalized chatbots with custom prompts and behaviors.',
    },
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Engage in seamless conversations powered by advanced LLMs.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Experience low-latency responses for fluid interactions.',
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">ChatForge</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            Build Intelligent
            <br />
            <span className="text-gradient">Conversational AI</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-md">
            Create, deploy, and manage AI-powered chatbots with custom personalities and capabilities.
          </p>

          <div className="space-y-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl animate-pulse-slow" />
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <AuthForm mode={mode} onToggleMode={() => setMode(mode === 'login' ? 'register' : 'login')} />
      </div>
    </div>
  );
};

export default AuthPage;
