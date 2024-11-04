module.exports = (searchResult, { searchCombinationId, searchId }) => {
  const result = { offers: [] };

  if (!(searchResult && searchResult.data && searchResult.data.hotels)) {
    throw new Error('Developer Error: missing hotel&offer data');
  }


  result.session = searchResult.session;
  // bunu eklemememizin sebebi, adaptor manager resp.providerSessionId varsa sessioni update et diyor.
  result.providerSessionId = searchResult.session.providerSessionId;
  result.session.lastOperation = 'SearchOffersByHotelId';

  const hotel = searchResult.data.hotels[0] || {};
  const offers = hotel.offers || [];

  offers.forEach(hotelOffer => {
    const offer = hotelOffer;
    offer.searchCombinationId = searchCombinationId; //////////////////////
    offer.searchId = searchId; //////////////////////
    offer.providerHotelId = hotel.providerHotelId;
    offer.provider = hotel.provider;
    offer.userId = searchResult.session.userId;
    offer.sessionId = searchResult.session.sessionId;

    offer.originalPrice.financialValues = { purchase: { } };
    offer.originalPrice.financialValues.purchase.originalCost = {
      currency: hotelOffer.originalPrice.itinerary.currency,
      total: hotelOffer.originalPrice.itinerary.baseFare,
    };
    offer.originalPrice.financialValues.purchase.originalCostTax = {
      currency: hotelOffer.originalPrice.itinerary.currency,
      total: hotelOffer.originalPrice.itinerary.taxFare || 0,
    };

    result.offers.push(offer);
  });

  return result;
};
