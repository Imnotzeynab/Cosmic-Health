/* =========================================================
EDIT SYMPTOM PAGE
========================================================= */

/* =========================================================
GET ELEMENTS
========================================================= */

const editContainer =
document.getElementById("edit-container");

const updateButton =
document.getElementById("update-button");

const deleteButton =
document.getElementById("delete-button");

const deleteConfirmation =
document.getElementById("delete-confirmation");

const deleteConfirmationMessage =
document.getElementById("delete-confirmation-message");

const deleteNo =
document.getElementById("delete-no");

const deleteYes =
document.getElementById("delete-yes");

/* =========================================================
GET EDIT INFORMATION
========================================================= */

const category =
localStorage.getItem(
"nasaHealthEditCategory"
);

const symptom =
localStorage.getItem(
"nasaHealthEditSymptom"
);

/* =========================================================
GET HEALTH DATA
========================================================= */

const data = getHealthData();

/* =========================================================
CATEGORY NAMES
========================================================= */

const categoryNames = {


musculoskeletal: "Musculoskeletal",

cardiovascular: "Cardiovascular",

immuneGeneral: "Immune & General",

respiratory: "Respiratory",

mentalBehavioral: "Mental & Behavioral",

sleep: "Sleep",

otherSymptoms: "Other Symptoms"


};

/* =========================================================
CHECK EDIT INFORMATION
========================================================= */

if (!category || !symptom) {


editContainer.innerHTML = `
    <div class="edit-error">

        <h2>
            Unable to edit symptom
        </h2>

        <p>
            No symptom was selected for editing.
        </p>

        <a
            href="rev.html"
            class="continue-btn"
        >
            BACK TO REVIEW
        </a>

    </div>
`;


}

/* =========================================================
CHECK WHETHER SYMPTOM EXISTS
========================================================= */

const symptomExists =
Boolean(
category &&
symptom &&
data[category] &&
Array.isArray(
data[category].selectedSymptoms
) &&
data[category]
.selectedSymptoms
.includes(symptom)
);

/* =========================================================
SHOW ERROR IF SYMPTOM DOES NOT EXIST
========================================================= */

if (
category &&
symptom &&
!symptomExists
) {


editContainer.innerHTML = `
    <div class="edit-error">

        <h2>
            Symptom not found
        </h2>

        <p>
            This symptom is no longer
            available in your current
            health check-in.
        </p>

        <a
            href="rev.html"
            class="continue-btn"
        >
            BACK TO REVIEW
        </a>

    </div>
`;


}

/* =========================================================
GET SAVED DETAILS
========================================================= */

const savedDetails =
symptomExists
? (
data.symptomDetails &&
data.symptomDetails[category] &&
data.symptomDetails[category][symptom]
? data.symptomDetails[category][symptom]
: {}
)
: {};

/* =========================================================
GET SAVED SEVERITY
========================================================= */

const savedSeverity =
symptomExists &&
data.severity &&
data.severity[category]
? data.severity[category][symptom]
: null;

/* =========================================================
CREATE EDIT CONTENT
========================================================= */

if (symptomExists) {


/* =====================================================
   CATEGORY
   ===================================================== */

const categoryLabel =
    document.createElement("div");

categoryLabel.classList.add(
    "edit-category"
);

categoryLabel.textContent =
    categoryNames[category] || category;

editContainer.appendChild(
    categoryLabel
);


/* =====================================================
   SYMPTOM NAME
   ===================================================== */

const symptomTitle =
    document.createElement("h2");

symptomTitle.classList.add(
    "edit-symptom-title"
);

symptomTitle.textContent =
    symptom;

editContainer.appendChild(
    symptomTitle
);


/* =====================================================
   DESCRIPTION
   ===================================================== */

const descriptionLabel =
    document.createElement("label");

descriptionLabel.textContent =
    "DESCRIPTION";

descriptionLabel.classList.add(
    "edit-label"
);

editContainer.appendChild(
    descriptionLabel
);


const description =
    document.createElement("textarea");

description.id =
    "edit-description";

description.placeholder =
    "Describe what you are experiencing...";

description.rows = 6;

description.value =
    savedDetails.description || "";

editContainer.appendChild(
    description
);


/* =====================================================
   DURATION
   ===================================================== */

const durationTitle =
    document.createElement("p");

durationTitle.textContent =
    "DURATION";

durationTitle.classList.add(
    "edit-label"
);

editContainer.appendChild(
    durationTitle
);


const durationContainer =
    document.createElement("div");

durationContainer.classList.add(
    "edit-duration-options"
);


const durations = [

    "Less than 1 day",
    "1–3 days",
    "4–7 days",
    "More than 7 days"

];


durations.forEach(function(duration) {

    const label =
        document.createElement("label");

    label.classList.add(
        "edit-duration-option"
    );


    const radio =
        document.createElement("input");

    radio.type =
        "radio";

    radio.name =
        "edit-duration";

    radio.value =
        duration;


    if (
        savedDetails.duration === duration
    ) {

        radio.checked = true;

    }


    const text =
        document.createElement("span");

    text.textContent =
        duration;


    label.appendChild(
        radio
    );

    label.appendChild(
        text
    );

    durationContainer.appendChild(
        label
    );

});


editContainer.appendChild(
    durationContainer
);


/* =====================================================
   SEVERITY
   ===================================================== */

const severityTitle =
    document.createElement("p");

severityTitle.textContent =
    "SEVERITY";

severityTitle.classList.add(
    "edit-label"
);

editContainer.appendChild(
    severityTitle
);


const severityContainer =
    document.createElement("div");

severityContainer.classList.add(
    "edit-severity-options"
);


const severityLabels = {

    1: "Minimal",
    2: "Mild",
    3: "Moderate",
    4: "Severe",
    5: "Very Severe"

};


for (
    let severity = 1;
    severity <= 5;
    severity++
) {

    const button =
        document.createElement("button");

    button.type =
        "button";

    button.classList.add(
        "edit-severity-option"
    );


    const number =
        document.createElement("strong");

    number.textContent =
        severity;


    const label =
        document.createElement("small");

    label.textContent =
        severityLabels[severity];


    button.appendChild(
        number
    );

    button.appendChild(
        label
    );


    if (
        Number(savedSeverity) === severity
    ) {

        button.classList.add(
            "selected"
        );

    }


    button.addEventListener(
        "click",
        function() {

            severityContainer
                .querySelectorAll(
                    ".edit-severity-option"
                )
                .forEach(function(option) {

                    option.classList.remove(
                        "selected"
                    );

                });


            this.classList.add(
                "selected"
            );

        }
    );


    severityContainer.appendChild(
        button
    );

}


editContainer.appendChild(
    severityContainer
);


}

/* =========================================================
GET SELECTED DURATION
========================================================= */

function getSelectedDuration() {


const selected =
    document.querySelector(
        'input[name="edit-duration"]:checked'
    );


if (!selected) {

    return null;

}


return selected.value;


}

/* =========================================================
GET SELECTED SEVERITY
========================================================= */

function getSelectedSeverity() {


const selected =
    document.querySelector(
        ".edit-severity-option.selected"
    );


if (!selected) {

    return null;

}


return Number(
    selected
        .querySelector("strong")
        .textContent
);


}

/* =========================================================
UPDATE
========================================================= */

