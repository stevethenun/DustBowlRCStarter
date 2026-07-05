const raceDaySelect = document.getElementById("raceDaySelect");
const viewRaceBtn = document.getElementById("viewRaceBtn");
const raceStatus = document.getElementById("raceStatus");

async function loadRaceDays() {

    try {

        const response = await fetch("data/raceDays.json");

        if (!response.ok) {
            throw new Error("Unable to load raceDays.json");
        }

        const raceDays = await response.json();

        raceDaySelect.innerHTML = '<option value="">Select a race day...</option>';

        raceDays.forEach(race => {

            const option = document.createElement("option");

            option.value = race.file;

            option.textContent =
                `${race.date} - ${race.title}`;

            raceDaySelect.appendChild(option);

        });

        raceStatus.textContent =
            `${raceDays.length} race day(s) loaded.`;

        viewRaceBtn.disabled = true;

    }
    catch (err) {

        console.error(err);

        raceStatus.textContent =
            "Unable to load race days.";

        raceDaySelect.innerHTML =
            '<option value="">No race days found</option>';

        viewRaceBtn.disabled = true;
    }

}

raceDaySelect.addEventListener("change", () => {

    viewRaceBtn.disabled = !raceDaySelect.value;

});

viewRaceBtn.addEventListener("click", () => {

    if (!raceDaySelect.value)
        return;

    window.location.href =
        `raceday.html?file=${encodeURIComponent(raceDaySelect.value)}`;

});

loadRaceDays();