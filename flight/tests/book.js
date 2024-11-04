const { get, find } = require('lodash');
const results = require('./purchase.json');

const book = require('../book');
const { skip, arrayify } = require('../../utility');

describe('flight book mapper tests', () => {
  it('flight book mapper', () => {
    const OTA_AirBookRS = get(results, 'data.purchaseBasketOTAResponse.retrieveReservationOTAResponse.OTA_AirBookRS', {});
    const AirReservation = get(OTA_AirBookRS, 'AirReservation', {});
    const bookingReferenceId = get(find(OTA_AirBookRS.AirReservation.BookingReferenceID, item => item.Type === 'PNR'), 'ID', null);
    const passengers = arrayify(get(AirReservation, 'TravelerInfo.AirTraveler', []));
    const ticketing = arrayify(get(AirReservation, 'Ticketing', []));

    const response = book()
      .setSession({})
      .setProviderSessionJson(skip('no provider json'))
      .setProviderSessionId(123)
      .setSessionId(12312)
      .setLastOperationName('book')
      .setMinutesForExpectedSignoutTime(15)
      .setTicketing('bookingOnly', get(OTA_AirBookRS, 'AirReservation.Ticketing.TicketTimeLimit'))
      .setIsTicketed(ticketing.length > 0)
      .setPnr(bookingReferenceId, bookingReferenceId);

    passengers.forEach((passenger, index) => {
      response.addPassenger()
        .setPassengerName(
          passenger.PersonName.NamePrefix,
          passenger.PersonName.GivenName,
          passenger.PersonName.Surname
        )
        .setPassengerBirthDate('1992-12-12')
        .setPassengerEmail('asdasd@adasd.tech')
        .setPassengerAirTraveler('ADT')
        .setPassengerPhone('GSM', '+9055555555')
        .setPassengerTicketNumber(get(find(ticketing, item => item.TravelerRefNumber === passenger.ProfileRef.UniqueID.ID), 'TicketDocumentNbr', get(ticketing, `[${index}].TicketDocumentNbr`, null)));
    })
    const fligthRes = response.get();
    console.log(fligthRes);
  });
});
