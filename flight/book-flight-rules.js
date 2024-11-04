const { needsMapping } = require('../utility');

module.exports = () => {
  const rules = [];

  const get = () => {
    return rules;
  }
  const addFareRuleText = (text) => {
    if (needsMapping(text)) {
      const [rule] = rules.slice(-1);
      const [fareRule] = rule.fareRules.slice(-1);
      fareRule.text = text;
    }
    return {};
  }
  const addFareRuleTitle = (title) => {
    if (needsMapping(title)) {
      const [rule] = rules.slice(-1);
      const [fareRule] = rule.fareRules.slice(-1);
      fareRule.subTitle = title;
    }
    return { addFareRuleText };
  }
  const addFareRules = (isAdd) => {
    if (needsMapping(isAdd)) {
      const [rule] = rules.slice(-1);
      rule.fareRules = rule.fareRules || [];
      rule.fareRules.push({});
    }
    return { addFareRuleTitle };
  }
  const addAirlineCode = (airlineCode) => {
    if (needsMapping(airlineCode)) {
      const [rule] = rules.slice(-1);
      rule.airlineCode = airlineCode;
    }
    return { addFareRules };
  }
  const addToAirport = (toAirport) => {
    if (needsMapping(toAirport)) {
      const [rule] = rules.slice(-1);
      rule.toAirport = toAirport;
    }
    return { addAirlineCode };
  }
  const addFromAirport = (fromAirport) => {
    if (needsMapping(fromAirport)) {
      const [rule] = rules.slice(-1);
      rule.fromAirport = fromAirport;
    }
    return { addToAirport };
  }
  const addFareReference = (fareReference) => {
    if (needsMapping(fareReference)) {
      const [rule] = rules.slice(-1);
      rule.fareReference = fareReference;
    }
    return { addFromAirport };
  }
  const addRules = (isAdd) => {
    if (needsMapping(isAdd)) {
      rules.push({});
    }
    return { addFareReference };
  };

  return { addRules, get };
};

