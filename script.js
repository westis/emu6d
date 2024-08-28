// API Endpoints
const apiEndpointStine =
  "https://my3.raceresult.com/288150/RRPublish/data/splits?key=768ff798a15beb28bcae9991ffa5791f&bib=11";
const apiEndpointDavid =
  "https://my3.raceresult.com/288150/RRPublish/data/splits?key=768ff798a15beb28bcae9991ffa5791f&bib=8";
const apiEndpointKatjaLykke =
  "https://my3.raceresult.com/288150/RRPublish/data/splits?key=768ff798a15beb28bcae9991ffa5791f&bib=7";
const apiEndpointKatjaBjerre =
  "https://my3.raceresult.com/288150/RRPublish/data/splits?key=768ff798a15beb28bcae9991ffa5791f&bib=9";
const apiEndpointPeterTorjussen =
  "https://my3.raceresult.com/288150/RRPublish/data/splits?key=768ff798a15beb28bcae9991ffa5791f&bib=6";

let elapsedHoursStine = [];
let paceStine = [];
let elapsedHoursDavid = [];
let paceDavid = [];
let elapsedHoursKatjaLykke = [];
let paceKatjaLykke = [];
let elapsedHoursKatjaBjerre = [];
let paceKatjaBjerre = [];
let elapsedHoursPeterTorjussen = [];
let pacePeterTorjussen = [];

// Helper Functions
function convertGunToSeconds(gunTime) {
  const parts = gunTime.split(":");
  let seconds = 0;
  if (parts.length === 2) {
    seconds += parseFloat(parts[0]) * 60; // minutes to seconds
    seconds += parseFloat(parts[1].replace(",", ".")); // seconds
  } else if (parts.length === 3) {
    seconds += parseFloat(parts[0]) * 3600; // hours to seconds
    seconds += parseFloat(parts[1]) * 60; // minutes to seconds
    seconds += parseFloat(parts[2].replace(",", ".")); // seconds
  }
  return seconds;
}

