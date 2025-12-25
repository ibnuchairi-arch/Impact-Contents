import React, { useState } from 'react';
import { SlideData, ContentRequest } from '../types';
import SlidePreview from './SlidePreview';
import { X } from 'lucide-react';

interface Props {
  slides: SlideData[];
  request: ContentRequest;
}

const ContentResults: React.FC<Props> = ({ slides, request }) => {
  const [previewSlide, setPreviewSlide] = useState<SlideData | null>(null);

  if (slides.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
           <span className="text-3xl">✨</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-600">No Content Yet</h3>
        <p className="max-w-xs mx-auto mt-2">Fill out the settings on the left and click Generate to see magic happen.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Generated Results</h2>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {request.type}
        </span>
      </div>

      {/* Grid of Slides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4 custom-scrollbar pr-2">
        {slides.map((slide) => (
          <SlidePreview 
            key={slide.id} 
            slide={slide} 
            aspectRatio={request.aspectRatio} 
            hasImage={request.hasImage}
            onPreview={setPreviewSlide}
          />
        ))}
      </div>

      {/* Full Screen Preview Modal */}
      {previewSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-700">Preview: {previewSlide.title}</h3>
              <button onClick={() => setPreviewSlide(null)} className="p-2 hover:bg-gray-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-8 bg-gray-100 flex items-center justify-center">
              {/* Reuse structure but scaled up conceptually */}
              <div 
                 className={`relative shadow-2xl rounded-lg overflow-hidden bg-slate-900 shrink-0
                 ${request.aspectRatio === '1:1' ? 'h-[500px] w-[500px]' : 
                   request.aspectRatio === '4:3' ? 'h-[600px] w-[450px]' : 
                   'h-[800px] w-[450px]'}
                 `}
              >
                 {/* Background */}
                 {request.hasImage && previewSlide.imageBase64 ? (
                  <img 
                    src={`data:image/png;base64,${previewSlide.imageBase64}`} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-orange-500"></div>
                )}

                 {/* Content */}
                 <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center ${request.hasImage ? 'bg-black/50' : ''}`}>
                    <h3 className="text-3xl font-bold text-white mb-4">{previewSlide.title}</h3>
                    <div className="h-1 w-16 bg-orange-400 mx-auto rounded-full mb-6"></div>
                    <p className="text-4xl font-medium text-slate-50 mb-4 leading-relaxed">{previewSlide.mainText}</p>
                    {previewSlide.secondaryText && <p className="text-xl text-slate-200 italic">{previewSlide.secondaryText}</p>}
                    <div className="absolute bottom-8 text-sm font-bold tracking-widest text-orange-400 uppercase">Impact English</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentResults;
