import {
  ApiOffer, OfferCard, PageResponse,
  VendorType, VenueType, ServiceType, ApiCity,
} from './types';
import { toOfferCard } from './mappers';

const VENDOR_TYPES: VendorType[] = ['VENUE', 'SERVICE_PROVIDER'];
const VENUE_TYPES: VenueType[] = ['RESTAURANT', 'BAR', 'LOFT'];
const SERVICE_TYPES: ServiceType[] = ['PHOTOGRAPHER', 'FLORIST', 'DJ', 'HOST'];
const CITIES: ApiCity[] = ['ALMATY', 'ASTANA'];

export type FeedParams = {
  query?: string;
  vendorType?: VendorType;
  venueType?: VenueType;
  serviceType?: ServiceType;
  city?: ApiCity;
  page: number;
  size: number;
  sortBy: 'createdAt';
  sortDirection: 'asc' | 'desc';
};

export function parseFeedParams(search: URLSearchParams): FeedParams {
  const query = search.get('query')?.trim() || undefined;

  const vendorTypeRaw = search.get('vendorType');
  const vendorType = vendorTypeRaw && VENDOR_TYPES.includes(vendorTypeRaw as VendorType)
    ? (vendorTypeRaw as VendorType) : undefined;

  const venueTypeRaw = search.get('venueType');
  const venueType = venueTypeRaw && VENUE_TYPES.includes(venueTypeRaw as VenueType)
    ? (venueTypeRaw as VenueType) : undefined;

  const serviceTypeRaw = search.get('serviceType');
  const serviceType = serviceTypeRaw && SERVICE_TYPES.includes(serviceTypeRaw as ServiceType)
    ? (serviceTypeRaw as ServiceType) : undefined;

  const cityRaw = search.get('city');
  const city = cityRaw && CITIES.includes(cityRaw as ApiCity)
    ? (cityRaw as ApiCity) : undefined;

  const page = Math.max(0, Number(search.get('page') ?? 0) || 0);
  const sizeRaw = Number(search.get('size') ?? 10) || 10;
  const size = Math.min(100, Math.max(1, sizeRaw));

  const sortBy: 'createdAt' = 'createdAt';
  const dirRaw = (search.get('sortDirection') ?? 'desc').toLowerCase();
  const sortDirection: 'asc' | 'desc' = dirRaw === 'asc' ? 'asc' : 'desc';

  return { query, vendorType, venueType, serviceType, city, page, size, sortBy, sortDirection };
}

export function applyFeed(offers: ApiOffer[], params: FeedParams): PageResponse<OfferCard> {
  const q = params.query?.toLowerCase();
  let filtered = offers.filter((o) => {
    if (params.vendorType && o.vendorType !== params.vendorType) return false;
    if (params.venueType && o.venueType !== params.venueType) return false;
    if (params.serviceType && o.serviceType !== params.serviceType) return false;
    if (params.city && o.city !== params.city) return false;
    if (q) {
      const hay = `${o.displayName} ${o.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    const cmp = a.createdAt.localeCompare(b.createdAt);
    return params.sortDirection === 'asc' ? cmp : -cmp;
  });

  const totalElements = filtered.length;
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / params.size);
  const start = params.page * params.size;
  const pageItems = filtered.slice(start, start + params.size);

  return {
    content: pageItems.map(toOfferCard),
    empty: pageItems.length === 0,
    first: params.page === 0,
    last: totalPages === 0 || params.page >= totalPages - 1,
    number: params.page,
    numberOfElements: pageItems.length,
    size: params.size,
    totalElements,
    totalPages,
  };
}
