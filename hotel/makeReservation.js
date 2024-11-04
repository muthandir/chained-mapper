const { needsMapping } = require('../utility');

const makeReservationMapper = () => {
  const data = {
    session: {},
    rooms: [],
    policies: [],
    warnings: [],
  };

  let lastNewPriceExtraOptionKey;

  const getLast = (array) => array[array.length - 1];

  const get = () => data;

  const setSessionData = (sessionData) => {
    if (needsMapping(sessionData)) {
      Object.assign(data.session, sessionData);
    }
    return { get };
  }

  const setSessionId = (id) => {
    if (needsMapping(id)) {
      data.session.sessionId = id;
    }
    return { setSessionData };
  };

  const setProviderSessionId = (id) => {
    if (needsMapping(id)) {
      data.providerSessionId = id;
    }
    return { setSessionId };
  };

  const setLastTicketingDate = (date) => {
    if (needsMapping(date)) {
      data.lastTicketingDate = date;
    }
    return { get, setProviderSessionId };
  };

  const setNewPriceExtraOptionType = (type) => {
    if (needsMapping(type)) {
      data.newPrice.itinerary.extraOptions[lastNewPriceExtraOptionKey].type = type;
    }
    // eslint-disable-next-line no-use-before-define
    return { addNewPriceExtraOption, setLastTicketingDate };
  };

  const setNewPriceExtraOptionIsTax = (isTax) => {
    if (needsMapping(isTax)) {
      data.newPrice.itinerary.extraOptions[lastNewPriceExtraOptionKey].isTax = isTax;
    }
    return { setNewPriceExtraOptionType };
  };

  const setNewPriceExtraOptionIsBillable = (isBillable) => {
    if (needsMapping(isBillable)) {
      data.newPrice.itinerary.extraOptions[lastNewPriceExtraOptionKey].isBillable = isBillable;
    }
    return { setNewPriceExtraOptionIsTax };
  };

  const addNewPriceExtraOption = (key) => {
    lastNewPriceExtraOptionKey = key;
    data.newPrice.itinerary.extraOptions[key] = {};
    return { setNewPriceExtraOptionIsBillable };
  };

  const setNewPriceTotalFare = (fare) => {
    if (needsMapping(fare)) {
      data.newPrice.itinerary.totalFare = fare;
    }
    return { addNewPriceExtraOption, setLastTicketingDate };
  };

  const setNewPrice = () => {
    data.newPrice = { itinerary: { extraOptions: {} } };
    return { setNewPriceTotalFare };
  };

  const setWarningParameterText = (text) => {
    if (needsMapping(text)) {
      getLast(getLast(data.warnings).parameters).text = text;
    }
    return {
      // eslint-disable-next-line no-use-before-define
      addWarningParameter, addWarning, setNewPrice, setLastTicketingDate,
    };
  };

  const setWarningParameterType = (type) => {
    if (needsMapping(type)) {
      getLast(getLast(data.warnings).parameters).type = type;
    }
    return { setWarningParameterText };
  };

  const addWarningParameter = () => {
    getLast(data.warnings).parameters.push({});
    return { setWarningParameterType };
  };

  const setWarningMessage = (msg) => {
    if (needsMapping(msg)) {
      getLast(data.warnings).message = msg;
    }
    // eslint-disable-next-line no-use-before-define
    return { addWarningParameter, addWarning, setNewPrice };
  };

  const setWarningCode = (code) => {
    if (needsMapping(code)) {
      getLast(data.warnings).code = code;
    }
    return { setWarningMessage };
  };

  const addWarning = () => {
    data.warnings.push({
      parameters: [],
    });
    return { setWarningCode };
  };

  const setPolicyAmount = (amount) => {
    if (needsMapping(amount)) {
      getLast(data.policies).amount = amount;
    }
    // eslint-disable-next-line no-use-before-define
    return { addPolicy, addWarning, setNewPrice };
  };

  const setPolicyPolicyType = (type) => {
    if (needsMapping(type)) {
      getLast(data.policies).policyType = type;
    }
    return { setPolicyAmount };
  };

  const setPolicyType = (type) => {
    if (needsMapping(type)) {
      getLast(data.policies).type = type;
    }
    return { setPolicyPolicyType };
  };

  const setPolicyTime = (time) => {
    if (needsMapping(time)) {
      getLast(data.policies).time = time;
    }
    return { setPolicyType };
  };

  const addPolicy = () => {
    data.policies.push({});
    return { setPolicyTime };
  };

  const setAction = (action) => {
    if (needsMapping(action)) {
      data.action = action;
    }
    return {
      addPolicy, addWarning, setNewPrice, setLastTicketingDate,
    };
  };

  const setTravellerAge = (age) => {
    if (needsMapping(age)) {
      getLast(getLast(data.rooms).travellers).age = age;
    }
    // eslint-disable-next-line no-use-before-define
    return { addTraveller, addRoom, setAction };
  };

  const setTravellerPhone = (phone) => {
    if (needsMapping(phone)) {
      getLast(getLast(data.rooms).travellers).phone = phone;
    }
    return { setTravellerAge };
  };

  const setTravellerLastname = (lastname) => {
    if (needsMapping(lastname)) {
      getLast(getLast(data.rooms).travellers).lastname = lastname;
    }
    return { setTravellerPhone };
  };

  const setTravellerFirstname = (firstname) => {
    if (needsMapping(firstname)) {
      getLast(getLast(data.rooms).travellers).firstname = firstname;
    }
    return { setTravellerLastname };
  };

  const setTravellerEmail = (email) => {
    if (needsMapping(email)) {
      getLast(getLast(data.rooms).travellers).email = email;
    }
    return { setTravellerFirstname };
  };

  const setTravellerTitle = (title) => {
    if (needsMapping(title)) {
      getLast(getLast(data.rooms).travellers).title = title;
    }
    return { setTravellerEmail };
  };

  const setTravellerOwner = (owner) => {
    if (needsMapping(owner)) {
      getLast(getLast(data.rooms).travellers).owner = owner;
    }
    return { setTravellerTitle };
  };

  const addTraveller = () => {
    getLast(data.rooms).travellers.push({});
    return { setTravellerOwner };
  };

  const setRoomType = (type) => {
    if (needsMapping(type)) {
      getLast(data.rooms).roomType = type;
    }
    // eslint-disable-next-line no-use-before-define
    return { addTraveller, addRoom, setAction };
  };

  const setRoomId = (id) => {
    if (needsMapping(id)) {
      getLast(data.rooms).roomId = id;
    }
    return { setRoomType };
  };

  const addRoom = () => {
    data.rooms.push({
      travellers: [],
    });
    return { setRoomId };
  };

  const setSupplierName = (name) => {
    if (needsMapping(name)) {
      data.supplierName = name;
    }
    return { addRoom, addTraveller, setAction };
  };

  const setSupplierConfirmationId = (id) => {
    if (needsMapping(id)) {
      data.supplierConfirmationId = id;
    }
    return { setSupplierName };
  };

  const setPriceCurrency = (cur) => {
    if (needsMapping(cur)) {
      data.priceCurrency = cur;
    }
    return { setSupplierConfirmationId };
  };

  const setPaymentType = (type) => {
    if (needsMapping(type)) {
      data.paymentType = type;
    }
    return { setPriceCurrency };
  };

  const setPaymentDate = (date) => {
    if (needsMapping(date)) {
      data.paymentDate = date;
    }
    return { setPaymentType };
  };

  const setHotelEmail = (email) => {
    if (needsMapping(email)) {
      data.hotelEmail = email;
    }
    return { setPaymentDate };
  };

  const setHotelAddress = (address) => {
    if (needsMapping(address)) {
      data.hotelAddress = address;
    }
    return { setHotelEmail };
  };

  const setHotelCity = (city) => {
    if (needsMapping(city)) {
      data.hotelCity = city;
    }
    return { setHotelAddress };
  };

  const setHotelFax = (fax) => {
    if (needsMapping(fax)) {
      data.hotelFax = fax;
    }
    return { setHotelCity };
  };

  const setHotelPhone = (phone) => {
    if (needsMapping(phone)) {
      data.hotelPhone = phone;
    }
    return { setHotelFax };
  };

  const setHotelName = (name) => {
    if (needsMapping(name)) {
      data.hotelName = name;
    }
    return { setHotelPhone };
  };

  const setCheckOut = (date) => {
    if (needsMapping(date)) {
      data.checkOut = date;
    }
    return { setHotelName };
  };

  const setCheckIn = (date) => {
    if (needsMapping(date)) {
      data.checkIn = date;
    }
    return { setCheckOut };
  };

  const setBookingPreferences = (pref) => {
    if (needsMapping(pref)) {
      data.bookingPreferences = pref;
    }
    return { setCheckIn };
  };

  /**
   * @param {string} status `OK` if purchased/booked, `RJ` if rejected.
   */
  const setStatus = (status) => {
    if (needsMapping(status)) {
      data.status = status;
    }
    return { setBookingPreferences };
  };

  const setReservationId = (id) => {
    if (needsMapping(id)) {
      data.reservationId = id;
    }
    return { setStatus };
  };

  return { setReservationId };
};

module.exports = makeReservationMapper;
