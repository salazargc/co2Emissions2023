window.onload = init;

function init() {
  //  Map View
  const map = L.map("mapid", {
    center: [0, 0],
    zoom: 2,
  });

  // Basemap
  const cartoMaps = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }
  ).addTo(map);

  

  // Chart Information
  let countryData = [];
  let emissionsData = [];
  function chartData(data) {
    let continentEmissions = {};

    let dataChart = data.features;
    for (let i = 0; i < dataChart.length; ++i) {
      let co2 = dataChart[i].properties["Co2-Emissions"] || 0;
      let continent = dataChart[i].properties["Continent"];
      if (continent){
        let idx = countryData.indexOf(dataChart[i].properties["Continent"]);
        if (idx < 0) {
          countryData.push(continent);
          continentEmissions[continent] = 0;
        }

        continentEmissions[continent] += co2;
      }

      }

      

    emissionsData = countryData.map((continent) =>
      Math.round(continentEmissions[continent] / 100000)
    );

   

    let barColors = [
      "#810f7c",
      "#8856a7",
      "#8c96c6",
      "#9ebcda",
      "#bfd3e6",
      "#edf8fb",
    ];
    

    myBarChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: countryData,
        datasets: [
          {
            data: emissionsData,
            backgroundColor: barColors,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "CO₂ Emissions (in 10⁵ tons) by Continent in 2023",
          },
          legend: { display: true },
        },
      },
    });
   
  }

  const emissionsToMap = (data) => {
    let emissionsGeojson = L.geoJSON(data, {
      pointToLayer: function (layer, latlng) {
        if (layer.properties["Jenks_Class"] === 1) {
          return L.circleMarker(latlng, {
            radius: 5,
          });
        } else if (layer.properties["Jenks_Class"] === 2) {
          return L.circleMarker(latlng, {
            radius: 15,
          });
        } else if (layer.properties["Jenks_Class"] === 3) {
          return L.circleMarker(latlng, {
            radius: 30,
          });
        } else if (layer.properties["Jenks_Class"] === 4) {
          return L.circleMarker(latlng, {
            radius: 45,
          });
        } else layer.properties["Jenks_Class"] === 5;
        return L.circleMarker(latlng, { radius: 65 });
      },
      style: function (feature) {
        return {
          fillOpacity: 0.4,
          fillColor: "#885df1",
          color: "#885df1",
          opacity: 0.3,
        };
      },

      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b><h2>" +
            layer.feature.properties["Country"] +
            "</b></h2>" +
            "<b>2023 CO2 Emissions: </b>" +
            layer.feature.properties["Co2-Emissions"] +
            " tons"
        );
      },
    }).addTo(map);
    map.fitBounds(emissionsGeojson.getBounds());
      
  

  }; 
  


  let myBarChart = null;
  const ctx = document.getElementById("myChart").getContext("2d");

  function fecthData(url) {
    fetch(url, {
      method: "GET",
      mode: "same-origin",
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json(response);
        } else {
          throw new Error("fetch API could not fetch the data");
        }
      })
      .then((geojson) => {
         
       
        chartData(geojson);
        emissionsToMap(geojson)

      })

      .catch(function (error) {
        console.log(error);
      });
  }

  fecthData("./data/co2_emissions.geojson");
}
