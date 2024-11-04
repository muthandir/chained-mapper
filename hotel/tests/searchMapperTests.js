/* eslint-disable no-undef */
const { expect } = require('chai');
const hotelSearch = require('../search');
const { skip } = require('../../utility');

const getISOCurrency = (currency) => currency;

const results = {
  session: 123,
  hotels: [
    {
      id: '1231111',
      hotelName: 'Everest Hotel',
      offers: [
        { offerId: 1, amount: 1000, currency: 'TRY' },
        { offerId: 2, amount: 1100, currency: 'TRY' },
        { offerId: 3, amount: 1200, currency: 'TRY' },
      ],
    },
    {
      id: '115d1351ss',
      hotelName: 'Fuji Hotel',
      offers: [
        { offerId: 11, amount: 999, currency: 'TRY' },
        { offerId: 12, amount: 1001, currency: 'TRY' },
      ],
    },
  ],
};

describe('hotel search mapper tests', () => {
  it('hotel search mapper with 2 hotels', () => {
    const response = hotelSearch()
      .setSession({})
      .setProviderSessionJson(skip('no provider json'))
      .setFinished(true)
      .setProviderSessionId(123)
      .setLastOperationName('searchHotelV2')
      .setMinutesForExpectedSignoutTime(18);

    results.hotels.forEach((element) => {
      const hotel = response.addHotel()
        .setName(element.hotelName)
        .setProvider('hotelbeds')
        .setProviderHotelId(element.id)
        .setSearchId(1231231);

      element.offers.forEach((offer) => {
        const offerMapper = hotel.addOffer()
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
          .setPaymentAtHotel(false);

        const ISOCurrency = getISOCurrency(offer.currency);

        offerMapper.setCurrency(ISOCurrency)
          .setBaseFare(offer.amount)
          .setTotalFare(offer.amount)
          .setTaxFare(skip('no tax provided'))
          .setExtraOptions(skip('no extra options in hotelbeds'))
          .setIsNonRefundable('yes')
          .setComission(skip('no commission in hotelbeds'))
          .setComissionTax(skip('no commission in hotelbeds'))
          .setOrderJson({ test: 'right' })
          .runFinalizeFunction(() => { });
      });
    });

    // console.log(JSON.stringify(response.get()));
    expect(response.get().data.hotels).to.be.lengthOf(2);
    expect(response.get().data.hotels[0].offers).to.be.lengthOf(3);
    expect(response.get().data.hotels[1].offers).to.be.lengthOf(2);
  });
});
