const map = L.map("map").setView([48.151965, 17.072995], 15);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const fixedPoints = {
    school: { lat: 48.151965, lng: 17.072995, name: "Moja škola FEI STU v Bratislave" },
    home: { lat: 48.285454, lng: 17.27019, name: "Moje bydlisko blízko Pezinka" }
};

L.marker([fixedPoints.school.lat, fixedPoints.school.lng]).addTo(map).bindPopup(fixedPoints.school.name);
L.marker([fixedPoints.home.lat, fixedPoints.home.lng]).addTo(map).bindPopup(fixedPoints.home.name);

let customMarkers = JSON.parse(localStorage.getItem("customMarkers")) || [];
let markerLayers = {};
let activePolyline = null;
let pendingLatLng = null;

const infoPanel = document.getElementById("info-panel");
const markerSelect = document.getElementById("marker-select");
const destinationSelect = document.getElementById("destination-select");
const resultDisplay = document.getElementById("result-display");

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function updateCalculation() {
    const selectedIndex = markerSelect.value;
    if (selectedIndex === "" || !customMarkers[selectedIndex]) {
        if (activePolyline) {
            map.removeLayer(activePolyline);
            activePolyline = null;
        }
        resultDisplay.innerHTML = "";
        return;
    }

    const destKey = destinationSelect.value;
    const targetMarker = customMarkers[selectedIndex];
    const targetDest = fixedPoints[destKey];

    const distance = haversine(targetMarker.lat, targetMarker.lng, targetDest.lat, targetDest.lng);

    if (activePolyline) {
        map.removeLayer(activePolyline);
    }

    activePolyline = L.polyline([
        [targetMarker.lat, targetMarker.lng],
        [targetDest.lat, targetDest.lng]
    ], { color: 'red', weight: 4 }).addTo(map);

    map.fitBounds(activePolyline.getBounds(), { padding: [50, 50] });

    resultDisplay.innerHTML = `
        <p><strong>Miesto:</strong> ${targetMarker.name}</p>
        <p><strong>Cieľ:</strong> ${destKey === 'school' ? 'Škola' : 'Bydlisko'}</p>
        <p><strong>Vzdialenosť:</strong> ${distance.toFixed(2)} km</p>
    `;

    const markerLayer = markerLayers[selectedIndex];
    if (markerLayer) {
        markerLayer.setPopupContent(`<strong>${targetMarker.name}</strong><br>Vzdialenosť: ${distance.toFixed(2)} km`);
        markerLayer.openPopup();
    }
}

function renderMarkers(preserveSelection = false) {
    const currentVal = preserveSelection ? markerSelect.value : "";

    Object.values(markerLayers).forEach(layer => map.removeLayer(layer));
    markerLayers = {};

    markerSelect.innerHTML = '<option value="">-- Vyberte bod --</option>';

    if (customMarkers.length === 0) {
        infoPanel.classList.remove("hidden");
        markerSelect.disabled = true;
        destinationSelect.disabled = true;
        resultDisplay.innerHTML = "";
        if (activePolyline) {
            map.removeLayer(activePolyline);
            activePolyline = null;
        }
    } else {
        infoPanel.classList.add("hidden");
        markerSelect.disabled = false;
        destinationSelect.disabled = false;

        customMarkers.forEach((m, index) => {
            const marker = L.marker([m.lat, m.lng]).addTo(map).bindPopup(m.name);
            markerLayers[index] = marker;

            const opt = document.createElement("option");
            opt.value = index;
            opt.textContent = m.name;
            markerSelect.appendChild(opt);
        });

        if (currentVal !== "" && customMarkers[currentVal]) {
            markerSelect.value = currentVal;
            updateCalculation();
        }
    }
}

map.on("click", (e) => {
    pendingLatLng = e.latlng;
    const name = prompt("Zadajte názov tohto bodu:");
    if (!name || name.trim() === "") return;

    customMarkers.push({ name: name.trim(), lat: pendingLatLng.lat, lng: pendingLatLng.lng });
    localStorage.setItem("customMarkers", JSON.stringify(customMarkers));
    
    // Automatically select the newly added marker
    renderMarkers(false);
    markerSelect.value = customMarkers.length - 1;
    updateCalculation();
});

markerSelect.addEventListener("change", updateCalculation);
destinationSelect.addEventListener("change", updateCalculation);

const clearBtn = document.getElementById("clear-btn");
if (clearBtn) {
    clearBtn.addEventListener("click", () => {
        if (confirm("Naozaj chcete vymazať všetky uložené body?")) {
            localStorage.removeItem("customMarkers");
            customMarkers = [];
            if (activePolyline) {
                map.removeLayer(activePolyline);
                activePolyline = null;
            }
            renderMarkers(false);
        }
    });
}

renderMarkers(false);