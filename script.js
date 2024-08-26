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

// Convert decimal hours to H:MM format
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
    pace.push(paceSecondsPerKm);
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
    pace.map(convertPaceToMinSecKm)
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
        label: "Stine",
        data: paceStine, // Keep pace in seconds/km for correct scaling
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "David",
        data: paceDavid, // Keep pace in seconds/km for correct scaling
        borderColor: "rgba(192, 75, 192, 1)",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Women's World Record Pace",
        data: Array(elapsedHoursStine.length).fill(womensWorldRecordPace), // World Record Pace line for Women
        borderColor: "rgba(255, 0, 0, 1)", // Red color for the Women's World Record line
        borderWidth: 2,
        fill: false,
        pointRadius: 0, // No points on this line
        borderDash: [10, 5], // Dashed line
      },
      {
        label: "Men's World Record Pace",
        data: Array(elapsedHoursStine.length).fill(mensWorldRecordPace), // World Record Pace line for Men
        borderColor: "rgba(0, 0, 255, 1)", // Blue color for the Men's World Record line
        borderWidth: 2,
        fill: false,
        pointRadius: 0, // No points on this line
        borderDash: [10, 5], // Dashed line
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: "linear",
        position: "bottom",
        title: {
          display: true,
          text: "Elapsed Time (H:MM)",
        },
        ticks: {
          callback: function (value, index, values) {
            return convertHoursToHMM(value); // Format ticks as H:MM
          },
          stepSize: 0.5, // Half-hour steps
        },
        grid: {
          color: function (context) {
            if (context.tick.value % 6 === 0) {
              return "#000"; // Black for every 6 hours
            } else if (context.tick.value % 1 === 0) {
              return "#ccc"; // Light gray for every hour
            } else {
              return "#eee"; // Even lighter gray for half hours
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
          text: "Pace (MM:SS/km)",
        },
        ticks: {
          callback: function (value, index, values) {
            return convertPaceToMinSecKm(value); // Format ticks as MM:SS
          },
          min:
            Math.min(
              ...paceStine,
              ...paceDavid,
              womensWorldRecordPace,
              mensWorldRecordPace
            ) - 30, // Adjust to seconds
          max:
            Math.max(
              ...paceStine,
              ...paceDavid,
              womensWorldRecordPace,
              mensWorldRecordPace
            ) + 30, // Adjust to seconds
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: "xy",
        },
        zoom: {
          enabled: true,
          mode: "xy",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const pace = convertPaceToMinSecKm(context.raw);
            const label = context.dataset.label || "";
            return `${label}: ${pace} min/km`;
          },
          title: function (context) {
            const elapsedTime = convertHoursToHMM(context[0].label);
            return `Elapsed Time: ${elapsedTime}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  },
});

// Function to update the chart
function updateChart() {
  performanceChart.data.labels = elapsedHoursStine;
  performanceChart.data.datasets[0].data = paceStine;
  performanceChart.data.datasets[1].data = paceDavid;
  performanceChart.data.datasets[2].data = Array(elapsedHoursStine.length).fill(
    womensWorldRecordPace
  ); // Update the Women's World Record Pace line
  performanceChart.data.datasets[3].data = Array(elapsedHoursStine.length).fill(
    mensWorldRecordPace
  ); // Update the Men's World Record Pace line
  performanceChart.update();
}
