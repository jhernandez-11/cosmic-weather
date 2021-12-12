let coords, longitude, latitude;

const getCoordinatesHandler = async () => {
    //console.log('stato')
    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by your browser!");
    }

    navigator.geolocation.getCurrentPosition((position) => {
      try {
        latitude = position.coords.latitude,
        longitude = position.coords.longitude,
        coords = longitude + "," + latitude;

        return coords;
      } catch (error) {
        console.log(error);
      }
    });
};



// Get the input field
// let input = document.getElementById("zipcode");
// let manualLocation;

// input.addEventListener("keyup", (e) => {
//     e.preventDefault();

//     if (e.key === 'Enter') {
//         manualLocation = input.value
//         console.log(manualLocation)
//     } else {
//         null
//     }
// });

export  { getCoordinatesHandler }