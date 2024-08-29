// Data Arrays
let stineRexRelativeDistance = [];

// Helper function to interpolate between two points
function interpolate(x1, y1, x2, y2, x) {
  return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
}

// Function to calculate the relative distance in km
function calculateRelativeDistance() {
  stineRexRelativeDistance = elapsedHoursStine.map((time, index) => {
    const stinePace = paceStine[index].paceSecondsPerKm;

    // Find the two closest points in Camille's data for interpolation
    const camilleData = performanceChart.data.datasets[8].data;
    let camilleBefore = null;
    let camilleAfter = null;

    for (let i = 0; i < camilleData.length - 1; i++) {
      if (camilleData[i].x <= time && camilleData[i + 1].x >= time) {
        camilleBefore = camilleData[i];
        camilleAfter = camilleData[i + 1];
        break;
      }
    }

    if (camilleBefore && camilleAfter) {
      // Interpolate Camille's distance
      const interpolatedCamilleDistance = interpolate(
        camilleBefore.x,
        (camilleBefore.x * 3600) / camilleBefore.y,
        camilleAfter.x,
        (camilleAfter.x * 3600) / camilleAfter.y,
        time
      );
      const stineDistance = (time * 3600) / stinePace;

      return {
        x: time,
        y: stineDistance - interpolatedCamilleDistance, // Relative distance in km
      };
    } else {
      return { x: time, y: 0 };
    }
  });
}

// Initialize the Relative Performance Chart
let ctxRelative = document
  .getElementById("relativePerformanceChart")
  .getContext("2d");
let relativePerformanceChart = new Chart(ctxRelative, {
  type: "line",
  data: {
    labels: elapsedHoursStine,
    datasets: [
      {
        label: "Stine Rex vs Camille Herron WR (Distance in Km)",
        data: stineRexRelativeDistance,
        borderColor: "#4BC0C0",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        pointHitRadius: 10,
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
            // Convert elapsed time to HH:MM format
            return `Elapsed Time: ${convertHoursToHMM(context[0].raw.x)}`;
          },
          label: function (context) {
            const distanceKm = context.raw.y.toFixed(2);
            const distanceMiles = (context.raw.y * 0.621371).toFixed(2); // Convert km to miles

            return `Distance Ahead/Behind Camille: ${distanceKm} km (${distanceMiles} miles)`;
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
          y: { min: -100, max: 150, minRange: 1 },
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
            xMin: 0,
            xMax: 0,
            borderColor: "rgba(117, 255, 71, 0.5)",
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              enabled: true,
              position: "end",
              content: "00:00",
              backgroundColor: "rgba(187, 40, 14, 0.8)",
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
          autoSkip: false,
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
          text: "Relative Distance (km)",
          color: "#FFF",
        },
        ticks: {
          color: "#DDD",
          callback: function (value) {
            // Only show labels for every 5 km to reduce clutter
            if (value % 5 === 0) {
              return `${value} km`;
            }
            return ""; // Skip labels for other values
          },
          stepSize: 1, // Step size is still 1 km for internal calculations
          autoSkip: false, // Do not skip ticks
        },
        grid: {
          color: function (context) {
            if (context.tick.value === 0) {
              return "rgba(255, 255, 255, 0.9)"; // Bright line for 0 value
            } else if (context.tick.value % 5 === 0) {
              return "rgba(255, 255, 255, 0.4)"; // Brighter line for every 5 km
            }
            return "#444"; // Default grid color
          },
          lineWidth: function (context) {
            if (context.tick.value === 0) {
              return 2; // Thicker line for 0 value
            } else if (context.tick.value % 5 === 0) {
              return 1.5; // Slightly thicker line for every 5 km
            }
            return 1; // Default line width
          },
        },
      },
    },
  },
});

// Load and update the relative chart
function updateRelativeChart() {
  calculateRelativeDistance();

  const maxTime = Math.max(...stineRexRelativeDistance.map((d) => d.x));
  const extendedMaxTime = maxTime + 1; // Add 1 hour of space on the right side

  relativePerformanceChart.data.labels = elapsedHoursStine;
  relativePerformanceChart.data.datasets[0].data = stineRexRelativeDistance;

  // Adjust the X-axis max to include extra space
  relativePerformanceChart.options.scales.x.max = extendedMaxTime;

  relativePerformanceChart.update();
}

