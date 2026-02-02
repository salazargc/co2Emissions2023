window.onload = init;

function init() {
  //  Map View
  const map = L.map("mapid", {
    minZoom:3,
    maxZoom:5,
    zoomControl:true,
    worlCopyJump:true,
    center: [22, 10],
    zoom: 4,
  });

  // Basemap
  const cartoMaps = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
      opacity: 0.9,
    },
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
      if (continent) {
        let idx = countryData.indexOf(dataChart[i].properties["Continent"]);
        if (idx < 0) {
          countryData.push(continent);
          continentEmissions[continent] = 0;
        }

        continentEmissions[continent] += co2;
      }
    }

    emissionsData = countryData.map((continent) =>
      Math.round(continentEmissions[continent] / 100000),
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
        if (feature.properties["Continent"] === "Asia") {
          return {
            fillOpacity: 0.4,
            fillColor: "#810f7c",
            color: "#810f7c",
            opacity: 0.3,
          };
        } else if (feature.properties["Continent"] === "Europe") {
          return {
            fillOpacity: 0.4,
            fillColor: "#8856a7",
            color: "#8856a7",
            opacity: 0.3,
          };
        } else if (feature.properties["Continent"] === "Africa") {
          return {
            fillOpacity: 0.4,
            fillColor: "#8c96c6",
            color: "#8c96c6",
            opacity: 0.3,
          };
        } else if (feature.properties["Continent"] === "North America") {
          return {
            fillOpacity: 0.4,
            fillColor: "#9ebcda",
            color: "#9ebcda",
            opacity: 0.3,
          };
        } else if (feature.properties["Continent"] === "South America") {
          return {
            fillOpacity: 0.4,
            fillColor: "#bfd3e6",
            color: "#bfd3e6",
            opacity: 0.3,
          };
        } else feature.properties["Continent"] === "Oceania";
        {
          return {
            fillOpacity: 0.4,
            fillColor: "#edf8fb",
            color: "#edf8fb",
            opacity: 0.3,
          };
        }
      },

      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b><h2>" +
            layer.feature.properties["Country"] +
            "</b></h2>" +
            "<b>2023 CO2 Emissions: </b>" +
            layer.feature.properties["Co2-Emissions"] +
            " tons",
        );
      },
    }).addTo(map);
    const bounds = emissionsGeojson.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [100, 80],
        maxZoom: 4,
      });
    }
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
        emissionsToMap(geojson);
      })

      .catch(function (error) {
        console.log(error);
      });
  }

  fecthData("./data/co2_emissions.geojson");
}
