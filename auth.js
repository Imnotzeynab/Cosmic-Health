"use strict";


/* =========================================================
   IN5 — AUTHENTICATION
========================================================= */


/* =========================================================
   MODE
========================================================= */

let registerMode = false;


/* =========================================================
   ELEMENTS
========================================================= */

const authForm =
    document.getElementById("auth-form");

const authTitle =
    document.getElementById("auth-title");

const authIntro =
    document.getElementById("auth-intro");

const authButton =
    document.getElementById("auth-button");

const nameField =
    document.getElementById("name-field");

const nameInput =
    document.getElementById("name");

const switchText =
    document.getElementById("switch-text");

const switchButton =
    document.getElementById("switch-button");

const authMessage =
    document.getElementById("auth-message");


/* =========================================================
   INITIAL STATE
========================================================= */

nameField.style.display = "none";


/* =========================================================
   SWITCH LOGIN / REGISTER
========================================================= */

switchButton.addEventListener("click", function () {

    registerMode = !registerMode;


    if (registerMode) {

        /* ---------------------------------------------
           REGISTER MODE
        --------------------------------------------- */

        authTitle.textContent =
            "Create Account";

        authIntro.textContent =
            "Create your account.";

        authButton.textContent =
            "Create Account";

        switchText.textContent =
            "Already have an account?";

        switchButton.textContent =
            "Login";

        nameField.style.display =
            "block";

        nameInput.required =
            true;

    } else {

        /* ---------------------------------------------
           LOGIN MODE
        --------------------------------------------- */

        authTitle.textContent =
            "Welcome Back";

        authIntro.textContent =
            "Sign in.";

        authButton.textContent =
            "Login";

        switchText.textContent =
            "Don't have an account?";

        switchButton.textContent =
            "Create Account";

        nameField.style.display =
            "none";

        nameInput.required =
            false;
    }


    authMessage.textContent = "";

});


/* =========================================================
   FORM SUBMISSION
========================================================= */

authForm.addEventListener("submit", function (event) {

    event.preventDefault();

    authMessage.textContent = "";


    /* =====================================================
       REGISTER
    ===================================================== */

    if (registerMode) {

        const name =
            nameInput.value.trim();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;


        /* Check fields */

        if (!name || !email || !password) {

            authMessage.textContent =
                "Please complete all fields.";

            authMessage.className =
                "auth-message error";

            return;
        }


        /* Save basic account information locally */

        localStorage.setItem(
            "cosmicHealthUser",
            JSON.stringify({
                name: name,
                email: email
            })
        );


        /* ---------------------------------------------
           REGISTER → MAIN
        --------------------------------------------- */

        window.location.href =
            "main.html";

        return;
    }


    /* =====================================================
       LOGIN
    ===================================================== */

    const email =
        document
            .getElementById("email")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;


    /* Check fields */

    if (!email || !password) {

        authMessage.textContent =
            "Please enter your email and password.";

        authMessage.className =
            "auth-message error";

        return;
    }


    /* ---------------------------------------------
       LOGIN → MAIN
    --------------------------------------------- */

    window.location.href =
        "main.html";

});
