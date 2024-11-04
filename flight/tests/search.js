const moment = require('moment');
const { isEmpty, minBy, get } = require('lodash');
const results = require('./oneway.json');

const flightSearch = require('../search');
const { skip, arrayify } = require('../../utility');

const getDirection = (routeIndex) => routeIndex === 0 ? 'departure' : 'return';

const durationCalculator = (flights) => {
  const duration = moment.duration(moment(flights.slice(-1)[0].arrivalDateTime).diff(moment(flights[0].departureDateTime)));
  const result = {
    duration: moment().startOf('day').add(duration.asMinutes(), 'minutes').format('HHmm'),
    min: duration.asMinutes()
  };
  return result;
}

const totalDurationCalculator = (depTime, returnTime = null) => {
  const totalDuration = {};
  let elapsedTime;
  const depTimeHour = Number(depTime.substr(0, 2));
  const depTimeMins = Number(depTime.substr(2, 2));


  if (returnTime) {
    const returnTimeHour = Number(returnTime.substr(0, 2));
    const returnTimeMins = Number(returnTime.substr(2, 2));

    const depTotalMinutes = (depTimeHour * 60) + depTimeMins;
    const returnTotalMinutes = (returnTimeHour * 60) + returnTimeMins;

    elapsedTime = depTotalMinutes + returnTotalMinutes;
    totalDuration.returnTotalMinutes = returnTotalMinutes;
    totalDuration.depTotalMinutes = depTotalMinutes;
    totalDuration.elapsedTimeInMinutes = depTotalMinutes + returnTotalMinutes;
  } else {
    const depTotalMinutes = (depTimeHour * 60) + depTimeMins;
    elapsedTime = depTotalMinutes;
    totalDuration.depTotalMinutes = depTotalMinutes;
    totalDuration.elapsedTimeInMinutes = depTotalMinutes;
  }

  let elapsedHour = parseInt(elapsedTime / 60, 10);
  let elapsedMinutes = elapsedTime % 60;
  if (elapsedMinutes < 10) {
    elapsedMinutes = `0${elapsedMinutes}`;
  }
  if (elapsedHour < 10) {
    elapsedHour = `0${elapsedHour}`;
  }
  totalDuration.elapsedHour = elapsedHour;
  totalDuration.elapsedTime = `${elapsedHour}:${elapsedMinutes}`;
  return totalDuration;
};

const mapRefund = (rules) => {
  if (rules.every(item => item.IsRefundable === false)) {
    return {
      type: 'NOT_PERMITTED',
      timeToDeparture: {}
    }
  }

  const refundableRules = rules.filter((item) => {
    return item.IsRefundable;
  });

  const pricedRules = refundableRules.filter((item) => {
    return item.PercentageOrFixedAmount && item.PercentageOrFixedAmount.FixedAmount.Amount > 0;
  });

  if (pricedRules.length) {
    const data = pricedRules.find(item => item.TimeToDeparture.TimePeriodCondition === 'MORE') || pricedRules.find(item => item.TimeToDeparture.TimePeriodCondition === 'LESS');
    return {
      type: 'PENALTY_CHARGE',
      timeToDeparture: {
        timePeriodCondition: data.TimeToDeparture.TimePeriodCondition,
        timeUnit: data.TimeToDeparture.TimeUnit,
        timeAmount: data.TimeToDeparture.TimeAmount
      }
    }
  }
  const data = refundableRules.find(item => item.TimeToDeparture.TimePeriodCondition === 'MORE') || refundableRules.find(item => item.TimeToDeparture.TimePeriodCondition === 'LESS');
  return {
    type: 'FREE_CHARGE',
    timeToDeparture: {
      timePeriodCondition: data.TimeToDeparture.TimePeriodCondition,
      timeUnit: data.TimeToDeparture.TimeUnit,
      timeAmount: data.TimeToDeparture.TimeAmount
    }
  };
};

