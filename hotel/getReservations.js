const { needsMapping } = require('../utility');

const mapper = () => {
  const data = [];

  let lastExtraOptionKey;

  const getLast = (array) => array[array.length - 1];

  const get = () => data;

  const setPriceExtraOptionType = (type) => {
    if (needsMapping(type)) {
      getLast(data).price.itinerary.extraOptions[lastExtraOptionKey].type = type;
    }
    // eslint-disable-next-line no-use-before-define
    return { addPriceExtraOption, addReservation, get };
  };

  const setPriceExtraOptionIsTax = (isTax) => {
    if (needsMapping(isTax)) {
      getLast(data).price.itinerary.extraOptions[lastExtraOptionKey].isTax = isTax;
    }
    return { setPriceExtraOptionType };
  };

  const setPriceExtraOptionIsBillable = (isBillable) => {
    if (needsMapping(isBillable)) {
      getLast(data).price.itinerary.extraOptions[lastExtraOptionKey].isBillable = isBillable;
    }
    return { setPriceExtraOptionIsTax };
  };

  const addPriceExtraOption = (key) => {
    getLast(data).price.itinerary.extraOptions[key] = {};
    lastExtraOptionKey = key;
    return { setPriceExtraOptionIsBillable };
  };

  const addPriceItem = (key, value) => {
    getLast(data).price.itinerary[key] = value;
    return {
      // eslint-disable-next-line no-use-before-define
      addPriceItem, addPriceExtraOption, addReservation, get,
    };
  };

  const setPriceTotalFare = (fare) => {
    if (needsMapping(fare)) {
      getLast(data).price.itinerary.totalFare = fare;
    }
    return {
      // eslint-disable-next-line no-use-before-define
      addPriceItem, addPriceExtraOption, addReservation, get,
    };
  };

  const setPenaltyRefundPenaltyAmount = (amount) => {
    if (needsMapping(amount)) {
      getLast(data).penalty.itinerary.refundPenaltyAmount = amount;
    }
    // eslint-disable-next-line no-use-before-define
    return { setPriceTotalFare };
  };

  const setPenaltyRefundAmount = (amount) => {
    if (needsMapping(amount)) {
      getLast(data).penalty.itinerary.refundAmount = amount;
    }
    return { setPenaltyRefundPenaltyAmount };
  };

  const setPenaltyExtraOptionType = (type) => {
    if (needsMapping(type)) {
      getLast(data).penalty.itinerary.extraOptions[lastExtraOptionKey].type = type;
    }
    // eslint-disable-next-line no-use-before-define
    return { addPenaltyExtraOption, setPenaltyRefundAmount };
  };

  const setPenaltyExtraOptionIsTax = (isTax) => {
    if (needsMapping(isTax)) {
      getLast(data).penalty.itinerary.extraOptions[lastExtraOptionKey].isTax = isTax;
    }
    return { setPenaltyExtraOptionType };
  };

  const setPenaltyExtraOptionIsBillable = (isBillable) => {
    if (needsMapping(isBillable)) {
      getLast(data).penalty.itinerary.extraOptions[lastExtraOptionKey].isBillable = isBillable;
    }
    return { setPenaltyExtraOptionIsTax };
  };

  const addPenaltyExtraOption = (key) => {
    getLast(data).penalty.itinerary.extraOptions[key] = {};
    lastExtraOptionKey = key;
    return { setPenaltyExtraOptionIsBillable };
  };

  const addPenaltyItem = (key, value) => {
    getLast(data).penalty.itinerary.item[key] = value;
    return { addPenaltyItem, addPenaltyExtraOption, setPenaltyRefundAmount };
  };

  const setTravellerAge = (age) => {
    if (needsMapping(age)) {
      getLast(getLast(getLast(data).rooms).travellers).age = age;
    }
    return {
      // eslint-disable-next-line no-use-before-define
      addTraveller, addRoom, addPenaltyItem, addPenaltyExtraOption, setPenaltyRefundAmount,
    };
  };

  const setTravellerPhone = (phone) => {
    if (needsMapping(phone)) {
      getLast(getLast(getLast(data).rooms).travellers).phone = phone;
    }
    return { setTravellerAge };
  };

  const setTravellerLastName = (name) => {
    if (needsMapping(name)) {
      getLast(getLast(getLast(data).rooms).travellers).lastname = name;
    }
    return { setTravellerPhone };
  };

  const setTravellerFirstName = (name) => {
    if (needsMapping(name)) {
      getLast(getLast(getLast(data).rooms).travellers).firstname = name;
    }
    return { setTravellerLastName };
  };

  const setTravellerEmail = (email) => {
    if (needsMapping(email)) {
      getLast(getLast(getLast(data).rooms).travellers).email = email;
    }
    return { setTravellerFirstName };
  };

  const setTravellerTitle = (title) => {
    if (needsMapping(title)) {
      getLast(getLast(getLast(data).rooms).travellers).title = title;
    }
    return { setTravellerEmail };
  };

  /**
   * @param {boolean} owner
   */
  const setTravellerOwner = (owner) => {
    if (needsMapping(owner)) {
      getLast(getLast(getLast(data).rooms).travellers).owner = owner;
    }
    return { setTravellerTitle };
  };

  const addTraveller = () => {
    getLast(getLast(data).rooms).travellers.push({});
    return { setTravellerOwner };
  };

  const setRoomType = (type) => {
    if (needsMapping(type)) {
      getLast(getLast(data).rooms).roomType = type;
    }
    return {
      // eslint-disable-next-line no-use-before-define
      addTraveller, addRoom, addPenaltyItem, addPenaltyExtraOption, setPenaltyRefundAmount,
    };
  };

  const setRoomId = (id) => {
    if (needsMapping(id)) {
      getLast(getLast(data).rooms).roomId = id;
    }
    return { setRoomType };
  };

  const addRoom = () => {
    getLast(data).rooms.push({ travellers: [] });
    return { setRoomId };
  };

  const setSupplierName = (name) => {
    if (needsMapping(name)) {
      getLast(data).supplierName = name;
    }
    return {
      addRoom, addPenaltyItem, addPenaltyExtraOption, setPenaltyRefundAmount,
    };
  };

  const setSupplierConfirmationId = (id) => {
    if (needsMapping(id)) {
      getLast(data).supplierConfirmationId = id;
    }
    return { setSupplierName };
  };

  const setHotelEmail = (email) => {
    if (needsMapping(email)) {
      getLast(data).hotelEmail = email;
    }
    return { setSupplierConfirmationId };
  };

  const setHotelAddress = (address) => {
    if (needsMapping(address)) {
      getLast(data).hotelAddress = address;
    }
    return { setHotelEmail };
  };

  /** City ID */
  const setHotelCity = (id) => {
    if (needsMapping(id)) {
      getLast(data).hotelCity = id;
    }
    return { setHotelAddress };
  };

  const setHotelFax = (fax) => {
    if (needsMapping(fax)) {
      getLast(data).hotelFax = fax;
    }
    return { setHotelCity };
  };

  const setHotelPhone = (phone) => {
    if (needsMapping(phone)) {
      getLast(data).hotelPhone = phone;
    }
    return { setHotelFax };
  };

  const setHotelName = (name) => {
    if (needsMapping(name)) {
      getLast(data).hotelName = name;
    }
    return { setHotelPhone };
  };

  const setPriceCurrency = (currency) => {
    if (needsMapping(currency)) {
      getLast(data).priceCurrency = currency;
    }
    return { setHotelName };
  };

  const setPaymentType = (type) => {
    if (needsMapping(type)) {
      getLast(data).paymentType = type;
    }
    return { setPriceCurrency };
  };

  const setPaymentTime = (time) => {
    if (needsMapping(time)) {
      getLast(data).paymentTime = time;
    }
    return { setPaymentType };
  };

  const setPaid = (paid) => {
    if (needsMapping(paid)) {
      getLast(data).paid = paid;
    }
    return { setPaymentTime };
  };

  const setPaymentDate = (date) => {
    if (needsMapping(date)) {
      getLast(data).paymentDate = date;
    }
    return { setPaid };
  };

  const setCheckOut = (date) => {
    if (needsMapping(date)) {
      getLast(data).checkOut = date;
    }
    return { setPaymentDate };
  };

  const setCheckIn = (date) => {
    if (needsMapping(date)) {
      getLast(data).checkIn = date;
    }
    return { setCheckOut };
  };

  const setBookingPreferences = (prefs) => {
    if (needsMapping(prefs)) {
      getLast(data).bookingPreferences = prefs;
    }
    return { setCheckIn };
  };

  const setReasonMessage = (message) => {
    if (needsMapping(message)) {
      getLast(data).reason.message = message;
    }
    return { setBookingPreferences };
  };

  const setReasonCode = (code) => {
    if (needsMapping(code)) {
      getLast(data).reason.code = code;
    }
    return { setReasonMessage };
  };

  const setActionJson = (json) => {
    if (needsMapping(json)) {
      getLast(data).actionJson = json;
    }
    return { setReasonCode };
  };

  /**
   * Accepted statuses and their meaning:
   *
   * |Status|Meaning                 |
   * |------|------------------------|
   * |`'OK'`|Booked/purchased        |
   * |`'RJ'`|Rejected                |
   * |`'XX'`|Canceled                |
   * |`'XP'`|Pending cancelation     |
   * |`'RF'`|Refunded                |
   * |`'RQ'`|Pending booking/purchase|
   */
  const setStatus = (status) => {
    if (needsMapping(status)) {
      getLast(data).status = status;
    }
    return { setActionJson };
  };

  const setReservationId = (id) => {
    if (needsMapping(id)) {
      getLast(data).reservationId = id;
    }
    return { setStatus };
  };

  const addReservation = () => {
    data.push({
      reason: {}, rooms: [], penalty: { itinerary: { item: {}, extraOptions: {} } }, price: { itinerary: { extraOptions: {} } },
    });
    return { setReservationId };
  };

  return { addReservation };
};

module.exports = mapper;
