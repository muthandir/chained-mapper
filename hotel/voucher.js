const { needsMapping } = require('../utility');

const mapper = () => {
  const data = {
    hotelInfo: {}, guestNames: [], policies: [], room: [], additionalInfo: [],
  };

  const getLast = (array) => array[array.length - 1];

  /**
   * @returns {{
   *   checkIn: string;
   *   checkOut: string;
   *   confirmationId: string;
   *   paymentAtHotel: boolean;
   *   reservationTime: string;
   *   supplierName: string;
   *   owner: string;
   *   hotelInfo: {
   *     address: string;
   *     category: string;
   *     email: string;
   *     fax: string;
   *     name: string;
   *     phone: string;
   *   };
   *   additionalInfo: string[];
   *   guestNames: string[];
   *   policies: object[];
   *   room: object[];
   * }}
   */
  const get = () => data;

  /** @param {string | symbol | null} info */
  const addAdditionalInfo = (info) => {
    if (needsMapping(info)) {
      data.additionalInfo.push(info);
    }
    return { addAdditionalInfo, get };
  }

  /** @param {string | symbol | null} type Room type code and description, e.g., `'SGL Tek kisilik oda'` */
  const setRoomType = (type) => {
    if (needsMapping(type)) {
      getLast(data.room).type = type;
    }
    // eslint-disable-next-line no-use-before-define
    return { addRoom, addAdditionalInfo, get };
  };

  /** @param {number | symbol | null} quantity */
  const setRoomQuantity = (quantity) => {
    if (needsMapping(quantity)) {
      getLast(data.room).quantity = quantity;
    }
    return { setRoomType };
  };

  /** @param {string | symbol | null} basis Board type code and description, e.g., `'BB Bed & Breakfast'` */
  const setRoomBoardBasis = (basis) => {
    if (needsMapping(basis)) {
      getLast(data.room).boardBasis = basis;
    }
    return { setRoomQuantity };
  };

  const addRoom = () => {
    data.room.push({});
    return { setRoomBoardBasis };
  };

  /** @param {number | symbol | null} amount */
  const setPolicyAmount = (amount) => {
    if (needsMapping(amount)) {
      getLast(data.policies).amount = amount;
    }
    // eslint-disable-next-line no-use-before-define
    return { addPolicy, addRoom, addAdditionalInfo, get };
  };

  /** @param {string | symbol | null} time ISO string */
  const setPolicyTime = (time) => {
    if (needsMapping(time)) {
      getLast(data.policies).time = time;
    }
    return { setPolicyAmount };
  };

  const addPolicy = () => {
    data.policies.push({});
    return { setPolicyTime };
  };

  /** @param {string | symbol | null} name */
  const addGuest = (name) => {
    if (needsMapping(name)) {
      data.guestNames.push(name);
    }
    return { addGuest, addPolicy, addRoom, addAdditionalInfo, get };
  };

  /** @param {string | symbol | null} num */
  const setHotelFax = (num) => {
    if (needsMapping(num)) {
      data.hotelInfo.fax = num;
    }
    return { addGuest, addPolicy, addRoom, addAdditionalInfo, get };
  };

  /** @param {string | symbol | null} num */
  const setHotelPhone = (num) => {
    if (needsMapping(num)) {
      data.hotelInfo.phone = num;
    }
    return { setHotelFax };
  };

  /** @param {string | symbol | null} email */
  const setHotelEmail = (email) => {
    if (needsMapping(email)) {
      data.hotelInfo.email = email;
    }
    return { setHotelPhone };
  };

  /** @param {string | symbol | null} category e.g., `'Hotel'` */
  const setHotelCategory = (category) => {
    if (needsMapping(category)) {
      data.hotelInfo.category = category;
    }
    return { setHotelEmail };
  };

  /** @param {string | symbol | null} address */
  const setHotelAddress = (address) => {
    if (needsMapping(address)) {
      data.hotelInfo.address = address;
    }
    return { setHotelCategory };
  };

  /** @param {string | symbol | null} name */
  const setHotelName = (name) => {
    if (needsMapping(name)) {
      data.hotelInfo.name = name;
    }
    return { setHotelAddress };
  };

  /** @param {string | symbol | null} name */
  const setOwner = (name) => {
    if (needsMapping(name)) {
      data.owner = name;
    }
    return { setHotelName };
  };

  /** @param {string | symbol | null} name */
  const setSupplierName = (name) => {
    if (needsMapping(name)) {
      data.supplierName = name;
    }
    return { setOwner };
  };

  /** @param {string | symbol | null} time YYYY-MM-DD HH:mm */
  const setReservationTime = (time) => {
    if (needsMapping(time)) {
      data.reservationTime = time;
    }
    return { setSupplierName };
  };

  /** @param {boolean | symbol | null} bool */
  const setPaymentAtHotel = (bool) => {
    if (needsMapping(bool)) {
      data.paymentAtHotel = bool;
    }
    return { setReservationTime };
  };

  /** @param {string | symbol | null} id */
  const setConfirmationId = (id) => {
    if (needsMapping(id)) {
      data.confirmationId = id;
    }
    return { setPaymentAtHotel };
  };

  /** @param {string | symbol | null} date YYYY-MM-DD */
  const setCheckOut = (date) => {
    if (needsMapping(date)) {
      data.checkOut = date;
    }
    return { setConfirmationId };
  };

  /** @param {string | symbol | null} date YYYY-MM-DD */
  const setCheckIn = (date) => {
    if (needsMapping(date)) {
      data.checkIn = date;
    }
    return { setCheckOut };
  };

  return { setCheckIn };
};

module.exports = mapper;
