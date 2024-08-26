const ctx = document.getElementById("lapChart").getContext("2d");
let lapData = [];

const lapChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Lap Time (seconds)",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        fill: false,
      },
    ],
  },
  options: {
    scales: {
      x: {
        title: {
          display: true,
          text: "Lap",
        },
      },
      y: {
        title: {
          display: true,
          text: "Time (seconds)",
        },
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

    lapData = splits.map((split, index) => ({
      lap: `Lap ${index + 1}`,
      time: parseTime(split.Chip),
    }));

    updateChart();
  } catch (error) {
    console.error("Error fetching lap data:", error);
  }
}

function parseTime(timeStr) {
  const parts = timeStr.split(":");
  return parseInt(parts[0]) * 60 + parseFloat(parts[1].replace(",", "."));
}

function updateChart() {
  lapChart.data.labels = lapData.map((data) => data.lap);
  lapChart.data.datasets[0].data = lapData.map((data) => data.time);
  lapChart.update();
}

// Fetch data every 30 seconds
setInterval(fetchLapData, 30000);
fetchLapData();
