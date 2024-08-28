// chartConfig.js
import {
  convertPaceToMinSecKm,
  convertPaceToMinSecMile,
  convertHoursToHMM,
} from "./common.js";

// Initialize the Performance Chart
export function initializePerformanceChart(ctx) {
  console.log("Initializing Performance Chart...");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "Stine Rex", data: [], hidden: false, borderColor: "#4BC0C0" },
        {
          label: "David Stoltenborg",
          data: [],
          hidden: false,
          borderColor: "#FF6384",
        },
        {
          label: "Katja Lykke",
          data: [],
          hidden: false,
          borderColor: "#36A2EB",
        },
        {
          label: "Katja Bjerre",
          data: [],
          hidden: false,
          borderColor: "#9966FF",
        },
        {
          label: "Peter Torjussen",
          data: [],
          hidden: false,
          borderColor: "#FF9F40",
        },
        {
          label: "Women's World Record Pace",
          data: [],
          hidden: false,
          borderColor: "#FF5722",
        },
        {
          label: "Men's World Record Pace",
          data: [],
          hidden: false,
          borderColor: "#2196F3",
        },
        {
          label: "Camille Herron WR",
          data: [],
          hidden: false,
          borderColor: "#FFD700",
        },
        {
          label: "Louise Kjellson - Nordic Record",
          data: [],
          hidden: false,
          borderColor: "#2ECC71",
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
              return `Pace: ${pacePerKm} min/km (${pacePerMile} min/mile)`;
            },
          },
        },
        legend: {
          labels: {
            color: "#FFF",
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
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
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
            color: "#FFF",
          },
          ticks: {
            stepSize: 1,
            callback: function (value, index, values) {
              const totalTicks = values.length;
              let labelInterval = 48;
              if (totalTicks <= 24) {
                labelInterval = 2;
              } else if (totalTicks <= 48) {
                labelInterval = 6;
              } else if (totalTicks <= 72) {
                labelInterval = 12;
              } else if (totalTicks <= 144) {
                labelInterval = 24;
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
            color: "#444",
            lineWidth: function (context) {
              return context.tick.value % 24 === 0 ? 2 : 1;
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
}

// Initialize the Relative Performance Chart
export function initializeRelativePerformanceChart(ctxRelative) {
  return new Chart(ctxRelative, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Stine Rex vs Camille Herron WR (Distance in Km)",
          data: [],
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
              return `Elapsed Time: ${convertHoursToHMM(context[0].raw.x)}`;
            },
            label: function (context) {
              const distanceKm = context.raw.y.toFixed(2);
              const distanceMiles = (context.raw.y * 0.621371).toFixed(2);
              return `Distance Ahead/Behind Camille: ${distanceKm} km (${distanceMiles} miles)`;
            },
          },
        },
        legend: {
          labels: {
            color: "#FFF",
          },
        },
        zoom: {
          limits: {
            x: { min: 0, max: 144, minRange: 1 },
            y: { min: -50, max: 50, minRange: 1 },
          },
          pan: {
            enabled: true,
            mode: "xy",
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
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
            color: "#FFF",
          },
          ticks: {
            stepSize: 1,
            callback: function (value, index, values) {
              const totalTicks = values.length;
              let labelInterval = 48;
              if (totalTicks <= 24) {
                labelInterval = 2;
              } else if (totalTicks <= 48) {
                labelInterval = 6;
              } else if (totalTicks <= 72) {
                labelInterval = 12;
              } else if (totalTicks <= 144) {
                labelInterval = 24;
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
            color: "#444",
            lineWidth: function (context) {
              return context.tick.value % 24 === 0 ? 2 : 1;
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
              if (value % 5 === 0) {
                return `${value} km`;
              }
              return "";
            },
            stepSize: 1,
            autoSkip: false,
          },
          grid: {
            color: "#444",
          },
        },
      },
    },
  });
}
