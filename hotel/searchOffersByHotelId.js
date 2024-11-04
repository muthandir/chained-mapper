const moment = require('moment');
const isFunction = require('lodash/isFunction');
const searchOffersByHotelId = require('./helper/searchOffersByHotelIdMapper');
const { needsMapping } = require('../utility');

module.exports = (...params) => {
  if (params.length > 0) {
    return searchOffersByHotelId(...params);
  }

  const result = { offers: [] };
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

    const [offer] = result.offers.slice(-1);
    finalizeFunction(offer);
    offer.policyJson = offer.policyResult || {};
    offer.currency = offer.price.itinerary.currency;
    //hotel.isInPolicy = hotel.offers.every(o => o.policyJson.success)// TODO: ogm-crbt hotel.isInPolicy ne demek?
    //hotel.isMin = hotel.offers.some(o => o.isMin);
    isMappingFinalized = true;
  }

  const setOrderJson = (orderJson) => {
    if (needsMapping(orderJson)) {
      const [offer] = result.offers.slice(-1);
      offer.orderJson = orderJson;
    }
    return { runFinalizeFunction };
  };

  const setComissionTax = (comissionTax) => {
    if (needsMapping(comissionTax)) {
      const [offer] = result.offers.slice(-1);
      offer.originalPrice.financialValues.purchase.comissionTax = comissionTax;
    }
    // eslint-disable-next-line no-use-before-define
    return { setOrderJson };
  };
  const setComission = (comission) => {
    if (needsMapping(comission)) {
      const [offer] = result.offers.slice(-1);
      offer.originalPrice.financialValues.purchase.comission = comission;
    }
    return { setComissionTax };
  };

  const setIsNonRefundable = (isNonRefundable) => {
    if (needsMapping(isNonRefundable)) {
      const [offer] = result.offers.slice(-1);
      offer.isNonRefundable = isNonRefundable;
    }
    return { setComission };
  };
  const setExtraOptions = (key, amount, isBillable, isTax, type) => {
    if (needsMapping(key)) {
      const [offer] = result.offers.slice(-1);
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
      const [offer] = result.offers.slice(-1);
      offer.price.itinerary.taxFare = taxFare;
      offer.originalPrice.financialValues.purchase.originalCostTax.total = taxFare;
    }
    return { setExtraOptions };
  };

  const setTotalFare = (totalFare) => {
    if (needsMapping(totalFare)) {
      const [offer] = result.offers.slice(-1);
      offer.price.itinerary.totalFare = totalFare;
      offer.originalPrice.financialValues.purchase.originalCost.total = totalFare;
    }
    return { setTaxFare };
  };
  const setBaseFare = (baseFare) => {
    if (needsMapping(baseFare)) {
      const [offer] = result.offers.slice(-1);
      offer.price.itinerary.baseFare = baseFare;
    }
    return { setTotalFare };
  };

  /**
   * search resultta display eden currencydir
   */
  const setCurrency = (currency) => {
    if (needsMapping(currency)) {
      const [offer] = result.offers.slice(-1);
      offer.price = { itinerary: { currency } };
      offer.originalPrice = { financialValues: { purchase: { originalCost: { currency: currency } } } };
      offer.originalPrice.financialValues.purchase.originalCostTax = { currency: currency };
    }
    return { setBaseFare };
  };
  const setPaymentAtHotel = (paymentAtHotel) => {
    if (needsMapping(paymentAtHotel)) {
      const [offer] = result.offers.slice(-1);
      offer.paymentAtHotel = paymentAtHotel;
    }
    return { setCurrency };
  };
  const setIsNegotiated = (isNegotiated) => {
    if (needsMapping(isNegotiated)) {
      const [offer] = result.offers.slice(-1);
      offer.isNegotiated = isNegotiated;
    }
    return { setPaymentAtHotel };
  };
  const setIsOnline = (isOnline) => {
    if (needsMapping(isOnline)) {
      const [offer] = result.offers.slice(-1);
      offer.isOnline = isOnline;
    }
    return { setIsNegotiated };
  };

  const setPriceTaxVatIncluded = (priceTaxVatIncluded) => {
    if (needsMapping(priceTaxVatIncluded)) {
      const [offer] = result.offers.slice(-1);
      offer.priceTaxVatIncluded = priceTaxVatIncluded;
    }
    return { setIsOnline };
  };
  const setStars = (stars) => {
    if (needsMapping(stars)) {
      const [offer] = result.offers.slice(-1);
      offer.stars = stars;
    }
    return { setPriceTaxVatIncluded };
  };
  const setIsOpaqueRates = (isOpaqueRates) => {
    if (needsMapping(isOpaqueRates)) {
      const [offer] = result.offers.slice(-1);
      offer.isOpaqueRates = isOpaqueRates;
    }
    return { setStars };
  };
  const setAllotment = (allotment) => {
    if (needsMapping(allotment)) {
      const [offer] = result.offers.slice(-1);
      offer.allotment = allotment;
    }
    return { setIsOpaqueRates };
  };
  const setRateType = (type) => {
    if (needsMapping(type)) {
      const [offer] = result.offers.slice(-1);
      offer.rateType = type;
    }
    return { setAllotment };
  };
  const setPriceSpeacialOffer = (priceSpeacialOffer) => {
    if (needsMapping(priceSpeacialOffer)) {
      const [offer] = result.offers.slice(-1);
      offer.priceSpeacialOffer = priceSpeacialOffer;
    }
    return { setRateType };
  };
  const setBoardBasisCancellationPolicy = (boardBasisCancellationPolicy) => {
    if (needsMapping(boardBasisCancellationPolicy)) {
      const [offer] = result.offers.slice(-1);
      offer.boardBasisCancellationPolicy = boardBasisCancellationPolicy;
    }
    return { setPriceSpeacialOffer };
  };
  const setBoardBasisValue = (boardBasisValue) => {
    if (needsMapping(boardBasisValue)) {
      const [offer] = result.offers.slice(-1);
      offer.boardBasisValue = boardBasisValue;
    }
    return { setBoardBasisCancellationPolicy };
  };
  const setBoardBasisName = (boardBasisName) => {
    if (needsMapping(boardBasisName)) {
      const [offer] = result.offers.slice(-1);
      offer.boardBasisName = boardBasisName;
    }
    return { setBoardBasisValue };
  };
  const setBoardBasisCode = (boardBasisCode) => {
    if (needsMapping(boardBasisCode)) {
      const [offer] = result.offers.slice(-1);
      offer.boardBasisCode = boardBasisCode;
    }
    return { setBoardBasisName };
  };
  const setRoomTypeDescription = (roomTypeDescription) => {
    if (needsMapping(roomTypeDescription)) {
      const [offer] = result.offers.slice(-1);
      offer.roomTypeDescription = roomTypeDescription;
    }
    return { setBoardBasisCode };
  };
  const setRoomType = (roomType) => {
    if (needsMapping(roomType)) {
      const [offer] = result.offers.slice(-1);
      offer.roomType = roomType;
    }
    return { setRoomTypeDescription };
  };

  const setRoomName = (roomName) => {
    if (needsMapping(roomName)) {
      const [offer] = result.offers.slice(-1);
      offer.roomName = roomName;
    }
    return { setRoomType };
  };

  const setNeedNationality = (needNationality) => {
    if (needsMapping(needNationality)) {
      const [offer] = result.offers.slice(-1);
      offer.needNationality = needNationality;
    }
    return { setRoomName };
  };
  const setRoomId = (roomId) => {
    if (needsMapping(roomId)) {
      const [offer] = result.offers.slice(-1);
      offer.roomId = roomId;
    }
    return { setNeedNationality };
  };
  const setIsSpecialOffer = (isSpecialOffer) => {
    if (needsMapping(isSpecialOffer)) {
      const [offer] = result.offers.slice(-1);
      offer.isSpecialOffer = isSpecialOffer;
    }
    return { setRoomId };
  };
  // const addOffer = () => {
  //   const [offer] =result.offers.slice(-1);

  //   if (!hotel.offers) {
  //     hotel.offers = [];
  //   }
  //   hotel.offers.push({});
  //   return { setIsSpecialOffer };
  // };

  const setSearchCombinationId = (searchCombinationId) => {
    if (needsMapping(searchCombinationId)) {
      const [offer] = result.offers.slice(-1);
      offer.searchCombinationId = searchCombinationId;
    }
    return { setIsSpecialOffer };
  };

  const setSearchId = (searchId) => {
    if (needsMapping(searchId)) {
      const [offer] = result.offers.slice(-1);
      offer.searchId = searchId;
    }
    return { setSearchCombinationId };
  };
  const setProviderHotelId = (providerHotelId) => {
    if (needsMapping(providerHotelId)) {
      const [offer] = result.offers.slice(-1);
      offer.providerHotelId = providerHotelId;
      //result.data.providerHotelIds = result.data.providerHotelIds || [];
      //result.data.providerHotelIds.push(providerHotelId);
    }
    return { setSearchId };
  };
  const setProvider = (provider) => {
    if (needsMapping(provider)) {
      const [offer] = result.offers.slice(-1);
      offer.provider = provider;
    }
    return { setProviderHotelId };
  };

  /**
 * eklendigi anda hotel search combinationa save edilebilmesi icin session id ve user id fieldlarini setliyor.
 *
 */
  const addOffer = () => {
    result.offers.push({
      userId: result.session.userId,
      sessionId: result.session.sessionId
    });
    isMappingFinalized = false; // yeni bir satir icin yeni islem basliyor. finalize a kadar gidilmesi lazim
    return { setProvider };
  };

  const setMinutesForExpectedSignoutTime = (minutes) => {
    if (needsMapping(minutes)) {
      result.session.expectedSignoutTime = moment().utc().add(minutes, 'minutes').format('YYYY-MM-DD HH:mm:00');
    }
    return { addOffer, get };
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