function convertPaceToMinSecKm(secondsPerKm) {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function convertPaceToMinSecMile(secondsPerKm) {
  const secondsPerMile = secondsPerKm * 1.60934;
  const minutes = Math.floor(secondsPerMile / 60);
  const seconds = Math.round(secondsPerMile % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function convertHoursToHMM(decimalHours) {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Calculate World Record Paces in seconds per km
const womensWorldRecordPace = (144 * 3600) / 901.768; // seconds per km
const mensWorldRecordPace = (144 * 3600) / 1036.8; // seconds per km

// Define the sunrise and sunset times for the relevant days
const sunriseTimes = [
  { day: 1, time: 6 + 13 / 60 }, // Aug 27, 06:13
  { day: 7, time: 6 + 23 / 60 }, // Sep 1, 06:23
];

const sunsetTimes = [
  { day: 1, time: 20 + 30 / 60 }, // Aug 27, 20:30
  { day: 7, time: 20 + 17 / 60 }, // Sep 1, 20:17
];

// Function to interpolate the sunrise or sunset time for any given day
function interpolateTime(day, times) {
  const start = times[0];
  const end = times[1];
  return (
    start.time +
    ((day - start.day) / (end.day - start.day)) * (end.time - start.time)
  );
}

// Define the race start time and other constants
const raceStartHour = 12; // Race starts at 12:00 noon (hour 12 of the day)
const raceStartDay = new Date("2024-08-26T12:00:00+02:00").getDay();

// Function to determine if a given hour (elapsed time) is during dark hours
function isDarkHour(elapsedHour) {
  const totalHours = raceStartHour + elapsedHour; // Calculate actual time of day
  const day = Math.floor(totalHours / 24) + 1; // Calculate race day (1-based)
  const hourOfDay = totalHours % 24; // Calculate hour of the current day

  const sunrise = interpolateTime(day, sunriseTimes);
  const sunset = interpolateTime(day, sunsetTimes);

  return hourOfDay < sunrise || hourOfDay >= sunset;
}

// Chart.js Initialization
let ctx = document.getElementById("performanceChart").getContext("2d");
let performanceChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Stine Rex",
        data: [],
        borderColor: "#4BC0C0",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        pointHitRadius: 10, // Increase the hover area
      },
      {
        label: "David Stoltenborg",
        data: [],
        borderColor: "#FF6384",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        pointHitRadius: 10, // Increase the hover area
      },
      {
        label: "Katja Lykke",
        data: [],
        borderColor: "#36A2EB",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        pointHitRadius: 10, // Increase the hover area
      },
      {
        label: "Katja Bjerre",
        data: [],
        borderColor: "#9966FF",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        pointHitRadius: 10, // Increase the hover area
      },
      {
        label: "Peter Torjussen",
        data: [],
        borderColor: "#FF9F40",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        pointHitRadius: 10, // Increase the hover area
      },
      {
        label: "Women's World Record Pace",
        data: [],
        borderColor: "#FF5722",
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointHitRadius: 10, // Increase the hover area
        borderDash: [10, 5],
      },
      {
        label: "Men's World Record Pace",
        data: [],
        borderColor: "#2196F3",
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointHitRadius: 10, // Increase the hover area
        borderDash: [10, 5],
      },
      {
        label: "Camille Herron WR",
        data: [],
        borderColor: "#FFD700",
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointHitRadius: 10, // Increase the hover area
        borderDash: [5, 5],
      },
      {
        label: "Louise Kjellson - Nordic Record",
        data: [],
        borderColor: "#2ECC71", // Choose a distinct color
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointHitRadius: 10, // Increase the hover area
        borderDash: [5, 5],
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: "#333",
        titleColor: "#FFF",
        bodyColor: "#FFF",
        callbacks: {
          title: function (context) {
            return context[0].dataset.label;
          },
          label: function (context) {
            const label = context.dataset.label;
            const dataIndex = context.dataIndex;
            const dataPoint = context.raw;

            const elapsedTime = convertHoursToHMM(dataPoint.x);
            const pacePerKm = convertPaceToMinSecKm(dataPoint.y);
            const pacePerMile = convertPaceToMinSecMile(dataPoint.y);

            if (
              label === "Camille Herron WR" ||
              label === "Louise Kjellson - Nordic Record"
            ) {
              // Calculate distance covered based on elapsed time and pace
              const distanceKm = (dataPoint.x * 3600) / dataPoint.y;
              const distanceMile = distanceKm * 0.621371;

              return [
                `Elapsed Time: ${elapsedTime}`,
                `Distance: ${distanceKm.toFixed(2)} km (${distanceMile.toFixed(
                  2
                )} miles)`,
                `Pace: ${pacePerKm} min/km (${pacePerMile} min/mile)`,
              ];
            } else {
              const paceData = getPaceDataForLabel(label, dataIndex);
              if (paceData) {
                return [
                  `Elapsed Time: ${elapsedTime}`,
                  `Distance: ${paceData.distanceKm.toFixed(
                    2
                  )} km (${paceData.distanceMile.toFixed(2)} miles)`,
                  `Pace: ${pacePerKm} min/km (${pacePerMile} min/mile)`,
                ];
              } else {
                return `Pace: ${pacePerKm} min/km`;
              }
            }
          },
        },
      },
      legend: {
        labels: {
          color: "#FFF", // White color for legend text
        },
      },
      zoom: {
        limits: {
          x: { min: 0, max: 144, minRange: 1 },
          y: { min: 0, max: 700, minRange: 30 },
        },
        pan: {
          enabled: true,
          mode: "xy",
        },
        zoom: {
          wheel: {
            enabled: true, // Enable zooming with mouse wheel
          },
          pinch: {
            enabled: true, // Enable zooming with touch gestures
          },
          mode: "xy", // Allow zooming on both axes
        },
      },
      annotation: {
        // Add the annotation plugin configuration here
        annotations: {
          elapsedTimeLine: {
            type: "line",
            xMin: 0, // Initial value, will be updated
            xMax: 0,
            borderColor: "rgba(117, 255, 71, 0.5)", // Red color with some transparency
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              enabled: true,
              position: "end",
              content: "00:00", // Initial label, will be updated
              backgroundColor: "rgba(34, 139, 34, 0.8)",
              color: "white",
            },
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        position: "bottom",
        title: {
          display: true,
          text: "Elapsed Time (H:MM)",
          color: "#FFF",
        },
        ticks: {
          stepSize: 1, // Ensure a gridline every hour
          callback: function (value, index, values) {
            const totalTicks = values.length;
            let labelInterval = 48;

            if (totalTicks <= 24) {
              labelInterval = 2; // Show labels every 2 hours
            } else if (totalTicks <= 48) {
              labelInterval = 6; // Show labels every 6 hours
            } else if (totalTicks <= 72) {
              labelInterval = 12; // Show labels every 12 hours
            } else if (totalTicks <= 144) {
              labelInterval = 24; // Show labels every 24 hours
            }

            // Show labels based on the calculated interval
            if (value % labelInterval === 0) {
              return convertHoursToHMM(value);
            }
            return "";
          },
          color: "#DDD",
          maxRotation: 0,
          autoSkip: false, // Don't skip ticks
        },
        grid: {
          color: function (context) {
            return "#444"; // Consistent grid color
          },
          lineWidth: function (context) {
            return context.tick.value % 24 === 0 ? 2 : 1; // Thicker line every 24 hours
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Pace (Min:Sec/km)",
          color: "#FFF",
        },
        ticks: {
          callback: function (value) {
            return convertPaceToMinSecKm(value);
          },
          color: "#DDD",
        },
        grid: {
          color: "#444",
        },
        reverse: true,
      },
    },
  },
});

// Function to toggle datasets visibility based on checkboxes
function updateDatasetsVisibility() {
  const stineRexCheckbox = document.getElementById("stineRex").checked;
  const davidStoltenborgCheckbox =
    document.getElementById("davidStoltenborg").checked;
  const katjaLykkeCheckbox = document.getElementById("katjaLykke").checked;
  const katjaBjerreCheckbox = document.getElementById("katjaBjerre").checked;
  const peterTorjussenCheckbox =
    document.getElementById("peterTorjussen").checked;
  const camilleHerronWRCheckbox =
    document.getElementById("camilleHerronWR").checked;
  const womensWRPaceCheckbox = document.getElementById("womensWRPace").checked;
  const mensWRPaceCheckbox = document.getElementById("mensWRPace").checked;
  const louiseKjellsonCheckbox = document.getElementById(
    "louiseKjellsonNordicRecord"
  ).checked;

  // Toggle dataset visibility
  performanceChart.data.datasets[0].hidden = !stineRexCheckbox;
  performanceChart.data.datasets[1].hidden = !davidStoltenborgCheckbox;
  performanceChart.data.datasets[2].hidden = !katjaLykkeCheckbox;
  performanceChart.data.datasets[3].hidden = !katjaBjerreCheckbox;
  performanceChart.data.datasets[4].hidden = !peterTorjussenCheckbox;
  performanceChart.data.datasets[5].hidden = !womensWRPaceCheckbox;
  performanceChart.data.datasets[6].hidden = !mensWRPaceCheckbox;
  performanceChart.data.datasets[7].hidden = !camilleHerronWRCheckbox;
  performanceChart.data.datasets[8].hidden = !louiseKjellsonCheckbox;

  // Collect all visible pace values for the Y-axis (Runners + Record Comparisons)
  const visiblePaces = [];

  if (stineRexCheckbox)
    visiblePaces.push(...paceStine.map((p) => p.paceSecondsPerKm));
  if (davidStoltenborgCheckbox)
    visiblePaces.push(...paceDavid.map((p) => p.paceSecondsPerKm));
  if (katjaLykkeCheckbox)
    visiblePaces.push(...paceKatjaLykke.map((p) => p.paceSecondsPerKm));
  if (katjaBjerreCheckbox)
    visiblePaces.push(...paceKatjaBjerre.map((p) => p.paceSecondsPerKm));
  if (peterTorjussenCheckbox)
    visiblePaces.push(...pacePeterTorjussen.map((p) => p.paceSecondsPerKm));
  if (camilleHerronWRCheckbox)
    visiblePaces.push(
      ...performanceChart.data.datasets[7].data.map((d) => d.y)
    );
  if (womensWRPaceCheckbox) visiblePaces.push(womensWorldRecordPace);
  if (mensWRPaceCheckbox) visiblePaces.push(mensWorldRecordPace);

  // Calculate Y-axis based on the visible data with leeway
  if (visiblePaces.length > 0) {
    const minY = Math.min(...visiblePaces) - 30;
    const maxY = Math.max(...visiblePaces) + 60; // Extra room above the highest value

    performanceChart.options.scales.y.min = Math.max(minY, 0); // Ensure minY is not negative
    performanceChart.options.scales.y.max = maxY;
  } else {
    performanceChart.options.scales.y.min = 0; // Default min Y
    performanceChart.options.scales.y.max = 600; // Default max Y, adjust if necessary
  }

  // Collect all times for X-axis scaling (only from runners)
  const allTimes = [];
  if (stineRexCheckbox) allTimes.push(...elapsedHoursStine);
  if (davidStoltenborgCheckbox) allTimes.push(...elapsedHoursDavid);
  if (katjaLykkeCheckbox) allTimes.push(...elapsedHoursKatjaLykke);
  if (katjaBjerreCheckbox) allTimes.push(...elapsedHoursKatjaBjerre);
  if (peterTorjussenCheckbox) allTimes.push(...elapsedHoursPeterTorjussen);

  // Calculate X-axis based on runners' data
  const maxTime = Math.max(...allTimes);
  performanceChart.options.scales.x.min = 0;
  performanceChart.options.scales.x.max = Math.min(Math.ceil(maxTime + 1), 144);

  // Update the legend to only include visible datasets
  performanceChart.options.plugins.legend.labels.generateLabels = function (
    chart
  ) {
    return chart.data.datasets
      .filter((dataset) => !dataset.hidden)
      .map((dataset, i) => {
        return {
          text: dataset.label,
          fillStyle: dataset.borderColor,
          strokeStyle: dataset.borderColor,
          hidden: chart.getDatasetMeta(i).hidden,
          lineCap: dataset.borderCapStyle,
          lineDash: dataset.borderDash,
          lineDashOffset: dataset.borderDashOffset,
          lineJoin: dataset.borderJoinStyle,
          lineWidth: dataset.borderWidth,
          pointStyle: dataset.pointStyle,
          datasetIndex: i,
          fontColor: "#FFF", // Ensure white font color
        };
      });
  };

  // Update the chart
  performanceChart.update();
}

// Function to get pace data based on the dataset label
function getPaceDataForLabel(label, dataIndex) {
  switch (label) {
    case "Stine Rex":
      return paceStine[dataIndex];
    case "David Stoltenborg":
      return paceDavid[dataIndex];
    case "Katja Lykke":
      return paceKatjaLykke[dataIndex];
    case "Katja Bjerre":
      return paceKatjaBjerre[dataIndex];
    case "Peter Torjussen":
      return pacePeterTorjussen[dataIndex];
    default:
      return null;
  }
}

// Fetch data for specific bib and update arrays
async function fetchData(bib, runner) {
  let apiEndpoint = "";
  switch (runner) {
    case "Stine Rex":
      apiEndpoint = apiEndpointStine;
      break;
    case "David Stoltenborg":
      apiEndpoint = apiEndpointDavid;
      break;
    case "Katja Lykke":
      apiEndpoint = apiEndpointKatjaLykke;
      break;
    case "Katja Bjerre":
      apiEndpoint = apiEndpointKatjaBjerre;
      break;
    case "Peter Torjussen":
      apiEndpoint = apiEndpointPeterTorjussen;
      break;
    default:
      return;
  }

  const response = await fetch(apiEndpoint);
  const data = await response.json();
  const lapData = data.Splits.filter(
    (split) => split.Exists && split.Name !== "Start"
  );

  let elapsedHoursMap = {};

  lapData.forEach((lap, index) => {
    const totalElapsedSeconds = convertGunToSeconds(lap.Gun);
    const totalElapsedHours = totalElapsedSeconds / 3600;
    if (totalElapsedHours > 144) return;

    const totalDistanceKm = (index + 1) * 1.4405;
    const totalDistanceMile = totalDistanceKm * 0.621371;

    const avgPaceSecondsPerKm = totalElapsedSeconds / totalDistanceKm;
    const avgPaceSecondsPerMile = totalElapsedSeconds / totalDistanceMile;

    elapsedHoursMap[totalElapsedHours] = {
      distanceKm: totalDistanceKm,
      distanceMile: totalDistanceMile,
      paceSecondsPerKm: avgPaceSecondsPerKm,
      paceSecondsPerMile: avgPaceSecondsPerMile,
    };
  });

  let elapsedHours = Object.keys(elapsedHoursMap)
    .map(Number)
    .sort((a, b) => a - b);
  let pace = elapsedHours.map((time) => elapsedHoursMap[time]);

  switch (runner) {
    case "Stine Rex":
      elapsedHoursStine = elapsedHours;
      paceStine = pace;
      break;
    case "David Stoltenborg":
      elapsedHoursDavid = elapsedHours;
      paceDavid = pace;
      break;
    case "Katja Lykke":
      elapsedHoursKatjaLykke = elapsedHours;
      paceKatjaLykke = pace;
      break;
    case "Katja Bjerre":
      elapsedHoursKatjaBjerre = elapsedHours;
      paceKatjaBjerre = pace;
      break;
    case "Peter Torjussen":
      elapsedHoursPeterTorjussen = elapsedHours;
      pacePeterTorjussen = pace;
      break;
  }
}

// Load and parse CSV file for Camille Herron
function loadCSVData() {
  return new Promise((resolve, reject) => {
    Papa.parse("CamilleWR.csv", {
      download: true,
      header: true,
      complete: function (results) {
        const camilleWRData = results.data
          .map((row) => {
            if (!row["Race Time"] || !row["Distance"] || row["Lap"] === "")
              return null;
            const elapsedTimeHours =
              convertGunToSeconds(row["Race Time"]) / 3600;
            const distanceKm = parseFloat(row["Distance"]) * 1.60934;
            return {
              x: elapsedTimeHours,
              y: convertGunToSeconds(row["Race Time"]) / distanceKm,
            };
          })
          .filter((data) => data !== null);

        addCamilleWRDataset(camilleWRData);
        resolve(); // Resolve the promise after data is loaded
      },
      error: function (error) {
        reject(error); // Handle errors if any
      },
    });
  });
}

// Function to add Camille's World Record dataset to the chart
function addCamilleWRDataset(data) {
  performanceChart.data.datasets[7].data = data;
  performanceChart.update();
}

function loadLouiseKjellsonData() {
  return new Promise((resolve, reject) => {
    Papa.parse("LapsLouise.csv", {
      download: true,
      header: true,
      complete: function (results) {
        const louiseData = results.data
          .map((row, index) => {
            const elapsedTime = row["Elapsed Time"];
            const distanceKm = parseFloat(row["Km"]);
            const averagePace = row["Average Pace"];

            let elapsedTimeHours;

            // Determine the correct format of elapsed time
            if (elapsedTime.includes(":")) {
              const timeParts = elapsedTime.split(":");

              if (timeParts.length === 2) {
                // mm:ss format
                const minutes = parseFloat(timeParts[0]);
                const seconds = parseFloat(timeParts[1]);
                elapsedTimeHours = (minutes * 60 + seconds) / 3600;
              } else if (timeParts.length === 3) {
                // hh:mm:ss format
                const hours = parseFloat(timeParts[0]);
                const minutes = parseFloat(timeParts[1]);
                const seconds = parseFloat(timeParts[2]);
                elapsedTimeHours = hours + (minutes * 60 + seconds) / 3600;
              }
            } else {
              // In case of an invalid format, skip the data
              console.log(`Invalid format for elapsed time: ${elapsedTime}`);
              return null;
            }

            // Convert the average pace (mm:ss) to seconds per km
            const paceParts = averagePace.split(":");
            const paceSecondsPerKm =
              parseFloat(paceParts[0]) * 60 + parseFloat(paceParts[1]);

            return {
              x: elapsedTimeHours,
              y: paceSecondsPerKm,
            };
          })
          .filter((data) => data !== null); // Remove any null values (invalid rows)

        addLouiseKjellsonDataset(louiseData);
        resolve();
      },
      error: function (error) {
        console.log(`Error loading CSV data: ${error}`);
        reject(error);
      },
    });
  });
}

function addLouiseKjellsonDataset(data) {
  performanceChart.data.datasets[8].data = data;
  performanceChart.update();
}

// Update chart with correct data
function updateChart() {
  const maxTimes = [
    ...elapsedHoursStine,
    ...elapsedHoursDavid,
    ...elapsedHoursKatjaLykke,
    ...elapsedHoursKatjaBjerre,
    ...elapsedHoursPeterTorjussen,
  ];

  const maxTimeRunners = Math.max(...maxTimes);
  const maxTimeWR = 144;
  const maxTime = Math.max(maxTimeRunners, maxTimeWR);
  const xAxisMax = Math.min(Math.ceil(maxTime), 144);

  performanceChart.data.labels = Array.from(
    { length: xAxisMax + 1 },
    (_, i) => i
  );

  performanceChart.data.datasets[0].data = elapsedHoursStine.map(
    (time, index) => ({
      x: time,
      y: paceStine[index].paceSecondsPerKm,
    })
  );
  performanceChart.data.datasets[1].data = elapsedHoursDavid.map(
    (time, index) => ({
      x: time,
      y: paceDavid[index].paceSecondsPerKm,
    })
  );
  performanceChart.data.datasets[2].data = elapsedHoursKatjaLykke.map(
    (time, index) => ({
      x: time,
      y: paceKatjaLykke[index].paceSecondsPerKm,
    })
  );
  performanceChart.data.datasets[3].data = elapsedHoursKatjaBjerre.map(
    (time, index) => ({
      x: time,
      y: paceKatjaBjerre[index].paceSecondsPerKm,
    })
  );
  performanceChart.data.datasets[4].data = elapsedHoursPeterTorjussen.map(
    (time, index) => ({
      x: time,
      y: pacePeterTorjussen[index].paceSecondsPerKm,
    })
  );

  performanceChart.data.datasets[5].data = Array.from(
    { length: 145 },
    (_, i) => ({
      x: i,
      y: womensWorldRecordPace,
    })
  );
  performanceChart.data.datasets[6].data = Array.from(
    { length: 145 },
    (_, i) => ({
      x: i,
      y: mensWorldRecordPace,
    })
  );

  loadCSVData();

  const allPaces = [
    ...paceStine.map((p) => p.paceSecondsPerKm),
    ...paceDavid.map((p) => p.paceSecondsPerKm),
    ...paceKatjaLykke.map((p) => p.paceSecondsPerKm),
    ...paceKatjaBjerre.map((p) => p.paceSecondsPerKm),
    ...pacePeterTorjussen.map((p) => p.paceSecondsPerKm),
    womensWorldRecordPace,
    mensWorldRecordPace,
  ];
  const minY = Math.min(...allPaces) - 30;
  const maxY = Math.max(...allPaces) + 60;

  performanceChart.options.scales.y.min = minY;
  performanceChart.options.scales.y.max = maxY;

  performanceChart.options.scales.y.ticks.stepSize = 30;
  performanceChart.options.scales.y.ticks.callback = function (value) {
    const minutes = Math.floor(value / 60);
    const seconds = Math.round(value % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  performanceChart.options.scales.x.min = 0;
  performanceChart.options.scales.x.max = xAxisMax;

  // Ensure ticks are placed every 24 hours, and show as H:MM
  performanceChart.options.scales.x.ticks = {
    stepSize: 1,
    callback: function (value) {
      const hour = Math.floor(value);
      if (hour % 24 === 0 || hour % 6 === 0) {
        return convertHoursToHMM(value); // Display major ticks at every 6 and 24 hours
      } else {
        return ""; // Hide minor tick labels
      }
    },
    autoSkip: false, // Do not skip ticks
    maxRotation: 0, // Keep labels horizontal
    color: "#DDD", // Ticks color
  };

  // Ensure grid lines are consistent, with specific handling for night hours
  performanceChart.options.scales.x.grid.color = function (context) {
    if (isDarkHour(context.tick.value)) {
      return "#000"; // Darker color for night hours
    } else if (context.tick.value % 24 === 0) {
      return "rgba(255, 255, 255, 0.8)"; // Brighter color for 24-hour lines
    } else {
      return "#444"; // Normal color for other hours
    }
  };

  performanceChart.options.scales.x.grid.lineWidth = function (context) {
    if (context.tick.value % 24 === 0) {
      return 2; // Thicker line for 24-hour intervals
    } else if (context.tick.value % 6 === 0) {
      return 1; // Slightly thinner line for 6-hour intervals
    } else {
      return 1; // Normal line width for other hours
    }
  };

  performanceChart.options.scales.x.grid.borderDash = function (context) {
    if (context.tick.value % 6 === 0 && context.tick.value % 24 !== 0) {
      return [5, 5]; // Dashed lines for 6-hour intervals, excluding 24-hour lines
    }
    return []; // Solid lines otherwise
  };

  // Add debugging for zoom hooks
  performanceChart.options.plugins.zoom.zoom.onZoomProgress = function ({
    chart,
  }) {
    const minTime = chart.scales.x.min;
    const maxTime = chart.scales.x.max;
    updateXLabels(minTime, maxTime);
  };

  performanceChart.options.plugins.zoom.zoom.onZoomComplete = function ({
    chart,
  }) {
    const minTime = chart.scales.x.min;
    const maxTime = chart.scales.x.max;
    updateXLabels(minTime, maxTime);
  };

  // Ensure ticks are placed every 24 hours, and show as H:MM
  performanceChart.options.scales.x.ticks = {
    stepSize: 1,
    callback: function (value) {
      const hour = Math.floor(value);
      if (hour % 24 === 0 || hour % 6 === 0) {
        return convertHoursToHMM(value); // Display major ticks at every 6 and 24 hours
      } else {
        return ""; // Hide minor tick labels
      }
    },
    autoSkip: false, // Do not skip ticks
    maxRotation: 0, // Keep labels horizontal
    color: "#DDD", // Ticks color
  };

  // Ensure grid lines are consistent, with specific handling for night hours
  performanceChart.options.scales.x.grid.color = function (context) {
    if (isDarkHour(context.tick.value)) {
      return "#000"; // Darker color for night hours
    } else if (context.tick.value % 24 === 0) {
      return "rgba(255, 255, 255, 0.8)"; // Brighter color for 24-hour lines
    } else {
      return "#444"; // Normal color for other hours
    }
  };

  performanceChart.options.scales.x.grid.lineWidth = function (context) {
    if (context.tick.value % 24 === 0) {
      return 2; // Thicker line for 24-hour intervals
    } else if (context.tick.value % 6 === 0) {
      return 1; // Slightly thinner line for 6-hour intervals
    } else {
      return 1; // Normal line width for other hours
    }
  };

  performanceChart.update();
}

function resetYAxis() {
  const visiblePaces = [];

  const minX = performanceChart.scales.x.min;
  const maxX = performanceChart.scales.x.max;

  // Filter and collect paces for each runner within the visible time range
  function filterPacesWithinTimeRange(elapsedHours, paces) {
    return paces
      .filter(
        (_, index) => elapsedHours[index] >= minX && elapsedHours[index] <= maxX
      )
      .map((p) => p.paceSecondsPerKm);
  }

  if (document.getElementById("stineRex").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursStine, paceStine)
    );
  if (document.getElementById("davidStoltenborg").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursDavid, paceDavid)
    );
  if (document.getElementById("katjaLykke").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursKatjaLykke, paceKatjaLykke)
    );
  if (document.getElementById("katjaBjerre").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursKatjaBjerre, paceKatjaBjerre)
    );
  if (document.getElementById("peterTorjussen").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(
        elapsedHoursPeterTorjussen,
        pacePeterTorjussen
      )
    );

  // Filter and collect paces for Camille Herron WR within the visible time range
  if (document.getElementById("camilleHerronWR").checked) {
    visiblePaces.push(
      ...performanceChart.data.datasets[7].data
        .filter((d) => d.x >= minX && d.x <= maxX)
        .map((d) => d.y)
    );
  }

  // Filter and collect paces for Louise Kjellson - Nordic Record within the visible time range
  if (document.getElementById("louiseKjellsonNordicRecord").checked) {
    visiblePaces.push(
      ...performanceChart.data.datasets[8].data
        .filter((d) => d.x >= minX && d.x <= maxX)
        .map((d) => d.y)
    );
  }

  // Collect World Record Paces within the visible time range
  if (document.getElementById("womensWRPace").checked && maxX >= minX) {
    visiblePaces.push(womensWorldRecordPace);
  }
  if (document.getElementById("mensWRPace").checked && maxX >= minX) {
    visiblePaces.push(mensWorldRecordPace);
  }

  // Calculate Y-axis limits based on visible data within the X range
  if (visiblePaces.length > 0) {
    const minY = Math.min(...visiblePaces) - 30;
    const maxY = Math.max(...visiblePaces) + 60;

    // Set the min and max for the Y-axis scale
    performanceChart.options.scales.y.min = Math.max(minY, 0); // Ensure no negative min
    performanceChart.options.scales.y.max = maxY;
  } else {
    performanceChart.options.scales.y.min = 0;
    performanceChart.options.scales.y.max = 600; // Default values if nothing is selected
  }

  // Update the chart to reflect changes
  performanceChart.update();
}

