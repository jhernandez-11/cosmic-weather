import axios from "axios";

const geocode = (address, callback) => {
  const url =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    encodeURIComponent(address) +
    ".json?access_token=pk.eyJ1Ijoiam9zZWhkejk4IiwiYSI6ImNrZGV3Mzk5OTE4MGIyd210NDFoZnNxNnUifQ.iDf6YzmBmb0jjKfd2SscfQ&limit=1";
  axios
    .get(url)
    .then((res) => {
      callback(undefined, {
        latitude: res.data.features[0].center[1],
        longitude: res.data.features[0].center[0],
        location: res.data.features[0].context[2].text + ', ' + res.data.features[0].context[4].text,
      });
    })
    .catch((error) => callback("Location error!", undefined));
};

export default geocode;