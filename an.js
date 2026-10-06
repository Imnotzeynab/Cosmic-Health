
/* =========================================================
   NASA HEALTH
   ANALYSIS PAGE
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const progressBar =
    document.getElementById("analysis-progress");

const percentText =
    document.getElementById("analysis-percent");

const completeMessage =
    document.getElementById("analysis-complete");

const viewResultsButton =
    document.getElementById("view-results-button");

const steps = [

    document.getElementById("analysis-step-1"),

    document.getElementById("analysis-step-2"),

    document.getElementById("analysis-step-3"),

    document.getElementById("analysis-step-4")

];


/* =========================================================
   LOAD HEALTH DATA
   ========================================================= */

const healthData = getHealthData();


/* =========================================================
   ANALYSIS RESULT
   ========================================================= */

let analysisResult = {

    indicators: [],

    symptoms: [],

    averageSeverity: 0,

    highestSeverity: 0,

    severeSymptoms: 0,

    status: "",

    patterns: [],

    possibleConcern: "",

    concernDescription: "",

    precautions: [],

    nextSteps: [],

    warning: null

};


/* =========================================================
   STEP 1
   CHECK INDICATOR LEVELS
   ========================================================= */

function checkIndicatorLevels() {

    const categories = [

        "musculoskeletal",

        "cardiovascular",

        "immuneGeneral",

        "respiratory",

        "mentalBehavioral",

        "sleep",

        "otherSymptoms"

    ];


    /* Find affected health indicators */

    categories.forEach(function(category) {

        const categoryData =
            healthData[category];

        if (
            categoryData &&
            Array.isArray(
                categoryData.selectedSymptoms
            ) &&
            categoryData.selectedSymptoms.length > 0
        ) {

            analysisResult.indicators.push(
                category
            );

        }

    });


    /* Collect all selected symptoms */

    categories.forEach(function(category) {

        const categoryData =
            healthData[category];

        if (
            categoryData &&
            Array.isArray(
                categoryData.selectedSymptoms
            )
        ) {

            categoryData.selectedSymptoms.forEach(
                function(symptom) {

                    analysisResult.symptoms.push({

                        symptom: symptom,

                        category: category

                    });

                }
            );

        }

    });

}


/* =========================================================
   STEP 2
   ANALYZE PATTERNS
   ========================================================= */

function analyzePatterns() {

    const symptoms =
        analysisResult.symptoms;


    const symptomNames =
        symptoms.map(function(item) {

            return String(
                item.symptom
            ).toLowerCase();

        });


    /* =====================================================
       FATIGUE + SLEEP PATTERN
       ===================================================== */

    const hasFatigue =
        symptomNames.some(function(symptom) {

            return (

                symptom.includes("fatigue") ||

                symptom.includes("tired") ||

                symptom.includes("exhaust")

            );

        });


    const hasSleep =
        symptomNames.some(function(symptom) {

            return (

                symptom.includes("sleep") ||

                symptom.includes("insomnia") ||

                symptom.includes("sleeping")

            );

        });


    if (
        hasFatigue &&
        hasSleep
    ) {

        analysisResult.patterns.push(

            "fatigue and sleep-related symptoms"

        );

    }


    /* =====================================================
       BREATHING + CHEST PATTERN
       ===================================================== */

    const hasBreathing =
        symptomNames.some(function(symptom) {

            return (

                symptom.includes("breath") ||

                symptom.includes("breathing") ||

                symptom.includes("shortness")

            );

        });


    const hasChest =
        symptomNames.some(function(symptom) {

            return symptom.includes("chest");

        });


    if (
        hasBreathing &&
        hasChest
    ) {

        analysisResult.warning =

            "Chest-related symptoms together with breathing difficulty may require prompt medical evaluation.";

    }

}


/* =========================================================
   STEP 3
   COMPARE WITH THRESHOLDS
   ========================================================= */

function compareWithThresholds() {

    const severities = [];


    Object.keys(
        healthData.severity || {}
    ).forEach(function(symptom) {

        const severity =
            Number(
                healthData.severity[symptom]
            );


        if (!isNaN(severity)) {

            severities.push(
                severity
            );

        }

    });


    /* =====================================================
       NO SEVERITY DATA
       ===================================================== */

    if (
        severities.length === 0
    ) {

        analysisResult.averageSeverity =
            0;

        analysisResult.highestSeverity =
            0;

        analysisResult.status =
            "A LITTLE SICK";

        return;

    }


    /* =====================================================
       CALCULATE AVERAGE
       ===================================================== */

    const total =
        severities.reduce(

            function(sum, value) {

                return sum + value;

            },

            0

        );


    const average =
        total / severities.length;


    /* =====================================================
       HIGHEST SEVERITY
       ===================================================== */

    const highest =
        Math.max(
            ...severities
        );


    /* =====================================================
       COUNT SEVERE SYMPTOMS
       ===================================================== */

    const severeCount =
        severities.filter(

            function(value) {

                return value >= 4;

            }

        ).length;


    analysisResult.averageSeverity =
        average;


    analysisResult.highestSeverity =
        highest;


    analysisResult.severeSymptoms =
        severeCount;


    /* =====================================================
       OVERALL STATUS

       These are app-defined screening thresholds,
       not medical diagnoses.
       ===================================================== */

    if (
        highest >= 5
    ) {

        analysisResult.status =
            "VERY SICK";

    }

    else if (
        average >= 3.7 ||
        severeCount >= 2
    ) {

        analysisResult.status =
            "SICK";

    }

    else if (
        average >= 2.5 ||
        highest >= 3
    ) {

        analysisResult.status =
            "ABOUT TO GET SICK";

    }

    else {

        analysisResult.status =
            "A LITTLE SICK";

    }

}