// Event listeners for checkboxes
// Event listeners for checkboxes (trigger Y-axis reset when a dataset is toggled)
document
  .getElementById("stineRex")
  .addEventListener("change", updateDatasetsVisibility);
document
  .getElementById("davidStoltenborg")
  .addEventListener("change", updateDatasetsVisibility);
document
  .getElementById("katjaLykke")
  .addEventListener("change", updateDatasetsVisibility);
document
  .getElementById("katjaBjerre")
  .addEventListener("change", updateDatasetsVisibility);
document
  .getElementById("peterTorjussen")
  .addEventListener("change", updateDatasetsVisibility);
document
  .getElementById("camilleHerronWR")
  .addEventListener("change", updateDatasetsVisibility);
document
  .getElementById("louiseKjellsonNordicRecord")
  .addEventListener("change", updateDatasetsVisibility);

document
  .getElementById("womensWRPace")
  .addEventListener("change", updateDatasetsVisibility);
document
  .getElementById("mensWRPace")
  .addEventListener("change", updateDatasetsVisibility);

updateDatasetsVisibility();

function setXScale(min, max) {
  performanceChart.options.scales.x.min = min;
  performanceChart.options.scales.x.max = max;

  // Recalculate the Y scale based on the visible time range
  adjustYScaleForVisibleXRange(min, max);

  performanceChart.update();
}

