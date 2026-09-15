/* =====================================================
   USER PROFILE
===================================================== */

function loadUserProfile() {

    /*
       Login ke time localStorage me "loggedInUser"
       naam se user object save hona chahiye.
    */

    let user = localStorage.getItem("loggedInUser");

    if (!user) {

        // Demo user
        user = {
            id: "USR001",
            name: "Krishna",
            email: "krishna@example.com",
            phone: "+91 9876543210",
            department: "Investigation",
            role: "Admin",
            address: "Lucknow, Uttar Pradesh"
        };

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(user)
        );
    }

    user = JSON.parse(user);

    // Top navbar name
    const topUserName = document.getElementById("topUserName");

    if (topUserName) {
        topUserName.textContent = user.name;
    }

    // Profile data
    document.getElementById("profileName").textContent =
        user.name || "-";

    document.getElementById("profileRole").textContent =
        user.role || "-";

    document.getElementById("profileFullName").textContent =
        user.name || "-";

    document.getElementById("profileEmail").textContent =
        user.email || "-";

    document.getElementById("profilePhone").textContent =
        user.phone || "-";

    document.getElementById("profileUserId").textContent =
        user.id || "-";

    document.getElementById("profileDepartment").textContent =
        user.department || "-";

    document.getElementById("profileRoleDetails").textContent =
        user.role || "-";

    document.getElementById("profileAddress").textContent =
        user.address || "-";

    // Avatar me name ka first letter
    const avatar = document.getElementById("profileAvatar");

    if (avatar) {
        avatar.textContent =
            user.name ? user.name.charAt(0).toUpperCase() : "U";
    }
}


/* =====================================================
   OPEN PROFILE
===================================================== */

function openProfile() {

    loadUserProfile();

    const modal = document.getElementById("profileModal");

    if (modal) {
        modal.style.display = "flex";
    }
}


/* =====================================================
   CLOSE PROFILE
===================================================== */

function closeProfile() {

    const modal = document.getElementById("profileModal");

    if (modal) {
        modal.style.display = "none";
    }
}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
        return;
    }

    /*
       Login session remove
    */
    localStorage.removeItem("loggedInUser");

    /*
       Agar aapke project me token/session hai,
       to yahan usko bhi remove kar sakte hain.
    */

    localStorage.removeItem("token");
    sessionStorage.clear();

    /*
       Login page par redirect
       Apne login page ka naam yahan set karein.
    */
    window.location.href = "login.html";
}


//    CLOSE PROFILE WHEN CLICKING OUTSIDE

window.addEventListener("click", function(event) {

    const modal = document.getElementById("profileModal");

    if (event.target === modal) {
        closeProfile();
    }

});


// PAGE LOAD

document.addEventListener("DOMContentLoaded", function() {

    loadUserProfile();

});
