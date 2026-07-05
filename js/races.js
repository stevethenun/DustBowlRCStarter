// =====================================================
// Dust Bowl RC - Race Day Results
// Works with LapMonitor JSON files
// Example:
// raceday.html?file=2026-07-04.json
// JSON should be in:
// data/results/2026-07-04.json
// =====================================================

const DEFAULT_RACE_FILE = "2026-07-04.json";

let raceDayData = null;

const classSelect = document.getElementById("classSelect");

const raceName = document.getElementById("raceName");
const raceDescription = document.getElementById("raceDescription");
const raceDayDate = document.getElementById("raceDayDate");

const firstPlace = document.getElementById("firstPlace");
const secondPlace = document.getElementById("secondPlace");
const thirdPlace = document.getElementById("thirdPlace");

const winner = document.getElementById("winner");
const driverCount = document.getElementById("driverCount");
const fastLap = document.getElementById("fastLap");
const fastDriver = document.getElementById("fastDriver");
const raceLength = document.getElementById("raceLength");

const leaderboardBody = document.querySelector("#heatTable tbody");
const lapTimes = document.getElementById("lapTimes");

async function loadRaceDay() {
    try {
        const fileName = getRaceFileName();
        const response = await fetch(`data/results/${fileName}`);

        if (!response.ok) {
            throw new Error(`Could not load data/results/${fileName}`);
        }

        raceDayData = await response.json();

        if (!raceDayData.races || raceDayData.races.length === 0) {
            throw new Error("No races found in this JSON file.");
        }

        buildRaceDropdown();
        renderRace(0);
    }
    catch (error) {
        raceName.innerText = "Race Failed To Load";
        raceDescription.innerText = error.message;
        console.error(error);
    }
}

function getRaceFileName() {
    const params = new URLSearchParams(window.location.search);
    return params.get("file") || DEFAULT_RACE_FILE;
}

function buildRaceDropdown() {
    classSelect.innerHTML = "";

    raceDayData.races.forEach((race, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.innerText = race.name || `Race ${index + 1}`;
        classSelect.appendChild(option);
    });

    classSelect.addEventListener("change", () => {
        renderRace(Number(classSelect.value));
    });
}

function renderRace(index) {
    const race = raceDayData.races[index];
    const standings = buildStandings(race);

    raceName.innerText = race.name || "Race Results";
    raceDayDate.innerText = formatDate(race.date);

    raceDescription.innerText =
        `${race.duration || "--"} ${race.durationType || "laps"} race • ${standings.length} drivers`;

    raceLength.innerText =
        `${race.duration || "--"} ${race.durationType || ""}`;

    renderPodium(standings);
    renderStats(standings);
    renderLeaderboard(standings);
    renderLapTimes(standings);
}

function buildStandings(race) {
    const drivers = race.drivers || [];

    const standings = drivers.map(driver => {
        const sortedLaps = [...(driver.laps || [])]
            .sort((a, b) => a.endTimestamp - b.endTimestamp);

        const calculatedLaps = sortedLaps
            .map((lap, index) => {

                const previousTimestamp =
                    index === 0 ? 0 : sortedLaps[index - 1].endTimestamp;

                return {
                    lapNumber: index + 1,
                    lapId: lap.lapId,
                    endTimestamp: lap.endTimestamp,
                    lapTime: lap.endTimestamp - previousTimestamp,
                    kind: lap.kind
                };

            })
            // Ignore the launch lap
            .filter((lap, index) => index > 0);

        const validLapTimes = calculatedLaps
            .map(lap => lap.lapTime)
            .filter(time => time > 0);

        const lapCount = calculatedLaps.length;
        const totalTime = sortedLaps.length > 0
            ? sortedLaps[sortedLaps.length - 1].endTimestamp
            : 0;

        const bestLap = validLapTimes.length > 0
            ? Math.min(...validLapTimes)
            : null;

        const averageLap = validLapTimes.length > 0
            ? validLapTimes.reduce((sum, time) => sum + time, 0) / validLapTimes.length
            : null;

        return {
            name: cleanName(driver.name),
            transponderId: driver.transponderId,
            lapCount,
            totalTime,
            bestLap,
            averageLap,
            laps: calculatedLaps
        };
    });

    standings.sort((a, b) => {
        if (b.lapCount !== a.lapCount) {
            return b.lapCount - a.lapCount;
        }

        return a.totalTime - b.totalTime;
    });

    return standings;
}

