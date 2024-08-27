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
      },
      {
        label: "David Stoltenborg",
        data: [],
        borderColor: "#FF6384",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
      },
      {
        label: "Katja Lykke",
        data: [],
        borderColor: "#36A2EB",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
      },
      {
        label: "Katja Bjerre",
        data: [],
        borderColor: "#9966FF",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
      },
      {
        label: "Peter Torjussen",
        data: [],
        borderColor: "#FF9F40",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
      },
      {
        label: "Women's World Record Pace",
        data: [],
        borderColor: "#FF5722",
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        borderDash: [10, 5],
      },
      {
        label: "Men's World Record Pace",
        data: [],
        borderColor: "#2196F3",
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        borderDash: [10, 5],
      },
      {
        label: "Camille Herron WR",
        data: [],
        borderColor: "#FFD700",
        borderWidth: 2,
        fill: false,
        borderDash: [5, 5],
        pointRadius: 0,
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
            const paceData = getPaceDataForLabel(
              context.dataset.label,
              context.dataIndex
            );
            if (paceData) {
              const elapsedTime = convertHoursToHMM(context.raw.x);
              const pacePerKm = convertPaceToMinSecKm(
                paceData.paceSecondsPerKm
              );
              const pacePerMile = convertPaceToMinSecMile(
                paceData.paceSecondsPerKm
              );
              return [
                `Elapsed Time: ${elapsedTime}`,
                `Distance: ${paceData.distanceKm.toFixed(
                  2
                )} km (${paceData.distanceMile.toFixed(2)} miles)`,
                `Pace: ${pacePerKm} min/km (${pacePerMile} min/mile)`,
              ];
            } else {
              const pacePerKm = convertPaceToMinSecKm(context.raw.y);
              return `Pace: ${pacePerKm} min/km`;
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
          callback: function (value) {
            return convertHoursToHMM(value);
          },
          stepSize: 1,
          color: "#DDD",
        },
        grid: {
          color: function (context) {
            if (context.tick.value % 6 === 0) {
              return "#555";
            } else if (context.tick.value % 1 === 0) {
              return "#444";
            }
          },
          lineWidth: function (context) {
            return context.tick.value % 6 === 0 ? 2 : 1;
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

  // Toggle dataset visibility
  performanceChart.data.datasets[0].hidden = !stineRexCheckbox;
  performanceChart.data.datasets[1].hidden = !davidStoltenborgCheckbox;
  performanceChart.data.datasets[2].hidden = !katjaLykkeCheckbox;
  performanceChart.data.datasets[3].hidden = !katjaBjerreCheckbox;
  performanceChart.data.datasets[4].hidden = !peterTorjussenCheckbox;
  performanceChart.data.datasets[5].hidden = !womensWRPaceCheckbox;
  performanceChart.data.datasets[6].hidden = !mensWRPaceCheckbox;
  performanceChart.data.datasets[7].hidden = !camilleHerronWRCheckbox;

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
  Papa.parse("CamilleWR.csv", {
    download: true,
    header: true,
    complete: function (results) {
      const camilleWRData = results.data
        .map((row) => {
          if (!row["Race Time"] || !row["Distance"] || row["Lap"] === "")
            return null;
          const elapsedTimeHours = convertGunToSeconds(row["Race Time"]) / 3600;
          const distanceKm = parseFloat(row["Distance"]) * 1.60934;
          return {
            x: elapsedTimeHours,
            y: convertGunToSeconds(row["Race Time"]) / distanceKm,
          };
        })
        .filter((data) => data !== null);

      addCamilleWRDataset(camilleWRData);
    },
  });
}

// Function to add Camille's World Record dataset to the chart
function addCamilleWRDataset(data) {
  performanceChart.data.datasets[7].data = data;
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

  performanceChart.options.scales.x.grid.color = function (context) {
    if (context.tick.value % 24 === 0) {
      return "#555";
    } else if (context.tick.value % 1 === 0) {
      return "#444";
    }
  };
  performanceChart.options.scales.x.grid.lineWidth = function (context) {
    return context.tick.value % 24 === 0 ? 2 : 1;
  };

  performanceChart.update();
}

function resetYAxis() {
  // Collect all visible pace values for the Y-axis (Runners + Record Comparisons)
  const visiblePaces = [];

  if (document.getElementById("stineRex").checked)
    visiblePaces.push(...paceStine.map((p) => p.paceSecondsPerKm));
  if (document.getElementById("davidStoltenborg").checked)
    visiblePaces.push(...paceDavid.map((p) => p.paceSecondsPerKm));
  if (document.getElementById("katjaLykke").checked)
    visiblePaces.push(...paceKatjaLykke.map((p) => p.paceSecondsPerKm));
  if (document.getElementById("katjaBjerre").checked)
    visiblePaces.push(...paceKatjaBjerre.map((p) => p.paceSecondsPerKm));
  if (document.getElementById("peterTorjussen").checked)
    visiblePaces.push(...pacePeterTorjussen.map((p) => p.paceSecondsPerKm));
  if (document.getElementById("camilleHerronWR").checked)
    visiblePaces.push(
      ...performanceChart.data.datasets[7].data.map((d) => d.y)
    );
  if (document.getElementById("womensWRPace").checked)
    visiblePaces.push(womensWorldRecordPace);
  if (document.getElementById("mensWRPace").checked)
    visiblePaces.push(mensWorldRecordPace);

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

  // Update the chart
  performanceChart.update();
}

function initialLoad() {
  Promise.all([
    fetchData(11, "Stine Rex"),
    fetchData(8, "David Stoltenborg"),
    fetchData(7, "Katja Lykke"),
    fetchData(9, "Katja Bjerre"),
    fetchData(6, "Peter Torjussen"),
  ]).then(() => {
    loadCSVData(); // Load Camille Herron WR data here
    updateChart(); // Populate the chart with data
    updateDatasetsVisibility(); // Ensure visibility is set based on checkboxes
    resetYAxis(); // Set the initial Y scale correctly
  });
}

initialLoad(); // Call the function on initial load

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
  .getElementById("womensWRPace")
  .addEventListener("change", updateDatasetsVisibility);
document
  .getElementById("mensWRPace")
  .addEventListener("change", updateDatasetsVisibility);

updateDatasetsVisibility();

function setXScale(min, max) {
  performanceChart.options.scales.x.min = min;
  performanceChart.options.scales.x.max = max;
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
});

document.getElementById("zoomAll").addEventListener("click", function () {
  setXScale(0, 144); // Always show the entire 144 hours
});

document.getElementById("resetX").addEventListener("click", function () {
  const maxTime = Math.max(...elapsedHoursStine);
  const xAxisMax = Math.ceil(maxTime / 1) * 1; // Extend to the nearest full hour
  setXScale(0, xAxisMax); // Reset to show from 0 up to the extended max time
  performanceChart.options.plugins.zoom = {}; // Disable panning
  performanceChart.update();
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
}

setInterval(updateClockAndCountdown, 1000);

// Call resetYAxis after the chart data is initially loaded
Promise.all([
  fetchData(11, "Stine Rex"),
  fetchData(8, "David Stoltenborg"),
  fetchData(7, "Katja Lykke"),
  fetchData(9, "Katja Bjerre"),
  fetchData(6, "Peter Torjussen"),
]).then(() => {
  updateChart(); // Populate the chart with data
  updateDatasetsVisibility(); // Ensure visibility is set based on checkboxes
  resetYAxis(); // Set the initial Y scale correctly
});
