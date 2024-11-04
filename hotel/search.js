const moment = require('moment');
const { needsMapping } = require('../utility');
const isFunction = require('lodash/isFunction');

module.exports = () => {
  const result = { data: { hotels: [], providerHotelIds: [] } };
  let isMappingFinalized = true;

  const get = () => {
    if (!isMappingFinalized) {
      throw new Error('Developer error: mapping is not finalized yet. Please call runFinalizeFunction');
    }
    // Some offers may have been dropped due to failure of the finalize function. Consequently, some hotels may have had all their
    // offers removed. In that case, we need to remove the hotel itself.
    result.data.hotels = result.data.hotels.filter((hotel) => hotel.offers && hotel.offers.length);
    return result;
  }

  const runFinalizeFunction = (finalizeFunction) => {
    if (!isFunction(finalizeFunction)) {
      throw new Error('Developer error: finalizeFunction is not a function');
    }

    const [hotel] = result.data.hotels.slice(-1);
    const [offer] = hotel.offers.slice(-1);
    try {
      finalizeFunction(offer);
      offer.policyJson = offer.policyResult || {};
      offer.currency = offer.price.itinerary.currency;
    } catch (err) {
      // If finalize function throws an error, remove the offer from the results.
      hotel.offers.splice(-1);
    }
    hotel.isInPolicy = hotel.offers.every(o => o.policyJson.success)// TODO: ogm-crbt hotel.isInPolicy ne demek?
    hotel.isMin = hotel.offers.some(o => o.isMin);
    isMappingFinalized = true;
  }

  const setProviderCurrencyConversions = (conversions) => {
    if (needsMapping(conversions)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.providerCurrencyConversions = conversions;
    }
    return { runFinalizeFunction };
  };

  const setOrderJson = (orderJson) => {
    if (needsMapping(orderJson)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.orderJson = orderJson;
    }
    return { setProviderCurrencyConversions };
  };

  const setComissionTax = (comissionTax) => {
    if (needsMapping(comissionTax)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.originalPrice.financialValues.purchase.comissionTax = comissionTax;
    }
    // eslint-disable-next-line no-use-before-define
    return { setOrderJson };
  };
  const setComission = (comission) => {
    if (needsMapping(comission)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.originalPrice.financialValues.purchase.comission = comission;
    }
    return { setComissionTax };
  };

  const setIsNonRefundable = (isNonRefundable) => {
    if (needsMapping(isNonRefundable)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.isNonRefundable = isNonRefundable;
    }
    return { setComission };
  };
  const setExtraOptions = (key, amount, isBillable, isTax, type) => {
    if (needsMapping(key)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.price.itinerary.extraOptions = offer.price.itinerary.extraOptions || {};
      if (offer.price.itinerary[key]) {
        throw new Error('Developer error: key already set to price.')
      }
      // price i setle
      offer.price.itinerary[key] = amount;
      // extra options i setle
      offer.price.itinerary.extraOptions[key] = { isBillable, isTax, type };
      return { setIsNonRefundable, setExtraOptions };
    }
    return { setIsNonRefundable };
  };
  const setTaxFare = (taxFare) => {
    if (needsMapping(taxFare)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.price.itinerary.taxFare = taxFare;
      offer.originalPrice.financialValues.purchase.originalCostTax.total = taxFare;
    }
    return { setExtraOptions };
  };

  const setTotalFare = (totalFare) => {
    if (needsMapping(totalFare)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.price.itinerary.totalFare = totalFare;
      offer.originalPrice.financialValues.purchase.originalCost.total = totalFare;
    }
    return { setTaxFare };
  };
  const setBaseFare = (baseFare) => {
    if (needsMapping(baseFare)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.price.itinerary.baseFare = baseFare;
    }
    return { setTotalFare };
  };

  /**
   * search resultta display eden currencydir
   */
  const setCurrency = (currency) => {
    if (needsMapping(currency)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.price = { itinerary: { currency } };
      offer.originalPrice = { financialValues: { purchase: { originalCost: { currency: currency } } } };
      offer.originalPrice.financialValues.purchase.originalCostTax = { currency: currency };
    }
    return { setBaseFare };
  };
  const setPaymentAtHotel = (paymentAtHotel) => {
    if (needsMapping(paymentAtHotel)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.paymentAtHotel = paymentAtHotel;
    }
    return { setCurrency };
  };
  const setIsNegotiated = (isNegotiated) => {
    if (needsMapping(isNegotiated)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.isNegotiated = isNegotiated;
    }
    return { setPaymentAtHotel };
  };
  const setIsOnline = (isOnline) => {
    if (needsMapping(isOnline)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.isOnline = isOnline;
    }
    return { setIsNegotiated };
  };

  const setPriceTaxVatIncluded = (priceTaxVatIncluded) => {
    if (needsMapping(priceTaxVatIncluded)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.priceTaxVatIncluded = priceTaxVatIncluded;
    }
    return { setIsOnline };
  };
  const setStars = (stars) => {
    if (needsMapping(stars)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.stars = stars;
    }
    return { setPriceTaxVatIncluded };
  };
  const setIsOpaqueRates = (isOpaqueRates) => {
    if (needsMapping(isOpaqueRates)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.isOpaqueRates = isOpaqueRates;
    }
    return { setStars };
  };
  const setAllotment = (allotment) => {
    if (needsMapping(allotment)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.allotment = allotment;
    }
    return { setIsOpaqueRates };
  };
  const setRateType = (type) => {
    if (needsMapping(type)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.rateType = type;
    }
    return { setAllotment };
  };
  const setPriceSpeacialOffer = (priceSpeacialOffer) => {
    if (needsMapping(priceSpeacialOffer)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.priceSpeacialOffer = priceSpeacialOffer;
    }
    return { setRateType };
  };
  const setBoardBasisCancellationPolicy = (boardBasisCancellationPolicy) => {
    if (needsMapping(boardBasisCancellationPolicy)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.boardBasisCancellationPolicy = boardBasisCancellationPolicy;
    }
    return { setPriceSpeacialOffer };
  };
  const setBoardBasisValue = (boardBasisValue) => {
    if (needsMapping(boardBasisValue)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.boardBasisValue = boardBasisValue;
    }
    return { setBoardBasisCancellationPolicy };
  };
  const setBoardBasisName = (boardBasisName) => {
    if (needsMapping(boardBasisName)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.boardBasisName = boardBasisName;
    }
    return { setBoardBasisValue };
  };
  const setBoardBasisCode = (boardBasisCode) => {
    if (needsMapping(boardBasisCode)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.boardBasisCode = boardBasisCode;
    }
    return { setBoardBasisName };
  };
  const setRoomTypeDescription = (roomTypeDescription) => {
    if (needsMapping(roomTypeDescription)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.roomTypeDescription = roomTypeDescription;
    }
    return { setBoardBasisCode };
  };
  const setRoomType = (roomType) => {
    if (needsMapping(roomType)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.roomType = roomType;
    }
    return { setRoomTypeDescription };
  };

  const setRoomName = (roomName) => {
    if (needsMapping(roomName)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.roomName = roomName;
    }
    return { setRoomType };
  };

  const setNeedNationality = (needNationality) => {
    if (needsMapping(needNationality)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.needNationality = needNationality;
    }
    return { setRoomName };
  };
  const setRoomId = (roomId) => {
    if (needsMapping(roomId)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.roomId = roomId;
    }
    return { setNeedNationality };
  };
  const setIsSpecialOffer = (isSpecialOffer) => {
    if (needsMapping(isSpecialOffer)) {
      const [hotel] = result.data.hotels.slice(-1);
      const [offer] = hotel.offers.slice(-1);
      offer.isSpecialOffer = isSpecialOffer;
    }
    return { setRoomId };
  };
  const addOffer = () => {
    const [hotel] = result.data.hotels.slice(-1);

    if (!hotel.offers) {
      hotel.offers = [];
    }
    hotel.offers.push({
      // Add hotel provider to each offer. The finalize function (above) gets the `offer` object only as a parameter and it needs
      // to know about the provider. So this ensures the `offer` object contains `provider`.
      provider: hotel.provider
    });
    return { setIsSpecialOffer };
  };

  const setSearchId = (searchId) => {
    if (needsMapping(searchId)) {
      const [hotel] = result.data.hotels.slice(-1);
      hotel.searchId = searchId;
    }
    return { addOffer };
  };
  const setProviderHotelId = (providerHotelId) => {
    if (needsMapping(providerHotelId)) {
      const [hotel] = result.data.hotels.slice(-1);
      hotel.providerHotelId = providerHotelId;
      result.data.providerHotelIds.push(providerHotelId);
    }
    return { setSearchId };
  };
  const setProvider = (provider) => {
    if (needsMapping(provider)) {
      const [hotel] = result.data.hotels.slice(-1);
      hotel.provider = provider;
    }
    return { setProviderHotelId };
  };
  const setName = (name) => {
    if (needsMapping(name)) {
      const [hotel] = result.data.hotels.slice(-1);
      hotel.name = name;
    }
    return { setProvider };
  };

  /**
 * eklendigi anda hotel search combinationa save edilebilmesi icin session id ve user id fieldlarini setliyor.
 *
 */
  const addHotel = () => {
    result.data.hotels.push({
      userId: result.session.userId,
      sessionId: result.session.sessionId
    });
    isMappingFinalized = false; // yeni bir satir icin yeni islem basliyor. finalize a kadar gidilmesi lazim
    return { setName };
  };

  const setMinutesForExpectedSignoutTime = (minutes) => {
    if (needsMapping(minutes)) {
      result.session.expectedSignoutTime = moment().utc().add(minutes, 'minutes').format('YYYY-MM-DD HH:mm:00');
    }
    return { addHotel, get };
  };

  const setLastOperationName = (operationName) => {
    if (needsMapping(operationName)) {
      result.session.lastOperation = operationName;
    }
    return { setMinutesForExpectedSignoutTime };
  };

  /**
   * creates the session
   *
   * @param {Boolean} isFinished sets if finished
   * @returns setLastOperationName
   *
   */
  const setProviderSessionId = (providerSessionId) => {
    if (needsMapping(providerSessionId)) {
      result.session.providerSessionId = providerSessionId;
    }
    return { setLastOperationName };
  };

  /**
 * completes the function
 *
 * @param {Boolean} isFinished sets if finished
 * @returns setProviderSessionId
 *
 */
  const setFinished = (isFinished) => {
    if (needsMapping(isFinished)) {
      result.data.finished = isFinished;
      if (isFinished) {
        result.session.lastOperationStatus = 'completed';
      } else {
        result.session.lastOperationStatus = 'idle';
      }
    }
    return { setProviderSessionId };
  };

  const setProviderSessionJson = (providerJson) => {
    if (needsMapping(providerJson)) {
      result.session.providerJson = providerJson;
    }
    return { setFinished };
  };

  const setSession = (session) => {
    if (needsMapping(session)) {
      result.session = session || {};
    }
    return { setProviderSessionJson };
  };

  return { setSession };
};
