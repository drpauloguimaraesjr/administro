'use client';

import { motion } from 'framer-motion';
import { Home, Building2, BarChart3 } from 'lucide-react';
import { ContextType } from '@/shared/types/index';

interface ContextSelectorProps {
  selectedContext: ContextType;
  onContextChange: (context: ContextType) => void;
}

export function ContextSelector({ selectedContext, onContextChange }: ContextSelectorProps) {
  const contexts: { value: ContextType; label: string; icon: React.ReactNode }[] = [
    { value: 'HOME', label: 'Casa', icon: <Home className="w-4 h-4" /> },
    { value: 'CLINIC', label: 'Clínica', icon: <Building2 className="w-4 h-4" /> },
    { value: 'OVERVIEW', label: 'Geral', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg">
      {contexts.map((context) => (
        <motion.button
          key={context.value}
          onClick={() => onContextChange(context.value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${selectedContext === context.value
            ? 'bg-white text-primary '
            : 'text-muted-foreground hover:text-foreground'
            }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {context.icon}
          <span className="hidden sm:inline">{context.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