const mapReissue = (rules) => {
  if (rules.every(item => item.IsChangeable === false)) {
    return {
      type: 'NOT_PERMITTED',
      timeToDeparture: {}
    }
  }

  const changeableRules = rules.filter((item) => {
    return item.IsChangeable;
  });

  const pricedRules = changeableRules.filter((item) => {
    return item.PercentageOrFixedAmount && item.PercentageOrFixedAmount.FixedAmount.Amount > 0;
  });

  if (pricedRules.length) {
    const data = pricedRules.find(item => item.TimeToDeparture.TimePeriodCondition === 'MORE') || pricedRules.find(item => item.TimeToDeparture.TimePeriodCondition === 'LESS');
    return {
      type: 'PENALTY_CHARGE',
      timeToDeparture: {
        timePeriodCondition: data.TimeToDeparture.TimePeriodCondition,
        timeUnit: data.TimeToDeparture.TimeUnit,
        timeAmount: data.TimeToDeparture.TimeAmount
      }
    }
  }
  const data = changeableRules.find(item => item.TimeToDeparture.TimePeriodCondition === 'MORE') || changeableRules.find(item => item.TimeToDeparture.TimePeriodCondition === 'LESS');
  return {
    type: 'FREE_CHARGE',
    timeToDeparture: {
      timePeriodCondition: data.TimeToDeparture.TimePeriodCondition,
      timeUnit: data.TimeToDeparture.TimeUnit,
      timeAmount: data.TimeToDeparture.TimeAmount
    }
  };
};

const sumPrice = (prices = []) => {
  let total = 0;
  prices.forEach((item) => {
    total += item;
  });
  return total;
};

const mapBrand = (cardContainer, flightBrands, miniRulesList, brandExtraOptions, index) => {
  flightBrands.forEach((brand) => {
    const brandRule = arrayify(miniRulesList).find((item) => item.BrandCode === arrayify(brand.FareInfo.FareInfo)[0].FareType);
    const refundable = mapRefund(arrayify(brandRule.PenaltyMiniRule.CancellationPenaltyList.CancellationPenalty));
    const reissue = mapReissue(arrayify(brandRule.PenaltyMiniRule.ChangePenaltyList.ChangePenalty));
    const brandOption = brandExtraOptions.find(brandExtraOptionItem => brandExtraOptionItem.BrandKey === brandRule.BrandKey);
    cardContainer.addBrand(true)
      .setBrandCurrency(brand.PassengerFare.TotalFare.CurrencyCode)
      .setBrandCode(arrayify(brand.FareInfo.FareInfo)[0].FareType)
      .addBrandPrice(true)
      .setBrandTotalFare(brand.PassengerFare.TotalFare.Amount)
      .setBrandBaseFare(brand.PassengerFare.BaseFare.Amount)
      .setBrandTaxFare(sumPrice(arrayify(brand.PassengerFare.Taxes.Tax).filter(taxItem => taxItem.TaxCode != 'KD').map(taxItem => taxItem.Amount)))
      .setBrandPriceBreakdownOptions(brand.PassengerTypeQuantity.Quantity, brand.PassengerTypeQuantity.Code)
      .addBrandRule(true)
      .setBrandRuleCabinBaggage(brandRule.CarryOnBaggageAllowance.FreeBaggageAllowance.kilos, brandRule.CarryOnBaggageAllowance.FreeBaggageAllowance.pieces)
      .setBrandRuleBaggage(brandRule.CheckedBaggageAllowance.FreeBaggageAllowance.kilos, brandRule.CheckedBaggageAllowance.FreeBaggageAllowance.pieces)
      .setBrandRuleRefund(refundable)
      .setBrandRuleReissue(reissue)
      .setBrandRuleSeatSelection(brandOption.SeatSelection)
      .setBrandRuleBonusMile(brandOption.BonusMileAmount)
      .setBrandType(index)
      .cloneBrand(true);
  })
}

