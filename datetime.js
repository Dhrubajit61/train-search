function updateTime() {
    let now = new Date();

    // Convert time to IST
    let options = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    };

    let timeString = now.toLocaleTimeString("en-GB", options);

    // Custom Date Format: 4-Feb-2026
    let day = now.toLocaleString("en-GB", { timeZone: "Asia/Kolkata", day: "numeric" });
    let month = now.toLocaleString("en-GB", { timeZone: "Asia/Kolkata", month: "short" });
    let year = now.toLocaleString("en-GB", { timeZone: "Asia/Kolkata", year: "numeric" });

    let dateString = `${day}-${month}-${year}`;

    document.getElementById("time").textContent = timeString;
    document.getElementById("date").textContent = dateString;
}

updateTime();
setInterval(updateTime, 1000);
