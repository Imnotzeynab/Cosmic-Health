/* =========================================================
   SYMPTOM + BODY AREA SEVERITY PAGE
   ========================================================= */

const severityContainer = document.getElementById("severity-container");

const data = getHealthData();

const categories = [
    "musculoskeletal",
    "cardiovascular",
    "immuneGeneral",
    "respiratory",
    "mentalBehavioral",
    "sleep",
    "otherSymptoms"
];

const categoryNames = {
    musculoskeletal: "Musculoskeletal",
    cardiovascular: "Cardiovascular",
    immuneGeneral: "Immune & General",
    respiratory: "Respiratory",
    mentalBehavioral: "Mental & Behavioral",
    sleep: "Sleep",
    otherSymptoms: "Other Symptoms"
};

const severityNames = {
    1: "Minimal",
    2: "Mild",
    3: "Moderate",
    4: "Severe",
    5: "Very severe"
};

/* =========================================================
   CREATE ONE 1-5 RATING CARD
   numberLabel : small text above the title (e.g. "SYMPTOM 1")
   titleText   : symptom name or body area name
   savedValue  : severity already saved (or undefined)
   onSave      : function called with the chosen severity
   ========================================================= */

function createRatingCard(numberLabel, titleText, savedValue, onSave) {

    const card = document.createElement("div");
    card.classList.add("severity-card");

    const number = document.createElement("div");
    number.classList.add("symptom-number");
    number.textContent = numberLabel;
    card.appendChild(number);

    const title = document.createElement("h2");
    title.textContent = titleText;
    card.appendChild(title);

    const scale = document.createElement("div");
    scale.classList.add("severity-scale");

    for (let severity = 1; severity <= 5; severity++) {

        const option = document.createElement("button");
        option.type = "button";
        option.classList.add("severity-option");

        const numberText = document.createElement("span");
        numberText.textContent = severity;

        const label = document.createElement("small");
        label.textContent = severityNames[severity];

        option.appendChild(numberText);
        option.appendChild(label);

        /* restore saved severity */
        if (Number(savedValue) === severity) {
            option.classList.add("selected");
        }

        option.addEventListener("click", function () {

            scale.querySelectorAll(".severity-option").forEach(function (button) {
                button.classList.remove("selected");
            });

            this.classList.add("selected");

            onSave(severity);

        });

        scale.appendChild(option);
    }

    card.appendChild(scale);

    severityContainer.appendChild(card);
}

/* =========================================================
   SYMPTOMS
   ========================================================= */

categories.forEach(function (category) {

    const selectedSymptoms = data[category]?.selectedSymptoms || [];

    if (selectedSymptoms.length === 0) {
        return;
    }

    const categoryTitle = document.createElement("h2");
    categoryTitle.textContent = categoryNames[category];
    categoryTitle.classList.add("severity-category-title");
    severityContainer.appendChild(categoryTitle);

    selectedSymptoms.forEach(function (symptom, index) {

        createRatingCard(
            "SYMPTOM " + (index + 1),
            symptom,
            data.severity?.[category]?.[symptom],
            function (severity) {
                saveSymptomSeverity(category, symptom, severity);
            }
        );

    });

});

/* =========================================================
   AFFECTED BODY AREAS
   ========================================================= */

const bodyAreas = getBodyAreas();

if (bodyAreas.length > 0) {

    const areasTitle = document.createElement("h2");
    areasTitle.textContent = "Affected body areas";
    areasTitle.classList.add("severity-category-title");
    severityContainer.appendChild(areasTitle);

    bodyAreas.forEach(function (area, index) {

        createRatingCard(
            "AREA " + (index + 1),
            area.label,
            area.severity,
            function (severity) {
                saveBodyAreaSeverity(area.label, severity);
            }
        );

    });

}

/* =========================================================
   NOTHING TO RATE
   ========================================================= */

if (severityContainer.children.length === 0) {

    const empty = document.createElement("p");
    empty.textContent =
        "No symptoms or body areas to rate. Go back to the check-in and select at least one.";
    severityContainer.appendChild(empty);

}