export enum ContentType {
  GRAMMAR = 'Grammar',
  VOCABULARY = 'Vocabulary',
  SLANG = 'Slang Words',
  IDIOMS = 'Idioms',
  ANNOUNCEMENT = 'Announcement'
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '4:3',
  STORY = '9:16'
}

export interface ContentRequest {
  type: ContentType;
  topic: string;
  hasImage: boolean;
  slideCount: number;
  aspectRatio: AspectRatio;
  // Specific for Announcement
  announcementTitle?: string;
  announcementBody1?: string;
  announcementFields?: string[]; // Dynamic highlighted fields
  announcementBody2?: string;
}

export interface SlideData {
  id: number;
  title: string;
  mainText: string;
  contentList?: string[]; // New field for list items (Announcement fields)
  secondaryText?: string;
  footer?: string;
  visualPrompt?: string; // Used for image generation
  imageBase64?: string; // The generated image data
}

export interface GenerationResult {
  slides: SlideData[];
  request: ContentRequest;
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  retryAfter?: number; // timestamp
}