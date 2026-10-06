/* =========================================================
   COSMIC HEALTH — 7 WEEK HEALTH HISTORY

   Requires:
   healthdata.js

   Expected health history format:

   {
       date: "2026-10-01",
       status: "STABLE",
       averageSeverity: 2.4,

       musculoskeletal: 1,
       cardiovascular: 0,
       sleep: 3,
       respiratory: 1,
       mentalBehavioral: 2,
       other: 0
   }

   The script is designed to also tolerate missing
   indicator fields.
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const weeklyChart =
    document.getElementById("weekly-chart");

const chartContainer =
    document.getElementById("chart-container");

const chartInstruction =
    document.getElementById("chart-instruction");

const emptyMessage =
    document.getElementById("history-empty");

const totalCheckins =
    document.getElementById("total-checkins");

const weeksRecorded =
    document.getElementById("weeks-recorded");

const latestStatus =
    document.getElementById("latest-status");

const weekDetail =
    document.getElementById("week-detail");

const selectedWeekTitle =
    document.getElementById("selected-week-title");

const selectedWeekDescription =
    document.getElementById("selected-week-description");

const weekCheckins =
    document.getElementById("week-checkins");

const weekAverage =
    document.getElementById("week-average");

const weekStatus =
    document.getElementById("week-status");

const indicatorList =
    document.getElementById("indicator-list");

const weekDailyList =
    document.getElementById("week-daily-list");

const closeWeekDetail =
    document.getElementById("close-week-detail");

const backButton =
    document.getElementById("back-button");


/* =========================================================
   HEALTH HISTORY
   ========================================================= */

const history =
    typeof getHealthHistory === "function"
        ? getHealthHistory()
        : [];


/* =========================================================
   CONSTANTS
   ========================================================= */

const REQUIRED_DAYS = 7;

const MAX_WEEKS = 7;


/* =========================================================
   HEALTH INDICATORS
   ========================================================= */

const INDICATORS = [

    {
        key: "musculoskeletal",
        label: "MUSCULOSKELETAL",
        possibleKeys: [
            "musculoskeletal",
            "musculoskeletalSeverity",
            "musculoskeletalHealth"
        ]
    },

    {
        key: "cardiovascular",
        label: "CARDIOVASCULAR",
        possibleKeys: [
            "cardiovascular",
            "cardiovascularSeverity",
            "cardiovascularHealth"
        ]
    },

    {
        key: "sleep",
        label: "SLEEP",
        possibleKeys: [
            "sleep",
            "sleepSeverity",
            "sleepHealth"
        ]
    },

    {
        key: "respiratory",
        label: "RESPIRATORY",
        possibleKeys: [
            "respiratory",
            "respiratorySeverity",
            "respiratoryHealth"
        ]
    },

    {
        key: "mentalBehavioral",
        label: "MENTAL & BEHAVIORAL",
        possibleKeys: [
            "mentalBehavioral",
            "mental",
            "behavioral",
            "mentalSeverity",
            "behavioralSeverity"
        ]
    },

    {
        key: "other",
        label: "OTHER SYMPTOMS",
        possibleKeys: [
            "other",
            "otherSymptoms",
            "otherSeverity"
        ]
    }

];


/* =========================================================
   DATE HELPERS
   ========================================================= */


/*
    Converts a YYYY-MM-DD date into a local Date.

    Using T00:00:00 prevents the browser from interpreting
    the date as UTC and moving it backward by one day.
*/

function createLocalDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

    return isNaN(date.getTime())
        ? null
        : date;

}


/*
    Returns Monday of the week containing the date.
*/

function getMonday(date) {

    const result =
        new Date(date);

    const day =
        result.getDay();

    const difference =
        day === 0
            ? -6
            : 1 - day;

    result.setDate(
        result.getDate() + difference
    );

    result.setHours(
        0,
        0,
        0,
        0
    );

    return result;

}


/*
    Creates a YYYY-MM-DD key.
*/

function dateKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


/*
    Adds a number of days to a date.
*/

function addDays(date, amount) {

    const result =
        new Date(date);

    result.setDate(
        result.getDate() + amount
    );

    return result;

}


/* =========================================================
   FORMATTING
   ========================================================= */

function formatShortDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );

}


function formatWeekRange(startDate) {

    const endDate =
        addDays(startDate, 6);

    return (
        formatShortDate(startDate) +
        " — " +
        formatShortDate(endDate)
    );

}


/* =========================================================
   NORMALIZE HISTORY
   ========================================================= */

function normalizeHistory() {

    if (!Array.isArray(history)) {
        return [];
    }

    return history

        .map(function (entry) {

            const date =
                createLocalDate(entry.date);

            if (!date) {
                return null;
            }

            return {
                ...entry,
                parsedDate: date,
                severity: normalizeSeverity(
                    entry.averageSeverity
                )
            };

        })

        .filter(Boolean)

        .sort(function (a, b) {

            return (
                a.parsedDate -
                b.parsedDate
            );

        });

}


/* =========================================================
   SEVERITY
   ========================================================= */

function normalizeSeverity(value) {

    const number =
        Number(value);

    if (isNaN(number)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            5,
            number
        )
    );

}


/* =========================================================
   FIND INDICATOR VALUE
   ========================================================= */

function getIndicatorValue(
    entry,
    indicator
) {

    for (
        let i = 0;
        i < indicator.possibleKeys.length;
        i++
    ) {

        const key =
            indicator.possibleKeys[i];

        if (
            entry[key] !== undefined &&
            entry[key] !== null &&
            entry[key] !== ""
        ) {

            const value =
                Number(entry[key]);

            if (!isNaN(value)) {

                return Math.max(
                    0,
                    Math.min(
                        5,
                        value
                    )
                );

            }

        }

    }

    return null;

}


/* =========================================================
   CREATE WEEK STRUCTURE
   ========================================================= */

function createWeeks(entries) {

    const weeks = {};

    entries.forEach(function (entry) {

        const monday =
            getMonday(entry.parsedDate);

        const key =
            dateKey(monday);

        if (!weeks[key]) {

            weeks[key] = {

                startDate: monday,

                entries: []

            };

        }

        weeks[key].entries.push(entry);

    });


    return Object.values(weeks)

        .sort(function (a, b) {

            return (
                a.startDate -
                b.startDate
            );

        });

}


/* =========================================================
   CREATE 7-WEEK OVERVIEW

   We show the latest 7 calendar weeks containing the
   current history period.

   Missing weeks remain visible as NO DATA.
   ========================================================= */

function createSevenWeekOverview(
    entries
) {

    if (
        !entries ||
        entries.length === 0
    ) {

        return [];

    }


    const latestDate =
        entries[
            entries.length - 1
        ].parsedDate;


    const latestMonday =
        getMonday(latestDate);


    const weeksByKey =
        {};


    createWeeks(entries).forEach(
        function (week) {

            weeksByKey[
                dateKey(
                    week.startDate
                )
            ] = week;

        }
    );


    const result = [];


    /*
        Build seven weeks ending with
        the most recent week.
    */

    for (
        let i = MAX_WEEKS - 1;
        i >= 0;
        i--
    ) {

        const weekStart =
            addDays(
                latestMonday,
                -(i * 7)
            );

        const key =
            dateKey(weekStart);


        result.push({

            startDate: weekStart,

            entries:
                weeksByKey[key]
                    ? weeksByKey[key].entries
                    : []

        });

    }


    return result;

}


/* =========================================================
   WEEK AVERAGE
   ========================================================= */

function getWeekAverage(entries) {

    if (
        !entries ||
        entries.length === 0
    ) {

        return null;

    }


    const validEntries =
        entries.filter(function (entry) {

            return (
                typeof entry.severity === "number"
            );

        });


    if (
        validEntries.length === 0
    ) {

        return null;

    }


    const total =
        validEntries.reduce(
            function (sum, entry) {

                return (
                    sum +
                    entry.severity
                );

            },
            0
        );


    return (
        total /
        validEntries.length
    );

}


/* =========================================================
   WEEK STATUS
   ========================================================= */

function getWeekStatus(entries) {

    if (
        !entries ||
        entries.length === 0
    ) {

        return "NO DATA";

    }


    const latest =
        entries[
            entries.length - 1
        ];


    return (
        latest.status ||
        "RECORDED"
    );

}