function renderPodium(standings) {
    firstPlace.innerText = standings[0]?.name || "--";
    secondPlace.innerText = standings[1]?.name || "--";
    thirdPlace.innerText = standings[2]?.name || "--";
}

function renderStats(standings) {
    winner.innerText = standings[0]?.name || "--";
    driverCount.innerText = standings.length;

    const fastest = findFastestLap(standings);

    if (fastest) {
        fastLap.innerText = formatTime(fastest.lapTime);
        fastDriver.innerText = fastest.driverName;
    }
    else {
        fastLap.innerText = "--";
        fastDriver.innerText = "--";
    }
}

function renderLeaderboard(standings) {
    leaderboardBody.innerHTML = "";

    standings.forEach((driver, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${getPositionText(index + 1)}</td>
            <td>${escapeHtml(driver.name)}</td>
            <td>${driver.lapCount}</td>
            <td>${formatTime(driver.bestLap)}</td>
            <td>${formatTime(driver.averageLap)}</td>
            <td>${formatTime(driver.totalTime)}</td>
        `;

        row.addEventListener("click", () => {
            renderSingleDriverLapTimes(driver);
        });

        leaderboardBody.appendChild(row);
    });
}

function renderLapTimes(standings) {
    if (!standings.length) {
        lapTimes.innerHTML = "No lap data found.";
        return;
    }

    renderSingleDriverLapTimes(standings[0]);
}

function renderSingleDriverLapTimes(driver) {
    const lapRows = driver.laps.map(lap => {
        const isBestLap = lap.lapTime === driver.bestLap;

        return `
            <tr class="${isBestLap ? "best-lap-row" : ""}">
                <td>${lap.lapNumber}</td>
                <td>${formatTime(lap.lapTime)}</td>
                <td>${formatTime(lap.endTimestamp)}</td>
                <td>${lap.kind || ""}</td>
            </tr>
        `;
    }).join("");

    lapTimes.innerHTML = `
        <h3>${escapeHtml(driver.name)} Lap Times</h3>

        <table class="lapTable">
            <thead>
                <tr>
                    <th>Lap</th>
                    <th>Lap Time</th>
                    <th>Total Time</th>
                    <th>Type</th>
                </tr>
            </thead>

            <tbody>
                ${lapRows}
            </tbody>
        </table>
    `;
}

function findFastestLap(standings) {
    let fastest = null;

    standings.forEach(driver => {
        driver.laps.forEach(lap => {
            if (lap.lapTime <= 0) {
                return;
            }

            if (!fastest || lap.lapTime < fastest.lapTime) {
                fastest = {
                    driverName: driver.name,
                    lapTime: lap.lapTime
                };
            }
        });
    });

    return fastest;
}

function formatTime(ms) {
    if (ms === null || ms === undefined || !Number.isFinite(ms)) {
        return "--";
    }

    const totalSeconds = ms / 1000;

    if (totalSeconds >= 60) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
    }

    return totalSeconds.toFixed(3);
}

function formatDate(dateText) {
    if (!dateText) {
        return "Unknown Date";
    }

    const date = new Date(dateText);

    if (Number.isNaN(date.getTime())) {
        return dateText;
    }

    return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

function cleanName(name) {
    return String(name || "Unknown Driver").trim();
}

function getPositionText(position) {
    if (position === 1) return "?? 1";
    if (position === 2) return "?? 2";
    if (position === 3) return "?? 3";
    return position;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadRaceDay();