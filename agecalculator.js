// Auto insert "/" in DD/MM/YYYY format
document.getElementById("dob").addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "").substring(0, 8); // only digits
    if (v.length >= 5) this.value = v.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
    else if (v.length >= 3) this.value = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    else this.value = v;
});

function calculateAge() {
    const dob = document.getElementById("dob").value;

    // Validate format
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
        document.getElementById("result").innerHTML = "Invalid date format!";
        return;
    }

    const [day, month, year] = dob.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);

    if (birthDate > new Date()) {
        document.getElementById("result").innerHTML = "Date is in the future!";
        return;
    }

    let today = new Date();
    let ageY = today.getFullYear() - birthDate.getFullYear();
    let ageM = today.getMonth() - birthDate.getMonth();
    let ageD = today.getDate() - birthDate.getDate();

    if (ageD < 0) {
        ageM--;
        ageD += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (ageM < 0) {
        ageY--;
        ageM += 12;
    }

    document.getElementById("result").innerHTML =
        `Age: ${ageY} Years, ${ageM} Months, ${ageD} Days`;
}