export type VendorType = 'VENUE' | 'SERVICE_PROVIDER';
export type VenueType = 'RESTAURANT' | 'BAR' | 'LOFT';
export type ServiceType = 'PHOTOGRAPHER' | 'FLORIST' | 'DJ' | 'HOST';
export type ApiCity = 'ALMATY' | 'ASTANA';
export type OfferStatus = 'CREATED' | 'PENDING' | 'ACTIVE' | 'DISABLED';
export type DetailsType = 'CONTACTS';
export type ContactType = 'PHONE' | 'TELEGRAM' | 'INSTAGRAM' | 'WHATSAPP';

export type ApiVendor = {
  id: number;
  name: string;
  surname: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type OfferImage = {
  imageUrl: string;
  isCover: boolean;
};

export type ContactData = {
  contactType: ContactType;
  contactInfo: string;
};

export type OfferDetail = {
  id: number;
  detailsType: DetailsType;
  data: ContactData[];
};

export type ApiOffer = {
  id: number;
  vendorId: number;
  vendorType: VendorType;
  venueType: VenueType | null;
  serviceType: ServiceType | null;
  displayName: string;
  description: string;
  city: ApiCity;
  status: OfferStatus;
  images: OfferImage[];
  detailsResponses: OfferDetail[];
  createdAt: string;
  rejectionReason?: string | null;
};

export type OfferCard = {
  id: number;
  vendorType: VendorType;
  venueType: VenueType | null;
  serviceType: ServiceType | null;
  name: string;
  city: ApiCity;
  status: OfferStatus;
  coverImageUrl: string;
};

export type CreateOfferRequest = {
  vendorType: VendorType;
  venueType: VenueType | null;
  serviceType: ServiceType | null;
  displayName: string;
  description: string;
  city: ApiCity;
  images: OfferImage[];
  details: Array<{
    detailsType: DetailsType;
    data: ContactData[];
  }>;
};

export type PageResponse<T> = {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
