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

  const lapData = data.Splits.filter(
    (split) => split.Exists && split.Name !== "Start"
  ); // Exclude invalid laps and the "Start" lap

  let elapsedHoursMap = {}; // Use an object to map elapsed time to pace data

  lapData.forEach((lap, index) => {
    const totalElapsedSeconds = convertGunToSeconds(lap.Gun);
    const totalElapsedHours = totalElapsedSeconds / 3600;
    if (totalElapsedHours > 144) return; // Skip any data points beyond 144 hours

    // Calculate cumulative distance covered up to this point
    const totalDistanceKm = (index + 1) * 1.4405; // cumulative distance in km
    const totalDistanceMile = totalDistanceKm * 0.621371; // convert km to miles

    // Calculate cumulative average pace (total time / total distance)
    const avgPaceSecondsPerKm = totalElapsedSeconds / totalDistanceKm;
    const avgPaceSecondsPerMile = totalElapsedSeconds / totalDistanceMile;

    // Map the data by elapsed hours
    elapsedHoursMap[totalElapsedHours] = {
      distanceKm: totalDistanceKm,
      distanceMile: totalDistanceMile,
      paceSecondsPerKm: avgPaceSecondsPerKm,
      paceSecondsPerMile: avgPaceSecondsPerMile,
    };
  });

  // Convert the map to sorted arrays
  let elapsedHours = Object.keys(elapsedHoursMap)
    .map(Number)
    .sort((a, b) => a - b);
  let pace = elapsedHours.map((time) => elapsedHoursMap[time]);

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
    elapsedHours
  );
  console.log(
    `Pace (${bib === 11 ? "Stine" : "David"}):`,
    pace.map((p) => convertPaceToMinSecKm(p.paceSecondsPerKm))
  );
}

// Load and parse the CSV file for Camille Herron
function loadCSVData() {
  Papa.parse("CamilleWR.csv", {
    download: true,
    header: true,
    complete: function (results) {
      console.log("CSV Data Loaded: ", results.data);
      const camilleWRData = results.data
        .map((row, index) => {
          if (!row["Race Time"] || !row["Distance"] || row["Lap"] === "") {
            console.error(
              `Row ${index} is missing "Race Time" or "Distance" or is an empty row`,
              row
            );
            return null; // Skip this row
          }

          const elapsedTimeHours = convertGunToSeconds(row["Race Time"]) / 3600;
          const distanceKm = parseFloat(row["Distance"]) * 1.60934;

          const paceSecondsPerKm =
            convertGunToSeconds(row["Race Time"]) / distanceKm;

          console.log(
            `Row ${index}: Race Time = ${row["Race Time"]}, Elapsed Time Hours = ${elapsedTimeHours}, Distance Km = ${distanceKm}, Pace = ${paceSecondsPerKm}`
          );

          return {
            x: elapsedTimeHours,
            y: paceSecondsPerKm, // Average pace for this lap
          };
        })
        .filter((data) => data !== null);

      console.log("Processed Camille WR Data: ", camilleWRData);

      addCamilleWRDataset(camilleWRData);
    },
  });
}

