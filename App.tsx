import React, { useState, useRef } from 'react';
import { Camera, Upload, Scan, AlertTriangle, XCircle } from 'lucide-react';
import { AppStatus, Contact, AnalysisState } from './types';
import { analyzeBusinessCards } from './services/geminiService';
import { compressImage } from './services/fileUtils';
import ResultsView from './components/ResultsView';
import ProcessingView from './components/ProcessingView';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AnalysisState>({
    status: AppStatus.IDLE,
    message: '',
    progress: 0
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetApp = () => {
    setAppState({ status: AppStatus.IDLE, message: '', progress: 0 });
    setContacts([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    processImage(file);
  };

  const processImage = async (file: File) => {
    try {
      // Step 1: Compress
      setAppState({ status: AppStatus.COMPRESSING, message: 'Optimizing image for AI analysis...', progress: 20 });
      const base64Image = await compressImage(file);
      
      // Step 2: Upload & Analyze
      setAppState({ status: AppStatus.ANALYZING, message: 'Identifying contacts and extracting details...', progress: 50 });
      
      // Simulate progressive steps for UX since API is one-shot
      const progressInterval = setInterval(() => {
        setAppState(prev => {
          if (prev.status !== AppStatus.ANALYZING || prev.progress >= 90) return prev;
          return { ...prev, progress: prev.progress + 5 };
        });
      }, 500);

      const results = await analyzeBusinessCards(base64Image);
      
      clearInterval(progressInterval);
      setAppState({ status: AppStatus.SUCCESS, message: 'Complete!', progress: 100 });
      setContacts(results);
    } catch (err: any) {
      console.error(err);
      setAppState({ status: AppStatus.ERROR, message: 'Failed to process image.', progress: 0 });
      setError(err.message || 'An unknown error occurred. Please try again.');
    }
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Scan size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">CardScanAI <span className="text-blue-600">V7</span></h1>
          </div>
          {appState.status === AppStatus.SUCCESS && (
            <button onClick={resetApp} className="text-sm font-medium text-gray-500 hover:text-gray-900">
              New Scan
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Hidden Input */}
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
        />

        {/* Views */}
        {appState.status === AppStatus.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="max-w-md w-full text-center space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Digitize your network
                </h2>
                <p className="text-gray-500 text-lg">
                  Instantly convert piles of business cards into digital contacts using Google AI.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={triggerCamera}
                  className="group relative flex flex-col items-center justify-center p-8 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                      <Camera size={40} />
                    </div>
                    <span className="text-xl font-semibold">Take Picture</span>
                    <span className="text-sm text-blue-100">Use your camera</span>
                  </div>
                </button>

                <button 
                  onClick={triggerUpload}
                  className="group relative flex flex-col items-center justify-center p-8 bg-white text-gray-800 rounded-2xl shadow-lg border border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="bg-gray-100 p-4 rounded-full group-hover:bg-gray-200 transition-colors">
                      <Upload size={40} className="text-gray-700" />
                    </div>
                    <span className="text-xl font-semibold">Upload Image</span>
                    <span className="text-sm text-gray-500">From gallery</span>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-8">
                 <p>Supports Batch Scanning • Single or Multiple Cards</p>
              </div>
            </div>
          </div>
        )}

        {(appState.status === AppStatus.COMPRESSING || appState.status === AppStatus.ANALYZING) && (
          <ProcessingView state={appState} />
        )}

        {appState.status === AppStatus.SUCCESS && (
          <ResultsView contacts={contacts} onReset={resetApp} />
        )}

        {appState.status === AppStatus.ERROR && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="bg-red-50 p-4 rounded-full mb-6">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Scan Failed</h3>
            <p className="text-gray-600 max-w-sm mb-8">{error}</p>
            <div className="flex gap-4">
              <button 
                onClick={resetApp}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Go Home
              </button>
              <button 
                onClick={() => {
                    setError(null);
                    if (fileInputRef.current) fileInputRef.current.click(); 
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;