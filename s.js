/* =========================================================
SLEEP HEALTH
========================================================= */

const symptomCards = document.querySelectorAll(".indicator-card");

const category = "sleep";

/* =========================================================
RESTORE SAVED DATA
========================================================= */

const savedData = getHealthData();

symptomCards.forEach(function(card) {


const symptom = card.dataset.symptom;

if (
    savedData[category] &&
    Array.isArray(savedData[category].selectedSymptoms) &&
    savedData[category].selectedSymptoms.includes(symptom)
) {

    card.classList.add("selected");

}


});

/* =========================================================
HANDLE SELECTION
========================================================= */

symptomCards.forEach(function(card) {


card.addEventListener("click", function() {

    const symptom = this.dataset.symptom;

    const data = getHealthData();


    /* MAKE SURE CATEGORY EXISTS */

    if (!data[category]) {

        data[category] = {
            selectedSymptoms: []
        };

    }


    /* MAKE SURE SELECTED SYMPTOMS EXISTS */

    if (!Array.isArray(data[category].selectedSymptoms)) {

        data[category].selectedSymptoms = [];

    }


    /* ALREADY SELECTED → REMOVE */

    if (
        data[category]
            .selectedSymptoms
            .includes(symptom)
    ) {

        removeSymptom(category, symptom);

        this.classList.remove("selected");

    }


    /* NOT SELECTED → ADD */

    else {

        addSymptom(category, symptom);

        this.classList.add("selected");

    }

});


});