function adjustYScaleForVisibleXRange(minTime, maxTime) {
  const visiblePaces = [];

  // Filter and collect paces for each runner within the visible time range
  function filterPacesWithinTimeRange(elapsedHours, paces) {
    return paces
      .filter(
        (_, index) =>
          elapsedHours[index] >= minTime && elapsedHours[index] <= maxTime
      )
      .map((p) => p.paceSecondsPerKm);
  }

  if (document.getElementById("stineRex").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursStine, paceStine)
    );
  if (document.getElementById("davidStoltenborg").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursDavid, paceDavid)
    );
  if (document.getElementById("katjaLykke").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursKatjaLykke, paceKatjaLykke)
    );
  if (document.getElementById("katjaBjerre").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursKatjaBjerre, paceKatjaBjerre)
    );
  if (document.getElementById("peterTorjussen").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(
        elapsedHoursPeterTorjussen,
        pacePeterTorjussen
      )
    );

  // Include Louise Kjellson's data if checked
  if (document.getElementById("louiseKjellsonNordicRecord").checked) {
    visiblePaces.push(
      ...performanceChart.data.datasets[8].data
        .filter((d) => d.x >= minTime && d.x <= maxTime)
        .map((d) => d.y)
    );
  }

  // Include Camille Herron's data if checked
  if (document.getElementById("camilleHerronWR").checked) {
    visiblePaces.push(
      ...performanceChart.data.datasets[7].data
        .filter((d) => d.x >= minTime && d.x <= maxTime)
        .map((d) => d.y)
    );
  }

  // Include world record paces within the visible time range
  if (document.getElementById("womensWRPace").checked && maxTime >= minTime) {
    visiblePaces.push(womensWorldRecordPace);
  }
  if (document.getElementById("mensWRPace").checked && maxTime >= minTime) {
    visiblePaces.push(mensWorldRecordPace);
  }

  // Calculate new Y-axis limits based on visible data
  if (visiblePaces.length > 0) {
    const minY = Math.min(...visiblePaces) - 30;
    const maxY = Math.max(...visiblePaces) + 60;

    performanceChart.options.scales.y.min = Math.max(minY, 0); // Ensure no negative min
    performanceChart.options.scales.y.max = maxY;
  } else {
    performanceChart.options.scales.y.min = 0;
    performanceChart.options.scales.y.max = 600; // Default values if nothing is selected
  }

  performanceChart.update();
}