const mapSegment = (cardContainer, flightContainer, index, minBrand) => {
  const { FlightSegment } = flightContainer.flight;
  arrayify(FlightSegment).forEach((segmentElement, directionIndex) => {
    const duration = moment.duration(moment(segmentElement.ArrivalDateTime).diff(moment(segmentElement.DepartureDateTime)));
    const flightDuration = moment().startOf('day').add(duration.asMinutes(), 'minutes').format('HHmm');
    const flightDurationHour = Number(moment().startOf('day').add(duration.asHours(), 'hours').format('HH'));

    const extraSegmentInfos = arrayify(flightContainer.extra.extraOTASegmentInfoListType.extraOTASegmentInfoList);
    const extraSegmentInfo = extraSegmentInfos.find((extraSegmentInfoItem) => extraSegmentInfoItem.segmentIndex === (directionIndex + 1).toString()) || {};
    const cabinClassInfo = arrayify(segmentElement.BookingClassAvail).find((cabinClassInfoItem) => arrayify(minBrand.FareInfo.FareReference).map((fareItem) => fareItem.ResBookDesigCode).includes(cabinClassInfoItem.ResBookDesigCode));
    const baggage = arrayify(minBrand.PassengerFare.FareBaggageAllowance).find((baggageItem) => Number(baggageItem.FlightSegmentRPH) === directionIndex + 1);

    cardContainer.addSegment(index)
      .setSegmentFlightNumber(segmentElement.FlightNumber.substr(2), index)
      .setSegmentFrom(segmentElement.DepartureAirport.LocationCode, index)
      .setSegmentTo(segmentElement.ArrivalAirport.LocationCode, index)
      .setSegmentDepartureDateTime(moment(segmentElement.DepartureDateTime).parseZone().format('YYYY-MM-DDTHH:mm:ss'), index)
      .setSegmentArrivalDateTime(moment(segmentElement.ArrivalDateTime).parseZone().format('YYYY-MM-DDTHH:mm:ss'), index)
      .setSegmentTotalDuration(0, index)
      .setSegmentFlightDuration(flightDuration, index)
      .setSegmentFlightDurationHour(flightDurationHour, index)
      .setSegmentOperatingAirline(segmentElement.OperatingAirline.CompanyShortName, index)
      .setSegmentMarketingAirline(segmentElement.OperatingAirline.CompanyShortName, index)
      .setSegmentAlliance('Star Alliance', index)
      .setSegmentEquipment(segmentElement.Equipment.AirEquipType, index)
      .addSegmentBaggage(index)
      .setSegmentBaggage('ADT', baggage.UnitOfMeasure === 'KILO' ? 'KG' : 'PC', baggage.FlightSegmentRPH, baggage.UnitOfMeasureQuantity, index)
      .addSegmentOrderJson(index)
      .setSegmentOrderJson(extraSegmentInfo.isConnected, cabinClassInfo.ResBookDesigCode, index)
      .addSegmentCabinClass(index)
      .setSegmentCabinClass(cabinClassInfo.ResBookDesigCode, cabinClassInfo.ResBookDesigQuantity, cabinClassInfo.ResBookDesigCode, cabinClassInfo.RPH, index)
      .calculateSegmentLayoverTime(true, index);
  });
};

