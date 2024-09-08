// Set runner names and bib numbers
const runner1Name = "Matthieu Bonne";
const runner1Bib = 1038;
const runner2Name = "Bartosz Fudali";
const runner2Bib = 56;
const runner3Name = "Zsuzsanna Maráz";
const runner3Bib = 97;
const runner4Name = "Viktoria Brown";
const runner4Bib = 6;
const runner5Name = "Beda Szabolcs";
const runner5Bib = 27;
const runner6Name = "Andrea Mehner";
const runner6Bib = 29;
const runnerCompare1Name = "Camille Herron";
const runnerCompare2Name = "";

// Populate checkboxes dynamically
const runners = [
  { id: "runner1", name: runner1Name, checked: true },
  { id: "runner2", name: runner2Name, checked: false },
  { id: "runner3", name: runner3Name, checked: false },
  { id: "runner4", name: runner4Name, checked: false },
  { id: "runner5", name: runner5Name, checked: false },
  { id: "runner6", name: runner6Name, checked: false },
];

const records = [
  { id: "runnerCompare1", name: runnerCompare1Name, checked: true },
  { id: "runnerCompare2", name: runnerCompare2Name, checked: false },
  { id: "womensWRPace", name: "Women's WR Pace", checked: false },
  { id: "mensWRPace", name: "Men's WR Pace", checked: false },
];

// Populate checkboxes for runners and records
function populateCheckboxes() {
  const runnersContainer = document.getElementById("runnersCheckboxGroup");
  const recordsContainer = document.getElementById("recordsCheckboxGroup");

  runners.forEach(({ id, name, checked }) => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" id="${id}" ${
      checked ? "checked" : ""
    } />${name}`;
    runnersContainer.appendChild(label);
  });

  records.forEach(({ id, name, checked }) => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" id="${id}" ${
      checked ? "checked" : ""
    } />${name}`;
    recordsContainer.appendChild(label);
  });
}

// Call this function before initializing the chart
populateCheckboxes();

// API Endpoints
const apiEndpointRunner1 = `https://main--ultramarathonse.netlify.app/api/emu?bib=${runner1Bib}`;
const apiEndpointRunner2 = `https://main--ultramarathonse.netlify.app/api/emu?bib=${runner2Bib}`;
const apiEndpointRunner3 = `https://main--ultramarathonse.netlify.app/api/emu?bib=${runner3Bib}`;
const apiEndpointRunner4 = `https://main--ultramarathonse.netlify.app/api/emu?bib=${runner4Bib}`;
const apiEndpointRunner5 = `https://main--ultramarathonse.netlify.app/api/emu?bib=${runner5Bib}`;
const apiEndpointRunner6 = `https://main--ultramarathonse.netlify.app/api/emu?bib=${runner6Bib}`;

// Elapsed hours and pace arrays for each runner
let elapsedHoursRunner1 = [];
let paceRunner1 = [];
let elapsedHoursRunner2 = [];
let paceRunner2 = [];
let elapsedHoursRunner3 = [];
let paceRunner3 = [];
let elapsedHoursRunner4 = [];
let paceRunner4 = [];
let elapsedHoursRunner5 = [];
let paceRunner5 = [];
let elapsedHoursRunner6 = [];
let paceRunner6 = [];