function updateXLabels(minTime, maxTime) {
  const chartWidth = performanceChart.width;
  const visibleRange = maxTime - minTime;

  // Estimate the space available for each label in pixels
  const pixelsPerLabel = 50; // Adjust this value based on your needs
  const maxLabels = Math.floor(chartWidth / pixelsPerLabel);

  let labelInterval = visibleRange / maxLabels; // Dynamic label interval based on space

  // Adjust labelInterval to the nearest common value for hours
  if (labelInterval <= 0.25) {
    labelInterval = 0.25; // Show labels every 15 minutes
  } else if (labelInterval <= 0.5) {
    labelInterval = 0.5; // Show labels every 30 minutes
  } else if (labelInterval <= 1) {
    labelInterval = 1; // Show labels every hour
  } else if (labelInterval <= 2) {
    labelInterval = 2; // Show labels every 2 hours
  } else if (labelInterval <= 6) {
    labelInterval = 6; // Show labels every 6 hours
  } else if (labelInterval <= 12) {
    labelInterval = 12; // Show labels every 12 hours
  } else {
    labelInterval = 24; // Show labels every 24 hours
  }

  performanceChart.options.scales.x.ticks.callback = function (
    value,
    index,
    values
  ) {
    if (value % labelInterval === 0) {
      return convertHoursToHMM(value);
    }
    return "";
  };

  performanceChart.update();
}

