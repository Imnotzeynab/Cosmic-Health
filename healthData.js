
const HEALTH_DATA_PREFIX = "nasaHealthData_";
const CURRENT_USER_KEY = "nasaCurrentUser";

const CHECK_IN_DURATION = 24 * 60 * 60 * 1000;

const HEALTH_CATEGORIES = [
    "musculoskeletal",
    "cardiovascular",
    "immuneGeneral",
    "respiratory",
    "mentalBehavioral",
    "sleep",
    "otherSymptoms"
];


/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUserId() {
    return localStorage.getItem(CURRENT_USER_KEY);
}


function getHealthDataKey() {

    const userId = getCurrentUserId();

    if (!userId) {
        return null;
    }

    return HEALTH_DATA_PREFIX + userId;
}


/* =========================================================
   CREATE / RESET
========================================================= */

function emptyCategories() {

    const categories = {};

    HEALTH_CATEGORIES.forEach(function (category) {

        categories[category] = {
            selectedSymptoms: []
        };

    });

    return categories;
}


function createHealthData() {

    return Object.assign(

        {
            indicators: [],

            bodyAreas: [],

            latestResult: null
        },

        emptyCategories(),

        {
            severity: {},

            symptomDetails: {},

            date: null,

            history: []
        }

    );

}


/*
    Clears the CURRENT check-in.

    It DOES NOT delete:
    - history
    - latestResult
*/

function resetCurrentCheckIn(data) {

    data.indicators = [];

    data.bodyAreas = [];

    Object.assign(
        data,
        emptyCategories()
    );

    data.severity = {};

    data.symptomDetails = {};

    data.date = null;

    return data;
}


/* =========================================================
   CHECK-IN VALIDITY
========================================================= */

function hasValidCurrentCheckIn(data) {

    if (!data || !data.date) {
        return false;
    }


    const checkInDate =
        new Date(data.date).getTime();


    if (isNaN(checkInDate)) {
        return false;
    }


    const elapsed =
        Date.now() - checkInDate;


    return (
        elapsed >= 0 &&
        elapsed < CHECK_IN_DURATION
    );

}


/* =========================================================
   GET / SAVE
========================================================= */

function getHealthData() {

    const key =
        getHealthDataKey();


    if (!key) {

        return createHealthData();

    }


    const storedData =
        localStorage.getItem(key);


    let data;


    if (!storedData) {

        data =
            createHealthData();


        localStorage.setItem(
            key,
            JSON.stringify(data)
        );


        return data;

    }


    try {

        data =
            JSON.parse(storedData);

    }

    catch (error) {

        console.error(
            "Could not read health data:",
            error
        );


        data =
            createHealthData();

    }


    /* Make sure all categories exist */

    HEALTH_CATEGORIES.forEach(
        function (category) {

            if (!data[category]) {

                data[category] = {
                    selectedSymptoms: []
                };

            }


            if (
                !Array.isArray(
                    data[category].selectedSymptoms
                )
            ) {

                data[category].selectedSymptoms = [];

            }

        }
    );


    /* Make sure other data exists */

    if (!Array.isArray(data.indicators)) {

        data.indicators = [];

    }


    if (!Array.isArray(data.bodyAreas)) {

        data.bodyAreas = [];

    }


    if (!data.severity) {

        data.severity = {};

    }


    if (!data.symptomDetails) {

        data.symptomDetails = {};

    }


    if (!Array.isArray(data.history)) {

        data.history = [];

    }


    /*
        Reset expired CURRENT check-in.

        History remains untouched.
    */

    if (
        data.date &&
        !hasValidCurrentCheckIn(data)
    ) {

        data =
            resetCurrentCheckIn(data);


        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    }


    return data;

}


function saveHealthData(data) {

    const key =
        getHealthDataKey();


    if (!key) {

        console.error(
            "No current user found. Health data cannot be saved."
        );

        return;

    }


    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}


