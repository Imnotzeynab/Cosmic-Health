/* =========================================================
NASA HEALTH
LOGIN SESSION GUARD
========================================================= */

const CURRENT_USER_KEY =
"nasaCurrentUser";

const currentUser =
localStorage.getItem(
CURRENT_USER_KEY
);

/* =========================================================
CHECK LOGIN
========================================================= */

if (!currentUser) {


window.location.href =
    "auth.html";


}
