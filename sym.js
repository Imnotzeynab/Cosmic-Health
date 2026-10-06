/* =========================================================
SYMPTOM DETAILS PAGE
========================================================= */

const symptomsContainer =
document.getElementById("symptoms-container");

/* =========================================================
GET HEALTH DATA
========================================================= */

const data = getHealthData();

/* =========================================================
HEALTH CATEGORIES
========================================================= */

const categories = [
"musculoskeletal",
"cardiovascular",
"immuneGeneral",
"respiratory",
"mentalBehavioral",
"sleep",
"otherSymptoms"
];

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
CHECK FOR SAVED SYMPTOMS
========================================================= */

let hasSymptoms = false;

/* =========================================================
CREATE SECTIONS
========================================================= */

categories.forEach(function(category) {


const selectedSymptoms =
    data[category]?.selectedSymptoms || [];


if (selectedSymptoms.length === 0) {
    return;
}


hasSymptoms = true;


/* =====================================================
   CATEGORY TITLE
   ===================================================== */

const categoryTitle =
    document.createElement("h2");

categoryTitle.textContent =
    categoryNames[category];

categoryTitle.classList.add(
    "symptom-category-title"
);

symptomsContainer.appendChild(
    categoryTitle
);


/* =====================================================
   CREATE EACH SYMPTOM
   ===================================================== */

selectedSymptoms.forEach(function(symptom) {

    createSymptomSection(
        category,
        symptom
    );

});


});

/* =========================================================
NO SYMPTOMS MESSAGE
========================================================= */

if (!hasSymptoms) {


const message =
    document.createElement("div");

message.classList.add(
    "no-symptoms-message"
);

message.innerHTML = `
    <h2>NO SYMPTOMS SELECTED</h2>

    <p>
        Please return to the health indicators
        and select at least one symptom before
        continuing.
    </p>

    <a href="healthind.html" class="continue-btn">
        BACK TO HEALTH INDICATORS
        <span>←</span>
    </a>
`;

symptomsContainer.appendChild(
    message
);


}

/* =========================================================
CREATE ONE SYMPTOM CARD
========================================================= */

function createSymptomSection(
category,
symptom
) {


const card =
    document.createElement("div");

card.classList.add(
    "symptom-detail-card"
);


/* =====================================================
   SYMPTOM NAME
   ===================================================== */

const title =
    document.createElement("h3");

title.textContent =
    symptom;

card.appendChild(
    title
);


/* =====================================================
   DESCRIPTION
   ===================================================== */

const descriptionLabel =
    document.createElement("label");

descriptionLabel.textContent =
    "Describe what you are experiencing";

card.appendChild(
    descriptionLabel
);


const description =
    document.createElement("textarea");

description.placeholder =
    "Describe your symptoms...";

description.rows = 5;

card.appendChild(
    description
);


/* =====================================================
   DURATION
   ===================================================== */

const durationTitle =
    document.createElement("p");

durationTitle.textContent =
    "How long has it been?";

durationTitle.classList.add(
    "duration-title"
);

card.appendChild(
    durationTitle
);


const durationContainer =
    document.createElement("div");

durationContainer.classList.add(
    "duration-options"
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
        "duration-option"
    );


    const radio =
        document.createElement("input");

    radio.type = "radio";

    radio.name =
        `duration-${category}-${symptom}`;

    radio.value =
        duration;


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


card.appendChild(
    durationContainer
);


/* =====================================================
   RESTORE SAVED INFORMATION
   ===================================================== */

const savedDetails =
    data.symptomDetails?.[category]?.[symptom];


if (
    savedDetails &&
    typeof savedDetails === "object"
) {

    if (
        typeof savedDetails.description === "string"
    ) {

        description.value =
            savedDetails.description;

    }


    if (
        savedDetails.duration
    ) {

        const radios =
            durationContainer.querySelectorAll(
                'input[type="radio"]'
            );


        radios.forEach(function(radio) {

            if (
                radio.value ===
                savedDetails.duration
            ) {

                radio.checked = true;

            }

        });

    }

}


/* =====================================================
   SAVE DESCRIPTION
   ===================================================== */

description.addEventListener(
    "input",
    function() {

        saveSymptomInformation(
            category,
            symptom,
            this.value,
            getSelectedDuration(
                durationContainer
            )
        );

    }
);


/* =====================================================
   SAVE DURATION
   ===================================================== */

const radios =
    durationContainer.querySelectorAll(
        'input[type="radio"]'
    );


radios.forEach(function(radio) {

    radio.addEventListener(
        "change",
        function() {

            saveSymptomInformation(
                category,
                symptom,
                description.value,
                this.value
            );

        }
    );

});


/* =====================================================
   ADD CARD TO PAGE
   ===================================================== */

symptomsContainer.appendChild(
    card
);


}

