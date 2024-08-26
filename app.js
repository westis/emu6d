const ctx = document.getElementById("lapChart").getContext("2d");
let lapData = [];

const lapChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Estimated Distance (km)",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "World Record (901.768 km)",
        data: [],
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
      },
    ],
  },
  options: {
    scales: {
      x: {
        title: {
          display: true,
          text: "Elapsed Time (hours)",
        },
        type: "linear",
        position: "bottom",
      },
      y: {
        title: {
          display: true,
          text: "Estimated Distance (km)",
        },
        beginAtZero: true,
      },
    },
  },
});

async function fetchLapData() {
  try {
    const response = await axios.get(
      "https://my3.raceresult.com/288150/RRPublish/data/splits?key=768ff798a15beb28bcae9991ffa5791f&bib=11"
    );
    const splits = response.data.Splits.filter((split) => split.Exists);

    let cumulativeTime = 0;
    let totalDistance = 0;
    lapData = splits.map((split, index) => {
      const elapsedTime = parseTime(split.Gun); // Use 'Gun' time as elapsed time
      cumulativeTime = elapsedTime / 3600; // Convert to hours

      // Calculate distance covered based on pace and elapsed time
      const paceParts = split.Speed.split(" ")[0].split(":");
      const paceInSeconds =
        parseInt(paceParts[0]) * 60 + parseInt(paceParts[1]);
      const distanceForThisLap = 1 / (paceInSeconds / 3600); // Assuming each lap is 1 km

      totalDistance += distanceForThisLap;

      return {
        time: cumulativeTime,
        distance: totalDistance,
      };
    });

    updateChart();
  } catch (error) {
    console.error("Error fetching lap data:", error);
  }
}

function parseTime(timeStr) {
  const parts = timeStr.split(":");
  return (
    parseInt(parts[0]) * 3600 +
    parseInt(parts[1]) * 60 +
    parseFloat(parts[2].replace(",", "."))
  );
}

function updateChart() {
  lapChart.data.labels = lapData.map((data) => data.time);
  lapChart.data.datasets[0].data = lapData.map((data) => data.distance);

  // Add the world record line
  const worldRecordData = lapData.map((data) => 901.768); // 901.768 km constant line
  lapChart.data.datasets[1].data = worldRecordData;

  lapChart.update();
}

// Fetch data every 30 seconds
setInterval(fetchLapData, 30000);
fetchLapData();
