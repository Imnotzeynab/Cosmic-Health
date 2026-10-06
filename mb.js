
const symptomCards =
    document.querySelectorAll(".indicator-card");


const category =
    "mentalBehavioral";



/* =========================================================
   GET SAVED DATA
   ========================================================= */

const savedData =
    getHealthData();



/* =========================================================
   RESTORE SELECTED INDICATORS
   ========================================================= */

symptomCards.forEach(card => {

    const symptom =
        card.dataset.symptom;


    if (
        savedData[category] &&
        savedData[category].selectedSymptoms &&
        savedData[category].selectedSymptoms.includes(symptom)
    ) {

        card.classList.add("selected");

    }

});



/* =========================================================
   SELECT / DESELECT
   ========================================================= */

symptomCards.forEach(card => {

    card.addEventListener("click", function () {

        const symptom =
            this.dataset.symptom;


        const data =
            getHealthData();



        /* MAKE SURE CATEGORY EXISTS */

        if (!data[category]) {

            data[category] = {
                selectedSymptoms: []
            };

        }



        /* MAKE SURE SELECTED SYMPTOMS EXISTS */

        if (!data[category].selectedSymptoms) {

            data[category].selectedSymptoms = [];

        }



        /* IF ALREADY SELECTED → REMOVE */

        if (
            data[category]
                .selectedSymptoms
                .includes(symptom)
        ) {

            removeSymptom(
                category,
                symptom
            );

            this.classList.remove("selected");

        }



        /* IF NOT SELECTED → SAVE AND KEEP SELECTED */

        else {

            addSymptom(
                category,
                symptom
            );

            this.classList.add("selected");

        }

    });

});
