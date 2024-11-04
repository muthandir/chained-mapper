const { needsMapping } = require('../utility');

const mapper = () => {
  const data = { penalty: {}, session: {} };

  const get = () => data;

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
    return { setSessionData };
  };

  const setPenaltyPercent = (percent) => {
    if (needsMapping(percent)) {
      data.penalty.penaltyPercent = percent;
    }
    return { get, setProviderSessionId };
  };

  const setPenaltyCurrency = (currency) => {
    if (needsMapping(currency)) {
      data.penalty.currency = currency;
    }
    return { setPenaltyPercent };
  };

  const setPenaltyAmount = (amount) => {
    if (needsMapping(amount)) {
      data.penalty.amount = amount;
    }
    return { setPenaltyCurrency };
  };

  const setTimestamp = (timestamp) => {
    if (needsMapping(timestamp)) {
      data.timestamp = timestamp;
    }
    return { setPenaltyAmount };
  };

  const setMessage = (message) => {
    if (needsMapping(message)) {
      data.message = message;
    }
    return { setTimestamp };
  };

  const setStatus = (status) => {
    if (needsMapping(status)) {
      data.status = status;
    }
    return { setMessage };
  };

  const setAction = (action) => {
    if (needsMapping(action)) {
      data.action = action;
    }
    return { setStatus };
  };

  return { setAction };
};

module.exports = mapper;