/* =========================================================
GET SELECTED DURATION
========================================================= */

function getSelectedDuration(
durationContainer
) {


const selected =
    durationContainer.querySelector(
        'input[type="radio"]:checked'
    );


if (!selected) {
    return null;
}


return selected.value;


}

/* =========================================================
SAVE DESCRIPTION + DURATION
========================================================= */

function saveSymptomInformation(
category,
symptom,
description,
duration
) {


const data =
    getHealthData();


if (
    !data.symptomDetails ||
    typeof data.symptomDetails !== "object"
) {

    data.symptomDetails = {};

}


if (
    !data.symptomDetails[category]
) {

    data.symptomDetails[category] = {};

}


data.symptomDetails[category][symptom] = {

    description: description,

    duration: duration

};


saveHealthData(data);

}
/* ---------- AFFECTED AREAS (from body map) ---------- */
/* ---------- AFFECTED AREAS (from body map) ---------- */
const bodyAreas = getBodyAreas();

if (bodyAreas.length > 0) {
    const areaTitle = document.createElement("h2");
    areaTitle.textContent = "Affected areas";
    areaTitle.classList.add("symptom-category-title");
    symptomsContainer.appendChild(areaTitle);

    bodyAreas.forEach(createAreaSection);

    const edit = document.createElement("a");
    edit.href = "bodymap.html";
    edit.textContent = "Edit areas on body map";
    edit.classList.add("area-edit");
    symptomsContainer.appendChild(edit);
}

function createAreaSection(area) {
    const card = document.createElement("div");
    card.classList.add("symptom-detail-card");

    const title = document.createElement("h3");
    title.textContent = area.label;
    card.appendChild(title);

    const descLabel = document.createElement("label");
    descLabel.textContent = "Describe what you feel in this area (pain, tingling, swelling...)";
    card.appendChild(descLabel);

    const description = document.createElement("textarea");
    description.placeholder = "Describe the problem in this area...";
    description.rows = 4;
    description.value = area.description || "";
    card.appendChild(description);

    const durationTitle = document.createElement("p");
    durationTitle.textContent = "How long has it been?";
    durationTitle.classList.add("duration-title");
    card.appendChild(durationTitle);

    const durationContainer = document.createElement("div");
    durationContainer.classList.add("duration-options");

    ["Less than 1 day", "1–3 days", "4–7 days", "More than 7 days"].forEach(function (d) {
        const label = document.createElement("label");
        label.classList.add("duration-option");

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "duration-area-" + area.label;
        radio.value = d;
        radio.checked = area.duration === d;

        const text = document.createElement("span");
        text.textContent = d;

        label.appendChild(radio);
        label.appendChild(text);
        durationContainer.appendChild(label);
    });
    card.appendChild(durationContainer);

    function save() {
        saveBodyAreaDetails(area.label, description.value, getSelectedDuration(durationContainer));
    }
    description.addEventListener("input", save);
    durationContainer.querySelectorAll('input[type="radio"]').forEach(function (r) {
        r.addEventListener("change", save);
    });

    symptomsContainer.appendChild(card);
}