import React from 'react';
import FederationResultsHub from '../Results/FederationResultsHub';

interface EventResultsProps {
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
  darkMode?: boolean;
}

export default function EventResults({ onNotify, darkMode }: EventResultsProps) {
  return (
    <div className="w-full">
      <FederationResultsHub darkMode={darkMode} onNotify={onNotify} />
    </div>
  );
}