// Helper Functions
function convertGunToSeconds(gunTime) {
  const parts = gunTime.split(":");
  let seconds = 0;
  if (parts.length === 2) {
    seconds += parseFloat(parts[0]) * 60;
    seconds += parseFloat(parts[1].replace(",", "."));
  } else if (parts.length === 3) {
    seconds += parseFloat(parts[0]) * 3600;
    seconds += parseFloat(parts[1]) * 60;
    seconds += parseFloat(parts[2].replace(",", "."));
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
  const totalMinutes = Math.round(decimalHours * 60); // Convert total hours to total minutes
  const hours = Math.floor(totalMinutes / 60); // Get whole hours
  const minutes = totalMinutes % 60; // Get the remainder as minutes

  return `${hours}:${minutes.toString().padStart(2, "0")}`;
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
const raceStartTime = new Date("2024-09-05T12:00:00+02:00").getTime();
const raceDuration = 144 * 3600 * 1000; // 144 hours in milliseconds
const raceEndTime = raceStartTime + raceDuration;

function formatTimeHHMMSS(seconds) {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${sec}`;
}

function updateClockAndCountdown() {
  const now = new Date().getTime();
  const elapsedSeconds = Math.floor((now - raceStartTime) / 1000);
  const remainingSeconds = Math.floor((raceEndTime - now) / 1000);

  if (elapsedSeconds >= 0 && remainingSeconds > 0) {
    document.getElementById(
      "liveClock"
    ).textContent = `Elapsed: ${formatTimeHHMMSS(elapsedSeconds)}`;
    document.getElementById(
      "countdownTimer"
    ).textContent = `Remaining: ${formatTimeHHMMSS(remainingSeconds)}`;
  } else if (remainingSeconds <= 0) {
    // Display "Race Finished" when time is up
    document.getElementById("liveClock").textContent = `Race Finished`;
    document.getElementById("countdownTimer").textContent = ``;
    document.getElementById("liveUpdateStatus").innerHTML =
      "<span>Race Finished</span>";
    document.getElementById("liveIndicator").style.display = "none"; // Hide the live indicator
  }
}

// Call this function every second to update the race clock
setInterval(updateClockAndCountdown, 1000);

function updateElapsedTimeAnnotation() {
  const now = new Date().getTime();
  const elapsedTimeInHours = (now - raceStartTime) / (1000 * 60 * 60); // Convert to hours

  const labelBackgroundColor =
    now <= raceEndTime
      ? "rgba(34, 139, 34, 0.8)" // Dark green while the race is ongoing
      : "rgba(255, 0, 0, 0.8)"; // Red if the race has ended

  if (elapsedTimeInHours >= 0 && elapsedTimeInHours <= 144) {
    performanceChart.options.plugins.annotation.annotations.elapsedTimeLine.xMin =
      elapsedTimeInHours;
    performanceChart.options.plugins.annotation.annotations.elapsedTimeLine.xMax =
      elapsedTimeInHours;
    performanceChart.options.plugins.annotation.annotations.elapsedTimeLine.label.content = `Elapsed Time: ${convertHoursToHMM(
      elapsedTimeInHours
    )}`;
    performanceChart.options.plugins.annotation.annotations.elapsedTimeLine.label.backgroundColor =
      labelBackgroundColor;

    // Ensure the annotation line is included in the X-axis range
    const xAxisMax = Math.max(
      performanceChart.options.scales.x.max,
      elapsedTimeInHours + 1
    );
    performanceChart.options.scales.x.min = 0;
    performanceChart.options.scales.x.max = xAxisMax;
  }

  // Update the chart after changes
  performanceChart.update();
}

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
        label: runner1Name,
        data: [],
        borderColor: "#4BC0C0",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        pointHitRadius: 10,
        hidden: true, // Hide the dataset initially
      },
      {
        label: runner2Name,
        data: [],
        borderColor: "#FF6384",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        pointHitRadius: 10,
        hidden: true, // Hide the dataset initially
      },
      {
        label: runner3Name,
        data: [],
        borderColor: "#36A2EB",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        pointHitRadius: 10,
        hidden: true, // Hide the dataset initially
      },
      {
        label: runner4Name,
        data: [],
        borderColor: "#9966FF",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        pointHitRadius: 10,
        hidden: true, // Hide the dataset initially
      },
      {
        label: runner5Name,
        data: [],
        borderColor: "#FF69B4",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        pointHitRadius: 10,
        hidden: true, // Hide the dataset initially
      },
      {
        label: runner6Name,
        data: [],
        borderColor: "#FF9F40",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        pointHitRadius: 10,
        hidden: true, // Hide the dataset initially
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
        hidden: true, // Hide the dataset initially
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
        hidden: true, // Hide the dataset initially
      },
      {
        label: `${runnerCompare1Name} WR`,
        data: [],
        borderColor: "#FFD700",
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointHitRadius: 10, // Increase the hover area
        borderDash: [5, 5],
        hidden: true, // Hide the dataset initially
      },
      {
        label: `${runnerCompare2Name} - Nordic Record`,
        data: [],
        borderColor: "#2ECC71", // Choose a distinct color
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointHitRadius: 10, // Increase the hover area
        borderDash: [5, 5],
        hidden: true, // Hide the dataset initially
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          // Title should display the runner's name
          title: function (context) {
            return context[0].dataset.label; // Return the label (runner's name) as the tooltip title
          },
          // Body content for each data point
          label: function (context) {
            const label = context.dataset.label;
            const dataIndex = context.dataIndex;
            const dataPoint = context.raw; // Access the raw data point

            const elapsedTime = convertHoursToHMM(dataPoint.x); // Elapsed time in H:MM format
            const pacePerKm = convertPaceToMinSecKm(dataPoint.y); // Average pace in min/km
            const pacePerMile = convertPaceToMinSecMile(dataPoint.y); // Average pace in min/mile

            if (
              label === `${runnerCompare1Name} WR` ||
              label === `${runnerCompare2Name} - Nordic Record`
            ) {
              // Calculate distance covered using elapsed time (dataPoint.x) and pace (dataPoint.y)
              const distanceKm = (dataPoint.x * 3600) / dataPoint.y;
              const distanceMile = distanceKm * 0.621371;

              // Return the formatted tooltip content
              return [
                `Elapsed Time: ${elapsedTime}`,
                `Distance: ${distanceKm.toFixed(2)} km (${distanceMile.toFixed(
                  2
                )} miles)`,
                `Pace: ${pacePerKm} min/km (${pacePerMile} min/mile)`,
              ];
            } else {
              // For regular runners, use pre-calculated distance and pace data
              const paceData = getPaceDataForLabel(label, dataIndex);
              if (paceData) {
                const distanceKm = paceData.distanceKm;
                const distanceMile = distanceKm * 0.621371;

                // Return the formatted tooltip content
                return [
                  `Elapsed Time: ${elapsedTime}`,
                  `Distance: ${distanceKm.toFixed(
                    2
                  )} km (${distanceMile.toFixed(2)} miles)`,
                  `Pace: ${pacePerKm} min/km (${pacePerMile} min/mile)`,
                ];
              } else {
                // Fallback in case data is missing
                return `Pace: ${pacePerKm} min/km`;
              }
            }
          },
        },
      },
      legend: {
        labels: {
          color: "#FFF", // White color for legend text
          filter: function (legendItem, chartData) {
            // Only show legend items for datasets that are visible
            return !chartData.datasets[legendItem.datasetIndex].hidden;
          },
        },
      },
      zoom: {
        limits: {
          x: { min: 0, max: 144, minRange: 1 },
          y: { min: 0, max: 900, minRange: 30 },
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

// Add event listeners to checkboxes after the DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateDatasetsVisibility);
  });
});

// Function to set X-axis scale
function setXScale(min, max) {
  performanceChart.options.scales.x.min = min;
  performanceChart.options.scales.x.max = max;
  performanceChart.update();
}

// Function to update X labels
function updateXLabels(minHour, maxHour) {
  performanceChart.data.labels = Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => i + minHour
  );
  performanceChart.update();
}

function updateZoomMode(event) {
  if (event.ctrlKey) {
    performanceChart.options.plugins.zoom.zoom.mode = "x";
  } else if (event.shiftKey) {
    performanceChart.options.plugins.zoom.zoom.mode = "y";
  } else {
    performanceChart.options.plugins.zoom.zoom.mode = "xy";
  }
}

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
    chartContainer.classList.remove("fullscreen");
    btn.textContent = "Fullscreen";
  } else {
    chartContainer.classList.add("fullscreen");
    btn.textContent = "Exit Fullscreen";
  }

  // Force Chart.js to resize the chart
  performanceChart.resize();
});

// Add event listeners for the modifier keys (zoom control)
document
  .getElementById("performanceChart")
  .addEventListener("wheel", updateZoomMode);

// Button Event Listeners for Zoom Controls
document.getElementById("zoom6h").addEventListener("click", function () {
  const maxTime = Math.max(...elapsedHoursRunner1, ...elapsedHoursRunner2); // Update with all runners
  const minTime = Math.max(Math.floor(maxTime - 6), 0);
  const minHour = Math.floor(minTime);
  const extendedMaxTime = Math.ceil(maxTime); // Extend to the nearest full hour

  if (maxTime < 6) {
    setXScale(0, 6); // Show the first 6 hours from start
  } else {
    setXScale(minHour, extendedMaxTime);
  }
  updateXLabels(minHour, extendedMaxTime);
});

document.getElementById("zoom24h").addEventListener("click", function () {
  const maxTime = Math.max(...elapsedHoursRunner1, ...elapsedHoursRunner2);
  const minTime = Math.max(Math.floor(maxTime - 24), 0);
  const minHour = Math.floor(minTime);
  const extendedMaxTime = Math.ceil(maxTime);

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
  const maxTime = Math.max(...elapsedHoursRunner1, ...elapsedHoursRunner2);
  const extendedMaxTime = Math.ceil(maxTime);
  setXScale(0, extendedMaxTime); // Reset X to elapsed time
  updateXLabels(0, extendedMaxTime);
});

document.getElementById("resetY").addEventListener("click", function () {
  resetYAxis();
});

// Reset Y-axis function
function resetYAxis() {
  const allPaces = [
    ...paceRunner1.map((p) => p.paceSecondsPerKm),
    ...paceRunner2.map((p) => p.paceSecondsPerKm),
    // Include other datasets here...
  ];

  const minY = Math.min(...allPaces) - 30;
  const maxY = Math.max(...allPaces) + 60;

  performanceChart.options.scales.y.min = Math.max(minY, 0);
  performanceChart.options.scales.y.max = maxY;
  performanceChart.update();
}

// Function to toggle datasets visibility based on checkboxes and fetch data if necessary
function updateDatasetsVisibility() {
  const runner1Checkbox = document.getElementById("runner1").checked;
  const runner2Checkbox = document.getElementById("runner2").checked;
  const runner3Checkbox = document.getElementById("runner3").checked;
  const runner4Checkbox = document.getElementById("runner4").checked;
  const runner5Checkbox = document.getElementById("runner5").checked;
  const runner6Checkbox = document.getElementById("runner6").checked;
  const runnerCompare1Checkbox =
    document.getElementById("runnerCompare1").checked;
  const runnerCompare2Checkbox =
    document.getElementById("runnerCompare2").checked;
  const womensWRPaceCheckbox = document.getElementById("womensWRPace").checked;
  const mensWRPaceCheckbox = document.getElementById("mensWRPace").checked;

  const checkboxes = [
    {
      checked: runner1Checkbox,
      runnerName: runner1Name,
      bib: runner1Bib,
      datasetIndex: 0,
      elapsedHours: elapsedHoursRunner1,
    },
    {
      checked: runner2Checkbox,
      runnerName: runner2Name,
      bib: runner2Bib,
      datasetIndex: 1,
      elapsedHours: elapsedHoursRunner2,
    },
    {
      checked: runner3Checkbox,
      runnerName: runner3Name,
      bib: runner3Bib,
      datasetIndex: 2,
      elapsedHours: elapsedHoursRunner3,
    },
    {
      checked: runner4Checkbox,
      runnerName: runner4Name,
      bib: runner4Bib,
      datasetIndex: 3,
      elapsedHours: elapsedHoursRunner4,
    },
    {
      checked: runner5Checkbox,
      runnerName: runner5Name,
      bib: runner5Bib,
      datasetIndex: 4,
      elapsedHours: elapsedHoursRunner5,
    },
    {
      checked: runner6Checkbox,
      runnerName: runner6Name,
      bib: runner6Bib,
      datasetIndex: 5,
      elapsedHours: elapsedHoursRunner6,
    },
  ];

  let maxElapsedTime = 0;

  // Fetch data only for runners that are checked and haven't been loaded yet
  checkboxes.forEach(
    ({ checked, runnerName, bib, datasetIndex, elapsedHours }) => {
      if (
        checked &&
        performanceChart.data.datasets[datasetIndex].data.length === 0
      ) {
        // Fetch the data if it hasn't been loaded
        fetchData(bib, runnerName).then(() => {
          performanceChart.data.datasets[datasetIndex].hidden = false;
          maxElapsedTime = Math.max(maxElapsedTime, ...elapsedHours);
          updateChart(maxElapsedTime); // Call the update function after data is fetched
        });
      } else {
        // Hide the dataset if unchecked
        performanceChart.data.datasets[datasetIndex].hidden = !checked;
        if (checked) {
          maxElapsedTime = Math.max(maxElapsedTime, ...elapsedHours);
        }
      }
    }
  );

  // Handle WR pace datasets separately to ensure they are updated correctly
  if (
    womensWRPaceCheckbox &&
    performanceChart.data.datasets[6].data.length === 0
  ) {
    // Generate WR data if not already loaded
    performanceChart.data.datasets[6].data = Array.from(
      { length: 144 + 1 },
      (_, i) => ({
        x: i,
        y: womensWorldRecordPace,
      })
    );
  }
  performanceChart.data.datasets[6].hidden = !womensWRPaceCheckbox;

  if (
    mensWRPaceCheckbox &&
    performanceChart.data.datasets[7].data.length === 0
  ) {
    // Generate WR data if not already loaded
    performanceChart.data.datasets[7].data = Array.from(
      { length: 144 + 1 },
      (_, i) => ({
        x: i,
        y: mensWorldRecordPace,
      })
    );
  }
  performanceChart.data.datasets[7].hidden = !mensWRPaceCheckbox;

  // Handle records comparison checkboxes
  if (
    runnerCompare1Checkbox &&
    performanceChart.data.datasets[8].data.length === 0
  ) {
    loadCSVData(); // Load data for Camille Herron WR
  }
  performanceChart.data.datasets[8].hidden = !runnerCompare1Checkbox;

  if (
    runnerCompare2Checkbox &&
    performanceChart.data.datasets[9].data.length === 0
  ) {
    loadLouiseKjellsonData(); // Load data for Louise Kjellson
  }
  performanceChart.data.datasets[9].hidden = !runnerCompare2Checkbox;

  // Collect visible pace values for Y-axis adjustment
  const visiblePaces = [];
  checkboxes.forEach(({ checked, datasetIndex }) => {
    if (checked) {
      visiblePaces.push(
        ...performanceChart.data.datasets[datasetIndex].data.map((d) => d.y)
      );
    }
  });

  if (womensWRPaceCheckbox) visiblePaces.push(womensWorldRecordPace);
  if (mensWRPaceCheckbox) visiblePaces.push(mensWorldRecordPace);

  // Adjust Y-axis based on visible paces
  if (visiblePaces.length > 0) {
    const minY = Math.min(...visiblePaces) - 30; // Adding buffer to minimum value
    const maxY = Math.max(...visiblePaces) + 60; // Adding buffer to maximum value
    performanceChart.options.scales.y.min = Math.max(minY, 0);
    performanceChart.options.scales.y.max = maxY;
  } else {
    performanceChart.options.scales.y.min = 0;
    performanceChart.options.scales.y.max = 600;
  }

  // Adjust X-axis to show up to the most recent data point + 1 hour buffer, not the full 144 hours
  if (maxElapsedTime > 0) {
    performanceChart.options.scales.x.max = Math.min(maxElapsedTime + 1, 144); // Only up to the last data point with buffer
  } else {
    performanceChart.options.scales.x.max = 144; // Default to 144 if no data is visible
  }

  // Update the chart with the new settings
  performanceChart.update();
}

// Fetch data for specific bib and update arrays
async function fetchData(bib, runnerName) {
  let apiEndpoint;

  // Use switch-case to determine the correct API endpoint based on the runner name
  switch (runnerName) {
    case runner1Name:
      apiEndpoint = apiEndpointRunner1;
      break;
    case runner2Name:
      apiEndpoint = apiEndpointRunner2;
      break;
    case runner3Name:
      apiEndpoint = apiEndpointRunner3;
      break;
    case runner4Name:
      apiEndpoint = apiEndpointRunner4;
      break;
    case runner5Name:
      apiEndpoint = apiEndpointRunner5;
      break;
    case runner6Name:
      apiEndpoint = apiEndpointRunner6;
      break;
    default:
      throw new Error(`Unknown runner: ${runnerName}`);
  }

  // Fetch the data from the API
  try {
    const response = await fetch(apiEndpoint);
    const data = await response.json();

    // Log the fetched data to the console
    console.log(`Fetched data for ${runnerName}:`, data);

    // Process the lap data based on the new data format
    const lapData = data.lapData.map((lap) => {
      const totalElapsedSeconds = convertGunToSeconds(lap.fullTime); // Use fullTime for cumulative elapsed time
      const totalElapsedHours = totalElapsedSeconds / 3600;
      const totalDistanceKm = parseFloat(lap.km); // Cumulative distance up to this point

      // Calculate pace using total elapsed time and total distance
      const paceSecondsPerKm = totalElapsedSeconds / totalDistanceKm;

      return {
        time: totalElapsedHours, // Total elapsed time in hours
        distanceKm: totalDistanceKm, // Total distance in km
        paceSecondsPerKm: paceSecondsPerKm, // Pace in seconds per km
      };
    });

    // Map data to the correct arrays for chart plotting
    let elapsedHours = lapData.map((lap) => lap.time);
    let pace = lapData.map((lap) => ({
      distanceKm: lap.distanceKm,
      paceSecondsPerKm: lap.paceSecondsPerKm,
    }));

    // Store the data based on the runner
    switch (runnerName) {
      case runner1Name:
        elapsedHoursRunner1 = elapsedHours;
        paceRunner1 = pace;
        break;
      case runner2Name:
        elapsedHoursRunner2 = elapsedHours;
        paceRunner2 = pace;
        break;
      case runner3Name:
        elapsedHoursRunner3 = elapsedHours;
        paceRunner3 = pace;
        break;
      case runner4Name:
        elapsedHoursRunner4 = elapsedHours;
        paceRunner4 = pace;
        break;
      case runner5Name:
        elapsedHoursRunner5 = elapsedHours;
        paceRunner5 = pace;
        break;
      case runner6Name:
        elapsedHoursRunner6 = elapsedHours;
        paceRunner6 = pace;
        break;
    }
  } catch (error) {
    console.error(`Error fetching data for ${runnerName}:`, error);
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
  performanceChart.data.datasets[8].data = data;
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

            if (elapsedTime.includes(":")) {
              const timeParts = elapsedTime.split(":");

              if (timeParts.length === 2) {
                const minutes = parseFloat(timeParts[0]);
                const seconds = parseFloat(timeParts[1]);
                elapsedTimeHours = (minutes * 60 + seconds) / 3600;
              } else if (timeParts.length === 3) {
                const hours = parseFloat(timeParts[0]);
                const minutes = parseFloat(timeParts[1]);
                const seconds = parseFloat(timeParts[2]);
                elapsedTimeHours = hours + (minutes * 60 + seconds) / 3600;
              }
            } else {
              console.log(`Invalid format for elapsed time: ${elapsedTime}`);
              return null;
            }

            const paceParts = averagePace.split(":");
            const paceSecondsPerKm =
              parseFloat(paceParts[0]) * 60 + parseFloat(paceParts[1]);

            return {
              x: elapsedTimeHours,
              y: paceSecondsPerKm,
            };
          })
          .filter((data) => data !== null);

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
  performanceChart.data.datasets[9].data = data;
  performanceChart.update();
}

function calculateExtendedLine(elapsedHours, pace) {
  const extendedLine = [];

  if (elapsedHours.length === 0) return extendedLine;

  const lastIndex = elapsedHours.length - 1;
  const lastTime = elapsedHours[lastIndex];
  const lastPace = pace[lastIndex].paceSecondsPerKm;

  for (let i = 1; i <= 6; i++) {
    const extendedTime = lastTime + i;
    extendedLine.push({
      x: extendedTime,
      y: lastPace + i * 60,
    });
  }

  return extendedLine;
}

// Update chart with correct data
function updateChart(maxElapsedTime) {
  const xAxisMax = Math.min(Math.ceil(maxElapsedTime + 1), 144); // Add 1 hour buffer based on most recent data point

  performanceChart.data.labels = Array.from(
    { length: xAxisMax + 1 },
    (_, i) => i
  );

  performanceChart.data.datasets[0].data = elapsedHoursRunner1.map(
    (time, index) => ({ x: time, y: paceRunner1[index].paceSecondsPerKm })
  );
  performanceChart.data.datasets[1].data = elapsedHoursRunner2.map(
    (time, index) => ({ x: time, y: paceRunner2[index].paceSecondsPerKm })
  );
  performanceChart.data.datasets[2].data = elapsedHoursRunner3.map(
    (time, index) => ({ x: time, y: paceRunner3[index].paceSecondsPerKm })
  );
  performanceChart.data.datasets[3].data = elapsedHoursRunner4.map(
    (time, index) => ({ x: time, y: paceRunner4[index].paceSecondsPerKm })
  );
  performanceChart.data.datasets[4].data = elapsedHoursRunner5.map(
    (time, index) => ({ x: time, y: paceRunner5[index].paceSecondsPerKm })
  );
  performanceChart.data.datasets[5].data = elapsedHoursRunner6.map(
    (time, index) => ({ x: time, y: paceRunner6[index].paceSecondsPerKm })
  );

  performanceChart.data.datasets[6].data = Array.from(
    { length: xAxisMax + 1 },
    (_, i) => ({
      x: i,
      y: womensWorldRecordPace,
    })
  );
  performanceChart.data.datasets[7].data = Array.from(
    { length: xAxisMax + 1 },
    (_, i) => ({
      x: i,
      y: mensWorldRecordPace,
    })
  );

  // Adjust Y-axis based on visible datasets' pace values
  const allPaces = [
    ...paceRunner1.map((p) => p.paceSecondsPerKm),
    ...paceRunner2.map((p) => p.paceSecondsPerKm),
    ...paceRunner3.map((p) => p.paceSecondsPerKm),
    ...paceRunner4.map((p) => p.paceSecondsPerKm),
    ...paceRunner5.map((p) => p.paceSecondsPerKm),
    ...paceRunner6.map((p) => p.paceSecondsPerKm),
    womensWorldRecordPace,
    mensWorldRecordPace,
  ];

  const minY = Math.min(...allPaces) - 30; // Adding a buffer to the minimum value
  const maxY = Math.max(...allPaces) + 60; // Adding a buffer to the maximum value

  performanceChart.options.scales.y.min = Math.max(minY, 0);
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
  performanceChart.options.scales.x.max = xAxisMax; // Dynamically adjust based on the most recent data point

  performanceChart.update();
}

function resetYAxis() {
  const visiblePaces = [];

  const minX = performanceChart.scales.x.min;
  const maxX = performanceChart.scales.x.max;

  function filterPacesWithinTimeRange(elapsedHours, paces) {
    return paces
      .filter(
        (_, index) => elapsedHours[index] >= minX && elapsedHours[index] <= maxX
      )
      .map((p) => p.paceSecondsPerKm);
  }

  if (document.getElementById("runner1").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursRunner1, paceRunner1)
    );
  if (document.getElementById("runner2").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursRunner2, paceRunner2)
    );
  if (document.getElementById("runner3").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursRunner3, paceRunner3)
    );
  if (document.getElementById("runner4").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursRunner4, paceRunner4)
    );
  if (document.getElementById("runner5").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursRunner5, paceRunner5)
    );
  if (document.getElementById("runner6").checked)
    visiblePaces.push(
      ...filterPacesWithinTimeRange(elapsedHoursRunner6, paceRunner6)
    );

  if (document.getElementById("runnerCompare1").checked) {
    visiblePaces.push(
      ...performanceChart.data.datasets[8].data
        .filter((d) => d.x >= minX && d.x <= maxX)
        .map((d) => d.y)
    );
  }

  if (document.getElementById("runnerCompare2").checked) {
    visiblePaces.push(
      ...performanceChart.data.datasets[9].data
        .filter((d) => d.x >= minX && d.x <= maxX)
        .map((d) => d.y)
    );
  }

  if (document.getElementById("womensWRPace").checked && maxX >= minX) {
    visiblePaces.push(womensWorldRecordPace);
  }
  if (document.getElementById("mensWRPace").checked && maxX >= minX) {
    visiblePaces.push(mensWorldRecordPace);
  }

  if (visiblePaces.length > 0) {
    const minY = Math.min(...visiblePaces) - 30;
    const maxY = Math.max(...visiblePaces) + 60;

    performanceChart.options.scales.y.min = Math.max(minY, 0);
    performanceChart.options.scales.y.max = maxY;
  } else {
    performanceChart.options.scales.y.min = 0;
    performanceChart.options.scales.y.max = 600;
  }

  performanceChart.update();
}

function hasRaceEnded() {
  const now = new Date().getTime();
  return now >= raceEndTime;
}

// Function to get the current zoom and pan state
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

// Function to reapply the zoom and pan state after chart updates
function applyZoomAndPan(savedState) {
  performanceChart.options.scales.x.min = savedState.x.min;
  performanceChart.options.scales.x.max = savedState.x.max;
  performanceChart.options.scales.y.min = savedState.y.min;
  performanceChart.options.scales.y.max = savedState.y.max;

  // Update the chart with the restored zoom and pan state
  performanceChart.update();
}

function getPaceDataForLabel(label, dataIndex) {
  switch (label) {
    case runner1Name:
      return paceRunner1[dataIndex];
    case runner2Name:
      return paceRunner2[dataIndex];
    case runner3Name:
      return paceRunner3[dataIndex];
    case runner4Name:
      return paceRunner4[dataIndex];
    case runner5Name:
      return paceRunner5[dataIndex];
    case runner6Name:
      return paceRunner6[dataIndex];
    default:
      return null;
  }
}

// Fetch data for all runners and update charts
// Function to fetch data only for currently selected runners
function updateAllData() {
  if (hasRaceEnded()) {
    return; // Stop fetching data if the race has ended
  }

  const zoomAndPanState = getCurrentZoomAndPan(); // Save current zoom/pan state

  const fetchPromises = [];

  // Check which runners are currently selected and only fetch their data
  const runner1Checkbox = document.getElementById("runner1").checked;
  const runner2Checkbox = document.getElementById("runner2").checked;
  const runner3Checkbox = document.getElementById("runner3").checked;
  const runner4Checkbox = document.getElementById("runner4").checked;
  const runner5Checkbox = document.getElementById("runner5").checked;
  const runner6Checkbox = document.getElementById("runner6").checked;

  if (runner1Checkbox) fetchPromises.push(fetchData(runner1Bib, runner1Name));
  if (runner2Checkbox) fetchPromises.push(fetchData(runner2Bib, runner2Name));
  if (runner3Checkbox) fetchPromises.push(fetchData(runner3Bib, runner3Name));
  if (runner4Checkbox) fetchPromises.push(fetchData(runner4Bib, runner4Name));
  if (runner5Checkbox) fetchPromises.push(fetchData(runner5Bib, runner5Name));
  if (runner6Checkbox) fetchPromises.push(fetchData(runner6Bib, runner6Name));

  // Fetch data only for checked runners
  Promise.all(fetchPromises)
    .then(() => {
      updateChart(); // Update chart with fetched data
      updateDatasetsVisibility(); // Ensure visibility of selected datasets
      resetYAxis(); // Adjust Y-axis based on visible data
      updateElapsedTimeAnnotation(); // Update elapsed time annotation line

      applyZoomAndPan(zoomAndPanState); // Reapply saved zoom/pan state
    })
    .catch((error) => {
      console.error("Error updating data:", error);
    });
}

// Call `updateAllData()` every minute to fetch new data and update the chart
setInterval(updateAllData, 60000); // 60000 ms = 1 minute

// Call initialLoad after the checkboxes have been populated
initialLoad();

// Initial load function: fetch only selected runners on initial load
function initialLoad() {
  const fetchPromises = [];

  // Fetch only data for selected runners
  const runner1Checkbox = document.getElementById("runner1").checked;
  const runner2Checkbox = document.getElementById("runner2").checked;
  const runner3Checkbox = document.getElementById("runner3").checked;
  const runner4Checkbox = document.getElementById("runner4").checked;
  const runner5Checkbox = document.getElementById("runner5").checked;
  const runner6Checkbox = document.getElementById("runner6").checked;
  const runnerCompare1Checkbox =
    document.getElementById("runnerCompare1").checked;
  const runnerCompare2Checkbox =
    document.getElementById("runnerCompare2").checked;

  if (runner1Checkbox) fetchPromises.push(fetchData(runner1Bib, runner1Name));
  if (runner2Checkbox) fetchPromises.push(fetchData(runner2Bib, runner2Name));
  if (runner3Checkbox) fetchPromises.push(fetchData(runner3Bib, runner3Name));
  if (runner4Checkbox) fetchPromises.push(fetchData(runner4Bib, runner4Name));
  if (runner5Checkbox) fetchPromises.push(fetchData(runner5Bib, runner5Name));
  if (runner6Checkbox) fetchPromises.push(fetchData(runner6Bib, runner6Name));

  if (runnerCompare1Checkbox) fetchPromises.push(loadCSVData());
  if (runnerCompare2Checkbox) fetchPromises.push(loadLouiseKjellsonData());

  // Fetch data and initialize the chart
  Promise.all(fetchPromises).then(() => {
    updateChart();
    updateDatasetsVisibility();
    resetYAxis();
    updateElapsedTimeAnnotation();

    // Start periodic updates every minute, but only if the race is ongoing
    if (!hasRaceEnded()) {
      setInterval(updateAllData, 60000); // Call updateAllData every minute
    }
  });
}