/* =========================================================
   BODY AREAS — 3D BODY MAP
========================================================= */

function saveBodyAreas(areas) {

    const data =
        getHealthData();


    data.bodyAreas =
        Array.isArray(areas)
            ? areas
            : [];


    saveHealthData(data);

}


function getBodyAreas() {

    const data =
        getHealthData();


    return Array.isArray(data.bodyAreas)
        ? data.bodyAreas
        : [];

}


/*
    Saves description and duration
    for one affected body area.
*/

function saveBodyAreaDetails(
    label,
    description,
    duration
) {

    const data =
        getHealthData();


    const area =
        data.bodyAreas.find(
            function (item) {

                return item.label === label;

            }
        );


    if (!area) {
        return;
    }


    area.description =
        description;


    area.duration =
        duration;


    saveHealthData(data);

}


/*
    Saves 1–5 severity
    for one affected body area.
*/

function saveBodyAreaSeverity(
    label,
    severity
) {

    const data =
        getHealthData();


    const area =
        data.bodyAreas.find(
            function (item) {

                return item.label === label;

            }
        );


    if (!area) {
        return;
    }


    area.severity =
        severity;


    saveHealthData(data);

}


/* =========================================================
   SYMPTOMS
========================================================= */

function ensureCategory(
    data,
    category
) {

    if (!data[category]) {

        data[category] = {
            selectedSymptoms: []
        };

    }


    if (
        !Array.isArray(
            data[category].selectedSymptoms
        )
    ) {

        data[category].selectedSymptoms = [];

    }

}


function addSymptom(
    category,
    symptom
) {

    const data =
        getHealthData();


    ensureCategory(
        data,
        category
    );


    if (
        !data[category]
            .selectedSymptoms
            .includes(symptom)
    ) {

        data[category]
            .selectedSymptoms
            .push(symptom);

    }


    saveHealthData(data);

}


function removeSymptom(
    category,
    symptom
) {

    const data =
        getHealthData();


    if (
        !data[category] ||
        !Array.isArray(
            data[category].selectedSymptoms
        )
    ) {

        return;

    }


    data[category].selectedSymptoms =
        data[category]
            .selectedSymptoms
            .filter(
                function (item) {

                    return item !== symptom;

                }
            );


    saveHealthData(data);

}


function toggleSymptom(
    category,
    symptom
) {

    const data =
        getHealthData();


    ensureCategory(
        data,
        category
    );


    const index =
        data[category]
            .selectedSymptoms
            .indexOf(symptom);


    if (index === -1) {

        data[category]
            .selectedSymptoms
            .push(symptom);

    }

    else {

        data[category]
            .selectedSymptoms
            .splice(index, 1);

    }


    saveHealthData(data);

}


/* =========================================================
   SYMPTOM SEVERITY
========================================================= */

function saveSymptomSeverity(
    category,
    symptom,
    severity
) {

    const data =
        getHealthData();


    if (!data.severity[category]) {

        data.severity[category] = {};

    }


    data.severity[category][symptom] =
        severity;


    saveHealthData(data);

}


/* =========================================================
   SYMPTOM DETAILS
========================================================= */

function saveSymptomDetails(
    category,
    symptom,
    details
) {

    const data =
        getHealthData();


    if (
        !data.symptomDetails[category]
    ) {

        data.symptomDetails[category] =
            {};

    }


    data.symptomDetails[category][symptom] =
        details;


    saveHealthData(data);

}


/* =========================================================
   CHECK-IN DATE
========================================================= */

function setHealthCheckInDate(date) {

    const data =
        getHealthData();


    data.date =
        date ||
        new Date().toISOString();


    saveHealthData(data);

}


function finalizeCheckIn() {

    const data =
        getHealthData();


    data.date =
        new Date().toISOString();


    saveHealthData(data);


    return data;

}


/* =========================================================
   BUILD INDICATOR HISTORY
========================================================= */

