const skipSymbol = Symbol('skipped');
const isNil = require('lodash/isNil');

const needsMapping = (data, options = { nullable: true }) => {
  // chain mekanizmasina hic undefined yollatmayalim.
  if (isNil(data) && isNil(options)) {
    throw new Error('Developer error: cannot set data & options to undefined. Use skip instead');
  }

  // skip edilmisse processe devam ederiz ama datayi maplemeyiz
  if (data === skipSymbol) {
    return false;
  }


  // eger data nil degil ise if e girme
  // eger data nil ise, opt varsa ve opt.nullable true ise kurtarsin yani !den dolayi false olup if in disina dussun
  // eger data nil ise, opt yoksa veya opt.nullable false ise hata versin
  if ((isNil(data) && !(options && options.nullable))) {
    throw new Error('Developer error: if "data" can be undefined, then options.nullable must be set to true')
  }

  // normal akis, process devam eder, data setlenir
  return true;
};

const skip = (skipMessage) => {
  if (!skipMessage) {
    throw new Error('Developer error: no skip message is provided');
  }
  return skipSymbol;
}

const arrayify = array => Array.isArray(array) ? array : [array];

module.exports = {
  needsMapping,
  hotelOperations: {
    search: 1,
    getOffersByHotel: 2,
    getOfferDetails: 3,
    purchase: 4,
    getReservation: 5,
    getReservations: 6,
    cancel: 7,
    getHotels: 8,
  },
  skip,
  arrayify
};