const mapCard = (cardContainer, brandOptions, departureContainer, returnContainer = {}) => {
  let isRefundable = false;
  /* Departure Flight Parameters */
  const flightBrands = arrayify(departureContainer.extra.bookingPriceInfoType.PTC_FareBreakdowns.PTC_FareBreakdown);

  const minBrand = minBy(flightBrands, (item) => {
    return Number(item.PassengerFare.TotalFare.Amount);//TODO servis te düzelt return new BigNumber(item.PassengerFare.TotalFare.Amount).toNumber();
  });

  const prices = {
    totalFare: [
      minBrand.PassengerFare.TotalFare.Amount
    ],
    taxFare: [
      sumPrice(arrayify(minBrand.PassengerFare.Taxes.Tax).filter(taxItem => taxItem.TaxCode != 'KD').map(taxItem => taxItem.Amount))
    ],
    baseFare: [
      minBrand.PassengerFare.TotalFare.Amount
    ]
  };

  const brandRule = arrayify(departureContainer.extra.miniRulesList.MiniRules).find((item) => item.BrandCode === arrayify(minBrand.FareInfo.FareInfo)[0].FareType);
  isRefundable = arrayify(brandRule.PenaltyMiniRule.CancellationPenaltyList.CancellationPenalty).find((penalty) => penalty.IsRefundable);

  mapSegment(cardContainer, departureContainer, 'departure', minBrand);

  mapBrand(cardContainer, flightBrands, departureContainer.extra.miniRulesList.MiniRules, brandOptions, 'departure');

  const mappedSegments = {
    departure: cardContainer.getSegments('departure'),
  };
  const segmentTotalDuration = {
    departure: durationCalculator(mappedSegments.departure)
  };

  cardContainer.airlineAirportContainer.addAirport(mappedSegments.departure[0].from, 'initial');
  cardContainer.airlineAirportContainer.addAirport(mappedSegments.departure[mappedSegments.departure.length - 1].to, 'final');

  /* Departure Flight Parameters END */

  if (!isEmpty(returnContainer)) {
    const returnFlightBrands = arrayify(returnContainer.extra.bookingPriceInfoType.PTC_FareBreakdowns.PTC_FareBreakdown);

    const returnMinBrand = minBy(returnFlightBrands, (item) => {
      return Number(item.PassengerFare.TotalFare.Amount);//TODO servis te düzelt return new BigNumber(item.PassengerFare.TotalFare.Amount).toNumber();
    });

    const returnBrandRule = arrayify(returnContainer.extra.miniRulesList.MiniRules).find((item) => item.BrandCode === arrayify(returnMinBrand.FareInfo.FareInfo)[0].FareType);

    if (!isRefundable) {
      isRefundable = arrayify(returnBrandRule.PenaltyMiniRule.CancellationPenaltyList.CancellationPenalty).find((penalty) => penalty.IsRefundable);
    }

    mapSegment(cardContainer, returnContainer, 'return', returnMinBrand);
    mapBrand(cardContainer, returnFlightBrands, returnContainer.extra.miniRulesList.MiniRules, brandOptions, 'return');

    mappedSegments.return = cardContainer.getSegments('return');
    segmentTotalDuration.return = durationCalculator(mappedSegments.return);

    prices.totalFare.push(returnMinBrand.PassengerFare.TotalFare.Amount);
    prices.baseFare.push(returnMinBrand.PassengerFare.BaseFare.Amount);
    prices.taxFare.push(sumPrice(arrayify(returnMinBrand.PassengerFare.Taxes.Tax).filter(taxItem => taxItem.TaxCode != 'KD').map(taxItem => taxItem.Amount)));
  }

  const totalDuration = totalDurationCalculator(segmentTotalDuration.departure.duration, segmentTotalDuration.return ? segmentTotalDuration.return.duration : null);

  cardContainer
    //.setSearchCombinationId(uuid.v4()) servis te unutma
    .setSearchCombinationId(123123)
    .setDepartureFlightStop()
    .setReturnFlightStop()
    .setDepartureFlightDuration(segmentTotalDuration.departure.duration)
    .setReturnFlightDuration(segmentTotalDuration.return ? segmentTotalDuration.return.duration : '0000')
    .setDepartureFlightDurationMin(segmentTotalDuration.departure.min)
    .setReturnFlightDurationMin(segmentTotalDuration.return ? segmentTotalDuration.return.min : 0)
    .setIsRefundable(isRefundable ? true : false)
    .setDistributor('thyRest')
    .setOwc(false)
    .setReturnProviderType('THYProvider')
    .setDepartureProviderType('THYProvider')
    .setCombinationId(0)
    .setRecommendationId(0)
    .setCurrency(minBrand.PassengerFare.BaseFare.CurrencyCode)
    .addTotalDuration(true)
    .setElapsedTime(totalDuration.elapsedTime)
    .setElapsedHour(totalDuration.elapsedHour)
    .setElapsedTimeInMinutes(totalDuration.elapsedTimeInMinutes)
    .setReturnTotalMinutes(totalDuration.returnTotalMinutes)
    .setDepartureTotalMinutes(totalDuration.depTotalMinutes)
    .addPrice(true)
    .setBaseFare(sumPrice(prices.baseFare))
    .setTotalFare(sumPrice(prices.totalFare))
    .setTaxFare(sumPrice(prices.taxFare))
    .setBreakdownOptions(minBrand.PassengerTypeQuantity.Quantity, minBrand.PassengerTypeQuantity.Code);
}


