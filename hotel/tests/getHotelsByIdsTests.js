/* eslint-disable no-undef */
const { expect } = require('chai');
const getHotelsByIds = require('../getHotelsListByIds');
const { skip } = require('../../utility');


const hotels = [
  {
    services: ["Casino", "Bar", "TV (free / paid)", "Parking (free / paid)", "Smoking area", "Garage (free / paid)", "Air conditioning (free / paid)", "Hair dryer (free / paid)", "Disabled facilities", "Mini-Bar (optional)", "Elevator/lift"],
    images: ['url1', 'url2'],
    updatedAtByProvider: '2020-02-03',
    longitude: 2.324252,
    latitude: 4.24222,
    address: 'address',
    provider: 'amadeus',
    email: 'gokhan@corebit.tech',
    phone: '380-23-23',
    fax: '242-242-2',
    description: 'cok guzel bir lokantamiz vardir',
    accommodationType: 'hotel',
    stars: '5',
    countryIso: 'TR',
    cityId: 4,
    name: 'Everest Hotel',
    hotelId: '2w422',
  },
  {
    services: ["Restaurant", "Bar", "TV (free / paid)", "Parking (free / paid)", "Smoking area", "Garage (free / paid)", "Air conditioning (free / paid)", "Hair dryer (free / paid)", "Disabled facilities", "Mini-Bar (optional)", "Elevator/lift"],
    images: ['url1', 'url2'],
    updatedAtByProvider: '2020-02-03',
    longitude: 2.324252,
    latitude: 4.24222,
    address: 'address',
    provider: 'amadeus',
    email: 'gokhan@corebit.tech',
    phone: '380-23-23',
    fax: '242-242-2',
    description: 'cok guzel bir bar vardir',
    accommodationType: 'hotel',
    stars: '5',
    countryIso: 'TR',
    cityId: 4,
    name: 'Fuji Hotel',
    hotelId: '2422',
  }];

describe('get hotels by ids tests', () => {
  it('get 2 hotels', () => {
    const response = getHotelsByIds();

    hotels.forEach((amadeusHotel) => {
      response.addHotel(amadeusHotel.hotelId)
        .setName(amadeusHotel.name)
        .setCityId(amadeusHotel.cityId)
        .setCountryIso(amadeusHotel.countryIso)
        .setStars(amadeusHotel.stars)
        .setAccommodationType(skip('amadeusta accomodation type yok!'))
        .setShortDescription(amadeusHotel.description)
        .setFullDescription(skip('no full desc'))
        .setLocationDescription(skip('no location desc'))
        .setFax(amadeusHotel.fax)
        .setPhone(amadeusHotel.phone)
        .setEmail(amadeusHotel.email)
        .setProvider(amadeusHotel.provider)
        .setAddress(amadeusHotel.address)
        .setLatitude(amadeusHotel.latitude)
        .setLongitude(amadeusHotel.longitude)
        .setUpdatedAtByProvider(amadeusHotel.updatedAtByProvider)
        .setThumbImage(amadeusHotel.images[0])
        .setImages(amadeusHotel.images.slice(1))
        .setServices(amadeusHotel.services);
    });

    // console.log(JSON.stringify(response.get()));
    expect(response.get()).to.be.lengthOf(2);
    expect(response.get()[0].name).to.be.equal('Everest Hotel');
    expect(response.get()[1].name).to.be.equal('Fuji Hotel');
  });
});