/*
    This creates the indicator-level information
    that will be stored in the long-term history.

    Example:

    indicators: {
        sleep: {
            severity: 4,
            symptoms: ["Difficulty sleeping"]
        }
    }
*/

function buildIndicatorHistory(data) {

    const indicators = {};


    HEALTH_CATEGORIES.forEach(
        function (category) {

            const categoryData =
                data[category];


            if (!categoryData) {
                return;
            }


            const symptoms =
                Array.isArray(
                    categoryData.selectedSymptoms
                )
                    ? categoryData.selectedSymptoms
                    : [];


            const categorySeverities =
                data.severity &&
                data.severity[category]
                    ? data.severity[category]
                    : {};


            const severityValues = [];


            Object.keys(
                categorySeverities
            ).forEach(
                function (symptom) {

                    const value =
                        Number(
                            categorySeverities[symptom]
                        );


                    if (
                        Number.isFinite(value) &&
                        value >= 1 &&
                        value <= 5
                    ) {

                        severityValues.push(
                            value
                        );

                    }

                }
            );


            /*
                Find the average severity
                for this specific indicator.
            */

            let indicatorSeverity =
                null;


            if (
                severityValues.length > 0
            ) {

                indicatorSeverity =
                    severityValues.reduce(
                        function (a, b) {
                            return a + b;
                        },
                        0
                    )
                    /
                    severityValues.length;

            }


            /*
                Store the indicator only if
                there is actual information.
            */

            if (
                symptoms.length > 0 ||
                indicatorSeverity !== null
            ) {

                indicators[category] = {

                    severity:
                        indicatorSeverity,

                    symptoms:
                        [...symptoms],

                    severities:
                        Object.assign(
                            {},
                            categorySeverities
                        )

                };

            }

        }
    );


    /*
        Also include body-map information
        under musculoskeletal when available.
    */

    if (
        Array.isArray(data.bodyAreas) &&
        data.bodyAreas.length > 0
    ) {

        if (!indicators.musculoskeletal) {

            indicators.musculoskeletal = {
                severity: null,
                symptoms: [],
                severities: {}
            };

        }


        indicators.musculoskeletal.bodyAreas =
            data.bodyAreas.map(
                function (area) {

                    return Object.assign(
                        {},
                        area
                    );

                }
            );


        const bodySeverities =
            data.bodyAreas
                .map(
                    function (area) {

                        return Number(
                            area.severity
                        );

                    }
                )
                .filter(
                    function (value) {

                        return (
                            Number.isFinite(value) &&
                            value >= 1 &&
                            value <= 5
                        );

                    }
                );


        if (
            bodySeverities.length > 0
        ) {

            indicators.musculoskeletal.severity =
                bodySeverities.reduce(
                    function (a, b) {
                        return a + b;
                    },
                    0
                )
                /
                bodySeverities.length;

        }

    }


    return indicators;

}


/* =========================================================
   DAILY ANALYSIS / LONG-TERM HISTORY
========================================================= */

function saveDailyHealthAnalysis(
    analysis
) {

    const data =
        getHealthData();


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    if (
        !Array.isArray(data.history)
    ) {

        data.history = [];

    }


    /*
        Build indicator-level history
        from the CURRENT check-in.
    */

    const indicators =
        buildIndicatorHistory(data);


    const historyEntry = {

        date:
            today,

        averageSeverity:
            analysis.averageSeverity ?? 0,

        highestSeverity:
            analysis.highestSeverity ?? 0,

        severeSymptoms:
            analysis.severeSymptoms ?? 0,

        status:
            analysis.status ??
            "A LITTLE SICK",

        /*
            NEW:
            Detailed indicator data.
        */

        indicators:
            indicators

    };


    /*
        One historical entry per day.

        If today's entry already exists,
        update it rather than creating
        duplicates.
    */

    const existingIndex =
        data.history.findIndex(
            function (entry) {

                return entry.date === today;

            }
        );


    if (
        existingIndex !== -1
    ) {

        data.history[existingIndex] =
            historyEntry;

    }

    else {

        data.history.push(
            historyEntry
        );

    }


    /*
        Keep history chronologically ordered.
    */

    data.history.sort(
        function (a, b) {

            return (
                new Date(a.date) -
                new Date(b.date)
            );

        }
    );


    saveHealthData(data);

}


