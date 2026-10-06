
/* =========================================================
   IMMUNE & GENERAL SYMPTOM SELECTION
   ========================================================= */

const symptomCards =
    document.querySelectorAll(".indicator-card");

const category = "immuneGeneral";


/* =========================================================
   LOAD SAVED DATA
   ========================================================= */

const data = getHealthData();

const savedSymptoms =
    data[category]?.symptoms || [];


/* =========================================================
   RESTORE SELECTED SYMPTOMS
   ========================================================= */

symptomCards.forEach(card => {

    const symptom =
        card.dataset.symptom;

    if (savedSymptoms.includes(symptom)) {
        card.classList.add("selected");
    }

});


/* =========================================================
   CLICK SYMPTOM
   ========================================================= */

symptomCards.forEach(card => {

    card.addEventListener("click", () => {

        const symptom =
            card.dataset.symptom;


        /* =========================================
           REMOVE IF ALREADY SELECTED
           ========================================= */

        if (card.classList.contains("selected")) {

            card.classList.remove("selected");

            removeImmuneGeneralSymptom(
                symptom
            );

        }


        /* =========================================
           SELECT AND SAVE
           ========================================= */

        else {

            card.classList.add("selected");

            selectImmuneGeneralSymptom(
                symptom
            );

        }

    });

});