/* =========================================================
   DISPLAY MAIN PAGE
   ========================================================= */

function displayHealthHistory() {

    const entries =
        normalizeHistory();


    /* -----------------------------------------
       SUMMARY
       ----------------------------------------- */

    totalCheckins.textContent =
        entries.length;


    if (entries.length > 0) {

        const latest =
            entries[
                entries.length - 1
            ];

        latestStatus.textContent =
            latest.status ||
            "RECORDED";

    } else {

        latestStatus.textContent =
            "—";

    }


    /*
        The weekly chart needs at least
        7 days/check-ins.
    */

    if (
        entries.length <
        REQUIRED_DAYS
    ) {

        chartContainer.style.display =
            "none";

        chartInstruction.style.display =
            "none";

        emptyMessage.style.display =
            "block";

        weeksRecorded.textContent =
            "0";

        return;

    }


    /* -----------------------------------------
       CHART AVAILABLE
       ----------------------------------------- */

    emptyMessage.style.display =
        "none";

    chartContainer.style.display =
        "flex";

    chartInstruction.style.display =
        "block";


    const weeks =
        createSevenWeekOverview(
            entries
        );


    const recordedWeeks =
        weeks.filter(function (week) {

            return (
                week.entries.length > 0
            );

        });


    weeksRecorded.textContent =
        recordedWeeks.length;


    renderWeeklyChart(weeks);

}


/* =========================================================
   RENDER WEEKLY CHART
   ========================================================= */

function renderWeeklyChart(weeks) {

    weeklyChart.innerHTML = "";


    weeks.forEach(
        function (week, index) {

            const hasData =
                week.entries.length > 0;


            const average =
                getWeekAverage(
                    week.entries
                );


            /* ---------------------------------
               WEEK COLUMN
               --------------------------------- */

            const column =
                document.createElement("button");

            column.type =
                "button";

            column.className =
                "weekly-bar-column";


            if (!hasData) {

                column.classList.add(
                    "no-data-week"
                );

            }


            /*
                Current week receives a special
                class.
            */

            if (
                index ===
                weeks.length - 1
            ) {

                column.classList.add(
                    "current-week"
                );

            }


            /* ---------------------------------
               BAR AREA
               --------------------------------- */

            const barArea =
                document.createElement("div");

            barArea.className =
                "weekly-bar-area";


            if (hasData) {

                const bar =
                    document.createElement("div");

                bar.className =
                    "weekly-health-bar";


                const severity =
                    normalizeSeverity(
                        average
                    );


                bar.style.height =
                    Math.max(
                        4,
                        (severity / 5) * 100
                    ) + "%";


                const value =
                    document.createElement("span");

                value.className =
                    "weekly-bar-value";

                value.textContent =
                    severity.toFixed(1);


                bar.appendChild(value);

                barArea.appendChild(bar);

            } else {

                const noData =
                    document.createElement("span");

                noData.className =
                    "no-data-label";

                noData.textContent =
                    "NO DATA";

                barArea.appendChild(
                    noData
                );

            }


            /* ---------------------------------
               WEEK LABEL
               --------------------------------- */

            const label =
                document.createElement("span");

            label.className =
                "weekly-bar-label";


            if (
                index ===
                weeks.length - 1
            ) {

                label.textContent =
                    "CURRENT";

            } else {

                label.textContent =
                    "WEEK " +
                    (
                        index + 1
                    );

            }


            const dates =
                document.createElement("small");

            dates.className =
                "weekly-bar-dates";

            dates.textContent =
                formatWeekRange(
                    week.startDate
                );


            column.appendChild(
                barArea
            );

            column.appendChild(
                label
            );

            column.appendChild(
                dates
            );


            /* ---------------------------------
               CLICK WEEK
               --------------------------------- */

            column.addEventListener(
                "click",
                function () {

                    openWeekDetail(
                        week
                    );

                }
            );


            weeklyChart.appendChild(
                column
            );

        }
    );

}


/* =========================================================
   OPEN WEEK DETAIL
   ========================================================= */