describe('flight search mapper tests', () => {
  it('flight search mapper', () => {
    const response = flightSearch()
      .setSession({})
      .setProviderSessionJson(skip('no provider json'))
      .setFinished(true)
      .setProviderSessionId(123)
      .setLastOperationName('getAvailabilitycalendar')
      .setMinutesForExpectedSignoutTime(15);

    const brandOptions = get(results, 'data.availabilityOTAResponse.extraOTABrandInfoList.fareBrandOtaResponseItems', []);
    const availabilityResponse = get(results, 'data.availabilityOTAResponse', {});
    const routes = get(availabilityResponse, 'createOTAAirRoute', []);
    const routeFlights = {
      departure: {
        index: 0,
        flights: [],
        extras: [],
      },
      return: {
        index: 1,
        flights: [],
        extras: [],
      }
    };
    arrayify(routes).forEach((route, routeIndex) => {
      const flights = get(route, 'OTA_AirAvailRS.OriginDestinationInformation.OriginDestinationOptions.OriginDestinationOption', []);
      const mappedRouteFlights = arrayify(flights).map((flightItem) => {
        flightItem.flightNumberString = arrayify(flightItem.FlightSegment).map((flightItem) => flightItem.FlightNumber).join('');
        return flightItem;
      });
      const key = getDirection(routeIndex);
      routeFlights[key].index = routeIndex;
      routeFlights[key].flights = mappedRouteFlights;
      routeFlights[key].extras = get(route, 'extraOTAAvailabilityInfoListType.extraOTAAvailabilityInfoList.extraOTAFlightInfoListType.extraOTAFlightInfoList', []);
    });

    if (routeFlights.return.extras.length) {
      routeFlights.departure.extras.forEach((departureExtra) => {
        routeFlights.return.extras.forEach((returnExtra) => {
          const cardContainer = response.addFlight();
          mapCard(cardContainer, brandOptions,
            {
              flight: routeFlights.departure.flights.find((item) => item.flightNumberString === departureExtra.flightNumber),
              extra: departureExtra
            },
            {
              flight: routeFlights.return.flights.find((item) => item.flightNumberString === returnExtra.flightNumber),
              extra: returnExtra
            });
          cardContainer.runFinalizeFunction(() => { });
          // flight.runFinalizeFunction(finalizeFunction); serviste düzelt
        });
      })
    } else {
      routeFlights.departure.extras.forEach((departureExtra) => {
        const cardContainer = response.addFlight();
        mapCard(cardContainer, brandOptions,
          {
            flight: routeFlights.departure.flights.find((item) => item.flightNumberString === departureExtra.flightNumber),
            extra: departureExtra
          });
        cardContainer.runFinalizeFunction(() => { });
        // flight.runFinalizeFunction(finalizeFunction); serviste düzelt
        // flight.runFinalizeFunction(finalizeFunction);
      });
    }

    const mappedFlights = response.get();
    console.log(mappedFlights);
    /* expect(response.get().data.hotels).to.be.lengthOf(2);
    expect(response.get().data.hotels[0].offers).to.be.lengthOf(3);
    expect(response.get().data.hotels[1].offers).to.be.lengthOf(2); */
  });
});
