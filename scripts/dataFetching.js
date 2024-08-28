// dataFetching.js

export let elapsedHoursStine = [];
export let paceStine = [];
export let elapsedHoursDavid = [];
export let paceDavid = [];
export let elapsedHoursKatjaLykke = [];
export let paceKatjaLykke = [];
export let elapsedHoursKatjaBjerre = [];
export let paceKatjaBjerre = [];
export let elapsedHoursPeterTorjussen = [];
export let pacePeterTorjussen = [];

// Global variables for CSV data
export let camilleData = [];
export let louiseData = [];

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

// Fetch data for specific bib and update arrays
export async function fetchData(bib, runner) {
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

  return { runner, elapsedHours, pace };
}

// Load and parse CSV file for Camille Herron
function loadCSVData(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function (results) {
        const data = results.data
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

        resolve(data);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}
