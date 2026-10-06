/* =========================================================
NASA HEALTH AUTHENTICATION
========================================================= */

const USERS_KEY = "nasaUsers";
const CURRENT_USER_KEY = "nasaCurrentUser";

/* =========================================================
SECTIONS
========================================================= */

const loginSection =
document.getElementById("login-section");

const registerSection =
document.getElementById("register-section");

const forgotSection =
document.getElementById("forgot-section");

/* =========================================================
FORMS
========================================================= */

const loginForm =
document.getElementById("login-form");

const registerForm =
document.getElementById("register-form");

const forgotForm =
document.getElementById("forgot-form");

/* =========================================================
BUTTONS
========================================================= */

const showRegister =
document.getElementById("show-register");

const showLogin =
document.getElementById("show-login");

const showForgotPassword =
document.getElementById(
"show-forgot-password"
);

const backToLogin =
document.getElementById(
"back-to-login"
);

/* =========================================================
MESSAGES
========================================================= */

const loginError =
document.getElementById("login-error");

const registerError =
document.getElementById("register-error");

const forgotError =
document.getElementById("forgot-error");

const forgotSuccess =
document.getElementById("forgot-success");

/* =========================================================
GET USERS
========================================================= */

function getUsers() {


const savedUsers =
    localStorage.getItem(USERS_KEY);

if (!savedUsers) {
    return {};
}

try {

    return JSON.parse(savedUsers);

}
catch (error) {

    console.error(
        "Could not read users:",
        error
    );

    return {};

}


}

/* =========================================================
SAVE USERS
========================================================= */

function saveUsers(users) {


localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
);


}

/* =========================================================
CREATE USER ID
========================================================= */

function createUserId(username) {


return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");


}

/* =========================================================
SHOW LOGIN
========================================================= */

function showLoginSection() {


loginSection.style.display = "block";

registerSection.style.display = "none";

forgotSection.style.display = "none";

loginError.textContent = "";
registerError.textContent = "";
forgotError.textContent = "";
forgotSuccess.textContent = "";


}

/* =========================================================
SHOW REGISTER
========================================================= */

function showRegisterSection() {


loginSection.style.display = "none";

registerSection.style.display = "block";

forgotSection.style.display = "none";

loginError.textContent = "";
registerError.textContent = "";
forgotError.textContent = "";
forgotSuccess.textContent = "";


}

/* =========================================================
SHOW FORGOT PASSWORD
========================================================= */

function showForgotSection() {


loginSection.style.display = "none";

registerSection.style.display = "none";

forgotSection.style.display = "block";

loginError.textContent = "";
registerError.textContent = "";
forgotError.textContent = "";
forgotSuccess.textContent = "";


}

/* =========================================================
NAVIGATION BUTTONS
========================================================= */

showRegister.addEventListener(
"click",
function () {


    showRegisterSection();

}


);

showLogin.addEventListener(
"click",
function () {


    showLoginSection();

}


);

showForgotPassword.addEventListener(
"click",
function () {


    showForgotSection();

}

);

backToLogin.addEventListener(
"click",
function () {


    showLoginSection();

}


);

/* =========================================================
REGISTER
========================================================= */

