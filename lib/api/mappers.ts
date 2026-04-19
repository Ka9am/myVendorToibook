import { ApiOffer, OfferCard } from './types';

export function toOfferCard(offer: ApiOffer): OfferCard {
  const cover = offer.images.find((i) => i.isCover) ?? offer.images[0];
  return {
    id: offer.id,
    vendorType: offer.vendorType,
    venueType: offer.venueType,
    serviceType: offer.serviceType,
    name: offer.displayName,
    city: offer.city,
    status: offer.status,
    coverImageUrl: cover?.imageUrl ?? '',
  };
}
