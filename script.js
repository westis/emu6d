// script.js

// API Endpoints
const apiEndpointStine =
  "https://my3.raceresult.com/288150/RRPublish/data/splits?key=768ff798a15beb28bcae9991ffa5791f&bib=11";
const apiEndpointDavid =
  "https://my3.raceresult.com/288150/RRPublish/data/splits?key=768ff798a15beb28bcae9991ffa5791f&bib=8";

let elapsedHoursStine = [];
let paceStine = [];
let elapsedHoursDavid = [];
let paceDavid = [];

// Convert "Gun" time (mm:ss.tt or h:mm:ss.tt) to total seconds
function convertGunToSeconds(gunTime) {
  const parts = gunTime.split(":");
  let seconds = 0;
  if (parts.length === 2) {
    // mm:ss.tt
    seconds += parseFloat(parts[0]) * 60; // minutes to seconds
    seconds += parseFloat(parts[1].replace(",", ".")); // seconds
  } else if (parts.length === 3) {
    // h:mm:ss.tt
    seconds += parseFloat(parts[0]) * 3600; // hours to seconds
    seconds += parseFloat(parts[1]) * 60; // minutes to seconds
    seconds += parseFloat(parts[2].replace(",", ".")); // seconds
  }
  return seconds;
}

// Convert pace from seconds per km to min:sec per km (MM:SS/km)
function convertPaceToMinSecKm(secondsPerKm) {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// Convert pace from seconds per km to min:sec per mile (MM:SS/mile)
function convertPaceToMinSecMile(secondsPerKm) {
  const secondsPerMile = secondsPerKm * 1.60934;
  const minutes = Math.floor(secondsPerMile / 60);
  const seconds = Math.round(secondsPerMile % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// Convert decimal hours to H:MM:SS format
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

// Function to fetch data and update the arrays for a specific bib
async function fetchData(bib) {
  const apiEndpoint = bib === 11 ? apiEndpointStine : apiEndpointDavid;
  const response = await fetch(apiEndpoint);
  const data = await response.json();

  const lapData = data.Splits.filter((split) => split.Exists);

  let accumulatedTime = 0;
  let totalDistance = 0;

  let elapsedHours = [];
  let pace = [];

  lapData.forEach((lap) => {
    // Extract the lap number from "Name", e.g., "Omgang 1" -> lap number = 1
    const match = lap.Name.match(/\d+/);
    if (!match) {
      console.warn(`Could not extract lap number from Name: ${lap.Name}`);
      return; // Skip this lap if the number can't be extracted
    }

    const lapNumber = parseInt(match[0]);

    const lapTimeSeconds = convertGunToSeconds(lap.Gun);
    accumulatedTime = lapTimeSeconds;

    // Calculate total distance covered up to this lap
    totalDistance = lapNumber * 1.4405; // distance in km

    // Calculate elapsed time in hours
    const elapsedTimeHours = accumulatedTime / 3600;
    elapsedHours.push(elapsedTimeHours);

    // Calculate pace (seconds/km) up to this lap
    const paceSecondsPerKm = accumulatedTime / totalDistance;
    pace.push({
      time: elapsedTimeHours,
      paceSecondsPerKm,
      distanceKm: totalDistance,
    });
  });

  if (bib === 11) {
    elapsedHoursStine = elapsedHours;
    paceStine = pace;
  } else if (bib === 8) {
    elapsedHoursDavid = elapsedHours;
    paceDavid = pace;
  }

  // Debugging output
  console.log(
    `Elapsed Hours (${bib === 11 ? "Stine" : "David"}):`,
    elapsedHours.map(convertHoursToHMM)
  );
  console.log(
    `Pace (${bib === 11 ? "Stine" : "David"}):`,
    pace.map((p) => convertPaceToMinSecKm(p.paceSecondsPerKm))
  );
}

// Initial fetch and update
Promise.all([fetchData(11), fetchData(8)]).then(() => {
  updateChart();
});

// Set interval to fetch data every 30 seconds
setInterval(() => {
  Promise.all([fetchData(11), fetchData(8)]).then(updateChart);
}, 30000);

let ctx = document.getElementById("performanceChart").getContext("2d");
let performanceChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: elapsedHoursStine, // Use raw hours for X axis (will format in callback)
    datasets: [
      {
        label: "Stine Rex",
        data: paceStine.map((p) => p.paceSecondsPerKm), // Keep pace in seconds/km for correct scaling
        borderColor: "#4BC0C0", // Bright cyan color for Stine
        borderWidth: 2,
        fill: false,
      },
      {
        label: "David Stoltenberg",
        data: paceDavid.map((p) => p.paceSecondsPerKm), // Keep pace in seconds/km for correct scaling
        borderColor: "#FF6384", // Bright pink color for David
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Women's World Record Pace",
        data: Array(elapsedHoursStine.length).fill(womensWorldRecordPace), // World Record Pace line for Women
        borderColor: "#FF5722", // Bright orange color for Women's World Record
        borderWidth: 2,
        fill: false,
        pointRadius: 0, // No points on this line
        borderDash: [10, 5], // Dashed line
      },
      {
        label: "Men's World Record Pace",
        data: Array(elapsedHoursStine.length).fill(mensWorldRecordPace), // World Record Pace line for Men
        borderColor: "#2196F3", // Bright blue color for Men's World Record
        borderWidth: 2,
        fill: false,
        pointRadius: 0, // No points on this line
        borderDash: [10, 5], // Dashed line
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: "#333", // Dark background for tooltips
        titleColor: "#FFF", // White text for tooltip titles
        bodyColor: "#FFF", // White text for tooltip bodies
        callbacks: {
          title: function (context) {
            return context[0].dataset.label; // Get the runner's name from the dataset label
          },
          label: function (context) {
            const paceData =
              context.dataset.label === "Stine Rex"
                ? paceStine[context.dataIndex]
                : paceDavid[context.dataIndex];
            const elapsedTime = convertHoursToHMM(paceData.time);
            const distanceKm = paceData.distanceKm.toFixed(2);
            const distanceMiles = (paceData.distanceKm * 0.621371).toFixed(2);
            const pacePerKm = convertPaceToMinSecKm(paceData.paceSecondsPerKm);
            const pacePerMile = convertPaceToMinSecMile(
              paceData.paceSecondsPerKm
            );
            return [
              // Return an array of strings for multi-line display
              `Elapsed Time: ${elapsedTime}`,
              `Distance: ${distanceKm} km / ${distanceMiles} miles`,
              `Average Pace: ${pacePerKm} min/km, ${pacePerMile} min/mile`,
            ];
          },
        },
      },
      legend: {
        labels: {
          color: "#FFF", // White color for legend text
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
          color: "#FFF", // White color for X axis title
        },
        ticks: {
          callback: function (value, index, values) {
            return convertHoursToHMM(value); // Format ticks as H:MM
          },
          stepSize: 0.5, // Half-hour steps
          color: "#DDD", // Light gray for X axis ticks
        },
        grid: {
          color: function (context) {
            if (context.tick.value % 6 === 0) {
              return "#555"; // Dark gray for every 6 hours
            } else if (context.tick.value % 1 === 0) {
              return "#444"; // Slightly lighter gray for every hour
            } else {
              return "#333"; // Even lighter gray for half hours
            }
          },
          lineWidth: function (context) {
            return context.tick.value % 6 === 0 ? 2 : 1; // Thicker line every 6 hours
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Pace (min/km)",
          color: "#FFF", // White color for Y axis title
        },
        ticks: {
          callback: function (value, index, values) {
            return convertPaceToMinSecKm(value); // Format ticks as MM:SS
          },
          min:
            Math.min(
              ...paceStine.map((p) => p.paceSecondsPerKm),
              ...paceDavid.map((p) => p.paceSecondsPerKm),
              womensWorldRecordPace,
              mensWorldRecordPace
            ) - 30, // Adjust to seconds
          max:
            Math.max(
              ...paceStine.map((p) => p.paceSecondsPerKm),
              ...paceDavid.map((p) => p.paceSecondsPerKm),
              womensWorldRecordPace,
              mensWorldRecordPace
            ) + 30, // Adjust to seconds
          color: "#DDD", // Light gray for Y axis ticks
        },
        grid: {
          color: "#444", // Slightly lighter gray for grid lines
        },
      },
    },
  },
});

// Function to update the chart
function updateChart() {
  performanceChart.data.labels = elapsedHoursStine;
  performanceChart.data.datasets[0].data = paceStine.map(
    (p) => p.paceSecondsPerKm
  );
  performanceChart.data.datasets[1].data = paceDavid.map(
    (p) => p.paceSecondsPerKm
  );
  performanceChart.data.datasets[2].data = Array(elapsedHoursStine.length).fill(
    womensWorldRecordPace
  ); // Update the Women's World Record Pace line
  performanceChart.data.datasets[3].data = Array(elapsedHoursStine.length).fill(
    mensWorldRecordPace
  ); // Update the Men's World Record Pace line
  performanceChart.update();
}
