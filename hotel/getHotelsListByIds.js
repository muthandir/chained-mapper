const { needsMapping } = require('../utility');

module.exports = (defaultOpt) => {
  const hotels = [];

  const get = () => hotels;

  const setServices = (services) => {
    if (needsMapping(services)) {
      const [hotel] = hotels.slice(-1);
      hotel.info.services = services;
    }

    return { get, addHotel };
  };
  const setImages = (images) => {
    if (needsMapping(images)) {
      const [hotel] = hotels.slice(-1);
      hotel.info = { images };
    }
    return { setServices };
  };
  const setThumbImage = (image) => {
    if (needsMapping(image)) {
      const [hotel] = hotels.slice(-1);
      hotel.image = image;
    }
    return { setImages };
  };
  const setUpdatedAtByProvider = (updatedAtByProvider) => {
    if (needsMapping(updatedAtByProvider)) {
      const [hotel] = hotels.slice(-1);
      hotel.updatedAtByProvider = updatedAtByProvider;
    }
    return { setThumbImage };
  };
  const setLongitude = (longitude) => {
    if (needsMapping(longitude)) {
      const [hotel] = hotels.slice(-1);
      hotel.longitude = longitude;
    }
    return { setUpdatedAtByProvider };
  };
  const setLatitude = (latitude) => {
    if (needsMapping(latitude)) {
      const [hotel] = hotels.slice(-1);
      hotel.latitude = latitude;
    }
    return { setLongitude };
  };
  const setAddress = (address) => {
    if (needsMapping(address)) {
      const [hotel] = hotels.slice(-1);
      hotel.address = address;
    }
    return { setLatitude };
  };
  const setProvider = (provider) => {
    if (needsMapping(provider)) {
      const [hotel] = hotels.slice(-1);
      hotel.provider = provider;
    }
    return { setAddress };
  };
  const setEmail = (email) => {
    if (needsMapping(email)) {
      const [hotel] = hotels.slice(-1);
      hotel.email = email;
    }
    return { setProvider };
  };
  const setPhone = (phone) => {
    if (needsMapping(phone)) {
      const [hotel] = hotels.slice(-1);
      hotel.contactNumbers.phone = phone;
    }
    return { setEmail };
  };
  const setFax = (fax) => {
    const [hotel] = hotels.slice(-1);
    hotel.contactNumbers = {};
    if (needsMapping(fax)) {
      hotel.contactNumbers.fax = fax;
    }
    return { setPhone };
  };
  const setLocationDescription = (description) => {
    if (needsMapping(description)) {
      const [hotel] = hotels.slice(-1);
      hotel.description = hotel.description || [];
      hotel.description.push({ type: 'location', description });
    }
    return { setFax };
  };
  const setFullDescription = (description) => {
    if (needsMapping(description)) {
      const [hotel] = hotels.slice(-1);
      hotel.description = hotel.description || [];
      hotel.description.push({ type: 'full', description });
    }
    return { setLocationDescription };
  };
  const setShortDescription = (description) => {
    if (needsMapping(description)) {
      const [hotel] = hotels.slice(-1);
      hotel.description = [{ type: 'short', description }];
    }
    return { setFullDescription };
  };
  const setAccommodationType = (accommodationType) => {
    if (needsMapping(accommodationType)) {
      const [hotel] = hotels.slice(-1);
      hotel.accommodationType = accommodationType;
    }
    return { setShortDescription };
  };
  const setStars = (stars) => {
    if (needsMapping(stars)) {
      const [hotel] = hotels.slice(-1);
      hotel.stars = stars;
    }
    return { setAccommodationType };
  };
  const setCountryIso = (countryIso) => {
    if (needsMapping(countryIso)) {
      const [hotel] = hotels.slice(-1);
      hotel.countryIso = countryIso;
    }
    return { setStars };
  };
  const setCityId = (cityId) => {
    if (needsMapping(cityId)) {
      const [hotel] = hotels.slice(-1);
      hotel.cityId = cityId;
    }
    return { setCountryIso };
  };
  const setName = (name) => {
    if (needsMapping(name)) {
      const [hotel] = hotels.slice(-1);
      hotel.name = name;
    }
    return { setCityId };
  };
  const addHotel = (hotelId) => {
    if (needsMapping(hotelId)) {
      hotels.push({ hotelId });
    }
    return { setName };
  };

  return { addHotel, get };
};
