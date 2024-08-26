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

// Function to update chart data
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
        label: "David Stoltenborg",
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
            const pacePerKm = convertPaceToMinSecKm(paceData.paceSecondsPerKm);
            const pacePerMile = convertPaceToMinSecMile(
              paceData.paceSecondsPerKm
            );
            return [
              // Return an array of strings for multi-line display
              `Elapsed Time: ${elapsedTime}`,
              `Pace (km): ${pacePerKm}`,
              `Pace (mile): ${pacePerMile}`,
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
          callback: function (value) {
            return convertHoursToHMM(value); // Format ticks as H:MM
          },
          stepSize: 6, // Step size for the x-axis
          color: "#DDD", // Light gray for X axis ticks
        },
        grid: {
          color: function (context) {
            if (context.tick.value % 6 === 0) {
              return "#555"; // Dark gray for every 6 hours
            } else {
              return "#333"; // Lighter gray for other intervals
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
          text: "Pace (Min:Sec/km)",
          color: "#FFF", // White color for Y axis title
        },
        ticks: {
          callback: function (value) {
            return convertPaceToMinSecKm(value); // Format ticks as MM:SS
          },
          color: "#DDD", // Light gray for Y axis ticks
        },
        grid: {
          color: "#444", // Slightly lighter gray for grid lines
        },
      },
    },
  },
});

// Functions to adjust the X axis
function setXScale(min, max) {
  performanceChart.options.scales.x.min = min;
  performanceChart.options.scales.x.max = max;
  performanceChart.options.plugins.zoom = {
    pan: {
      enabled: true,
      mode: "x",
    },
  };
  performanceChart.update();
}

document.getElementById("zoom6h").addEventListener("click", function () {
  const maxTime = Math.max(...elapsedHoursStine);
  const minTime = Math.max(maxTime - 6, 0); // Ensure we don't go left of 0
  if (maxTime < 6) {
    setXScale(0, 6); // Show the first 6 hours from start
  } else {
    setXScale(minTime, maxTime);
  }
});

document.getElementById("zoom24h").addEventListener("click", function () {
  const maxTime = Math.max(...elapsedHoursStine);
  const minTime = Math.max(maxTime - 24, 0); // Ensure we don't go left of 0
  if (maxTime < 24) {
    setXScale(0, 24); // Show the first 24 hours from start
  } else {
    setXScale(minTime, maxTime);
  }
});

document.getElementById("zoomAll").addEventListener("click", function () {
  setXScale(0, 144); // Always show the entire 144 hours
});

document.getElementById("resetX").addEventListener("click", function () {
  setXScale(0, Math.max(...elapsedHoursStine)); // Reset to show from 0 up to latest elapsed time
  performanceChart.options.plugins.zoom = {}; // Disable panning
  performanceChart.update();
});

// Functions to adjust the Y axis
function setYScale(min, max) {
  performanceChart.options.scales.y.min = min;
  performanceChart.options.scales.y.max = max;
  performanceChart.options.plugins.zoom = {
    pan: {
      enabled: true,
      mode: "y",
    },
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
  setYScale(undefined, undefined);
  performanceChart.options.plugins.zoom = {}; // Disable panning
  performanceChart.update();
});

// Function to check for a new version
const checkVersion = async () => {
  try {
    const response = await fetch("/version.js"); // Fetch the latest version.js file
    const newVersionText = await response.text();

    // Extract the version number from the fetched file
    const newVersion = newVersionText.match(
      /version\s*=\s*['"]([^'"]+)['"]/
    )[1];

    if (newVersion !== version) {
      showUpdateNotification(); // Show a notification bar if a new version is detected
    }
  } catch (error) {
    console.error("Error checking for updates:", error);
  }
};

// Function to show a notification bar
const showUpdateNotification = () => {
  const notification = document.createElement("div");
  notification.id = "update-notification";
  notification.style.position = "fixed";
  notification.style.bottom = "0";
  notification.style.width = "100%";
  notification.style.backgroundColor = "#4CAF50";
  notification.style.color = "white";
  notification.style.textAlign = "center";
  notification.style.padding = "10px";
  notification.style.zIndex = "1000";
  notification.style.cursor = "pointer";
  notification.innerText =
    "A new version of this page is available. Click here to refresh.";

  // Add click event to refresh the page
  notification.addEventListener("click", () => {
    location.reload();
  });

  document.body.appendChild(notification);
};

// Check for updates every 10 minutes (600,000 ms)
setInterval(checkVersion, 600000);
