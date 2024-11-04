/* eslint-disable no-undef */
const { expect } = require('chai');
const searchOffersByHotelId = require('../hotel/searchOffersByHotelId');
const { skip } = require('../utility');

const getISOCurrency = (currency) => currency;

const results = {
  session: 123,
  hotel: {
    id: '1231111',
    hotelName: 'Everest Hotel',
    offers: [
      { offerId: 1, amount: 1000, currency: 'TRY' },
      { offerId: 2, amount: 1100, currency: 'TRY' },
      { offerId: 3, amount: 1200, currency: 'TRY' },
    ],
  },
};

describe('hotel search by hotel id mapper tests', () => {
  it('hotel search by hotel id mapper with 3 offers', () => {
    const response = searchOffersByHotelId()
      .setSession({})
      .setProviderSessionJson(skip('no provider json'))
      .setFinished(true)
      .setProviderSessionId(123)
      .setLastOperationName('searchOffersByHotelId')
      .setMinutesForExpectedSignoutTime(18);

    results.hotel.offers.forEach((offer) => {
      const ISOCurrency = getISOCurrency(offer.currency);
      const offerMapper = response.addOffer()
        .setProvider('hotelbeds')
        .setProviderHotelId(results.hotel.id)
        .setSearchId(1231231)
        .setSearchCombinationId('1231231')
        .setIsSpecialOffer(false)
        .setRoomId(offer.offerId)
        .setNeedNationality(true)
        .setRoomName('single standard')
        .setRoomType(skip('hotelbeds roomtype dondurmuyor'))
        .setRoomTypeDescription('Room only')
        .setBoardBasisCode('BB')
        .setBoardBasisName('bed and breakfast')
        .setBoardBasisValue(skip('no board basis value in hotelbeds'))
        .setBoardBasisCancellationPolicy(skip('no cancellation policy in search'))
        .setPriceSpeacialOffer(true)
        .setRateType('BOOKABLE')
        .setAllotment(12)
        .setIsOpaqueRates(false)
        .setStars(4)
        .setPriceTaxVatIncluded(false)
        .setIsOnline(true)
        .setIsNegotiated(false)
        .setPaymentAtHotel(false)
        .setCurrency(ISOCurrency)
        .setBaseFare(offer.amount)
        .setTotalFare(offer.amount)
        .setTaxFare(skip('no tax provided'))
        .setExtraOptions(skip('no extra options in hotelbeds'))
        .setIsNonRefundable('yes')
        .setComission(skip('no commission in hotelbeds'))
        .setComissionTax(skip('no commission in hotelbeds'))
        .setOrderJson({ sessionNumber: 2 })
        .runFinalizeFunction(() => { });

    });

    //console.log(JSON.stringify(response.get()));
    expect(response.get().offers).to.be.lengthOf(3);
    expect(response.get().offers[0].price.itinerary.totalFare).to.be.equal(1000);
    expect(response.get().offers[1].price.itinerary.totalFare).to.be.equal(1100);
    expect(response.get().offers[2].price.itinerary.totalFare).to.be.equal(1200);

  });
});