document.getElementById("zoom6h").addEventListener("click", function () {
  const maxTime = Math.max(...elapsedHoursStine);
  const minTime = Math.max(Math.floor(maxTime - 6), 0);
  const minHour = Math.floor(minTime);
  const extendedMaxTime = Math.ceil(maxTime / 1) * 1; // Extend to the nearest full hour

  if (maxTime < 6) {
    setXScale(0, 6); // Show the first 6 hours from start
  } else {
    setXScale(minHour, extendedMaxTime);
  }
  updateXLabels(minHour, extendedMaxTime);
});

document.getElementById("zoom24h").addEventListener("click", function () {
  const maxTime = Math.max(...elapsedHoursStine);
  const minTime = Math.max(Math.floor(maxTime - 24), 0);
  const minHour = Math.floor(minTime);
  const extendedMaxTime = Math.ceil(maxTime / 1) * 1; // Extend to the nearest full hour

  if (maxTime < 24) {
    setXScale(0, 24); // Show the first 24 hours from start
  } else {
    setXScale(minHour, extendedMaxTime);
  }
  updateXLabels(minHour, extendedMaxTime);
});

document.getElementById("zoomAll").addEventListener("click", function () {
  setXScale(0, 144); // Always show the entire 144 hours
  updateXLabels(0, 144);
});

