/* ============================================================
   COSMIC HEALTH — LOCAL HEALTH ASSISTANT
   ------------------------------------------------------------
   Purpose:
   - Read the existing Cosmic Health history
   - Explain detected health trends
   - Give NASA-STD-3001-informed guidance from your local
     knowledge base
   - Work offline
   - Never diagnose medical conditions
   ============================================================ */

const CosmicHealthAssistant = {

    /* --------------------------------------------------------
       1. GET USER HEALTH DATA
       -------------------------------------------------------- */

    getHealthData() {
        try {
            if (typeof getHealthHistory === "function") {
                return getHealthHistory();
            }

            const stored = localStorage.getItem("healthHistory");

            if (!stored) {
                return [];
            }

            return JSON.parse(stored);

        } catch (error) {
            console.error("Assistant: unable to read health history", error);
            return [];
        }
    },


    /* --------------------------------------------------------
       2. GET RECENT HEALTH DATA
       -------------------------------------------------------- */

    getRecentData(days = 7) {

        const history = this.getHealthData();

        if (!Array.isArray(history) || history.length === 0) {
            return [];
        }

        return history.slice(-days);
    },


    /* --------------------------------------------------------
       3. FIND THE MOST IMPORTANT INDICATORS
       -------------------------------------------------------- */

    analyzeIndicators() {

        const recentData = this.getRecentData(7);

        if (recentData.length === 0) {
            return {
                status: "insufficient_data",
                indicators: []
            };
        }

        const indicators = {};

        recentData.forEach(day => {

            if (!day.indicators) return;

            Object.entries(day.indicators).forEach(([category, data]) => {

                if (!indicators[category]) {
                    indicators[category] = {
                        category,
                        severities: [],
                        symptoms: []
                    };
                }

                if (typeof data.severity === "number") {
                    indicators[category].severities.push(data.severity);
                }

                if (Array.isArray(data.symptoms)) {
                    indicators[category].symptoms.push(...data.symptoms);
                }
            });
        });


        const results = Object.values(indicators).map(indicator => {

            const severities = indicator.severities;

            const average =
                severities.length > 0
                    ? severities.reduce((a, b) => a + b, 0) / severities.length
                    : 0;

            const latest =
                severities.length > 0
                    ? severities[severities.length - 1]
                    : 0;

            let trend = "stable";

            if (severities.length >= 2) {

                const first = severities[0];
                const last = severities[severities.length - 1];

                if (last > first) {
                    trend = "increasing";
                } else if (last < first) {
                    trend = "decreasing";
                }
            }

            return {
                category: indicator.category,
                average,
                latest,
                trend,
                symptoms: [...new Set(indicator.symptoms)]
            };
        });

        return {
            status: "analyzed",
            indicators: results
        };
    },


    /* --------------------------------------------------------
       4. FIND THE MOST RELEVANT HEALTH ISSUE
       -------------------------------------------------------- */

    getPriorityIndicator() {

        const analysis = this.analyzeIndicators();

        if (!analysis.indicators.length) {
            return null;
        }

        return [...analysis.indicators]
            .sort((a, b) => b.latest - a.latest)[0];
    },


    /* --------------------------------------------------------
       5. CREATE A HEALTH SUMMARY
       -------------------------------------------------------- */

    createHealthSummary() {

        const analysis = this.analyzeIndicators();

        if (analysis.status === "insufficient_data") {

            return {
                text:
                    "I don't have enough recent health data to identify a meaningful trend yet. " +
                    "Continue recording your daily health information so Cosmic Health can analyze it.",
                indicators: []
            };
        }

        const concerning = analysis.indicators.filter(
            indicator =>
                indicator.latest >= 3 ||
                indicator.trend === "increasing"
        );

        if (concerning.length === 0) {

            return {
                text:
                    "Your recent recorded indicators do not show a strong worsening trend. " +
                    "Continue monitoring your daily health data.",
                indicators: analysis.indicators
            };
        }

        const descriptions = concerning.map(indicator => {

            const name = this.formatCategory(indicator.category);

            if (indicator.trend === "increasing") {
                return `${name} appears to be increasing`;
            }

            return `${name} has a higher recent severity`;
        });

        return {
            text:
                "Based on your recent recorded data, I noticed: " +
                descriptions.join(", ") +
                ".",
            indicators: concerning
        };
    },


    /* --------------------------------------------------------
       6. NASA-INFORMED GUIDANCE
       -------------------------------------------------------- */

    getGuidance(category) {

        /*
         * These are intentionally general.
         *
         * Do NOT claim that these statements are direct NASA
         * medical prescriptions.
         *
         * Your protocols.json can later contain your verified
         * NASA-STD-3001 references.
         */

        const guidance = {

            sleep: {
                title: "Sleep and recovery",
                advice:
                    "Monitor sleep duration, sleep quality, and recovery patterns. " +
                    "Consistent sleep and adequate recovery are important for maintaining " +
                    "human performance during demanding missions."
            },

            cardiovascular: {
                title: "Cardiovascular monitoring",
                advice:
                    "Continue monitoring cardiovascular-related measurements and symptoms. " +
                    "Look for persistent or worsening changes rather than relying on a single reading."
            },

            musculoskeletal: {
                title: "Musculoskeletal health",
                advice:
                    "Monitor pain, discomfort, mobility, and changes in physical function. " +
                    "Persistent or worsening symptoms should receive appropriate professional evaluation."
            },

            respiratory: {
                title: "Respiratory monitoring",
                advice:
                    "Pay attention to changes in breathing, respiratory symptoms, and their progression over time."
            },

            immuneGeneral: {
                title: "General health monitoring",
                advice:
                    "Continue monitoring symptoms and changes in overall health. " +
                    "Persistent or worsening symptoms should be evaluated by an appropriate healthcare professional."
            },

            mentalBehavioral: {
                title: "Behavioral and psychological wellbeing",
                advice:
                    "Monitor changes in mood, stress, behavior, concentration, and overall wellbeing. " +
                    "Maintaining recovery and healthy routines can support sustained performance."
            },

            otherSymptoms: {
                title: "Other symptoms",
                advice:
                    "Continue recording the symptom, its severity, duration, and whether it is improving or worsening."
            }
        };

        return guidance[category] || {
            title: "Health monitoring",
            advice:
                "Continue recording your health information and monitor changes over time."
        };
    },


    /* --------------------------------------------------------
       7. ANSWER A USER QUESTION
       -------------------------------------------------------- */

    ask(question) {

        if (!question || typeof question !== "string") {
            return this.defaultResponse();
        }

        const q = question.toLowerCase().trim();

        /*
         * Greetings
         */

        if (
            q.includes("hello") ||
            q.includes("hi") ||
            q.includes("hey")
        ) {
            return {
                text:
                    "Hello. I'm the Cosmic Health local assistant. " +
                    "I can explain your recorded health trends and provide " +
                    "general NASA-informed health guidance.",
                type: "conversation"
            };
        }


        /*
         * What can you do?
         */

        if (
            q.includes("what can you do") ||
            q.includes("help") ||
            q.includes("what do you do")
        ) {
            return {
                text:
                    "I can analyze your recent Cosmic Health data, " +
                    "identify changes in your recorded indicators, explain " +
                    "why an indicator was flagged, and provide general " +
                    "NASA-informed guidance. I do not diagnose medical conditions.",
                type: "help"
            };
        }


        /*
         * Ask about current health
         */

        if (
            q.includes("my health") ||
            q.includes("how am i") ||
            q.includes("health status") ||
            q.includes("how is my health") ||
            q.includes("status")
        ) {

            const summary = this.createHealthSummary();

            return {
                text: summary.text,
                type: "health_summary",
                data: summary.indicators
            };
        }


        /*
         * Ask about trends
         */

        if (
            q.includes("trend") ||
            q.includes("trending") ||
            q.includes("getting worse") ||
            q.includes("getting better")
        ) {

            const analysis = this.analyzeIndicators();

            if (!analysis.indicators.length) {
                return {
                    text:
                        "There isn't enough recent recorded data to identify a trend yet.",
                    type: "trend"
                };
            }

            const trendText = analysis.indicators.map(indicator => {

                const name = this.formatCategory(indicator.category);

                return `${name}: ${indicator.trend}`;
            });

            return {
                text:
                    "Here are the recent recorded trends:\n\n" +
                    trendText.join("\n"),
                type: "trend",
                data: analysis.indicators
            };
        }


        /*
         * Sleep
         */

        if (
            q.includes("sleep") ||
            q.includes("sleeping") ||
            q.includes("tired") ||
            q.includes("fatigue")
        ) {

            return this.answerCategory("sleep");
        }


        /*
         * Cardiovascular
         */

        if (
            q.includes("heart") ||
            q.includes("cardiovascular") ||
            q.includes("pulse") ||
            q.includes("blood pressure")
        ) {

            return this.answerCategory("cardiovascular");
        }


        /*
         * Musculoskeletal
         */

        if (
            q.includes("pain") ||
            q.includes("muscle") ||
            q.includes("bone") ||
            q.includes("joint") ||
            q.includes("musculoskeletal")
        ) {

            return this.answerCategory("musculoskeletal");
        }


        /*
         * Respiratory
         */

        if (
            q.includes("breathing") ||
            q.includes("respiratory") ||
            q.includes("lung")
        ) {

            return this.answerCategory("respiratory");
        }


        /*
         * Mental / behavioral
         */

        if (
            q.includes("stress") ||
            q.includes("mood") ||
            q.includes("mental") ||
            q.includes("behavior") ||
            q.includes("concentration")
        ) {

            return this.answerCategory("mentalBehavioral");
        }


        /*
         * Safety question
         */

        if (
            q.includes("emergency") ||
            q.includes("urgent") ||
            q.includes("serious")
        ) {

            return {
                text:
                    "If you are experiencing severe, rapidly worsening, or emergency symptoms, " +
                    "seek appropriate medical or emergency assistance rather than relying on this assistant.",
                type: "safety"
            };
        }


        /*
         * NASA question
         */

        if (
            q.includes("nasa") ||
            q.includes("std-3001") ||
            q.includes("standard")
        ) {

            return {
                text:
                    "Cosmic Health can use a local knowledge base containing " +
                    "NASA-STD-3001-informed guidance. The assistant should use " +
                    "that local source material rather than inventing NASA requirements.",
                type: "nasa"
            };
        }


        /*
         * Default response
         */

        return this.defaultResponse();
    },


    /* --------------------------------------------------------
       8. CATEGORY RESPONSE
       -------------------------------------------------------- */

    answerCategory(category) {

        const analysis = this.analyzeIndicators();

        const indicator = analysis.indicators.find(
            item => item.category === category
        );

        const guidance = this.getGuidance(category);

        const name = this.formatCategory(category);

        if (!indicator) {

            return {
                text:
                    `I don't currently have enough recorded data about ${name.toLowerCase()} ` +
                    `to identify a specific trend.\n\n` +
                    guidance.advice,
                type: "category",
                category
            };
        }

        let trendSentence =
            `${name} is currently showing a ${indicator.trend} trend ` +
            `in your recent recorded data.`;

        if (indicator.symptoms.length > 0) {
            trendSentence +=
                ` Recorded symptoms include: ${indicator.symptoms.join(", ")}.`;
        }

        return {
            text:
                trendSentence +
                "\n\n" +
                guidance.advice,
            type: "category",
            category,
            data: indicator
        };
    },


    /* --------------------------------------------------------
       9. FORMAT CATEGORY NAMES
       -------------------------------------------------------- */

    formatCategory(category) {

        const names = {
            musculoskeletal: "Musculoskeletal health",
            cardiovascular: "Cardiovascular health",
            immuneGeneral: "General/immune health",
            respiratory: "Respiratory health",
            mentalBehavioral: "Mental and behavioral wellbeing",
            sleep: "Sleep",
            otherSymptoms: "Other symptoms"
        };

        return names[category] || category;
    },


    /* --------------------------------------------------------
       10. DEFAULT RESPONSE
       -------------------------------------------------------- */

    defaultResponse() {

        return {
            text:
                "I can help you understand your recent Cosmic Health data. " +
                "Try asking:\n\n" +
                "• How is my health?\n" +
                "• What are my recent trends?\n" +
                "• How is my sleep?\n" +
                "• What about my cardiovascular health?\n" +
                "• Am I getting worse?\n" +
                "• What can you tell me about NASA-STD-3001?",
            type: "help"
        };
    }
};


/* ============================================================
   OPTIONAL GLOBAL FUNCTION
   ------------------------------------------------------------
   This makes it easy for the HTML interface to call:
       askAssistant("How is my health?")
   ============================================================ */

function askAssistant(question) {
    return CosmicHealthAssistant.ask(question);
}