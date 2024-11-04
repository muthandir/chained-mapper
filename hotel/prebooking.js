const { needsMapping } = require('../utility');

const prebookingChain = () => {
  const data = {
    bookingPreferences: [],
    priceBreakdown: [],
    policies: [],
    warnings: [],
    session: {},
  };

  const getLast = (array) => array[array.length - 1];

  const get = () => data;

  const setProviderSessionJson = (json) => {
    if (needsMapping(json)) {
      data.session.providerJson = json;
    }
    return { get }
  };

  const setSessionData = (sessionData) => {
    if (needsMapping(sessionData)) {
      Object.assign(data.session, sessionData);
    }
    return { get };
  }

  const setProviderSessionId = (id) => {
    if (needsMapping(id)) {
      data.providerSessionId = id;
    }
    return { setSessionData, setProviderSessionJson };
  }

  const setLastTicketingDate = (date) => {
    if (needsMapping(date)) {
      data.lastTicketingDate = date;
    }
    return { setProviderSessionId };
  };

  const setExtraOptions = (key, amount, isBillable, isTax, type) => {
    if (needsMapping(key)) {
      if (data.newPrice.itinerary[key]) {
        throw new Error('key already set to price');
      }
      if (!data.newPrice.itinerary.extraOptions) {
        data.newPrice.itinerary.extraOptions = {};
      }
      data.newPrice.itinerary[key] = amount;
      data.newPrice.itinerary.extraOptions[key] = { isBillable, isTax, type };
    }
    return { setExtraOptions, setLastTicketingDate };
  };

  const setTaxFare = (fare) => {
    if (needsMapping(fare)) {
      data.newPrice.itinerary.taxFare = fare;
    }
    return { setExtraOptions, setLastTicketingDate };
  };

  const setTotalFare = (fare) => {
    if (needsMapping(fare)) {
      data.newPrice.itinerary.totalFare = fare;
    }
    return { setTaxFare };
  };

  const setBaseFare = (fare) => {
    if (needsMapping(fare)) {
      data.newPrice.itinerary.baseFare = fare;
    }
    return { setTotalFare };
  };

  const setNewPriceCurrency = (currency) => {
    if (needsMapping(currency)) {
      data.newPrice.itinerary.currency = currency;
    }
    return { setBaseFare };
  };

  const setNewPrice = () => {
    data.newPrice = { itinerary: {} };
    return { setNewPriceCurrency };
  };

  const setAccountingNumber = (number) => {
    if (needsMapping(number)) {
      data.accountingNumber = String(number);
    }
    return { setNewPrice, setLastTicketingDate };
  };

  const setWarningParameterText = (text) => {
    if (needsMapping(text)) {
      getLast(getLast(data.warnings).parameters).text = text;
    }
    // eslint-disable-next-line no-use-before-define
    return { addWarningParameter, addWarning, setAccountingNumber };
  };

  const setWarningParameterType = (type) => {
    if (needsMapping(type)) {
      getLast(getLast(data.warnings).parameters).type = type;
    }
    // eslint-disable-next-line no-use-before-define
    return { setWarningParameterText };
  };

  const addWarningParameter = () => {
    getLast(data.warnings).parameters.push({});
    return { setWarningParameterType };
  };

  const setWarningMessage = (message) => {
    if (needsMapping(message)) {
      getLast(data.warnings).message = message;
    }
    // eslint-disable-next-line no-use-before-define
    return { addWarningParameter, addWarning, setAccountingNumber };
  };

  const setCode = (code) => {
    if (needsMapping(code)) {
      getLast(data.warnings).code = code;
    }
    return { setWarningMessage };
  };

  const addWarning = () => {
    data.warnings.push({ parameters: [] });
    return { setWarningCode: setCode };
  };

  const setPolicyAmount = (amount) => {
    if (needsMapping(amount)) {
      getLast(data.policies).amount = amount;
    }
    // eslint-disable-next-line no-use-before-define
    return { addPolicy, addWarning, setAccountingNumber };
  };

  const setPolicyTime = (time) => {
    if (needsMapping(time)) {
      getLast(data.policies).time = time;
    }
    return { setPolicyAmount };
  };

  const setType = (type) => {
    if (needsMapping(type)) {
      getLast(data.policies).type = type;
    }
    return { setPolicyTime };
  };

  const addPolicy = () => {
    data.policies.push({});
    return { setPolicyType: setType };
  };

  const setPreflag = (bool) => {
    if (needsMapping(bool)) {
      data.preflag = bool;
    }
    return { addPolicy, addWarning, setAccountingNumber };
  };

  const setPriceBreakdownPrice = (price) => {
    if (needsMapping(price)) {
      getLast(data.priceBreakdown).price = price;
    }
    // eslint-disable-next-line no-use-before-define
    return { addPriceBreakdown, setPreflag };
  };

  const setPriceBreakdownDate = (date) => {
    if (needsMapping(date)) {
      getLast(data.priceBreakdown).date = date;
    }
    return { setPriceBreakdownPrice };
  };

  const setPriceBreakdownCurrency = (currency) => {
    if (needsMapping(currency)) {
      getLast(data.priceBreakdown).currency = currency;
    }
    return { setPriceBreakdownDate };
  };

  const addPriceBreakdown = () => {
    data.priceBreakdown.push({});
    return { setPriceBreakdownCurrency };
  };

  const setSpecialOffer = (bool) => {
    if (needsMapping(bool)) {
      data.specialOffer = bool;
    }
    return { addPriceBreakdown, setPreflag };
  };

  const addBookingPreference = (pref) => {
    if (needsMapping(pref)) {
      data.bookingPreferences.push(pref);
    }
    return { addBookingPreference, setSpecialOffer };
  };

  return { addBookingPreference };
};

module.exports = prebookingChain;