document.getElementById("resetX").addEventListener("click", function () {
  const maxTime = Math.max(
    ...elapsedHoursStine,
    ...elapsedHoursDavid,
    ...elapsedHoursKatjaLykke,
    ...elapsedHoursKatjaBjerre,
    ...elapsedHoursPeterTorjussen
  );
  const xAxisMax = Math.ceil(maxTime / 1) * 1; // Extend to the nearest full hour

  // Reset the X-axis scale to show the entire data range from 0 to the maximum time
  performanceChart.options.scales.x.min = 0;
  performanceChart.options.scales.x.max = xAxisMax > 144 ? 144 : xAxisMax;

  // Recalculate the Y scale based on the full X-axis range
  adjustYScaleForVisibleXRange(0, performanceChart.options.scales.x.max);

  // Ensure the zoom and pan settings are not disabled
  performanceChart.options.plugins.zoom = {
    limits: {
      x: { min: 0, max: 144, minRange: 1 },
      y: { min: 0, max: 700, minRange: 30 },
    },
    pan: {
      enabled: true,
      mode: "xy",
    },
    zoom: {
      wheel: {
        enabled: true, // Enable zooming with mouse wheel
      },
      pinch: {
        enabled: true, // Enable zooming with touch gestures
      },
      mode: "xy", // Allow zooming on both axes
      onZoomProgress({ chart }) {
        const minTime = chart.scales.x.min;
        const maxTime = chart.scales.x.max;
        updateXLabels(minTime, maxTime);
      },
      onZoomComplete({ chart }) {
        const minTime = chart.scales.x.min;
        const maxTime = chart.scales.x.max;
        updateXLabels(minTime, maxTime);
      },
    },
  };

  // Use onUpdate to capture all changes, including zooming and panning
  performanceChart.options.onUpdate = function () {
    const minTime = performanceChart.scales.x.min;
    const maxTime = performanceChart.scales.x.max;
    updateXLabels(minTime, maxTime);
  };

  // Update the chart with the reset settings
  performanceChart.update();
  updateXLabels(minHour, extendedMaxTime);
});

function setYScale(min, max) {
  performanceChart.options.scales.y.min = min;
  performanceChart.options.scales.y.max = max;
  performanceChart.options.plugins.zoom.pan = {
    enabled: true,
    mode: "y", // Ensure Y-axis panning is enabled
  };
  performanceChart.update();
}

document.getElementById("tightY").addEventListener("click", function () {
  const minY =
    Math.min(
      ...paceStine.map((p) => p.paceSecondsPerKm),
      ...paceDavid.map((p) => p.paceSecondsPerKm)
    ) - 30;
  const maxY =
    Math.max(
      ...paceStine.map((p) => p.paceSecondsPerKm),
      ...paceDavid.map((p) => p.paceSecondsPerKm)
    ) + 30;
  setYScale(minY, maxY);
});

document.getElementById("resetY").addEventListener("click", function () {
  resetYAxis(); // Reset Y-axis after the initial load using the same logic as the button
});

