import React from 'react';
import { AnalysisState, AppStatus } from '../types';
import { Loader2, Zap } from 'lucide-react';

interface ProcessingViewProps {
  state: AnalysisState;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ state }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-white p-6 rounded-full shadow-xl border-4 border-blue-50">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {state.status === AppStatus.COMPRESSING && "Optimizing Image..."}
        {state.status === AppStatus.ANALYZING && "Scanning Cards..."}
      </h3>
      
      <p className="text-gray-500 max-w-md mx-auto mb-8">
        {state.message}
      </p>

      {/* Progress Indicators */}
      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${state.progress}%` }}
        ></div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Zap size={14} />
        <span>Powered by Google Gemini Pro</span>
      </div>
    </div>
  );
};

export default ProcessingView;