let stations = [];
let fromCode = "";
let toCode = "";

fetch("stations.json", { cache: "no-store" })
    .then(res => res.json())
    .then(data => stations = data);

function setupAutocomplete(inputId, onSelect) {
    const input = document.getElementById(inputId);
    const field = input.parentElement;

    input.addEventListener("input", () => {
        closeSuggestions(field);
        const val = input.value.trim().toUpperCase();
        if (!val) return;

        const box = document.createElement("div");
        box.className = "suggestions";

        stations
            .filter(s => s.en.includes(val) || s.sc.includes(val))
            .slice(0, 8)
            .forEach(s => {
                const div = document.createElement("div");
                div.textContent = `${s.en} (${s.sc})`;
                div.onclick = () => {
                    input.value = `${s.en} (${s.sc})`;
                    onSelect(s.sc);
                    closeSuggestions(field);
                };
                box.appendChild(div);
            });

        field.appendChild(box);
    });
}
document.getElementById("swapBtn").onclick = () => {
    // swap input values
    const fromInput = document.getElementById("fromStation");
    const toInput = document.getElementById("toStation");

    [fromInput.value, toInput.value] = [toInput.value, fromInput.value];

    // swap station codes
    [fromCode, toCode] = [toCode, fromCode];
};


function closeSuggestions(container = document) {
    container.querySelectorAll(".suggestions").forEach(e => e.remove());
}


setupAutocomplete("fromStation", code => fromCode = code);
setupAutocomplete("toStation", code => toCode = code);
document.getElementById("searchBtn").onclick = async () => {
    const date = document.getElementById("journeyDate").value;
    const quota = document.getElementById("quota").value;

    if (!fromCode || !toCode || !date) {
        alert("Fill all fields");
        return;
    }

    const formattedDate = date.split("-").reverse().join("-");

    const url = `https://cttrainsapi.confirmtkt.com/api/v1/trains/search?sourceStationCode=${fromCode}&destinationStationCode=${toCode}&dateOfJourney=${formattedDate}&sortBy=DEFAULT&addAvailabilityCache=true`;

    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();

    renderTrains(json.data.trainList, quota);
};
// async function fetchPremiumTatkalAvailability(train, cls, doj) {
//     const payload = {
//         source: train.fromStnCode,
//         destination: train.toStnCode,
//         class: cls,
//         quota: "PT",
//         doj: doj.replaceAll("-", ""),
//         trainNumber: train.trainNumber,
//         moreThanOneDay: false,
//         status: ""
//     };

//     const res = await fetch("/.netlify/functions/ptAvailability", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(payload)
//     });


//     const json = await res.json();
//     return json.response?.availability_status;
// }

function renderTrains(trains, quota) {
    const container = document.getElementById("trainList");
    container.innerHTML = "";

    trains.forEach(train => {
        const div = document.createElement("div");
        div.className = "train-card";

        div.innerHTML = `
      <div class="header">
         <div>
        <b>${train.trainNumber}</b> - ${train.trainName} 
        </div>
        <div class="check-route" data-train="${train.trainNumber}">Check Route
       <i class="fa-solid fa-location-dot"></i>
       </div>
        </div>
      <div class="route">
        ${train.fromStnName} (${train.departureTime})
        →
        ${train.toStnName} (${train.arrivalTime})
      </div>
      <div class="classes">
        ${renderClasses(train, quota)}
      </div>
    `;

        container.appendChild(div);
        div.querySelector(".check-route").onclick = () => {
            showRoutePopup(train.trainNumber, train.trainName);
        };

    });


}
// function renderClasses(train, quota) {
//     const cache =
//         quota === "TQ"
//             ? train.availabilityCacheTatkal
//             : train.availabilityCache;

//     let html = "";

//     for (let cls in cache) {
//         const a = cache[cls];
//         const statusClass = getAvailabilityClass(a.availability || "");

//         html += `
//       <div class="class-box ${statusClass}">
//         <div><b>${cls}</b></div>
//         <div>${a.availabilityDisplayName || a.availability}</div>
//         <div>${a.predictionDisplayName || ""}</div>
//         <div>₹ ${a.fare}</div>
//       </div>
//     `;
//     }

