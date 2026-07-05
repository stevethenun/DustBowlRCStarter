document.getElementById("firstPlace").innerText = "Steve";
document.getElementById("secondPlace").innerText = "Tim";
document.getElementById("thirdPlace").innerText = "Jason";

document.getElementById("winner").innerText = "Steve";
document.getElementById("driverCount").innerText = "18";
document.getElementById("fastLap").innerText = "19.224";
document.getElementById("fastDriver").innerText = "Steve";

const classes = [
    "2WD Stock",
    "2WD Mod",
    "4WD",
    "Mini B",
    "Kids"
];

const classSelect = document.getElementById("classSelect");

classes.forEach(c => {

    let o = document.createElement("option");
    o.text = c;
    classSelect.appendChild(o);

});

const heatBody = document.querySelector("#heatTable tbody");

[
    ["1", "Steve", "27", "19.224"],
    ["2", "Tim", "27", "19.510"],
    ["3", "Jason", "26", "19.921"],
    ["4", "Nick", "26", "20.114"]
].forEach(r => {

    let tr = document.createElement("tr");

    r.forEach(v => {

        let td = document.createElement("td");
        td.innerText = v;
        tr.appendChild(td);

    });

    heatBody.appendChild(tr);

});

document.querySelector("#mainTable tbody").innerHTML = heatBody.innerHTML;