/* =========================================================
   SAVE LATEST RESULT
========================================================= */

function saveLatestResult(result) {

    const data =
        getHealthData();


    /*
        Fallback numbers calculated
        from the 1–5 severities.
    */

    const values = [];


    Object.keys(
        data.severity || {}
    ).forEach(
        function (category) {

            Object.keys(
                data.severity[category] || {}
            ).forEach(
                function (symptom) {

                    const value =
                        Number(
                            data.severity
                                [category]
                                [symptom]
                        );


                    if (
                        Number.isFinite(value)
                    ) {

                        values.push(value);

                    }

                }
            );

        }
    );


    const stats = {};


    if (values.length > 0) {

        stats.averageSeverity =
            values.reduce(
                function (a, b) {
                    return a + b;
                },
                0
            )
            /
            values.length;


        stats.highestSeverity =
            Math.max.apply(
                null,
                values
            );


        stats.severeSymptoms =
            values.filter(
                function (value) {

                    return value >= 4;

                }
            ).length;

    }


    /*
        Save the complete latest result.
    */

    const fullResult =
        Object.assign(
            {},
            stats,
            result,
            {
                savedAt:
                    new Date().toISOString()
            }
        );


    data.latestResult =
        fullResult;


    saveHealthData(data);


    /*
        ALSO save today's information
        to long-term history.
    */

    saveDailyHealthAnalysis(
        fullResult
    );

}


/* =========================================================
   GET LATEST RESULT
========================================================= */

function getLatestResult() {

    const data =
        getHealthData();


    return (
        data.latestResult ||
        null
    );

}


/* =========================================================
   GET HEALTH HISTORY
========================================================= */

function getHealthHistory() {

    const data =
        getHealthData();


    if (
        !Array.isArray(data.history)
    ) {

        data.history = [];

    }


    /*
        Old data compatibility.

        If history did not exist but
        latestResult does, create one
        historical entry.
    */

    if (
        data.history.length === 0 &&
        data.latestResult
    ) {

        const result =
            data.latestResult;


        const saved =
            new Date(
                result.savedAt
            );


        if (
            !isNaN(
                saved.getTime()
            )
        ) {

            data.history.push({

                date:
                    saved
                        .toISOString()
                        .split("T")[0],

                averageSeverity:
                    result.averageSeverity ?? 0,

                highestSeverity:
                    result.highestSeverity ?? 0,

                severeSymptoms:
                    result.severeSymptoms ?? 0,

                status:
                    result.status ??
                    "A LITTLE SICK",

                /*
                    If this is an old result,
                    there may be no indicator
                    history available.
                */

                indicators:
                    buildIndicatorHistory(data)

            });


            saveHealthData(data);

        }

    }


    return data.history;

}


/* =========================================================
   TODAY CHECK-IN
========================================================= */

function hasCheckInForToday() {

    return hasValidCurrentCheckIn(
        getHealthData()
    );

}


/* =========================================================
   CLEAR CURRENT HEALTH DATA
========================================================= */

/*
    IMPORTANT:

    This does NOT delete history.

    It only clears the current check-in.
*/

function clearHealthData() {

    const data =
        getHealthData();


    const history =
        Array.isArray(data.history)
            ? data.history
            : [];


    const newData =
        createHealthData();


    newData.history =
        history;


    /*
        latestResult is also preserved.
    */

    newData.latestResult =
        data.latestResult || null;


    saveHealthData(
        newData
    );

}