let ctx = document.getElementById("performanceChart").getContext("2d");
let performanceChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [], // Start with empty labels
    datasets: [
      {
        label: "Stine Rex",
        data: [], // Start with empty data
        borderColor: "#4BC0C0", // Bright cyan color for Stine
        borderWidth: 2,
        fill: false,
        pointRadius: 1, // Smaller circles for Stine
      },
      {
        label: "David Stoltenborg",
        data: [], // Start with empty data
        borderColor: "#FF6384", // Bright pink color for David
        borderWidth: 2,
        fill: false,
        pointRadius: 1, // Smaller circles for David
      },
      {
        label: "Women's World Record Pace",
        data: [], // Start with empty data
        borderColor: "#FF5722", // Bright orange color for Women's World Record
        borderWidth: 2,
        fill: false,
        pointRadius: 0, // No points on this line
        borderDash: [10, 5], // Dashed line
      },
      {
        label: "Men's World Record Pace",
        data: [], // Start with empty data
        borderColor: "#2196F3", // Bright blue color for Men's World Record
        borderWidth: 2,
        fill: false,
        pointRadius: 0, // No points on this line
        borderDash: [10, 5], // Dashed line
      },
      {
        label: "Camille Herron WR",
        data: [], // Start with empty data
        borderColor: "#FFD700", // Gold color for Camille's WR
        borderWidth: 2,
        fill: false,
        borderDash: [5, 5],
        pointRadius: 0, // No points on this line
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
                : context.dataset.label === "David Stoltenborg"
                ? paceDavid[context.dataIndex]
                : null;

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
        zoom: {
          enabled: true,
          mode: "xy",
        },
        pan: {
          enabled: true,
          mode: "xy",
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
          stepSize: 1, // Show a tick for every hour
          color: "#DDD", // Light gray for X axis ticks
        },
        grid: {
          color: function (context) {
            if (context.tick.value % 6 === 0) {
              return "#555"; // Dark gray for every 6 hours (major grid line)
            } else if (context.tick.value % 1 === 0) {
              return "#444"; // Light gray for every hour (minor grid line)
            }
          },
          lineWidth: function (context) {
            return context.tick.value % 6 === 0 ? 2 : 1; // Thicker line for every 6 hours
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

// Function to add Camille's World Record dataset to the chart
function addCamilleWRDataset(data) {
  console.log("Adding Camille's WR Data to Chart: ", data); // Debugging line
  performanceChart.data.datasets[4].data = data;
  performanceChart.update(); // Update the chart to display the new dataset
}

// Update chart with correct data
function updateChart() {
  // Determine the maximum elapsed time for Stine and David
  const maxTimeStine = Math.max(...elapsedHoursStine);
  const maxTimeDavid = Math.max(...elapsedHoursDavid);
  const maxTime = Math.max(maxTimeStine, maxTimeDavid);

  // Set the x-axis maximum to a bit ahead of the current max time, rounded up to the nearest full hour
  const xAxisMax = Math.ceil(maxTime / 1) * 1; // Always extend to the nearest full hour

  // Update the chart labels to reflect the elapsed times
  performanceChart.data.labels = Array.from(
    { length: Math.max(elapsedHoursStine.length, elapsedHoursDavid.length) },
    (_, i) => i
  );

  // Update datasets for Stine and David
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

  // Fill world record lines
  const numPoints = performanceChart.data.labels.length;
  performanceChart.data.datasets[2].data = Array(numPoints).fill(
    womensWorldRecordPace
  );
  performanceChart.data.datasets[3].data =
    Array(numPoints).fill(mensWorldRecordPace);

  // Load Camille's data and add it to the chart
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

      // Add Camille's WR data to the chart
      performanceChart.data.datasets[4].data = camilleWRData;

      // Determine min and max values for the Y-axis
      const allPaces = [
        ...paceStine.map((p) => p.paceSecondsPerKm),
        ...paceDavid.map((p) => p.paceSecondsPerKm),
        ...camilleWRData.map((d) => d.y),
        womensWorldRecordPace,
        mensWorldRecordPace,
      ];
      const minY = Math.min(...allPaces) - 30; // Provide a buffer below the fastest pace
      const maxY = Math.max(...allPaces) + 30; // Provide a buffer above the slowest pace

      // Adjust Y-axis range and ticks
      performanceChart.options.scales.y.min = minY;
      performanceChart.options.scales.y.max = maxY;

      // Determine appropriate tick interval in seconds
      const stepSize = 30; // Default step size in seconds
      performanceChart.options.scales.y.ticks.stepSize = stepSize;

      // Format Y-axis ticks as MM:SS
      performanceChart.options.scales.y.ticks.callback = function (value) {
        const minutes = Math.floor(value / 60);
        const seconds = Math.round(value % 60)
          .toString()
          .padStart(2, "0");
        return `${minutes}:${seconds}`;
      };

      // Adjust X-axis to reflect the actual elapsed time and show a bit ahead
      performanceChart.options.scales.x.min = 0;
      performanceChart.options.scales.x.max = xAxisMax;

      // Adjust the grid lines to show thicker lines every 24 hours
      performanceChart.options.scales.x.grid.color = function (context) {
        if (context.tick.value % 24 === 0) {
          return "#555"; // Dark gray for every 24 hours (major grid line)
        } else if (context.tick.value % 1 === 0) {
          return "#444"; // Light gray for every hour (minor grid line)
        }
      };
      performanceChart.options.scales.x.grid.lineWidth = function (context) {
        return context.tick.value % 24 === 0 ? 2 : 1; // Thicker line for every 24 hours
      };

      // Debugging line
      console.log("Chart data after update: ", performanceChart.data);

      // Update the chart
      performanceChart.update();
    },
  });
}

// Ensure this function is called after fetching the data
Promise.all([fetchData(11), fetchData(8)]).then(() => {
  updateChart();
});

// Load CSV data and then fetch and update data for Stine and David
loadCSVData();
Promise.all([fetchData(11), fetchData(8)]).then(() => {
  updateChart();
});

// Functions to adjust the X axis
function setXScale(min, max) {
  performanceChart.options.scales.x.min = min;
  performanceChart.options.scales.x.max = max;
  performanceChart.update();
}

// Set up event listeners for zoom buttons
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
  setXScale(0, maxTime); // Reset to show from 0 up to latest elapsed time
  performanceChart.options.plugins.zoom = {}; // Disable panning
  performanceChart.update();
});

// Functions to adjust the Y axis
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
  setYScale(undefined, undefined);
  performanceChart.options.plugins.zoom = {}; // Disable panning
  performanceChart.update();
});
