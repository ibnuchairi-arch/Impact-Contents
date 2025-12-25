import React, { useState, useEffect } from 'react';
import { ContentRequest, ContentType, AspectRatio, SlideData, ErrorState } from './types';
import ContentForm from './components/ContentForm';
import ContentResults from './components/ContentResults';
import { generateSlideText, generateSlideImage } from './services/geminiService';
import { AlertTriangle, Clock } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [request, setRequest] = useState<ContentRequest>({
    type: ContentType.GRAMMAR,
    topic: '',
    hasImage: false,
    slideCount: 1,
    aspectRatio: AspectRatio.SQUARE,
    announcementTitle: '',
    announcementBody1: '',
    announcementFields: [''], // Initialize with one empty field
    announcementBody2: ''
  });

  const [slides, setSlides] = useState<SlideData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>(''); // For granular loading messages
  
  // Error & Retry State
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false, message: '' });
  const [retryTimer, setRetryTimer] = useState<number>(0);

  // --- Effects ---

  // Countdown Timer for Error Retry
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (retryTimer > 0) {
      interval = setInterval(() => {
        setRetryTimer((prev) => prev - 1);
      }, 1000);
    } else if (retryTimer === 0 && errorState.hasError) {
      // Auto retry when timer hits 0
      handleGenerate();
    }
    return () => clearInterval(interval);
  }, [retryTimer, errorState.hasError]);

  // --- Logic ---

  const handleGenerate = async () => {
    // Validation
    if (request.type === ContentType.ANNOUNCEMENT) {
        if (!request.announcementTitle || !request.announcementBody1) return;
    } else {
        if (!request.topic) return;
    }

    setIsGenerating(true);
    setErrorState({ hasError: false, message: '' });
    setSlides([]); // Clear previous results while generating

    try {
      // 1. Generate Text Content
      setLoadingStage('Drafting content with Gemini...');
      const generatedSlides = await generateSlideText(request);

      // 2. Generate Images (if requested)
      if (request.hasImage) {
        setLoadingStage(`Designing unique visuals...`);
        
        // Process images in parallel
        const slidesWithImages = await Promise.all(
          generatedSlides.map(async (slide) => {
            if (slide.visualPrompt) {
              const base64 = await generateSlideImage(slide.visualPrompt, request.aspectRatio);
              return { ...slide, imageBase64: base64 };
            }
            return slide;
          })
        );
        setSlides(slidesWithImages);
      } else {
        setSlides(generatedSlides);
      }

      setLoadingStage('');
      setIsGenerating(false);

    } catch (error: any) {
      console.error(error);
      setIsGenerating(false);
      setLoadingStage('');
      
      // Basic Error handling logic
      const isQuotaError = error.message?.includes('429') || error.message?.includes('quota') || error.status === 429;
      
      if (isQuotaError || error) {
        setErrorState({
          hasError: true,
          message: isQuotaError ? "Quota exceeded. Cooling down..." : "AI Service unavailable. Retrying..."
        });
        setRetryTimer(10); // 10 seconds retry countdown
      }
    }
  };

  const cancelRetry = () => {
    setRetryTimer(0);
    setErrorState({ hasError: false, message: '' });
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header / Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">I</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Impact <span className="text-blue-600">Generator</span></h1>
          </div>
          <div className="text-xs text-gray-500 hidden sm:block">Marketing Division Tool v1.0</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Error / Retry Notification */}
        {errorState.hasError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-500" />
              <div>
                <p className="font-bold">{errorState.message}</p>
                <p className="text-sm">Retrying automatically in {retryTimer} seconds...</p>
              </div>
            </div>
            <button 
              onClick={cancelRetry} 
              className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-50"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Loading Overlay State */}
        {isGenerating && (
          <div className="fixed inset-0 z-40 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-gray-100 max-w-sm w-full text-center">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-gray-800">Creating Magic</h3>
              <p className="text-gray-500 mt-2 text-sm">{loadingStage}</p>
              {request.hasImage && <p className="text-xs text-orange-500 mt-4 bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1"><Clock size={12}/> AI Image generation takes time</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
          
          {/* Left Column: Settings (4 cols) */}
          <div className="lg:col-span-4 h-full">
            <ContentForm 
              request={request}
              onChange={setRequest}
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right Column: Output (8 cols) */}
          <div className="lg:col-span-8 h-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 overflow-hidden">
            <ContentResults slides={slides} request={request} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;