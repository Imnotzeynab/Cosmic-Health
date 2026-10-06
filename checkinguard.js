/* =========================================================
   CHECK-IN GUARD
   Needs healthdata.js loaded first.
   Shows a message instead of the check-in page if the user
   already completed a check-in in the last 24 hours.
   ========================================================= */

if (hasCheckInForToday()) {

    const main = document.querySelector("main");

    if (main) {

        main.className = "no-checkin-page";

        main.innerHTML = `
            <div class="no-checkin-card">

                <p class="section-label">NASA HEALTH</p>

                <h1>YOU ALREADY CHECKED IN</h1>

                <p>
                    You have already completed a health check-in
                    within the last 24 hours.
                </p>

                <p>
                    You can start a new check-in once 24 hours
                    have passed.
                </p>

                <div class="no-checkin-actions">
                    <a href="res.html" class="continue-btn">
                        VIEW TODAY'S ANALYSIS
                    </a>
                    <a href="hh.html" class="secondary-result-button">
                        VIEW HISTORY
                    </a>
                </div>

            </div>
        `;
    }
}