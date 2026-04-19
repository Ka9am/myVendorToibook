import {
  CreateOfferRequest, VendorType, VenueType, ServiceType, ApiCity,
  OfferImage, DetailsType, ContactType,
} from './types';

const VENDOR_TYPES: VendorType[] = ['VENUE', 'SERVICE_PROVIDER'];
const VENUE_TYPES: VenueType[] = ['RESTAURANT', 'BAR', 'LOFT'];
const SERVICE_TYPES: ServiceType[] = ['PHOTOGRAPHER', 'FLORIST', 'DJ', 'HOST'];
const CITIES: ApiCity[] = ['ALMATY', 'ASTANA'];
const DETAIL_TYPES: DetailsType[] = ['CONTACTS'];
const CONTACT_TYPES: ContactType[] = ['PHONE', 'TELEGRAM', 'INSTAGRAM', 'WHATSAPP'];

export type ValidationResult =
  | { ok: true; value: CreateOfferRequest }
  | { ok: false; error: string };

export function validateOfferRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const b = body as Record<string, unknown>;

  if (typeof b.vendorType !== 'string' || !VENDOR_TYPES.includes(b.vendorType as VendorType)) {
    return { ok: false, error: 'vendorType must be VENUE or SERVICE_PROVIDER' };
  }
  const vendorType = b.vendorType as VendorType;

  let venueType: VenueType | null = null;
  let serviceType: ServiceType | null = null;

  if (vendorType === 'VENUE') {
    if (typeof b.venueType !== 'string' || !VENUE_TYPES.includes(b.venueType as VenueType)) {
      return { ok: false, error: 'venueType is required for VENUE' };
    }
    venueType = b.venueType as VenueType;
    if (b.serviceType != null) return { ok: false, error: 'serviceType must be null for VENUE' };
  } else {
    if (typeof b.serviceType !== 'string' || !SERVICE_TYPES.includes(b.serviceType as ServiceType)) {
      return { ok: false, error: 'serviceType is required for SERVICE_PROVIDER' };
    }
    serviceType = b.serviceType as ServiceType;
    if (b.venueType != null) return { ok: false, error: 'venueType must be null for SERVICE_PROVIDER' };
  }

  if (typeof b.displayName !== 'string' || !b.displayName.trim()) {
    return { ok: false, error: 'displayName is required' };
  }
  if (typeof b.description !== 'string' || !b.description.trim()) {
    return { ok: false, error: 'description is required' };
  }
  if (typeof b.city !== 'string' || !CITIES.includes(b.city as ApiCity)) {
    return { ok: false, error: 'city must be ALMATY or ASTANA' };
  }

  const images: OfferImage[] = [];
  if (!Array.isArray(b.images)) return { ok: false, error: 'images must be an array' };
  for (const raw of b.images) {
    if (!raw || typeof raw !== 'object') return { ok: false, error: 'Invalid image entry' };
    const img = raw as Record<string, unknown>;
    if (typeof img.imageUrl !== 'string' || !img.imageUrl.trim()) {
      return { ok: false, error: 'image.imageUrl is required' };
    }
    images.push({ imageUrl: img.imageUrl, isCover: img.isCover === true });
  }
  if (images.length > 0 && !images.some((i) => i.isCover)) images[0].isCover = true;

  const details: CreateOfferRequest['details'] = [];
  if (b.details !== undefined) {
    if (!Array.isArray(b.details)) return { ok: false, error: 'details must be an array' };
    for (const raw of b.details) {
      if (!raw || typeof raw !== 'object') return { ok: false, error: 'Invalid detail entry' };
      const d = raw as Record<string, unknown>;
      if (typeof d.detailsType !== 'string' || !DETAIL_TYPES.includes(d.detailsType as DetailsType)) {
        return { ok: false, error: 'detailsType must be CONTACTS' };
      }
      if (!Array.isArray(d.data)) return { ok: false, error: 'detail.data must be an array' };
      const data = [];
      for (const raw2 of d.data) {
        if (!raw2 || typeof raw2 !== 'object') return { ok: false, error: 'Invalid contact entry' };
        const c = raw2 as Record<string, unknown>;
        if (typeof c.contactType !== 'string' || !CONTACT_TYPES.includes(c.contactType as ContactType)) {
          return { ok: false, error: 'Invalid contactType' };
        }
        if (typeof c.contactInfo !== 'string' || !c.contactInfo.trim()) {
          return { ok: false, error: 'contactInfo is required' };
        }
        data.push({ contactType: c.contactType as ContactType, contactInfo: c.contactInfo });
      }
      details.push({ detailsType: d.detailsType as DetailsType, data });
    }
  }

  return {
    ok: true,
    value: {
      vendorType, venueType, serviceType,
      displayName: b.displayName.trim(),
      description: b.description.trim(),
      city: b.city as ApiCity,
      images, details,
    },
  };
}