/* =========================================================
   STEP 4
   GENERATE RESULTS
   ========================================================= */

function generateResults() {


    /* =====================================================
       SLEEP + FATIGUE PATTERN
       ===================================================== */

    if (

        analysisResult.patterns.includes(

            "fatigue and sleep-related symptoms"

        )

    ) {

        analysisResult.possibleConcern =

            "Sleep and fatigue concern";


        analysisResult.concernDescription =

            "The information you provided shows a combination of sleep-related and fatigue symptoms that may be worth monitoring.";


        analysisResult.precautions = [

            "Pay attention to changes in sleep quality and energy levels.",

            "Maintain a consistent sleep and rest routine.",

            "Monitor whether symptoms become more frequent or severe."

        ];


        analysisResult.nextSteps = [

            "Continue monitoring your symptoms.",

            "Record changes during your next health check-in.",

            "Consider speaking with a qualified healthcare professional if symptoms persist or worsen."

        ];

    }


    /* =====================================================
       NO SPECIFIC PATTERN
       ===================================================== */

    else {

        analysisResult.possibleConcern =

            "No specific pattern identified";


        analysisResult.concernDescription =

            "The information provided does not show a specific symptom pattern that can be identified from the current health data.";


        analysisResult.precautions = [

            "Continue monitoring your health information.",

            "Pay attention to any new or worsening symptoms.",

            "Maintain adequate rest, hydration, and recovery."

        ];


        analysisResult.nextSteps = [

            "Continue monitoring your symptoms.",

            "Complete another check-in if your symptoms change.",

            "Seek professional medical advice if concerning symptoms persist or worsen."

        ];

    }


    /* =====================================================
       ADD WARNING
       ===================================================== */

    if (
        analysisResult.warning
    ) {

        analysisResult.nextSteps.unshift(

            "Consider seeking prompt medical evaluation for the symptoms described."

        );

    }

}


/* =========================================================
   SAVE ANALYSIS RESULT
   ========================================================= */

function saveAnalysisResult() {

    localStorage.setItem(

        "nasaHealthAnalysis",

        JSON.stringify(
            analysisResult
        )

    );

}


/* =========================================================
   COMPLETE STEP
   ========================================================= */

function completeStep(stepNumber) {

    const step =
        steps[stepNumber];


    if (!step) {

        return;

    }


    step.classList.remove(
        "active"
    );


    step.classList.add(
        "complete"
    );


    const icon =
        step.querySelector(
            ".analysis-step-icon span"
        );


    if (icon) {

        icon.className =
            "step-check";


        icon.textContent =
            "✓";

    }

}


/* =========================================================
   ACTIVATE STEP
   ========================================================= */

function activateStep(stepNumber) {

    const step =
        steps[stepNumber];


    if (!step) {

        return;

    }


    step.classList.add(
        "active"
    );


    const icon =
        step.querySelector(
            ".analysis-step-icon span"
        );


    if (icon) {

        icon.className =
            "step-spinner";


        icon.textContent =
            "";

    }

}


/* =========================================================
   UPDATE PROGRESS
   ========================================================= */

function updateProgress(value) {

    progressBar.style.width =
        value + "%";


    percentText.textContent =
        value + "%";

}


/* =========================================================
   RUN ANALYSIS
   ========================================================= */


/* =========================================================
   RUN ANALYSIS
   ========================================================= */

async function runAnalysis() {


    /* =====================================================
       STEP 1
       CHECKING INDICATOR LEVELS
       ===================================================== */

    updateProgress(10);

    checkIndicatorLevels();

    await wait(700);

    completeStep(0);


    /* =====================================================
       STEP 2
       ANALYZING PATTERNS
       ===================================================== */

    activateStep(1);

    updateProgress(35);

    analyzePatterns();

    await wait(700);

    completeStep(1);


    /* =====================================================
       STEP 3
       COMPARING WITH THRESHOLDS
       ===================================================== */

    activateStep(2);

    updateProgress(65);

    compareWithThresholds();

    await wait(700);

    completeStep(2);


    /* =====================================================
       STEP 4
       GENERATING RESULTS
       ===================================================== */

    activateStep(3);

    updateProgress(85);

    generateResults();

    await wait(700);

    saveAnalysisResult();

    updateProgress(100);

    completeStep(3);


    /* =====================================================
       ANALYSIS COMPLETE
       ===================================================== */

    await wait(400);


    completeMessage.style.opacity =
        "1";


    viewResultsButton.style.display =
        "inline-flex";

}



function wait(milliseconds) {

    return new Promise(

        function(resolve) {

            setTimeout(

                resolve,

                milliseconds

            );

        }

    );

}


/* =========================================================
   VIEW RESULTS
   ========================================================= */

viewResultsButton.addEventListener(

    "click",

    function() {

        window.location.href =
            "res.html";

    }

);


/* =========================================================
   START ANALYSIS
   ========================================================= */

runAnalysis();

