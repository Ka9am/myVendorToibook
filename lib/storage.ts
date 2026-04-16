import { Offer, Booking, Message } from './types';

const OFFERS_KEY = 'toibook_offers';
const BOOKINGS_KEY = 'toibook_bookings';
const VENDOR_ID_KEY = 'toibook_vendor_id';

// ── Vendor ID (simulates logged-in vendor) ──────────────────────────────────
export function getVendorId(): string {
  if (typeof window === 'undefined') return 'vendor_1';
  let id = localStorage.getItem(VENDOR_ID_KEY);
  if (!id) {
    id = 'vendor_1';
    localStorage.setItem(VENDOR_ID_KEY, id);
  }
  return id;
}

// ── Offers ──────────────────────────────────────────────────────────────────
export function getOffers(): Offer[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(OFFERS_KEY);
  if (!raw) {
    const seed = getSeedOffers();
    localStorage.setItem(OFFERS_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw);
}

export function getOfferById(id: string): Offer | undefined {
  return getOffers().find((o) => o.id === id);
}

export function saveOffer(offer: Offer): void {
  const offers = getOffers();
  const index = offers.findIndex((o) => o.id === offer.id);
  if (index >= 0) {
    offers[index] = offer;
  } else {
    offers.push(offer);
  }
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}

export function deleteOffer(id: string): void {
  const offers = getOffers().filter((o) => o.id !== id);
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}

export function getVendorOffers(vendorId: string): Offer[] {
  return getOffers().filter((o) => o.vendorId === vendorId);
}

// ── Bookings ─────────────────────────────────────────────────────────────────
export function getBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(BOOKINGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getBookingById(id: string): Booking | undefined {
  return getBookings().find((b) => b.id === id);
}

export function saveBooking(booking: Booking): void {
  const bookings = getBookings();
  const index = bookings.findIndex((b) => b.id === booking.id);
  if (index >= 0) {
    bookings[index] = booking;
  } else {
    bookings.push(booking);
  }
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function getVendorBookings(vendorId: string): Booking[] {
  const offerIds = getVendorOffers(vendorId).map((o) => o.id);
  return getBookings().filter((b) => offerIds.includes(b.offerId));
}

export function addMessage(bookingId: string, message: Message): void {
  const booking = getBookingById(bookingId);
  if (!booking) return;
  booking.messages.push(message);
  saveBooking(booking);
}

export function updateBookingStatus(bookingId: string, status: Booking['status']): void {
  const booking = getBookingById(bookingId);
  if (!booking) return;
  booking.status = status;
  saveBooking(booking);
}

// ── Seed data ─────────────────────────────────────────────────────────────────
function getSeedOffers(): Offer[] {
  return [
    {
      id: 'offer_1',
      vendorId: 'vendor_1',
      vendorName: 'Сарай Банкет Холл',
      title: 'Sаray Banquet Hall',
      description: 'Премиальный банкетный зал в центре Алматы. Вмещает до 500 гостей. Полный комплекс услуг: декор, кейтеринг, звук и свет.',
      category: 'venue',
      city: 'Almaty',
      price: 1500000,
      capacity: 500,
      photos: [],
      availableDates: ['2026-05-10', '2026-05-17', '2026-05-24', '2026-06-07'],
      rating: 4.8,
      reviewCount: 42,
      createdAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'offer_2',
      vendorId: 'vendor_2',
      vendorName: 'Арман Бекзатов',
      title: 'Профессиональный тамада',
      description: 'Опытный тамада с 10-летним стажем. Проводим свадьбы, юбилеи и корпоративы на казахском и русском языках.',
      category: 'tamada',
      city: 'Astana',
      price: 250000,
      photos: [],
      availableDates: ['2026-05-03', '2026-05-10', '2026-05-31'],
      rating: 4.9,
      reviewCount: 87,
      createdAt: '2026-01-20T10:00:00Z',
    },
    {
      id: 'offer_3',
      vendorId: 'vendor_3',
      vendorName: 'Golden Lens Studio',
      title: 'Фото и видеосъёмка свадеб',
      description: 'Команда из 3 человек: фотограф, видеограф и мобилограф. Современная техника, быстрая обработка. Доступны в любой точке Казахстана.',
      category: 'photo_video',
      city: 'Almaty',
      price: 400000,
      photos: [],
      availableDates: ['2026-05-01', '2026-05-08', '2026-05-15', '2026-05-22'],
      rating: 4.7,
      reviewCount: 34,
      createdAt: '2026-02-01T10:00:00Z',
    },
    {
      id: 'offer_4',
      vendorId: 'vendor_4',
      vendorName: 'Гүлдер Флористика',
      title: 'Свадебный декор и флористика',
      description: 'Оформляем свадебные залы, арки, столы и автомобили. Работаем со свежими цветами. Любой стиль — от классики до бохо.',
      category: 'decor',
      city: 'Shymkent',
      price: 350000,
      photos: [],
      availableDates: ['2026-05-05', '2026-05-12', '2026-05-19', '2026-05-26'],
      rating: 4.6,
      reviewCount: 28,
      createdAt: '2026-02-10T10:00:00Z',
    },
    {
      id: 'offer_5',
      vendorId: 'vendor_5',
      vendorName: 'DJ Нурлан',
      title: 'DJ и живая музыка',
      description: 'DJ с профессиональным оборудованием. Играю казахскую, русскую и зарубежную музыку. Также работаю с живыми музыкантами.',
      category: 'music',
      city: 'Almaty',
      price: 180000,
      photos: [],
      availableDates: ['2026-05-02', '2026-05-09', '2026-05-16', '2026-05-23', '2026-05-30'],
      rating: 4.5,
      reviewCount: 61,
      createdAt: '2026-02-15T10:00:00Z',
    },
    {
      id: 'offer_6',
      vendorId: 'vendor_6',
      vendorName: 'Астана Кейтеринг',
      title: 'Кейтеринг — казахская и европейская кухня',
      description: 'Профессиональный кейтеринг для свадеб и мероприятий. Меню от 3000 ₸ на персону. Выездное обслуживание по всему Казахстану.',
      category: 'catering',
      city: 'Astana',
      price: 3000,
      capacity: 300,
      photos: [],
      availableDates: ['2026-05-04', '2026-05-11', '2026-05-18', '2026-05-25'],
      rating: 4.4,
      reviewCount: 19,
      createdAt: '2026-02-20T10:00:00Z',
    },
  ];
}