if (
updateButton &&
symptomExists
) {


updateButton.addEventListener(
    "click",
    function() {

        const descriptionElement =
            document.getElementById(
                "edit-description"
            );


        const updatedDescription =
            descriptionElement
                ? descriptionElement.value.trim()
                : "";


        const updatedDuration =
            getSelectedDuration();


        const updatedSeverity =
            getSelectedSeverity();


        const currentData =
            getHealthData();


        /* =============================================
           DETAILS
           ============================================= */

        if (!currentData.symptomDetails) {

            currentData.symptomDetails = {};

        }


        if (
            !currentData.symptomDetails[category]
        ) {

            currentData.symptomDetails[category] =
                {};

        }


        currentData
            .symptomDetails
            [category]
            [symptom] = {

                description:
                    updatedDescription,

                duration:
                    updatedDuration

            };


        /* =============================================
           SEVERITY
           ============================================= */

        if (!currentData.severity) {

            currentData.severity = {};

        }


        if (
            !currentData.severity[category]
        ) {

            currentData.severity[category] =
                {};

        }


        if (
            updatedSeverity !== null
        ) {

            currentData
                .severity
                [category]
                [symptom] =
                updatedSeverity;

        }


        /* =============================================
           SAVE
           ============================================= */

        saveHealthData(
            currentData
        );


        /* =============================================
           CLEAR EDIT DATA
           ============================================= */

        localStorage.removeItem(
            "nasaHealthEditCategory"
        );

        localStorage.removeItem(
            "nasaHealthEditSymptom"
        );


        /* =============================================
           RETURN TO REVIEW
           ============================================= */

        window.location.href =
            "rev.html";

    }
);


}

/* =========================================================
DELETE BUTTON
========================================================= */

if (
deleteButton &&
symptomExists
) {


deleteButton.addEventListener(
    "click",
    function() {

        deleteConfirmationMessage.textContent =
            `Are you sure you want to delete "${symptom}" from your health check-in?`;

        deleteConfirmation.style.display =
            "flex";

    }
);


}

/* =========================================================
CANCEL DELETE
========================================================= */

if (deleteNo) {


deleteNo.addEventListener(
    "click",
    function() {

        deleteConfirmation.style.display =
            "none";

    }
);


}

/* =========================================================
CONFIRM DELETE
========================================================= */

if (deleteYes) {


deleteYes.addEventListener(
    "click",
    function() {

        const currentData =
            getHealthData();


        /* =============================================
           REMOVE SYMPTOM
           ============================================= */

        if (
            currentData[category] &&
            Array.isArray(
                currentData[category]
                    .selectedSymptoms
            )
        ) {

            currentData[category]
                .selectedSymptoms =
                currentData[category]
                    .selectedSymptoms
                    .filter(
                        function(selectedSymptom) {

                            return (
                                selectedSymptom !==
                                symptom
                            );

                        }
                    );

        }


        /* =============================================
           REMOVE DETAILS
           ============================================= */

        if (
            currentData.symptomDetails &&
            currentData.symptomDetails[category]
        ) {

            delete currentData
                .symptomDetails
                [category]
                [symptom];

        }


        /* =============================================
           REMOVE SEVERITY
           ============================================= */

        if (
            currentData.severity &&
            currentData.severity[category]
        ) {

            delete currentData
                .severity
                [category]
                [symptom];

        }


        /* =============================================
           REMOVE EMPTY CATEGORY
           ============================================= */

        if (
            currentData[category] &&
            currentData[category]
                .selectedSymptoms
                .length === 0
        ) {

            if (
                Array.isArray(
                    currentData.indicators
                )
            ) {

                currentData.indicators =
                    currentData
                        .indicators
                        .filter(
                            function(indicator) {

                                return (
                                    indicator !==
                                    category
                                );

                            }
                        );

            }

        }


        /* =============================================
           SAVE
           ============================================= */

        saveHealthData(
            currentData
        );


        /* =============================================
           CLEAR EDIT DATA
           ============================================= */

        localStorage.removeItem(
            "nasaHealthEditCategory"
        );

        localStorage.removeItem(
            "nasaHealthEditSymptom"
        );


        /* =============================================
           RETURN TO REVIEW
           ============================================= */

        window.location.href =
            "rev.html";

    }
);


}
