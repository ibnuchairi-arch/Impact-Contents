import React from 'react';
import { SlideData, AspectRatio } from '../types';
import { Download, Eye } from 'lucide-react';
import { downloadSlideAsImage } from '../utils/downloadUtils';

interface Props {
  slide: SlideData;
  aspectRatio: AspectRatio;
  hasImage: boolean;
  onPreview: (slide: SlideData) => void;
}

const SlidePreview: React.FC<Props> = ({ slide, aspectRatio, hasImage, onPreview }) => {
  
  // Aspect Ratio classes
  const aspectClass = 
    aspectRatio === AspectRatio.SQUARE ? 'aspect-square' :
    aspectRatio === AspectRatio.PORTRAIT ? 'aspect-[4/3]' : 'aspect-[9/16]';

  const handleDownload = () => {
    downloadSlideAsImage(slide, aspectRatio, hasImage);
  };

  const LOGO_URL = "https://v0-users-assets.s3.us-east-1.amazonaws.com/uploads/user-22920625/image.png";

  return (
    <div className="flex flex-col gap-3 group">
      {/* The Visual Slide Representation */}
      <div 
        className={`relative w-full ${aspectClass} rounded-lg overflow-hidden shadow-md border border-gray-200 transition-transform group-hover:shadow-xl bg-slate-900 select-none`}
      >
        {/* Background Layer */}
        {hasImage && slide.imageBase64 ? (
          <img 
            src={`data:image/png;base64,${slide.imageBase64}`} 
            alt="Slide Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-orange-500"></div>
        )}

        {/* Mandatory Logo Header */}
        <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
             <img src={LOGO_URL} alt="Impact Logo" className="h-6 md:h-8 object-contain" />
          </div>
        </div>

        {/* Overlay for text readability if image exists, or just styling */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center pt-16
          ${hasImage ? 'bg-black/50 backdrop-blur-[1px]' : ''}`}
        >
          {/* Content Wrapper */}
          <div className="flex flex-col items-center w-full max-w-full">
            {/* Title */}
            <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-md leading-tight mb-2">
              {slide.title}
            </h3>
            
            <div className="h-0.5 w-12 bg-orange-400 rounded-full mb-4"></div>

            {/* Main Message (Explanation 1) */}
            <p className="text-lg md:text-2xl font-medium text-slate-50 drop-shadow-sm whitespace-pre-wrap leading-relaxed mb-4">
              {slide.mainText}
            </p>

            {/* Dynamic Content List (Fields) - Distinguishable */}
            {slide.contentList && slide.contentList.length > 0 && (
              <div className="flex flex-col gap-2 w-full max-w-[80%] mb-4">
                {slide.contentList.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg text-slate-50 font-medium text-base md:text-lg shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}

            {/* Additional Details (Explanation 2) */}
            {slide.secondaryText && (
              <p className="text-sm md:text-lg text-slate-200 italic font-light">
                {slide.secondaryText}
              </p>
            )}
          </div>

          {/* Footer Branding */}
          <div className="absolute bottom-4 text-[10px] md:text-xs font-bold tracking-widest text-orange-400 uppercase">
            Impact English
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button 
          onClick={() => onPreview(slide)}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium"
        >
          <Eye size={16} /> Preview
        </button>
        <button 
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium shadow-sm"
        >
          <Download size={16} /> Download
        </button>
      </div>
    </div>
  );
};

export default SlidePreview;