
let students = JSON.parse(localStorage.getItem("students")) || [];

// Get today's date in local format
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Convert old attendance data into date-wise history
students.forEach(student => {
    if (!student.attendanceHistory ||
        typeof student.attendanceHistory !== "object") {
        student.attendanceHistory = {};
    }

    if (student.attendance &&
        !student.attendanceHistory[getTodayDate()]) {
        student.attendanceHistory[getTodayDate()] =
            student.attendance;
    }

    delete student.attendance;
});

// Save student data
function saveData() {
    localStorage.setItem("students", JSON.stringify(students));
}

saveData();

// Set default attendance date
document.getElementById("attendanceDate").value = getTodayDate();

// Add new student
function addStudent() {
    const name = document.getElementById("studentName").value.trim();
    const roll = document.getElementById("studentRoll").value.trim();

    if (name === "" || roll === "") {
        alert("Please enter student name and roll number!");
        return;
    }

    if (students.some(student =>
        student.roll.toLowerCase() === roll.toLowerCase())) {
        alert("Roll number already exists!");
        return;
    }

    students.push({
        name: name,
        roll: roll,
        attendanceHistory: {}
    });

    saveData();
    displayStudents();

    document.getElementById("studentName").value = "";
    document.getElementById("studentRoll").value = "";
}

// Mark attendance for selected date
function markAttendance(roll, status) {
    const student = students.find(s => s.roll === roll);
    const selectedDate = document.getElementById("attendanceDate").value;

    if (!selectedDate) {
        alert("Please select a date!");
        return;
    }

    if (student) {
        student.attendanceHistory[selectedDate] = status;
        saveData();
        displayStudents();
    }
}

// Delete student
function deleteStudent(roll) {
    if (confirm("Are you sure you want to delete this student?")) {
        students = students.filter(student => student.roll !== roll);

        saveData();
        document.getElementById("historyContent").innerHTML = "";
        document.getElementById("historyMessage").textContent =
            "Student deleted.";

        displayStudents();
    }
}

// Calculate attendance percentage
function calculatePercentage(student) {
    const records = Object.values(student.attendanceHistory);

    const totalDays = records.filter(status =>
        status === "Present" || status === "Absent"
    ).length;

    const presentDays = records.filter(status =>
        status === "Present"
    ).length;

    if (totalDays === 0) {
        return 0;
    }

    return Math.round((presentDays / totalDays) * 100);
}

// Show attendance history
function viewHistory(roll) {
    const student = students.find(s => s.roll === roll);

    if (!student) return;

    document.getElementById("historyMessage").textContent =
        "Attendance history for " + student.name;

    const historyContent = document.getElementById("historyContent");
    historyContent.innerHTML = "";

    const dates = Object.keys(student.attendanceHistory).sort().reverse();

    if (dates.length === 0) {
        document.getElementById("historyMessage").textContent =
            "No attendance records found for " + student.name;
        return;
    }

    const table = document.createElement("table");
    table.className = "history-table";

    const header = document.createElement("tr");

    ["Date", "Attendance"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        header.appendChild(th);
    });

    table.appendChild(header);

    dates.forEach(date => {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.textContent = date;

        const statusCell = document.createElement("td");
        statusCell.textContent = student.attendanceHistory[date];

        row.appendChild(dateCell);
        row.appendChild(statusCell);

        table.appendChild(row);
    });

    historyContent.appendChild(table);
}

// Display and search students
function displayStudents() {
    const table = document.getElementById("studentTable");
    const searchInput = document.getElementById("searchInput");
    const selectedDate = document.getElementById("attendanceDate").value;

    table.innerHTML = "";

    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm) ||
        student.roll.toLowerCase().includes(searchTerm)
    );

    filteredStudents.forEach(student => {
        const row = document.createElement("tr");

        const rollCell = document.createElement("td");
        rollCell.textContent = student.roll;

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;

        const attendanceCell = document.createElement("td");
        const currentStatus = student.attendanceHistory[selectedDate] || "Not Marked";

        const statusText = document.createElement("span");
        statusText.className = "status";
        statusText.textContent = currentStatus;

        if (currentStatus === "Present") {
            statusText.classList.add("present-text");
        } else if (currentStatus === "Absent") {
            statusText.classList.add("absent-text");
        }

        const presentButton = document.createElement("button");
        presentButton.textContent = "Present";
        presentButton.className = "present-btn";
        presentButton.onclick = () => markAttendance(student.roll, "Present");

        const absentButton = document.createElement("button");
        absentButton.textContent = "Absent";
        absentButton.className = "absent-btn";
        absentButton.onclick = () => markAttendance(student.roll, "Absent");

        attendanceCell.appendChild(statusText);
        attendanceCell.appendChild(document.createElement("br"));
        attendanceCell.appendChild(presentButton);
        attendanceCell.appendChild(absentButton);

        const percentageCell = document.createElement("td");
        percentageCell.textContent = calculatePercentage(student) + "%";

        const actionsCell = document.createElement("td");

        const historyButton = document.createElement("button");
        historyButton.textContent = "History";
        historyButton.className = "history-btn";
        historyButton.onclick = () => viewHistory(student.roll);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.onclick = () => deleteStudent(student.roll);

        actionsCell.appendChild(historyButton);
        actionsCell.appendChild(deleteButton);

        row.appendChild(rollCell);
        row.appendChild(nameCell);
        row.appendChild(attendanceCell);
        row.appendChild(percentageCell);
        row.appendChild(actionsCell);

        table.appendChild(row);
    });

    // Dashboard counts for selected date
    document.getElementById("totalStudents").textContent =
        students.length;

    document.getElementById("presentCount").textContent =
        students.filter(s =>
            s.attendanceHistory[selectedDate] === "Present"
        ).length;

    document.getElementById("absentCount").textContent =
        students.filter(s =>
            s.attendanceHistory[selectedDate] === "Absent"
        ).length;
}

// Load students when page opens
displayStudents();