// Update the relative chart when the main chart is updated
updateRelativeChart();

// Function to handle zooming and resetting the X and Y axes
function setRelativeXScale(min, max) {
  relativePerformanceChart.options.scales.x.min = min;
  relativePerformanceChart.options.scales.x.max = max;

  // Ensure ticks are shown correctly on the X-axis
  relativePerformanceChart.options.scales.x.ticks = {
    stepSize: 1,
    callback: function (value, index, values) {
      const totalTicks = values.length;
      let labelInterval = 1;

      // Set label intervals based on the zoom level (tighter control)
      if (max - min <= 6) {
        labelInterval = 1; // Show labels every hour when zoomed in to 6 hours or less
      } else if (max - min <= 24) {
        labelInterval = 2; // Show labels every 2 hours when zoomed in to 24 hours or less
      } else {
        labelInterval = 6; // Show labels every 6 hours otherwise
      }

      if (value % labelInterval === 0) {
        return convertHoursToHMM(value);
      }
      return "";
    },
    color: "#DDD",
    maxRotation: 0,
    autoSkip: false,
  };

  relativePerformanceChart.update();
}

function setRelativeYScale(min, max) {
  relativePerformanceChart.options.scales.y.min = Math.min(min, 0); // Ensure 0 is included
  relativePerformanceChart.options.scales.y.max = max;

  // Ensure the 0 line is always visible and distinguishable
  relativePerformanceChart.options.scales.y.grid = {
    color: function (context) {
      if (context.tick.value === 0) {
        return "rgba(255, 255, 255, 0.8)"; // Bright line for 0 value
      } else if (context.tick.value % 5 === 0) {
        return "rgba(255, 255, 255, 0.6)"; // Brighter line for every 5 km
      }
      return "#444"; // Default grid color
    },
    lineWidth: function (context) {
      if (context.tick.value === 0) {
        return 2; // Thicker line for 0 value
      } else if (context.tick.value % 5 === 0) {
        return 1.5; // Slightly thicker line for every 5 km
      }
      return 1; // Default line width
    },
  };

  relativePerformanceChart.update();
}

// Zoom button event listeners
document
  .getElementById("relativeZoom6h")
  .addEventListener("click", function () {
    const maxTime = Math.max(...stineRexRelativeDistance.map((d) => d.x));
    const minTime = Math.max(maxTime - 6, 0); // Show last 6 hours or from the start
    const extendedMaxTime = Math.max(maxTime + 1, 6); // Ensure at least 6 hours + 1 hour buffer
    setRelativeXScale(minTime, extendedMaxTime);
  });

document
  .getElementById("relativeZoom24h")
  .addEventListener("click", function () {
    const maxTime = Math.max(...stineRexRelativeDistance.map((d) => d.x));
    const minTime = Math.max(maxTime - 24, 0); // Show last 24 hours or from the start
    const extendedMaxTime = Math.max(maxTime + 1, 24); // Ensure at least 24 hours + 1 hour buffer
    setRelativeXScale(minTime, extendedMaxTime);
  });

document
  .getElementById("relativeZoomAll")
  .addEventListener("click", function () {
    setRelativeXScale(0, 145); // Show all 144 hours + 1 hour buffer
  });

document
  .getElementById("relativeResetX")
  .addEventListener("click", function () {
    const maxTime = Math.max(...stineRexRelativeDistance.map((d) => d.x));
    const extendedMaxTime = maxTime + 1; // Add 1 hour of space on the right side
    setRelativeXScale(0, extendedMaxTime);
  });

document
  .getElementById("relativeTightY")
  .addEventListener("click", function () {
    const minY = Math.min(...stineRexRelativeDistance.map((d) => d.y)) - 1;
    const maxY = Math.max(...stineRexRelativeDistance.map((d) => d.y)) + 1;
    setRelativeYScale(minY, maxY);
  });

document
  .getElementById("relativeResetY")
  .addEventListener("click", function () {
    setRelativeYScale(-50, 50); // Reset Y to full range
  });

// Update the relative chart when the main chart is updated
updateRelativeChart();
