const moment = require('moment');
const { needsMapping } = require('../utility');
const { isFunction, last } = require('lodash');

module.exports = () => {
  const result = {
    cards: {},
  };
  let isMappingFinalized = true;

  const get = () => {
    if (!isMappingFinalized) {
      throw new Error('Developer error: mapping is not finalized yet. Please call runFinalizeFunction');
    }
    return result;
  }


  const runFinalizeFunction = (finalizeFunction) => {
    if (!isFunction(finalizeFunction)) {
      throw new Error('Developer error: finalizeFunction is not a function');
    }

    const [flight] = result.data.flights.slice(-1);
    finalizeFunction(flight);
    isMappingFinalized = true;
  }
  const setPassengerTicketNumber = (ticketNumber) => {
    if (needsMapping(ticketNumber)) {
      const [passenger] = result.cards.traveler.slice(-1);
      passenger.eTicketDocuments = {
        eTicketInfo: [{
          ticketNumber
        }]
      }
    }
    return {};
  }
  const setPassengerPhone = (phoneType, phoneNumber) => {
    if (needsMapping(phoneType) && needsMapping(phoneNumber)) {
      const [passenger] = result.cards.traveler.slice(-1);
      passenger.telephone = {
        phoneType,
        locationCode: phoneNumber
      };
    }
    return { setPassengerTicketNumber };
  };
  const setPassengerAirTraveler = (passengerCode) => {
    if (needsMapping(passengerCode)) {
      const [passenger] = result.cards.traveler.slice(-1);
      passenger.airTraveler = passengerCode;
    }
    return { setPassengerPhone };
  };
  const setPassengerEmail = (email) => {
    if (needsMapping(email)) {
      const [passenger] = result.cards.traveler.slice(-1);
      passenger.email = email;
    }
    return { setPassengerAirTraveler }
  };
  const setPassengerBirthDate = (birthDate) => {
    if (needsMapping(birthDate)) {
      const [passenger] = result.cards.traveler.slice(-1);
      passenger.birthDate = birthDate;
    }
    return { setPassengerEmail }
  };
  const setPassengerName = (namePrefix, givenName, surname) => {
    if (needsMapping(namePrefix) && needsMapping(givenName) && needsMapping(surname)) {
      const [passenger] = result.cards.traveler.slice(-1);
      passenger.personName = {
        namePrefix,
        givenName,
        surname
      };
    }
    return { setPassengerBirthDate };
  }
  const addPassenger = (isAdd) => {
    if (needsMapping(isAdd)) {
      if (!result.cards.traveler) {
        result.cards.traveler = [];
      }
      result.cards.traveler.push({});
    }
    return { setPassengerName };
  }
  const setStatus = (status) => {
    if (needsMapping(status)) {
      result.cards.cancel = status.toString();
    }
    return { addPassenger, get };
  }
  const setTicketDesignator = (object) => {
    if (needsMapping(object)) {
      result.cards.ticketDesignator = object || {};
    }
    return { setStatus }
  };

  const setPnr = (gdsPnr, ghostPnr) => {
    if (needsMapping(gdsPnr) && needsMapping(ghostPnr)) {
      result.cards.bookingReferenceId = {
        gdsPnr,
        ghostPnr
      }
    }
    return { setTicketDesignator };
  }
  const setIsTicketed = (isTicketed) => {
    if (needsMapping(isTicketed)) {
      result.cards.isTicketed = isTicketed;
    }
    return { setPnr };
  }
  const setTicketing = (ticketType, ticketTimeLimit) => {
    if (needsMapping(ticketType) && needsMapping(ticketTimeLimit)) {
      result.cards.ticketing = {
        ticketType, ticketTimeLimit
      }
    }
    return { setIsTicketed };
  }

  const setMinutesForExpectedSignoutTime = (minutes) => {
    if (needsMapping(minutes)) {
      result.session.expectedSignoutTime = moment().utc().add(minutes, 'minutes').format('YYYY-MM-DD HH:mm:00');
    }
    return { setTicketing };
  };

  const setLastOperationName = (operationName) => {
    if (needsMapping(operationName)) {
      result.session.lastOperation = operationName;
    }
    return { setMinutesForExpectedSignoutTime };
  };

  const setSessionId = (sessionId) => {
    if (needsMapping(sessionId)) {
      result.session.sessionId = sessionId;
      result.sessionId = sessionId;
    }
    return { setLastOperationName };
  };

  const setProviderSessionId = (providerSessionId) => {
    if (needsMapping(providerSessionId)) {
      result.session.providerSessionId = providerSessionId;
      result.providerSessionId = providerSessionId;
    }
    return { setSessionId };
  };

  const setProviderSessionJson = (providerJson) => {
    if (needsMapping(providerJson)) {
      result.session.providerJson = providerJson;
    }
    return { setProviderSessionId };
  };

  const setSession = (session) => {
    if (needsMapping(session)) {
      result.session = session || {};
    }
    return { setProviderSessionJson };
  };

  return { setSession };
};

