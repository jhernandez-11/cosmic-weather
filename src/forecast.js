import axios from 'axios'

const forecast = (latitude, longitude, callback) => {
  // const url2 =
  //   "http://api.weatherstack.com/current?access_key=7f52f87871bb95a8a0a2cac4d02a088f&query=" +
  //   longitude +
  //   "," +
  //   latitude +
  //   "&units=f";

  const url = `https://api.stormglass.io/v2/weather/point?lat=${longitude}&lng=${latitude}&params=airTemperature,humidity,cloudCover&start=${Math.floor(
    Date.now() / 1000
  )}`;

  axios
    .get(url, {
      headers: {
        Authorization:
          "9a56ee7e-5b6d-11eb-9009-0242ac130002-9a56ef1e-5b6d-11eb-9009-0242ac130002",
      },
    })
    .then((res) => {
      const temperature = (
          (res.data.hours[0].airTemperature.noaa * 9) / 5 +
          32
        ).toFixed(0),
        humidity = (res.data.hours[0].humidity.noaa).toFixed(0) + "%";

      const weatherDescription = () => {
        const clouds = res.data.hours[0].cloudCover.noaa.toFixed(0);

        if (clouds == 0) {
          return "Clear sky.";
        } else if (clouds == 1 || clouds == 2) {
          return "Fair sky.";
        } else if (clouds == 3 || clouds == 4 || clouds == 5) {
          return "Mostly clear sky.";
        } else if (clouds == 6 || clouds == 7) {
          return "Partly cloudy.";
        } else if (clouds == 8) {
          return "Broken clouds.";
        } else {
          return "Overcast.";
        }
      };

      if (temperature >= 100) {
        callback(
          undefined,
          `${weatherDescription()} It is currently ${temperature + `\u00B0` + 'F'}, be extremely cautious. The humidity is ${humidity}.`
        );
      } else if (temperature >= 90 && temperature <= 99) {
        callback(
          undefined,
          `${weatherDescription()} It is currently ${temperature + `\u00B0` + 'F'}, very hot. The humidity is ${humidity}.`
        );
      } else if (temperature >= 80 && temperature <= 89) {
        callback(
          undefined,
          `${weatherDescription()} It is currently ${temperature + `\u00B0` + 'F'}, good weather. The humidity is ${humidity}.`
        );
      } else if (temperature >= 70 && temperature <= 79) {
        callback(
          undefined,
          `${weatherDescription()} It is currently ${temperature + `\u00B0` + 'F'}, perfect weather. The humidity is ${humidity}.`
        );
      } else if (temperature >= 60 && temperature <= 69) {
        callback(
          undefined,
          `${weatherDescription()} It is currently ${temperature + `\u00B0` + 'F'}, a little cold. The humidity is ${humidity}.`
        );
      } else if (temperature >= 50 && temperature <= 59) {
        callback(
          undefined,
          `${weatherDescription()} It is currently ${temperature + `\u00B0` + 'F'}, it's cold. The humidity is ${humidity}.`
        );
      } else if (temperature >= 40 && temperature <= 49) {
        callback(
          undefined,
          `${weatherDescription()} It is currently ${temperature + `\u00B0` + 'F'}, somewhat cold. The humidity is ${humidity}.`
        );
      } else if (temperature >= 30 && temperature <= 39) {
        callback(
          undefined,
          `${weatherDescription()} It is currently ${temperature + `\u00B0` + 'F'}, really cold. The humidity is ${humidity}.`
        );
      } else if (temperature >= 20 && temperature <= 29) {
        callback(
          undefined,
          `${weatherDescription()} It is currently ${temperature + `\u00B0` + 'F'}, very cold. The humidity is ${humidity}.`
        );
      } else if (temperature >= 10 && temperature <= 19) {
        callback(
          undefined,
          `${weatherDescription()} It is currently ${temperature + `\u00B0` + 'F'}, freezing cold. The humidity is ${humidity}.`
        );
      } else {
        callback(
          undefined,
          `${weatherDescription()} It is currently ${temperature + `\u00B0` + 'F'}, be extremely cautious. The humidity is ${humidity}.`
        );
      }
    })
    .catch(
      (error) => {
        console.log(error)
        callback("Forecast error!")
      },
      undefined
    );
};

export default forecast;