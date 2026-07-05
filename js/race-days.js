// =====================================================
// Dust Bowl RC - Home Page
// Loads available race days from:
// data/races.json
// =====================================================

const raceDaySelect = document.getElementById("raceDaySelect");
const viewRaceBtn = document.getElementById("viewRaceBtn");
const raceStatus = document.getElementById("raceStatus");

async function loadRaceDays() {

    try {

        const response = await fetch("data/races.json", { cache: "no-cache" });

        if (!response.ok) {
            throw new Error(`Unable to load races.json (HTTP ${response.status})`);
        }

        const raceDays = await response.json();

        if (!Array.isArray(raceDays) || raceDays.length === 0) {
            throw new Error("No race days found.");
        }

        raceDaySelect.innerHTML = "";

        raceDays.forEach(race => {

            const option = document.createElement("option");

            option.value = race.file;
            option.textContent = `${race.date} - ${race.title}`;

            raceDaySelect.appendChild(option);

        });

        // Select the newest race by default
        raceDaySelect.selectedIndex = 0;

        viewRaceBtn.disabled = false;

        raceStatus.textContent =
            `${raceDays.length} race day${raceDays.length === 1 ? "" : "s"} available.`;

    }
    catch (err) {

        console.error(err);

        raceDaySelect.innerHTML =
            `<option value="">No race days found</option>`;

        raceStatus.textContent = err.message;

        viewRaceBtn.disabled = true;

    }

}

raceDaySelect.addEventListener("change", () => {

    viewRaceBtn.disabled = raceDaySelect.value === "";

});

viewRaceBtn.addEventListener("click", () => {

    const file = raceDaySelect.value;

    if (!file)
        return;

    window.location.href = `raceday.html?file=${encodeURIComponent(file)}`;

});

loadRaceDays();