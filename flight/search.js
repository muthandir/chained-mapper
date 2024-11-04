const moment = require('moment');
const { needsMapping } = require('../utility');
const { isFunction, cloneDeep, has } = require('lodash');

const OperatingAirlines = {
  AJ: 'AJ0',
  TK: 'TK',
};

module.exports = () => {
  const result = {
    data: {},
    airlineAirport: {
      airline: [],
      airport: []
    }
  };
  const airlineAirportContainer = {
    addAirport: (airport, sequence) => {
      if (!result.airlineAirport.airport.find(item => item.airport === airport)) {
        result.airlineAirport.airport.push({
          airport,
          sequence
        });
      }
    },
    addAirline: (airline) => {
      if (!result.airlineAirport.airline.includes(airline)) {
        result.airlineAirport.airline.push(airline);
      }
    },
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
    const brands = flight.brands || [];
    if (brands.length) {
      brands.forEach((brand, index) => {
        const clonedFlight = cloneDeep(flight);
        clonedFlight.price = brand.price;
        if (brand.type === 'departure') {
          delete clonedFlight.return;
        } else {
          delete clonedFlight.departure;
        }
        clonedFlight.isBrand = true;
        finalizeFunction(clonedFlight);
        brand.price = clonedFlight.price;
        brand.policyResult = clonedFlight.brands[index].policyResult;
        if (has(clonedFlight, `brands[${index}].display`, false)) {
          brand.display = clonedFlight.brands[index].display;
        }
      });
    }
    flight.isBrand = false;
    finalizeFunction(flight);
    flight.policyJson = flight.policyResult || {
      "warnings": [
        {
          "code": 300510003,
          "message": "no policy found"
        }
      ],
      "errors": [],
      "action": "",
      "success": true
    };
    isMappingFinalized = true;
  }

  /* SEGMENT FUNCTIONS END */
  const setSegmentToTerminal = (toTerminal, directionIndex = 'departure') => {
    if (needsMapping(toTerminal) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.toTerminal = toTerminal;
    }
    return {};
  };

  const setSegmentFromTerminal = (terminal, directionIndex = 'departure') => {
    if (needsMapping(terminal) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.terminal = terminal;
    }
    return { setSegmentToTerminal };
  };

  const calculateSegmentLayoverTime = (isCalc, directionIndex = 'departure') => {
    if (needsMapping(isCalc) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const segments = flight[directionIndex];
      segments.forEach((element, index) => {
        if (segments[index + 1]) {
          const layoverTime = moment().startOf('day').add(moment.duration(moment(segments[index + 1].departureDateTime).diff(moment(segments[index].arrivalDateTime))).asMinutes(), 'minutes').format('HH:mm');
          const layoverTimeMin = moment.duration(moment(segments.slice(-1)[0].departureDateTime).diff(moment(segments[0].arrivalDateTime))).asMinutes();
          segments[index + 1].layoverTime = layoverTime;
          segments[index + 1].layoverTimeMin = layoverTimeMin;
        }
      });
    }
    return { setSegmentFromTerminal };
  }

  const setSegmentCabinClass = (desigCode, quantity, cabinClassCode, rph, directionIndex = 'departure') => {
    if (needsMapping(desigCode) && needsMapping(quantity) && needsMapping(cabinClassCode) && needsMapping(rph) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      const [cabinClass] = segment.cabinClassInfo.slice(-1);
      cabinClass.desigCode = desigCode;
      cabinClass.quantity = quantity;
      cabinClass.class = cabinClassCode;
      cabinClass.rph = rph;
    }
    return { calculateSegmentLayoverTime };
  }

  const addSegmentCabinClass = (directionIndex = 'departure') => {
    if (needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      if (!segment.cabinClassInfo) {
        segment.cabinClassInfo = [];
      }
      segment.cabinClassInfo.push({});
    }
    return { setSegmentCabinClass };
  }

  const setSegmentOrderJson = (orderJson, directionIndex = 'departure') => {
    if (needsMapping(orderJson) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.orderJson = orderJson;
    }
    return { addSegmentCabinClass };
  }

  const addSegmentOrderJson = (directionIndex = 'departure') => {
    if (needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.orderJson = {
        isConnected: null,
        flightClass: null
      }
    }
    return { setSegmentOrderJson };
  }

  const setSegmentBaggage = (type, unit, index, quantity, directionIndex = 'departure') => {
    if (needsMapping(type) && needsMapping(unit) && needsMapping(index) && needsMapping(quantity) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.baggages.type = type;
      segment.baggages.unit = unit;
      segment.baggages.index = index;
      segment.baggages.quantity = quantity;
    }
    return { addSegmentOrderJson };
  }

  const addSegmentBaggage = (directionIndex) => {
    if (needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.baggages = {
        type: null,
        unit: null,
        index: null,
        quantity: null
      };
    }
    return { setSegmentBaggage };
  }

  const setSegmentEquipment = (equipment, directionIndex = 'departure') => {
    if (needsMapping(equipment) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.equipment = equipment;
    }
    return { addSegmentBaggage };
  }
  const setSegmentAlliance = (alliance, directionIndex = 'departure') => {
    if (needsMapping(alliance) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.alliance = alliance;
    }
    return { setSegmentEquipment };
  }
  const setSegmentMarketingAirline = (airline, directionIndex = 'departure', isNeedMap = true) => {
    if (needsMapping(airline) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.marketingAirlineCode = isNeedMap ? OperatingAirlines[airline] : airline;
      airlineAirportContainer.addAirline(segment.marketingAirlineCode);
    }
    return { setSegmentAlliance };
  }
  const setSegmentOperatingAirline = (airline, directionIndex = 'departure', isNeedMap = true) => {
    if (needsMapping(airline) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.operatingAirlineCode = isNeedMap ? OperatingAirlines[airline] : airline;
    }
    return { setSegmentMarketingAirline };
  };
  const setSegmentFlightDurationHour = (flightDurationHour, directionIndex = 'departure') => {
    if (needsMapping(flightDurationHour) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.flightDurationHour = flightDurationHour;
    }
    return { setSegmentOperatingAirline };
  }
  const setSegmentFlightDuration = (flightDuration, directionIndex = 'departure') => {
    if (needsMapping(flightDuration) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.flightDuration = flightDuration;
    }
    return { setSegmentFlightDurationHour }
  }
  const setSegmentTotalDuration = (duration, directionIndex = 'departure') => {
    if (needsMapping(duration) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.totalFlightDuration = duration;
    }
    return { setSegmentFlightDuration }
  }
  const setSegmentArrivalDateTime = (dateTime, directionIndex = 'departure') => {
    if (needsMapping(dateTime) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.arrivalDateTime = dateTime;
    }
    return { setSegmentTotalDuration };
  };
  const setSegmentDepartureDateTime = (dateTime, directionIndex = 'departure') => {
    if (needsMapping(dateTime) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.departureDateTime = dateTime;
    }
    return { setSegmentArrivalDateTime };
  };
  const setSegmentTo = (to, directionIndex = 'departure') => {
    if (needsMapping(to) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.to = to;
    }
    return { setSegmentDepartureDateTime };
  };
  const setSegmentFrom = (from, directionIndex = 'departure') => {
    if (needsMapping(from) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.from = from;
    }
    return { setSegmentTo };
  };
  const setSegmentFlightNumber = (flightNumber, directionIndex = 'departure') => {
    if (needsMapping(flightNumber) && needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      const [segment] = flight[directionIndex].slice(-1);
      segment.flightNumber = flightNumber;
    }
    return { setSegmentFrom };
  };
  const addSegment = (directionIndex = 'departure') => {
    if (needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      if (!flight[directionIndex]) {
        flight[directionIndex] = [];
      }
      flight[directionIndex].push({});
    }
    return { setSegmentFlightNumber };
  };
  const getSegments = (directionIndex = 'departure') => {
    if (needsMapping(directionIndex)) {
      const [flight] = result.data.flights.slice(-1);
      return flight[directionIndex];
    }
    return {};
  };
  /* SEGMENT FUNCTIONS START */

  /* BRAND FUNCTIONS FINISH */
  const cloneBrand = (isClone) => {
    if (needsMapping(isClone)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      flight.originalBrands.push(cloneDeep(brand));
    }
    return {};
  }
  const setBrandType = (type) => {
    if (needsMapping(type)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.type = type;
    }
    return { cloneBrand };
  }
  const setBrandRuleBonusMile = (bonusMile) => {
    if (needsMapping(bonusMile)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.rule.bonusMile = bonusMile;
    }
    return { setBrandType };
  }
  const setBrandRuleSeatSelection = (isSelectable) => {
    if (needsMapping(isSelectable)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.rule.seatSelection = isSelectable;
    }
    return { setBrandRuleBonusMile };
  }
  const setBrandRuleReissue = (reissue) => {
    if (needsMapping(reissue)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.rule.reissue = reissue;
    }
    return { setBrandRuleSeatSelection };
  }
  const setBrandRuleRefund = (refund) => {
    if (needsMapping(refund)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.rule.refund = refund;
    }
    return { setBrandRuleReissue };
  }
  const setBrandRuleBaggage = (kilos, pieces) => {
    if (needsMapping(kilos) && needsMapping(pieces)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.rule.baggage = {
        kilos,
        pieces,
      };
    }
    return { setBrandRuleRefund };
  }
  const setBrandRuleCabinBaggage = (kilos, pieces) => {
    if (needsMapping(kilos) && needsMapping(pieces)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.rule.cabinBaggage = {
        kilos,
        pieces,
      };
    }
    return { setBrandRuleBaggage };
  };
  const addBrandRule = (isAdd) => {
    if (needsMapping(isAdd)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.rule = {
        cabinBaggage: {
          kilos: null,
          pieces: null,
        },
        baggage: {
          kilos: null,
          pieces: null,
        },
        reissue: null,
        refund: null,
        bonusMile: null,
        seatSelection: false
      }
    }
    return { setBrandRuleCabinBaggage };
  }
  const setBrandPriceBreakdownOptions = (quantity, passengerCode) => {
    if (needsMapping(quantity) && needsMapping(passengerCode)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      const [breakdown] = brand.price.itinerary.breakdown.slice(-1);
      breakdown.code = passengerCode;
      breakdown.quantity = quantity;
    }
    return { addBrandRule };
  };
  const setBrandTaxFare = (taxFare) => {
    if (needsMapping(taxFare)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.price.itinerary.taxFare = taxFare;
      const [breakdown] = brand.price.itinerary.breakdown.slice(-1);
      breakdown.taxFare = taxFare;
    }
    return { setBrandPriceBreakdownOptions };
  }
  const setBrandBaseFare = (baseFare) => {
    if (needsMapping(baseFare)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.price.itinerary.baseFare = baseFare;
      const [breakdown] = brand.price.itinerary.breakdown.slice(-1);
      breakdown.baseFare = baseFare;
    }
    return { setBrandTaxFare };
  }
  const setBrandTotalFare = (totalFare) => {
    if (needsMapping(totalFare)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.price.itinerary.totalFare = totalFare;
      const [breakdown] = brand.price.itinerary.breakdown.slice(-1);
      breakdown.totalFare = totalFare;
    }
    return { setBrandBaseFare };
  }
  const addBrandPrice = (isAdd) => {
    if (needsMapping(isAdd)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.price = {
        itinerary: {
          totalFare: 0,
          baseFare: 0,
          taxFare: 0,
          breakdown: [
            {
              totalFare: 0,
              baseFare: 0,
              quantity: 0,
              code: null
            }
          ]
        }
      };
      return { setBrandTotalFare };
    };
  }
  const setBrandCode = (code) => {
    if (needsMapping(code)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.code = code;
    }
    return { addBrandPrice }
  }
  const setBrandCurrency = (currency) => {
    if (needsMapping(currency)) {
      const [flight] = result.data.flights.slice(-1);
      const [brand] = flight.brands.slice(-1);
      brand.currency = currency;
    }
    return { setBrandCode }
  }
  const addBrand = (isAdd) => {
    if (needsMapping(isAdd)) {
      const [flight] = result.data.flights.slice(-1);
      if (!flight.brands) {
        flight.brands = [];
        flight.originalBrands = [];
      }
      flight.brands.push({
        isBrand: true
      });
    }
    return { setBrandCurrency };
  };
  /* BRAND FUNCTIONS START */
  const compareAirport = (isCalc) => {
    if (needsMapping(isCalc)) {
      const [flight] = result.data.flights.slice(-1);
      if (flight.return && flight.return.length) {
        if (flight.departure[0].from !== flight.return[flight.returnFlightStop].to) {
          const warning = {
            code: 300511001,
            message: "Departure and Arrival airports are different.",
            parameters: []
          };
          warning.parameters.push(flight.departure[0].from);
          warning.parameters.push(flight.return[flight.returnFlightStop].to);

          if (!flight.warnings) {
            flight.warnings = [];
          }

          flight.warnings.push(warning);
        }

        if (flight.departure[flight.departureFlightStop].to != flight.return[0].from) {
          let warning = {
            code: 300511002,
            message: 'Arrival and Return airports are different.',
            parameters: []
          };
          warning.parameters.push(flight.return[0].from);
          warning.parameters.push(flight.departure[flight.departureFlightStop].to);

          if (!flight.warnings) {
            flight.warnings = [];
          }
          flight.warnings.push(warning);
        }
      }
    }
    return {};
  }
  const setNegotiated = (code) => {
    if (needsMapping(code)) {
      const [flight] = result.data.flights.slice(-1);
      flight.negotiated = code;
    }
    return { compareAirport };
  };
  const setBreakdownOptions = (quantity, passengerCode) => {
    if (needsMapping(quantity) && needsMapping(passengerCode)) {
      const [flight] = result.data.flights.slice(-1);
      const [breakdown] = flight.price.itinerary.breakdown.slice(-1);
      breakdown.code = passengerCode;
      breakdown.quantity = quantity;
    }
    return { setNegotiated };
  };
  const setTaxFare = (taxFare) => {
    if (needsMapping(taxFare)) {
      const [flight] = result.data.flights.slice(-1);
      flight.price.itinerary.taxFare = taxFare;
      const [breakdown] = flight.price.itinerary.breakdown.slice(-1);
      breakdown.taxFare = taxFare;
    }
    return { setBreakdownOptions };
  };
  const setTotalFare = (totalFare) => {
    if (needsMapping(totalFare)) {
      const [flight] = result.data.flights.slice(-1);
      flight.price.itinerary.totalFare = totalFare;
      const [breakdown] = flight.price.itinerary.breakdown.slice(-1);
      breakdown.totalFare = totalFare;
    }
    return { setTaxFare };
  };
  const setBaseFare = (baseFare) => {
    if (needsMapping(baseFare)) {
      const [flight] = result.data.flights.slice(-1);
      flight.price.itinerary.baseFare = baseFare;
      const [breakdown] = flight.price.itinerary.breakdown.slice(-1);
      breakdown.baseFare = baseFare;
    }
    return { setTotalFare };
  };
  const addPrice = (isAdd) => {
    if (needsMapping(isAdd)) {
      const [flight] = result.data.flights.slice(-1);
      flight.price = {
        itinerary: {
          totalFare: 0,
          baseFare: 0,
          taxFare: 0,
          markupFare: 0,
          breakdown: [
            {
              totalFare: 0,
              baseFare: 0,
              markupFare: 0,
              quantity: 0,
              code: null
            }
          ]
        }
      };
    }
    return { setBaseFare };
  };
  const setDepartureTotalMinutes = (min) => {
    if (needsMapping(min)) {
      const [flight] = result.data.flights.slice(-1);
      flight.totalDuration.depTotalMinutes = min;
    }
    return { addPrice };
  };
  const setReturnTotalMinutes = (min) => {
    if (needsMapping(min)) {
      const [flight] = result.data.flights.slice(-1);
      flight.totalDuration.returnTotalMinutes = min;
    }
    return { setDepartureTotalMinutes };
  };
  const setElapsedTimeInMinutes = (min) => {
    if (needsMapping(min)) {
      const [flight] = result.data.flights.slice(-1);
      flight.totalDuration.elapsedTimeInMinutes = min;
    }
    return { setReturnTotalMinutes };
  };

  const setElapsedHour = (min) => {
    if (needsMapping(min)) {
      const [flight] = result.data.flights.slice(-1);
      flight.totalDuration.elapsedHour = min;
    }
    return { setElapsedTimeInMinutes };
  };

  const setElapsedTime = (min) => {
    if (needsMapping(min)) {
      const [flight] = result.data.flights.slice(-1);
      flight.totalDuration.elapsedTime = min;
    }
    return { setElapsedHour };
  };

  const addTotalDuration = (isAddTotalDuration) => {
    if (needsMapping(isAddTotalDuration)) {
      const [flight] = result.data.flights.slice(-1);
      flight.totalDuration = {};
    }
    return { setElapsedTime };
  }

  const setCurrency = (currency) => {
    if (needsMapping(currency)) {
      const [flight] = result.data.flights.slice(-1);
      flight.currency = currency;
    }
    return { addTotalDuration };
  }
  const setRecommendationId = (recommendationId) => {
    if (needsMapping(recommendationId)) {
      const [flight] = result.data.flights.slice(-1);
      flight.recommendationId = recommendationId;
    }
    return { setCurrency };
  }
  const setCombinationId = (combinationId) => {
    if (needsMapping(combinationId)) {
      const [flight] = result.data.flights.slice(-1);
      flight.combinationId = combinationId;
    }
    return { setRecommendationId };
  }
  const setDepartureProviderType = (provider) => {
    if (needsMapping(provider)) {
      const [flight] = result.data.flights.slice(-1);
      flight.departureProviderType = provider;
    }
    return { setCombinationId };
  }
  const setReturnProviderType = (provider) => {
    if (needsMapping(provider)) {
      const [flight] = result.data.flights.slice(-1);
      flight.returnProviderType = provider;
    }
    return { setDepartureProviderType };
  }
  const setOwc = (isOwc) => {
    if (needsMapping(isOwc)) {
      const [flight] = result.data.flights.slice(-1);
      flight.isOwc = isOwc;
    }
    return { setReturnProviderType };
  }
  const setDistributor = (distributor) => {
    if (needsMapping(distributor)) {
      const [flight] = result.data.flights.slice(-1);
      flight.distributor = distributor;
    }
    return { setOwc };
  }
  const setIsRefundable = (isRefundable) => {
    if (needsMapping(isRefundable)) {
      const [flight] = result.data.flights.slice(-1);
      flight.isRefundable = isRefundable;
    }
    return { setDistributor };
  }

  const setReturnFlightDurationMin = (flightDurationMin) => {
    if (needsMapping(flightDurationMin)) {
      const [flight] = result.data.flights.slice(-1);
      flight.returnFlightDurationMin = flightDurationMin;
    }
    return { setIsRefundable }
  };

  const setDepartureFlightDurationMin = (flightDurationMin) => {
    if (needsMapping(flightDurationMin)) {
      const [flight] = result.data.flights.slice(-1);
      flight.departureFlightDurationMin = flightDurationMin;
    }
    return { setReturnFlightDurationMin }
  };

  const setReturnFlightDuration = (flightDuration) => {
    if (needsMapping(flightDuration)) {
      const [flight] = result.data.flights.slice(-1);
      flight.returnFlightDuration = flightDuration;
    }
    return { setDepartureFlightDurationMin }
  };

  const setDepartureFlightDuration = (flightDuration) => {
    if (needsMapping(flightDuration)) {
      const [flight] = result.data.flights.slice(-1);
      flight.departureFlightDuration = flightDuration;
    }
    return { setReturnFlightDuration }
  };

  const setReturnFlightStop = (isSet) => {
    if (needsMapping(isSet)) {
      const [flight] = result.data.flights.slice(-1);
      flight.returnFlightStop = flight.return ? flight.return.length - 1 : 0;
    }
    return { setDepartureFlightDuration }
  };

  const setDepartureFlightStop = (isSet) => {
    if (needsMapping(isSet)) {
      const [flight] = result.data.flights.slice(-1);
      flight.departureFlightStop = flight.departure.length - 1;
    }
    return { setReturnFlightStop }
  };

  /**
  * completes the function
  *
  * @param {uuid} searchCombinationId sets if finished
  * @returns addSegment
  *
  */
  const setSearchCombinationId = (searchCombinationId) => {
    if (needsMapping(searchCombinationId)) {
      const [flight] = result.data.flights.slice(-1);
      flight.searchCombinationId = searchCombinationId;
    }
    return { setDepartureFlightStop };
  };
  /**
  * completes the function
  *
  * @returns setSearchCombinationId
  *
  */
  const addFlight = () => {
    if (!result.data.flights) {
      result.data.flights = [];
    }
    result.data.flights.push({});
    isMappingFinalized = false; // yeni bir satir icin yeni islem basliyor. finalize a kadar gidilmesi lazim
    return { setSearchCombinationId, addSegment, getSegments, addBrand, runFinalizeFunction, airlineAirportContainer };
  };
  /**
  * completes the function
  *
  * @param {Number} minutes sets if finished
  * @returns addFlight, get
  *
  */
  const setMinutesForExpectedSignoutTime = (minutes) => {
    if (needsMapping(minutes)) {
      result.session.expectedSignoutTime = moment().utc().add(minutes, 'minutes').format('YYYY-MM-DD HH:mm:00');
    }
    return { addFlight, get };
  };

  /**
   * completes the function
   *
   * @param {String} operationName sets if finished
   * @returns setMinutesForExpectedSignoutTime
   *
   */
  const setLastOperationName = (operationName) => {
    if (needsMapping(operationName)) {
      result.session.lastOperation = operationName;
    }
    return { setMinutesForExpectedSignoutTime };
  };

  /**
   * completes the function
   *
   * @param {String} providerSessionId sets if finished
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

  /**
  * completes the function
  *
  * @param {JSON} providerJson sets if finished
  * @returns setFinished
  *
  */
  const setProviderSessionJson = (providerJson) => {
    if (needsMapping(providerJson)) {
      result.session.providerJson = providerJson;
    }
    return { setFinished };
  };
  /**
  * completes the function
  *
  * @param {Object} isFinished sets if finished
  * @returns setProviderSessionJson
  *
  */
  const setSession = (session) => {
    if (needsMapping(session)) {
      result.session = session || {};
    }
    return { setProviderSessionJson };
  };

  return { setSession };
};
