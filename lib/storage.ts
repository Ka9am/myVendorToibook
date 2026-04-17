import { Offer, Booking, Message, Review, User } from './types';
import { getUser, saveAllUsers, getAllUsers } from './auth';

const OFFERS_KEY = 'toibook_offers_v2';
const BOOKINGS_KEY = 'toibook_bookings_v2';
const REVIEWS_KEY = 'toibook_reviews';
const FAVORITES_KEY = 'toibook_favorites';
const VIEWS_SESSION_KEY = 'toibook_viewed_session';
const SEED_FLAG = 'toibook_seeded_v2';

// ── Offers ──────────────────────────────────────────────────────────────────

export function getOffers(): Offer[] {
  if (typeof window === 'undefined') return [];
  seedIfNeeded();
  const raw = localStorage.getItem(OFFERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getActiveOffers(): Offer[] {
  return getOffers().filter((o) => o.isActive);
}

export function getOfferById(id: string): Offer | undefined {
  return getOffers().find((o) => o.id === id);
}

export function saveOffer(offer: Offer): void {
  const offers = getOffers();
  const i = offers.findIndex((o) => o.id === offer.id);
  if (i >= 0) offers[i] = offer;
  else offers.push(offer);
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}

export function deleteOffer(id: string): void {
  const offers = getOffers().filter((o) => o.id !== id);
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}

export function getVendorOffers(vendorId: string): Offer[] {
  return getOffers().filter((o) => o.vendorId === vendorId);
}

export function toggleOfferActive(id: string): void {
  const offer = getOfferById(id);
  if (!offer) return;
  saveOffer({ ...offer, isActive: !offer.isActive });
}

export function toggleOfferFeatured(id: string): void {
  const offer = getOfferById(id);
  if (!offer) return;
  saveOffer({ ...offer, featured: !offer.featured });
}

export function incrementViews(id: string): void {
  if (typeof window === 'undefined') return;
  const raw = sessionStorage.getItem(VIEWS_SESSION_KEY);
  const viewed: string[] = raw ? JSON.parse(raw) : [];
  if (viewed.includes(id)) return;
  viewed.push(id);
  sessionStorage.setItem(VIEWS_SESSION_KEY, JSON.stringify(viewed));

  const offer = getOfferById(id);
  if (!offer) return;
  saveOffer({ ...offer, views: offer.views + 1 });
}

// ── Vendor id helper ────────────────────────────────────────────────────────

export function getVendorId(): string {
  const u = getUser();
  if (u?.role === 'vendor') return u.id;
  return 'vendor_1';
}

// ── Bookings ────────────────────────────────────────────────────────────────

export function getBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  seedIfNeeded();
  const raw = localStorage.getItem(BOOKINGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getBookingById(id: string): Booking | undefined {
  return getBookings().find((b) => b.id === id);
}

export function saveBooking(booking: Booking): void {
  const bookings = getBookings();
  const i = bookings.findIndex((b) => b.id === booking.id);
  if (i >= 0) bookings[i] = booking;
  else bookings.push(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function getVendorBookings(vendorId: string): Booking[] {
  return getBookings().filter((b) => b.vendorId === vendorId);
}

export function getClientBookings(clientId: string): Booking[] {
  return getBookings().filter((b) => b.clientId === clientId);
}

export function addMessage(bookingId: string, message: Message): void {
  const b = getBookingById(bookingId);
  if (!b) return;
  saveBooking({ ...b, messages: [...b.messages, message] });
}

export function updateBookingStatus(bookingId: string, status: Booking['status']): void {
  const b = getBookingById(bookingId);
  if (!b) return;
  saveBooking({ ...b, status });
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export function getReviews(): Review[] {
  if (typeof window === 'undefined') return [];
  seedIfNeeded();
  const raw = localStorage.getItem(REVIEWS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getOfferReviews(offerId: string): Review[] {
  return getReviews()
    .filter((r) => r.offerId === offerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addReview(review: Review): void {
  const reviews = getReviews();
  reviews.push(review);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

  // Recalculate offer rating
  const offer = getOfferById(review.offerId);
  if (offer) {
    const offerReviews = reviews.filter((r) => r.offerId === review.offerId);
    const avg = offerReviews.reduce((s, r) => s + r.rating, 0) / offerReviews.length;
    saveOffer({
      ...offer,
      rating: Math.round(avg * 10) / 10,
      reviewCount: offerReviews.length,
    });
  }

  // Mark booking as reviewed
  const booking = getBookingById(review.bookingId);
  if (booking) saveBooking({ ...booking, hasReview: true });
}

// ── Favorites ───────────────────────────────────────────────────────────────

type FavoritesMap = Record<string, string[]>;

function readFavorites(): FavoritesMap {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function getFavorites(userId: string): string[] {
  return readFavorites()[userId] ?? [];
}

export function isFavorite(userId: string, offerId: string): boolean {
  return getFavorites(userId).includes(offerId);
}

export function toggleFavorite(userId: string, offerId: string): boolean {
  const all = readFavorites();
  const list = all[userId] ?? [];
  const i = list.indexOf(offerId);
  let isFav: boolean;
  if (i >= 0) {
    list.splice(i, 1);
    isFav = false;
  } else {
    list.push(offerId);
    isFav = true;
  }
  all[userId] = list;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(all));
  return isFav;
}

// ── Seed ────────────────────────────────────────────────────────────────────

function seedIfNeeded(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEED_FLAG)) return;

  const { users, offers, bookings, reviews } = buildSeed();

  // Merge users — keep any existing ones (so manual registrations survive)
  const existing = getAllUsers();
  const existingEmails = new Set(existing.map((u) => u.email.toLowerCase()));
  const merged = [...existing, ...users.filter((u) => !existingEmails.has(u.email.toLowerCase()))];
  saveAllUsers(merged);

  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  localStorage.setItem(SEED_FLAG, '1');
}

const img = (seed: string) => `https://picsum.photos/seed/${seed}/900/600`;

function buildSeed(): { users: User[]; offers: Offer[]; bookings: Booking[]; reviews: Review[] } {
  const users: User[] = [
    {
      id: 'client_1',
      name: 'Айгерим',
      email: 'client@test.com',
      password: '123456',
      role: 'client',
      city: 'Almaty',
      phone: '+7 777 111 22 33',
      createdAt: '2026-01-01T10:00:00Z',
    },
    {
      id: 'vendor_1',
      name: 'Саят Нұрланов',
      email: 'saray@test.com',
      password: '123456',
      role: 'vendor',
      companyName: 'Сарай Банкет Холл',
      city: 'Almaty',
      phone: '+7 777 222 33 44',
      description: 'Премиальные банкетные площадки и кейтеринг в Алматы и Астане.',
      createdAt: '2026-01-02T10:00:00Z',
    },
    {
      id: 'vendor_2',
      name: 'Арман Бекзатов',
      email: 'arman@test.com',
      password: '123456',
      role: 'vendor',
      companyName: 'Arman Events',
      city: 'Astana',
      phone: '+7 777 333 44 55',
      description: 'Тамада, DJ и фото/видео — полный пакет для ваших мероприятий.',
      createdAt: '2026-01-03T10:00:00Z',
    },
  ];

  const offers: Offer[] = [
    {
      id: 'offer_1',
      vendorId: 'vendor_1',
      vendorName: 'Сарай Банкет Холл',
      title: 'Банкетный зал «Сарай» в центре Алматы',
      description:
        'Премиальный банкетный зал в центре Алматы. Вмещает до 500 гостей. Полный комплекс услуг: декор, кейтеринг, звук и свет.',
      category: 'venue',
      city: 'Almaty',
      price: 1500000,
      capacity: 500,
      photos: [img('saray-1'), img('saray-2'), img('saray-3')],
      availableDates: ['2026-05-10', '2026-05-17', '2026-05-24', '2026-06-07', '2026-06-14', '2026-06-21'],
      characteristics: {
        venueType: 'Банкетный зал',
        area: 800,
        parking: true,
        ownKitchen: true,
        catering: 'Только свой',
        alcohol: true,
      },
      rating: 4.5,
      reviewCount: 2,
      views: 342,
      featured: true,
      isActive: true,
      createdAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'offer_2',
      vendorId: 'vendor_2',
      vendorName: 'Arman Events',
      title: 'Тамада на 2 языках — Арман Бекзатов',
      description:
        'Опытный тамада с 10-летним стажем. Проводим свадьбы, юбилеи и корпоративы на казахском и русском языках.',
      category: 'tamada',
      city: 'Astana',
      price: 250000,
      photos: [img('tamada-arman-1'), img('tamada-arman-2')],
      availableDates: ['2026-05-03', '2026-05-10', '2026-05-31', '2026-06-07', '2026-06-14'],
      characteristics: {
        languages: ['Русский', 'Казахский'],
        experience: 10,
        eventTypes: ['Свадьба', 'Юбилей', 'Корпоратив'],
        djIncluded: true,
        ownSound: true,
      },
      rating: 4.9,
      reviewCount: 0,
      views: 198,
      featured: false,
      isActive: true,
      createdAt: '2026-01-20T10:00:00Z',
    },
    {
      id: 'offer_3',
      vendorId: 'vendor_2',
      vendorName: 'Golden Lens Studio',
      title: 'Фото и видеосъёмка свадеб',
      description:
        'Команда из 3 человек: фотограф, видеограф и мобилограф. Современная техника, быстрая обработка. Доступны в любой точке Казахстана.',
      category: 'photo_video',
      city: 'Almaty',
      price: 400000,
      photos: [img('photo-gold-1'), img('photo-gold-2'), img('photo-gold-3')],
      availableDates: ['2026-05-01', '2026-05-08', '2026-05-15', '2026-05-22', '2026-06-05'],
      characteristics: {
        service: 'Фото + видео',
        style: 'Смешанный',
        experience: 7,
        deliveryDays: 21,
        drone: true,
        photoBook: true,
        offsite: true,
      },
      rating: 5.0,
      reviewCount: 1,
      views: 276,
      featured: true,
      isActive: true,
      createdAt: '2026-02-01T10:00:00Z',
    },
    {
      id: 'offer_4',
      vendorId: 'vendor_1',
      vendorName: 'Гүлдер Флористика',
      title: 'Свадебный декор и флористика',
      description:
        'Оформляем свадебные залы, арки, столы и автомобили. Работаем со свежими цветами. Любой стиль — от классики до бохо.',
      category: 'decor',
      city: 'Shymkent',
      price: 350000,
      photos: [img('flowers-guldr-1'), img('flowers-guldr-2')],
      availableDates: ['2026-05-05', '2026-05-12', '2026-05-19', '2026-05-26', '2026-06-02'],
      characteristics: {
        decorTypes: ['Цветочный', 'Арки', 'Столы'],
        installIncluded: true,
        terms: 'Аренда',
      },
      rating: 4.6,
      reviewCount: 0,
      views: 124,
      featured: false,
      isActive: true,
      createdAt: '2026-02-10T10:00:00Z',
    },
    {
      id: 'offer_5',
      vendorId: 'vendor_2',
      vendorName: 'DJ Нурлан',
      title: 'DJ и живая музыка',
      description:
        'DJ с профессиональным оборудованием. Играю казахскую, русскую и зарубежную музыку. Также работаю с живыми музыкантами.',
      category: 'music',
      city: 'Almaty',
      price: 180000,
      photos: [img('dj-nurlan-1'), img('dj-nurlan-2')],
      availableDates: ['2026-05-02', '2026-05-09', '2026-05-16', '2026-05-23', '2026-05-30', '2026-06-06'],
      characteristics: {
        format: 'Живая + DJ',
        genres: ['Казахская', 'Поп', 'Электронная'],
        musicianCount: 4,
        ownEquipment: true,
      },
      rating: 4.5,
      reviewCount: 0,
      views: 156,
      featured: false,
      isActive: true,
      createdAt: '2026-02-15T10:00:00Z',
    },
    {
      id: 'offer_6',
      vendorId: 'vendor_1',
      vendorName: 'Астана Кейтеринг',
      title: 'Кейтеринг — казахская и европейская кухня',
      description:
        'Профессиональный кейтеринг для свадеб и мероприятий. Меню от 3000 ₸ на персону. Выездное обслуживание по всему Казахстану.',
      category: 'catering',
      city: 'Astana',
      price: 3000,
      capacity: 300,
      photos: [img('catering-astana-1'), img('catering-astana-2')],
      availableDates: ['2026-05-04', '2026-05-11', '2026-05-18', '2026-05-25'],
      characteristics: {
        cuisines: ['Казахская', 'Европейская'],
        minGuests: 50,
        offsite: true,
        dishesIncluded: true,
        waitersIncluded: true,
      },
      rating: 4.4,
      reviewCount: 0,
      views: 98,
      featured: false,
      isActive: true,
      createdAt: '2026-02-20T10:00:00Z',
    },
    {
      id: 'offer_7',
      vendorId: 'vendor_1',
      vendorName: 'Каспий Шатёр',
      title: 'Пляжный шатёр на берегу Каспия',
      description:
        'Уникальная локация — шатёр прямо на пляже. До 200 гостей. Идеально для летних свадеб и закрытых вечеринок.',
      category: 'venue',
      city: 'Aktau',
      price: 800000,
      capacity: 200,
      photos: [img('aktau-tent-1'), img('aktau-tent-2')],
      availableDates: ['2026-06-10', '2026-06-17', '2026-07-01', '2026-07-15'],
      characteristics: {
        venueType: 'На природе',
        area: 400,
        parking: true,
        ownKitchen: false,
        catering: 'Сторонний разрешён',
        alcohol: true,
      },
      rating: 4.2,
      reviewCount: 0,
      views: 78,
      featured: false,
      isActive: true,
      createdAt: '2026-03-01T10:00:00Z',
    },
    {
      id: 'offer_8',
      vendorId: 'vendor_2',
      vendorName: 'Самал Тамада',
      title: 'Тамада «Самал» — яркие шоу-программы',
      description:
        'Провожу свадьбы, юбилеи и той-той. Разрабатываю сценарий индивидуально под каждое мероприятие. В команде — DJ и ведущие-близнецы.',
      category: 'tamada',
      city: 'Almaty',
      price: 300000,
      photos: [img('samal-tamada-1'), img('samal-tamada-2')],
      availableDates: ['2026-05-10', '2026-05-24', '2026-06-07', '2026-06-21'],
      characteristics: {
        languages: ['Казахский', 'Русский', 'Английский'],
        experience: 6,
        eventTypes: ['Свадьба', 'Юбилей'],
        djIncluded: true,
        ownSound: false,
      },
      rating: 4.7,
      reviewCount: 0,
      views: 212,
      featured: true,
      isActive: true,
      createdAt: '2026-03-05T10:00:00Z',
    },
    {
      id: 'offer_9',
      vendorId: 'vendor_2',
      vendorName: 'Provincial Studio',
      title: 'Фотограф в Костанае',
      description:
        'Свадебный и семейный фотограф. Работаю 5 лет. Студия и выездная съёмка. Все фото в двух версиях — цвет и плёнка.',
      category: 'photo_video',
      city: 'Kostanay',
      price: 250000,
      photos: [img('kostanay-photo-1'), img('kostanay-photo-2')],
      availableDates: ['2026-05-08', '2026-05-22', '2026-06-05', '2026-06-19'],
      characteristics: {
        service: 'Только фото',
        style: 'Репортаж',
        experience: 5,
        deliveryDays: 14,
        drone: false,
        photoBook: true,
        offsite: true,
      },
      rating: 4.3,
      reviewCount: 0,
      views: 54,
      featured: false,
      isActive: true,
      createdAt: '2026-03-10T10:00:00Z',
    },
    {
      id: 'offer_10',
      vendorId: 'vendor_1',
      vendorName: 'Sky Balloons',
      title: 'Оформление шарами и неоновый декор',
      description:
        'Гирлянды, арки, фотозоны, световой декор. Оформим зал любого размера. Монтаж и демонтаж включены.',
      category: 'decor',
      city: 'Astana',
      price: 200000,
      photos: [img('balloons-sky-1'), img('balloons-sky-2')],
      availableDates: ['2026-05-11', '2026-05-25', '2026-06-08', '2026-06-22'],
      characteristics: {
        decorTypes: ['Шары', 'Световой', 'Арки'],
        installIncluded: true,
        terms: 'Аренда или продажа',
      },
      rating: 4.6,
      reviewCount: 0,
      views: 89,
      featured: false,
      isActive: true,
      createdAt: '2026-03-15T10:00:00Z',
    },
    {
      id: 'offer_11',
      vendorId: 'vendor_2',
      vendorName: 'Shymkent Live Band',
      title: 'Живой кавер-бенд «Құрдастар»',
      description:
        'Кавер-бенд из 5 музыкантов. Казахская, восточная и поп-музыка. Своё оборудование и свет.',
      category: 'music',
      city: 'Shymkent',
      price: 220000,
      photos: [img('band-shymkent-1')],
      availableDates: ['2026-05-07', '2026-05-21', '2026-06-04', '2026-06-18'],
      characteristics: {
        format: 'Живая музыка',
        genres: ['Казахская', 'Восточная', 'Поп'],
        musicianCount: 5,
        ownEquipment: true,
      },
      rating: 4.4,
      reviewCount: 0,
      views: 67,
      featured: false,
      isActive: true,
      createdAt: '2026-03-20T10:00:00Z',
    },
    {
      id: 'offer_12',
      vendorId: 'vendor_1',
      vendorName: 'Шығыс Дастархан',
      title: 'Восточный кейтеринг «Шығыс Дастархан»',
      description:
        'Подлинная восточная кухня на ваших торжествах. Бешбармак, самса, плов, казахские десерты. Выездное обслуживание.',
      category: 'catering',
      city: 'Shymkent',
      price: 4500,
      capacity: 400,
      photos: [img('catering-shygys-1'), img('catering-shygys-2')],
      availableDates: ['2026-05-14', '2026-05-28', '2026-06-11', '2026-06-25'],
      characteristics: {
        cuisines: ['Казахская', 'Восточная'],
        minGuests: 80,
        offsite: true,
        dishesIncluded: true,
        waitersIncluded: false,
      },
      rating: 4.5,
      reviewCount: 0,
      views: 112,
      featured: false,
      isActive: true,
      createdAt: '2026-03-25T10:00:00Z',
    },
  ];

  const bookings: Booking[] = [
    {
      id: 'booking_1',
      offerId: 'offer_2',
      offerTitle: 'Тамада на 2 языках — Арман Бекзатов',
      vendorId: 'vendor_2',
      clientId: 'client_1',
      clientName: 'Айгерим',
      eventDate: '2026-05-10',
      status: 'pending',
      messages: [
        {
          id: 'msg_1_1',
          bookingId: 'booking_1',
          sender: 'client',
          text: 'Здравствуйте! Интересует ваша услуга на 10 мая. Это свадьба, около 200 гостей.',
          timestamp: '2026-04-10T14:00:00Z',
        },
      ],
      hasReview: false,
      createdAt: '2026-04-10T14:00:00Z',
    },
    {
      id: 'booking_2',
      offerId: 'offer_5',
      offerTitle: 'DJ и живая музыка',
      vendorId: 'vendor_2',
      clientId: 'client_1',
      clientName: 'Айгерим',
      eventDate: '2026-06-06',
      status: 'confirmed',
      messages: [
        {
          id: 'msg_2_1',
          bookingId: 'booking_2',
          sender: 'client',
          text: 'Здравствуйте, хотим вас на 6 июня на свадьбу',
          timestamp: '2026-04-05T10:00:00Z',
        },
        {
          id: 'msg_2_2',
          bookingId: 'booking_2',
          sender: 'vendor',
          text: 'Добрый день! Дата свободна, подтверждаю. Давайте созвонимся по деталям программы',
          timestamp: '2026-04-05T10:30:00Z',
        },
        {
          id: 'msg_2_3',
          bookingId: 'booking_2',
          sender: 'client',
          text: 'Отлично! Наберу вас завтра',
          timestamp: '2026-04-05T10:45:00Z',
        },
      ],
      hasReview: false,
      createdAt: '2026-04-05T10:00:00Z',
    },
    {
      id: 'booking_3',
      offerId: 'offer_7',
      offerTitle: 'Пляжный шатёр на берегу Каспия',
      vendorId: 'vendor_1',
      clientId: 'client_1',
      clientName: 'Айгерим',
      eventDate: '2026-07-01',
      status: 'rejected',
      messages: [
        {
          id: 'msg_3_1',
          bookingId: 'booking_3',
          sender: 'client',
          text: 'Здравствуйте, хотим шатёр на 1 июля',
          timestamp: '2026-04-08T16:00:00Z',
        },
        {
          id: 'msg_3_2',
          bookingId: 'booking_3',
          sender: 'vendor',
          text: 'К сожалению, на эту дату уже есть бронь. Могу предложить 8 или 15 июля',
          timestamp: '2026-04-08T16:20:00Z',
        },
      ],
      hasReview: false,
      createdAt: '2026-04-08T16:00:00Z',
    },
    // Past reviews (fake clients) — to seed rating for offer_1 and offer_3
    {
      id: 'booking_past_1',
      offerId: 'offer_1',
      offerTitle: 'Банкетный зал «Сарай» в центре Алматы',
      vendorId: 'vendor_1',
      clientId: 'client_fake_1',
      clientName: 'Жанна',
      eventDate: '2026-02-15',
      status: 'confirmed',
      messages: [],
      hasReview: true,
      createdAt: '2026-01-20T10:00:00Z',
    },
    {
      id: 'booking_past_2',
      offerId: 'offer_1',
      offerTitle: 'Банкетный зал «Сарай» в центре Алматы',
      vendorId: 'vendor_1',
      clientId: 'client_fake_2',
      clientName: 'Мадина',
      eventDate: '2026-03-08',
      status: 'confirmed',
      messages: [],
      hasReview: true,
      createdAt: '2026-02-12T10:00:00Z',
    },
    {
      id: 'booking_past_3',
      offerId: 'offer_3',
      offerTitle: 'Фото и видеосъёмка свадеб',
      vendorId: 'vendor_2',
      clientId: 'client_fake_1',
      clientName: 'Жанна',
      eventDate: '2026-02-20',
      status: 'confirmed',
      messages: [],
      hasReview: true,
      createdAt: '2026-01-25T10:00:00Z',
    },
  ];

  const reviews: Review[] = [
    {
      id: 'review_1',
      offerId: 'offer_1',
      bookingId: 'booking_past_1',
      clientId: 'client_fake_1',
      clientName: 'Жанна',
      rating: 5,
      text: 'Отличный зал, всё прошло великолепно! Персонал внимательный, еда вкусная. Гости в восторге.',
      createdAt: '2026-02-16T20:00:00Z',
    },
    {
      id: 'review_2',
      offerId: 'offer_1',
      bookingId: 'booking_past_2',
      clientId: 'client_fake_2',
      clientName: 'Мадина',
      rating: 4,
      text: 'Хороший зал, но парковка была немного перегружена. В остальном всё на уровне.',
      createdAt: '2026-03-09T15:00:00Z',
    },
    {
      id: 'review_3',
      offerId: 'offer_3',
      bookingId: 'booking_past_3',
      clientId: 'client_fake_1',
      clientName: 'Жанна',
      rating: 5,
      text: 'Команда Golden Lens — это просто космос! Фото и видео вернули нас в тот день снова. Советую всем!',
      createdAt: '2026-02-22T12:00:00Z',
    },
  ];

  return { users, offers, bookings, reviews };
}