function formatTime(timeInSeconds) {
  const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(timeInSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

const startTime = new Date("2024-08-26T12:00:00+02:00").getTime();
const endTime = new Date("2024-09-01T12:00:00+02:00").getTime();

function updateClockAndCountdown() {
  const now = new Date().getTime();
  const elapsedSeconds = Math.floor((now - startTime) / 1000);
  const remainingSeconds = Math.floor((endTime - now) / 1000);

  document.getElementById("liveClock").textContent = `Elapsed: ${formatTime(
    elapsedSeconds
  )}`;
  document.getElementById(
    "countdownTimer"
  ).textContent = `Remaining: ${formatTime(remainingSeconds)}`;

  if (remainingSeconds <= 0) {
    const liveUpdateElement = document.getElementById("liveUpdateStatus");
    liveUpdateElement.textContent = "Event Finished";
    liveUpdateElement.style.color = "red";
    document.getElementById("loadingDots").style.display = "none"; // Stop the animation
  }
}

// Function to adjust the zoom mode based on modifier keys
function updateZoomMode(event) {
  if (event.ctrlKey) {
    performanceChart.options.plugins.zoom.zoom.mode = "x";
  } else if (event.shiftKey) {
    performanceChart.options.plugins.zoom.zoom.mode = "y";
  } else {
    performanceChart.options.plugins.zoom.zoom.mode = "xy";
  }
}

// Add event listeners for the modifier keys
document
  .getElementById("performanceChart")
  .addEventListener("wheel", updateZoomMode);

setInterval(updateClockAndCountdown, 1000);

// Fullscreen functionality
document.getElementById("fullscreenBtn").addEventListener("click", function () {
  const chartContainer = document.getElementById("chart-container");
  const btn = document.getElementById("fullscreenBtn");

  if (!document.fullscreenElement) {
    chartContainer.classList.add("fullscreen");
    btn.textContent = "Exit Fullscreen";
    chartContainer.requestFullscreen().catch((err) => {
      alert(`Error attempting to enable fullscreen mode: ${err.message}`);
    });
  } else {
    chartContainer.classList.remove("fullscreen");
    btn.textContent = "Fullscreen";
    document.exitFullscreen();
  }

  // Force Chart.js to resize the chart
  performanceChart.resize();
});

// Listen for the fullscreen change event
document.addEventListener("fullscreenchange", function () {
  const btn = document.getElementById("fullscreenBtn");
  const chartContainer = document.getElementById("chart-container");

  if (!document.fullscreenElement) {
    // Fullscreen mode is exited
    chartContainer.classList.remove("fullscreen");
    btn.textContent = "Fullscreen";
  } else {
    // Fullscreen mode is entered
    chartContainer.classList.add("fullscreen");
    btn.textContent = "Exit Fullscreen";
  }

  // Force Chart.js to resize the chart
  performanceChart.resize();
});

function getCurrentZoomAndPan() {
  return {
    x: {
      min: performanceChart.options.scales.x.min,
      max: performanceChart.options.scales.x.max,
    },
    y: {
      min: performanceChart.options.scales.y.min,
      max: performanceChart.options.scales.y.max,
    },
  };
}

// Function to update the elapsed time annotation line
function updateElapsedTimeAnnotation() {
  const now = new Date().getTime();
  const elapsedSeconds = Math.floor((now - startTime) / 1000);
  const elapsedHours = elapsedSeconds / 3600;

  const isActive = now <= endTime; // Check if the event is still active

  const labelBackgroundColor = isActive
    ? "rgba(34, 139, 34, 0.8)" // Dark green with 80% opacity
    : "rgba(255, 0, 0, 0.8)"; // Red with 80% opacity

  if (
    performanceChart.options.plugins.annotation &&
    performanceChart.options.plugins.annotation.annotations &&
    performanceChart.options.plugins.annotation.annotations.elapsedTimeLine
  ) {
    performanceChart.options.plugins.annotation.annotations.elapsedTimeLine.xMin =
      elapsedHours;
    performanceChart.options.plugins.annotation.annotations.elapsedTimeLine.xMax =
      elapsedHours;
    performanceChart.options.plugins.annotation.annotations.elapsedTimeLine.label.content = `${convertHoursToHMM(
      elapsedHours
    )}`;
    performanceChart.options.plugins.annotation.annotations.elapsedTimeLine.label.backgroundColor =
      labelBackgroundColor;
  } else {
    console.error("ElapsedTimeLine annotation not found in performanceChart.");
  }

  if (
    relativePerformanceChart.options.plugins.annotation &&
    relativePerformanceChart.options.plugins.annotation.annotations &&
    relativePerformanceChart.options.plugins.annotation.annotations
      .elapsedTimeLine
  ) {
    relativePerformanceChart.options.plugins.annotation.annotations.elapsedTimeLine.xMin =
      elapsedHours;
    relativePerformanceChart.options.plugins.annotation.annotations.elapsedTimeLine.xMax =
      elapsedHours;
    relativePerformanceChart.options.plugins.annotation.annotations.elapsedTimeLine.label.content = `${convertHoursToHMM(
      elapsedHours
    )}`;
    relativePerformanceChart.options.plugins.annotation.annotations.elapsedTimeLine.label.backgroundColor =
      labelBackgroundColor;
  } else {
    console.error(
      "ElapsedTimeLine annotation not found in relativePerformanceChart."
    );
  }

  // Update both charts
  performanceChart.update();
  relativePerformanceChart.update();
}

function applyZoomAndPan(savedState) {
  performanceChart.options.scales.x.min = savedState.x.min;
  performanceChart.options.scales.x.max = savedState.x.max;
  performanceChart.options.scales.y.min = savedState.y.min;
  performanceChart.options.scales.y.max = savedState.y.max;

  performanceChart.update();
}

// Check if the race has ended
function hasRaceEnded() {
  const now = new Date().getTime();
  return now > endTime;
}

let zoomAndPanState;

// Fetch data for all runners and update charts
function updateAllData() {
  if (hasRaceEnded()) {
    // Stop fetching data if the race has ended
    return;
  }

  // Save current zoom and pan state
  zoomAndPanState = getCurrentZoomAndPan();

  Promise.all([
    fetchData(11, "Stine Rex"),
    fetchData(8, "David Stoltenborg"),
    fetchData(7, "Katja Lykke"),
    fetchData(9, "Katja Bjerre"),
    fetchData(6, "Peter Torjussen"),
  ]).then(() => {
    updateChart();
    updateDatasetsVisibility();
    resetYAxis();
    updateRelativeChart();
    updateElapsedTimeAnnotation(); // Update the annotation line

    // Reapply zoom and pan settings
    applyZoomAndPan(zoomAndPanState);
  });
}

// Initial data load and start periodic updates
function initialLoad() {
  Promise.all([
    fetchData(11, "Stine Rex"),
    fetchData(8, "David Stoltenborg"),
    fetchData(7, "Katja Lykke"),
    fetchData(9, "Katja Bjerre"),
    fetchData(6, "Peter Torjussen"),
    loadCSVData(), // Load Camille Herron WR data here
    loadLouiseKjellsonData(), // Load Louise Kjellson data
  ]).then(() => {
    // Update main performance chart data
    updateChart();
    updateDatasetsVisibility();
    resetYAxis();

    // Calculate the relative distance after all data has been fetched
    calculateRelativeDistance();

    // Initialize and update the relative chart
    updateRelativeChart();

    updateElapsedTimeAnnotation();

    // Capture the initial zoom and pan state
    zoomAndPanState = getCurrentZoomAndPan();

    // Start periodic updates if the event is not finished
    if (!hasRaceEnded()) {
      setInterval(() => {
        console.log("Updating all data...");
        updateAllData();
      }, 60000);
    }
  });
}

// Call the initialLoad function to start the process
initialLoad();