registerForm.addEventListener(
"submit",
function (event) {


    event.preventDefault();

    registerError.textContent = "";

    const username =
        document
            .getElementById(
                "register-username"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "register-password"
            )
            .value;

    const confirmPassword =
        document
            .getElementById(
                "register-confirm"
            )
            .value;


    if (username.length < 3) {

        registerError.textContent =
            "Username must contain at least 3 characters.";

        return;

    }


    if (password.length < 6) {

        registerError.textContent =
            "Password must contain at least 6 characters.";

        return;

    }


    if (password !== confirmPassword) {

        registerError.textContent =
            "Passwords do not match.";

        return;

    }


    const users = getUsers();

    const userId =
        createUserId(username);


    if (users[userId]) {

        registerError.textContent =
            "This username already exists.";

        return;

    }


    users[userId] = {

        id: userId,

        username: username,

        password: password

    };


    saveUsers(users);


    const healthData = {

        indicators: [],

        musculoskeletal: {
            selectedSymptoms: []
        },

        cardiovascular: {
            selectedSymptoms: []
        },

        immuneGeneral: {
            selectedSymptoms: []
        },

        respiratory: {
            selectedSymptoms: []
        },

        mentalBehavioral: {
            selectedSymptoms: []
        },

        sleep: {
            selectedSymptoms: []
        },

        otherSymptoms: {
            selectedSymptoms: []
        },

        severity: {},

        symptomDetails: {},

        date: null,

        history: []

    };


    localStorage.setItem(
        "nasaHealthData_" + userId,
        JSON.stringify(healthData)
    );


    localStorage.setItem(
        CURRENT_USER_KEY,
        userId
    );


    window.location.href =
        "healthind.html";

}


);

/* =========================================================
LOGIN
========================================================= */

loginForm.addEventListener(
"submit",
function (event) {


    event.preventDefault();

    loginError.textContent = "";

    const username =
        document
            .getElementById(
                "login-username"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "login-password"
            )
            .value;


    const users = getUsers();

    const userId =
        createUserId(username);


    if (!users[userId]) {

        loginError.textContent =
            "Account not found.";

        return;

    }


    if (
        users[userId].password !==
        password
    ) {

        loginError.textContent =
            "Incorrect password.";

        return;

    }


    localStorage.setItem(
        CURRENT_USER_KEY,
        userId
    );


    const healthKey =
        "nasaHealthData_" + userId;


    if (
        !localStorage.getItem(
            healthKey
        )
    ) {

        const healthData = {

            indicators: [],

            musculoskeletal: {
                selectedSymptoms: []
            },

            cardiovascular: {
                selectedSymptoms: []
            },

            immuneGeneral: {
                selectedSymptoms: []
            },

            respiratory: {
                selectedSymptoms: []
            },

            mentalBehavioral: {
                selectedSymptoms: []
            },

            sleep: {
                selectedSymptoms: []
            },

            otherSymptoms: {
                selectedSymptoms: []
            },

            severity: {},

            symptomDetails: {},

            date: null,

            history: []

        };


        localStorage.setItem(
            healthKey,
            JSON.stringify(healthData)
        );

    }


    window.location.href =
        "healthind.html";

}


);

/* =========================================================
FORGOT PASSWORD
========================================================= */

forgotForm.addEventListener(
"submit",
function (event) {


    event.preventDefault();

    forgotError.textContent = "";
    forgotSuccess.textContent = "";


    const username =
        document
            .getElementById(
                "forgot-username"
            )
            .value
            .trim();

    const newPassword =
        document
            .getElementById(
                "forgot-password"
            )
            .value;

    const confirmPassword =
        document
            .getElementById(
                "forgot-confirm"
            )
            .value;


    /* Check username */

    const users = getUsers();

    const userId =
        createUserId(username);


    if (!users[userId]) {

        forgotError.textContent =
            "Account not found.";

        return;

    }


    /* Check password length */

    if (newPassword.length < 6) {

        forgotError.textContent =
            "Password must contain at least 6 characters.";

        return;

    }


    /* Check passwords */

    if (
        newPassword !==
        confirmPassword
    ) {

        forgotError.textContent =
            "Passwords do not match.";

        return;

    }


    /* Update password */

    users[userId].password =
        newPassword;


    saveUsers(users);


    forgotSuccess.textContent =
        "Your password has been reset successfully.";


    forgotForm.reset();


    /*
       Give the user a moment to see
       the success message, then return
       to the login page.
    */

    setTimeout(
        function () {

            showLoginSection();

            document
                .getElementById(
                    "login-username"
                )
                .value = username;

        },
        1500
    );

}


);