function openWeekDetail(week) {

    const entries =
        week.entries;


    const average =
        getWeekAverage(entries);


    const status =
        getWeekStatus(entries);


    /* -----------------------------------------
       HEADER
       ----------------------------------------- */

    selectedWeekTitle.textContent =
        formatWeekRange(
            week.startDate
        );


    selectedWeekDescription.textContent =
        entries.length > 0

            ? "Review the health information recorded during this week."

            : "No health check-ins were recorded during this week.";


    /* -----------------------------------------
       SUMMARY
       ----------------------------------------- */

    weekCheckins.textContent =
        entries.length;


    weekAverage.textContent =
        average === null
            ? "—"
            : average.toFixed(1) +
              " / 5";


    weekStatus.textContent =
        status;


    /* -----------------------------------------
       INDICATORS
       ----------------------------------------- */

    renderIndicators(entries);


    /* -----------------------------------------
       DAILY CHECK-INS
       ----------------------------------------- */

    renderDailyEntries(entries);


    /* -----------------------------------------
       SHOW
       ----------------------------------------- */

    weekDetail.style.display =
        "block";


    /*
        Smoothly move the user to
        the selected week's details.
    */

    weekDetail.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   RENDER HEALTH INDICATORS
   ========================================================= */

function renderIndicators(entries) {

    indicatorList.innerHTML = "";


    INDICATORS.forEach(
        function (indicator) {

            const values = [];


            entries.forEach(
                function (entry) {

                    const value =
                        getIndicatorValue(
                            entry,
                            indicator
                        );


                    if (
                        value !== null
                    ) {

                        values.push(value);

                    }

                }
            );


            const item =
                document.createElement("div");

            item.className =
                "indicator-item";


            const header =
                document.createElement("div");

            header.className =
                "indicator-header";


            const name =
                document.createElement("span");

            name.className =
                "indicator-name";

            name.textContent =
                indicator.label;


            const value =
                document.createElement("span");

            value.className =
                "indicator-value";


            const progress =
                document.createElement("div");

            progress.className =
                "indicator-progress";


            const fill =
                document.createElement("div");

            fill.className =
                "indicator-progress-fill";


            if (values.length === 0) {

                value.textContent =
                    "NO DATA";

                fill.style.width =
                    "0%";

            } else {

                const average =
                    values.reduce(
                        function (
                            total,
                            current
                        ) {

                            return (
                                total +
                                current
                            );

                        },
                        0
                    ) /
                    values.length;


                value.textContent =
                    average.toFixed(1) +
                    " / 5";


                fill.style.width =
                    (
                        average /
                        5 *
                        100
                    ) +
                    "%";

            }


            header.appendChild(
                name
            );

            header.appendChild(
                value
            );


            progress.appendChild(
                fill
            );


            item.appendChild(
                header
            );

            item.appendChild(
                progress
            );


            indicatorList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   RENDER DAILY ENTRIES
   ========================================================= */

function renderDailyEntries(entries) {

    weekDailyList.innerHTML = "";


    if (
        !entries ||
        entries.length === 0
    ) {

        const noData =
            document.createElement("div");

        noData.className =
            "daily-no-data";

        noData.textContent =
            "NO CHECK-INS WERE RECORDED THIS WEEK.";

        weekDailyList.appendChild(
            noData
        );

        return;

    }


    entries.forEach(
        function (entry) {

            const row =
                document.createElement("div");

            row.className =
                "daily-entry";


            const date =
                document.createElement("span");

            date.className =
                "daily-entry-date";

            date.textContent =
                formatShortDate(
                    entry.parsedDate
                );


            const status =
                document.createElement("span");

            status.className =
                "daily-entry-status";

            status.textContent =
                entry.status ||
                "RECORDED";


            const severity =
                document.createElement("span");

            severity.className =
                "daily-entry-severity";

            severity.textContent =
                entry.severity.toFixed(1) +
                " / 5";


            row.appendChild(
                date
            );

            row.appendChild(
                status
            );

            row.appendChild(
                severity
            );


            weekDailyList.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   CLOSE WEEK DETAIL
   ========================================================= */

closeWeekDetail.addEventListener(
    "click",
    function () {

        weekDetail.style.display =
            "none";

    }
);


/* =========================================================
   HOME BUTTON
   ========================================================= */

backButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "index.html";

    }
);


/* =========================================================
   START
   ========================================================= */

displayHealthHistory();