//     return html || "<i>No availability</i>";
// }
function renderClasses(train, quota) {
    let html = "";

    // 🔥 PREMIUM TATKAL SPECIAL FLOW
    if (quota === "PT") {
        for (let cls in train.availabilityCacheTatkal) {
            html += `
              <div class="class-box avl-loading" data-train="${train.trainNumber}" data-class="${cls}">
                 <div><b>${cls}</b></div>
                 <div>Checking PT...</div>
              </div>
            `;
        }

        // async load PT data
        setTimeout(() => loadPTAvailability(train), 0);

        return html;
    }

    // ✅ NORMAL FLOW (unchanged)
    const cache =
        quota === "TQ"
            ? train.availabilityCacheTatkal
            : train.availabilityCache;

    for (let cls in cache) {
        const a = cache[cls];
        const statusClass = getAvailabilityClass(a.availability || "");

        html += `
          <div class="class-box ${statusClass}">
            <div><b>${cls}</b></div>
            <div>${a.availabilityDisplayName || a.availability}</div>
            <div>${a.predictionDisplayName || ""}</div>
            <div>₹ ${a.fare}</div>
          </div>
        `;
    }

    return html || "<i>No availability</i>";
}


function getAvailabilityClass(avlText = "") {
    const t = avlText.toUpperCase().trim();

    // ❗ check NEGATIVE cases FIRST
    if (
        t.includes("NOT AVAILABLE") ||
        t.includes("REGRET") ||
        t.includes("NO MORE")
    ) return "avl-not-available";

    if (t.includes("RAC")) return "avl-rac";
    if (t.includes("WL")) return "avl-wl";
    if (t.includes("AVAILABLE") || t.includes("CURR_AVL")) return "avl-available";

    return "avl-unknown";
}
async function loadPTAvailability(train) {
    const date = document.getElementById("journeyDate").value;
    const doj = date.split("-").reverse().join("-");

    for (let cls in train.availabilityCacheTatkal) {
        try {
            const pt = await fetchPremiumTatkalAvailability(train, cls, doj);
            if (!pt) continue;

            const box = document.querySelector(
                `.class-box[data-train="${train.trainNumber}"][data-class="${cls}"]`
            );

            if (!box) continue;

            box.className = `class-box ${getAvailabilityClass(pt.availability_status)}`;
            box.innerHTML = `
                <div><b>${cls}</b></div>
                <div>${pt.availability_status}</div>
                <div>₹ ${pt.price}</div>
                <div>${pt.last_updated_on}</div>
            `;
        } catch (e) {
            console.error("PT fetch failed", e);
        }
    }
}

async function showRoutePopup(trainNo, trainName) {
    const modal = document.getElementById("routeModal");
    const body = document.getElementById("routeBody");
    const title = document.getElementById("routeTitle");

    title.textContent = `${trainNo} – ${trainName}`;
    body.innerHTML = "Loading route...";
    modal.classList.remove("hidden");

    try {

        const res = await fetch(
            `/.netlify/functions/trainRoute?trainNo=${trainNo}`,
            { cache: "no-store" }
        );

        const html = await res.text();

        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Extract ONLY the route table
        const table = doc.querySelector("table.table");

        if (!table) {
            body.innerHTML = "Route table not found";
            return;
        }
        // ✅ REMOVE LAST TR FROM TBODY
        const tbody = table.querySelector("tbody");
        if (tbody && tbody.lastElementChild) {
            tbody.removeChild(tbody.lastElementChild);
        }
        // 🔥 REMOVE href FROM ALL .stationHover LINKS
        table.querySelectorAll("a.stationHover").forEach(a => {
            a.removeAttribute("href");
            a.removeAttribute("target");
            a.style.pointerEvents = "none";
            a.style.cursor = "default";
        });
        table.querySelectorAll("tbody tr").forEach(row => {
            const cells = row.querySelectorAll("td");
            const labels = ["Station", "Arr", "Dep", "Halt", "Day", "Distance"];

            cells.forEach((td, i) => {
                td.setAttribute("data-label", labels[i] || "");
            });
        });
        const wrapper = document.createElement("div");
        wrapper.className = "route-table-wrapper";
        wrapper.appendChild(table);

        body.innerHTML = "";
        body.appendChild(wrapper);

        body.innerHTML = "";
        body.appendChild(table);

    } catch (err) {
        body.innerHTML = "Failed to load route";
    }
}

document.getElementById("closeModal").onclick = () => {
    document.getElementById("routeModal").classList.add("hidden");
};
document.getElementById("routeModal").onclick = e => {
    if (e.target.id === "routeModal") {
        e.currentTarget.classList.add("hidden");
    }
};

