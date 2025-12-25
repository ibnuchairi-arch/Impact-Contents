import React from 'react';
import { ContentType, ContentRequest, AspectRatio } from '../types';
import { Layout, Image as ImageIcon, Type, Layers, Megaphone, Plus, Trash2 } from 'lucide-react';

interface Props {
  request: ContentRequest;
  onChange: (newRequest: ContentRequest) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

const ContentForm: React.FC<Props> = ({ request, onChange, onSubmit, isGenerating }) => {
  
  const updateField = <K extends keyof ContentRequest>(key: K, value: ContentRequest[K]) => {
    onChange({ ...request, [key]: value });
  };

  const isAnnouncement = request.type === ContentType.ANNOUNCEMENT;

  // Validation Logic
  const isValid = isAnnouncement
    ? !!request.announcementTitle && !!request.announcementBody1
    : !!request.topic;

  // Dynamic Fields Handlers
  const handleAddAnnouncementField = () => {
    const currentFields = request.announcementFields || [];
    if (currentFields.length < 5) {
      updateField('announcementFields', [...currentFields, '']);
    }
  };

  const handleRemoveAnnouncementField = (index: number) => {
    const currentFields = request.announcementFields || [];
    const newFields = currentFields.filter((_, i) => i !== index);
    updateField('announcementFields', newFields);
  };

  const handleUpdateAnnouncementField = (index: number, value: string) => {
    const currentFields = [...(request.announcementFields || [])];
    currentFields[index] = value;
    updateField('announcementFields', currentFields);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-600 h-full flex flex-col gap-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Layers className="text-blue-600" />
          Content Setup
        </h2>
        <p className="text-sm text-gray-500 mt-1">Configure your Impact content needs</p>
      </div>

      <div className="space-y-5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        
        {/* 1. Content Type */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Type size={16} /> Type of Content
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(ContentType).map((t) => (
              <button
                key={t}
                onClick={() => updateField('type', t)}
                className={`p-3 text-sm rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1 text-center ${
                  request.type === t
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-medium shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                 {t === ContentType.ANNOUNCEMENT ? <Megaphone size={16} className="mb-1" /> : null}
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Topic OR Announcement Fields */}
        {isAnnouncement ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Announcement Title</label>
              <input
                type="text"
                value={request.announcementTitle || ''}
                onChange={(e) => updateField('announcementTitle', e.target.value)}
                placeholder="e.g. Class Cancelled, New Schedule..."
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold outline-none transition"
              />
            </div>
            
            {/* Main Message */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Main Message</label>
              <textarea
                rows={3}
                value={request.announcementBody1 || ''}
                onChange={(e) => updateField('announcementBody1', e.target.value)}
                placeholder="Short explanation of the announcement..."
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
              />
            </div>

            {/* Dynamic Highlighted Fields */}
            <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <label className="text-sm font-semibold text-gray-700">Highlighted Details</label>
                 {(request.announcementFields?.length || 0) < 5 && (
                   <button 
                     onClick={handleAddAnnouncementField}
                     className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                   >
                     <Plus size={14} /> Add Field
                   </button>
                 )}
               </div>
               
               <div className="space-y-2">
                 {request.announcementFields?.map((field, index) => (
                   <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={field}
                        onChange={(e) => handleUpdateAnnouncementField(index, e.target.value)}
                        placeholder={`Field ${index + 1} (e.g. Time: 5PM)`}
                        className="flex-1 p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm outline-none transition"
                      />
                      <button 
                        onClick={() => handleRemoveAnnouncementField(index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition"
                        title="Remove field"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                 ))}
                 {request.announcementFields?.length === 0 && (
                   <div className="text-xs text-gray-400 italic text-center py-2 border border-dashed rounded-lg">
                     No highlighted fields added.
                   </div>
                 )}
               </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Additional Details <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                value={request.announcementBody2 || ''}
                onChange={(e) => updateField('announcementBody2', e.target.value)}
                placeholder="Any extra info..."
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <label className="text-sm font-semibold text-gray-700">Topic</label>
            <input
              type="text"
              value={request.topic}
              onChange={(e) => updateField('topic', e.target.value)}
              placeholder="e.g. Daily Routines, Fruits, Office Talk..."
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        )}

        {/* 3. Image Mode */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ImageIcon size={16} /> Visual Style
          </label>
          <div className="flex gap-4">
             <label className={`flex-1 cursor-pointer p-3 rounded-xl border flex items-center justify-center gap-2 transition ${!request.hasImage ? 'bg-orange-50 border-orange-500 text-orange-700 font-medium' : 'border-gray-200 text-gray-600'}`}>
                <input 
                  type="radio" 
                  name="hasImage" 
                  checked={!request.hasImage} 
                  onChange={() => updateField('hasImage', false)}
                  className="hidden" 
                />
                <span>Clean (Text Only)</span>
             </label>
             <label className={`flex-1 cursor-pointer p-3 rounded-xl border flex items-center justify-center gap-2 transition ${request.hasImage ? 'bg-blue-50 border-blue-600 text-blue-700 font-medium' : 'border-gray-200 text-gray-600'}`}>
                <input 
                  type="radio" 
                  name="hasImage" 
                  checked={request.hasImage} 
                  onChange={() => updateField('hasImage', true)}
                  className="hidden" 
                />
                <span>With AI Image</span>
             </label>
          </div>
        </div>

        {/* 4. Slides & Ratio */}
        <div className="grid grid-cols-2 gap-4">
            {/* Slide Count */}
            <div className={`space-y-2 ${isAnnouncement ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <label className="text-sm font-semibold text-gray-700">Slides</label>
              <div className="flex rounded-xl bg-gray-100 p-1">
                {[1, 2, 3].map(num => (
                  <button
                    key={num}
                    onClick={() => updateField('slideCount', num)}
                    disabled={isAnnouncement}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      request.slideCount === num ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              {isAnnouncement && <p className="text-[10px] text-gray-500">Announcements are single slide.</p>}
            </div>

            {/* Ratio */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                 <Layout size={16} /> Ratio
              </label>
              <select 
                value={request.aspectRatio}
                onChange={(e) => updateField('aspectRatio', e.target.value as AspectRatio)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={AspectRatio.SQUARE}>1:1 (Square)</option>
                <option value={AspectRatio.PORTRAIT}>4:3 (Post)</option>
                <option value={AspectRatio.STORY}>9:16 (Story)</option>
              </select>
            </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onSubmit}
        disabled={isGenerating || !isValid}
        className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]
          ${isGenerating || !isValid
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
          }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-3">
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             Thinking...
          </span>
        ) : "Generate Content"}
      </button>

    </div>
  );
};

export default ContentForm;