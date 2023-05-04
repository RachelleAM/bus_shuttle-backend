import Polyline from "@mapbox/polyline";

const searchForDrivers = (latitude, longitude, rides) => {
  const [latTolerance, lngTolerance] = [0.05 / 2, 0.055 / 2];

  const output = rides.filter(({ route }) => {
    const filteredPolyline = [];
    let found = false;

    const polyArr = Polyline.decode(route);
    for (var i = 0; i < polyArr.length; i += 10)
      filteredPolyline.push(polyArr[i]);

    for (var i = 0; i < filteredPolyline.length; i++) {
      const [lat, lng] = filteredPolyline[i];
      if (
        latitude <= lat + latTolerance &&
        latitude >= lat - latTolerance &&
        longitude <= lng + lngTolerance &&
        longitude >= lng - lngTolerance
      ) {
        found = true;
        break;
      }
    }
    return found;
  });

  return output;
};

export default searchForDrivers;
