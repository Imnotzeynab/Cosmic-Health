const symptomCards = document.querySelectorAll(".indicator-card");

const category = "cardiovascular";


// GET SAVED DATA
const savedData = getHealthData();


// RESTORE SELECTED CARDS
symptomCards.forEach(card => {

    const symptom = card.dataset.symptom;

    if (
        savedData[category] &&
        savedData[category].selectedSymptoms &&
        savedData[category].selectedSymptoms.includes(symptom)
    ) {
        card.classList.add("selected");
    }

});


// SELECT / DESELECT
symptomCards.forEach(card => {

    card.addEventListener("click", function () {

        const symptom = this.dataset.symptom;

        const data = getHealthData();


        if (!data[category]) {
            data[category] = {
                selectedSymptoms: []
            };
        }


        if (!data[category].selectedSymptoms) {
            data[category].selectedSymptoms = [];
        }


        if (data[category].selectedSymptoms.includes(symptom)) {

            // Remove selection
            removeSymptom(
                category,
                symptom
            );

            this.classList.remove("selected");

        } else {

            // Keep selection saved
            addSymptom(
                category,
                symptom
            );

            this.classList.add("selected");

        }

    });

});