export type Category =
  | 'venue'
  | 'catering'
  | 'music'
  | 'photo_video'
  | 'decor'
  | 'tamada'
  | 'other';

export type City =
  | 'Almaty'
  | 'Astana'
  | 'Shymkent'
  | 'Aktau'
  | 'Kostanay';

export const CATEGORY_LABELS: Record<Category, string> = {
  venue: 'Площадка',
  catering: 'Кейтеринг',
  music: 'Музыка / DJ',
  photo_video: 'Фото и видео',
  decor: 'Декор / Флористика',
  tamada: 'Тамада / Ведущий',
  other: 'Другое',
};

export const CITIES: City[] = ['Almaty', 'Astana', 'Shymkent', 'Aktau', 'Kostanay'];
export const CATEGORIES: Category[] = ['venue', 'catering', 'music', 'photo_video', 'decor', 'tamada', 'other'];

export type Offer = {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description: string;
  category: Category;
  city: City;
  price: number;
  capacity?: number;
  photos: string[];
  availableDates: string[];
  rating?: number;
  reviewCount?: number;
  createdAt: string;
};

export type MessageSender = 'client' | 'vendor';

export type Message = {
  id: string;
  bookingId: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
};

export type BookingStatus = 'pending' | 'confirmed' | 'rejected';

export type Booking = {
  id: string;
  offerId: string;
  offerTitle: string;
  vendorId: string;
  clientName: string;
  eventDate: string;
  status: BookingStatus;
  messages: Message[];
  createdAt: string;
};
