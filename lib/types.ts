export type Role = 'client' | 'vendor';

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

export type BookingStatus = 'pending' | 'confirmed' | 'rejected';

export const CATEGORY_LABELS: Record<Category, string> = {
  venue: 'Площадки',
  tamada: 'Тамада',
  photo_video: 'Фото и видео',
  decor: 'Декор',
  music: 'Музыка',
  catering: 'Кейтеринг',
  other: 'Другое',
};

export const CITIES: City[] = ['Almaty', 'Astana', 'Shymkent', 'Aktau', 'Kostanay'];
export const CATEGORIES: Category[] = [
  'venue', 'tamada', 'photo_video', 'decor', 'music', 'catering', 'other',
];

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  companyName?: string;
  city?: string;
  phone?: string;
  description?: string;
  createdAt: string;
};

export type CharValue = string | number | boolean | string[];

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
  characteristics: Record<string, CharValue>;
  rating: number;
  reviewCount: number;
  views: number;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
};

export type MessageSender = Role;

export type Message = {
  id: string;
  bookingId: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
};

export type Booking = {
  id: string;
  offerId: string;
  offerTitle: string;
  vendorId: string;
  clientId: string;
  clientName: string;
  eventDate: string;
  status: BookingStatus;
  messages: Message[];
  hasReview: boolean;
  createdAt: string;
};

export type Review = {
  id: string;
  offerId: string;
  bookingId: string;
  clientId: string;
  clientName: string;
  rating: number;
  text: string;
  createdAt: string;
};

// ── Characteristics schema per category ───────────────────────────────────

export type CharFieldType = 'number' | 'boolean' | 'select' | 'multiselect';

export type CharField = {
  key: string;
  label: string;
  type: CharFieldType;
  options?: string[];
  unit?: string;
};

export const CHAR_SCHEMAS: Record<Category, CharField[]> = {
  venue: [
    { key: 'venueType', label: 'Тип площадки', type: 'select', options: ['Банкетный зал', 'Ресторан', 'Загородная', 'На природе', 'Шатёр'] },
    { key: 'area', label: 'Площадь', type: 'number', unit: 'м²' },
    { key: 'parking', label: 'Парковка', type: 'boolean' },
    { key: 'ownKitchen', label: 'Своя кухня', type: 'boolean' },
    { key: 'catering', label: 'Кейтеринг', type: 'select', options: ['Включён', 'Сторонний разрешён', 'Только свой'] },
    { key: 'alcohol', label: 'Алкоголь разрешён', type: 'boolean' },
  ],
  tamada: [
    { key: 'languages', label: 'Языки ведения', type: 'multiselect', options: ['Русский', 'Казахский', 'Английский'] },
    { key: 'experience', label: 'Опыт', type: 'number', unit: 'лет' },
    { key: 'eventTypes', label: 'Тип мероприятий', type: 'multiselect', options: ['Свадьба', 'Юбилей', 'Корпоратив', 'Другое'] },
    { key: 'djIncluded', label: 'DJ в комплекте', type: 'boolean' },
    { key: 'ownSound', label: 'Своё звуковое оборудование', type: 'boolean' },
  ],
  photo_video: [
    { key: 'service', label: 'Услуга', type: 'select', options: ['Только фото', 'Только видео', 'Фото + видео'] },
    { key: 'style', label: 'Стиль съёмки', type: 'select', options: ['Репортаж', 'Постановочный', 'Смешанный'] },
    { key: 'experience', label: 'Опыт', type: 'number', unit: 'лет' },
    { key: 'deliveryDays', label: 'Срок сдачи', type: 'number', unit: 'раб. дней' },
    { key: 'drone', label: 'Съёмка дроном', type: 'boolean' },
    { key: 'photoBook', label: 'Фотокнига включена', type: 'boolean' },
    { key: 'offsite', label: 'Выездная съёмка', type: 'boolean' },
  ],
  decor: [
    { key: 'decorTypes', label: 'Тип декора', type: 'multiselect', options: ['Цветочный', 'Шары', 'Арки', 'Столы', 'Шатры', 'Световой'] },
    { key: 'installIncluded', label: 'Монтаж включён', type: 'boolean' },
    { key: 'terms', label: 'Условие', type: 'select', options: ['Аренда', 'Продажа', 'Аренда или продажа'] },
  ],
  music: [
    { key: 'format', label: 'Формат', type: 'select', options: ['Живая музыка', 'DJ', 'Живая + DJ'] },
    { key: 'genres', label: 'Жанры', type: 'multiselect', options: ['Казахская', 'Восточная', 'Поп', 'Джаз', 'Классика', 'Электронная'] },
    { key: 'musicianCount', label: 'Кол-во музыкантов', type: 'number', unit: 'чел.' },
    { key: 'ownEquipment', label: 'Своё оборудование', type: 'boolean' },
  ],
  catering: [
    { key: 'cuisines', label: 'Тип кухни', type: 'multiselect', options: ['Казахская', 'Европейская', 'Восточная', 'Смешанная'] },
    { key: 'minGuests', label: 'Мин. гостей', type: 'number', unit: 'чел.' },
    { key: 'offsite', label: 'Выездной кейтеринг', type: 'boolean' },
    { key: 'dishesIncluded', label: 'Посуда включена', type: 'boolean' },
    { key: 'waitersIncluded', label: 'Официанты включены', type: 'boolean' },
  ],
  other: [],
};
