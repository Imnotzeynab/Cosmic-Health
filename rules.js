 /* ============================================================
    COSMIC HEALTH — ASSISTANT RULE ENGINE
    ------------------------------------------------------------
    Purpose:
    - Analyze existing Cosmic Health health-history data
    - Detect changes and potentially important trends
    - Connect detected indicators to protocols.json
    - Provide structured information to assistant.js

    IMPORTANT:
    This is a decision-support rule engine.
    It does NOT diagnose medical conditions.
    ============================================================ */


/* ============================================================
   CONFIGURATION
   ============================================================ */

const ASSISTANT_RULE_CONFIG = {

    /*
     * Severity scale used by the existing Cosmic Health system.
     *
     * Adjust these values if your health-data system uses
     * a different severity scale.
     */

    elevatedSeverity: 3,

    highSeverity: 4,

    increasingTrendDifference: 1,

    minimumDaysForTrend: 2,

    recentDays: 7
};


/* ============================================================
   GET HEALTH HISTORY
   ============================================================ */

function getAssistantHealthHistory() {

    try {

        /*
         * Your existing health-data JS already provides
         * getHealthHistory().
         */

        if (typeof getHealthHistory === "function") {
            return getHealthHistory();
        }


        /*
         * Fallback to localStorage.
         */

        const stored =
            localStorage.getItem("healthHistory");

        if (!stored) {
            return [];
        }

        const history = JSON.parse(stored);

        return Array.isArray(history)
            ? history
            : [];

    } catch (error) {

        console.error(
            "Cosmic Health Rules: unable to read history",
            error
        );

        return [];
    }
}


/* ============================================================
   GET RECENT HISTORY
   ============================================================ */

function getRecentAssistantHistory(days = ASSISTANT_RULE_CONFIG.recentDays) {

    const history = getAssistantHealthHistory();

    if (!history.length) {
        return [];
    }

    return history.slice(-days);
}


/* ============================================================
   EXTRACT CATEGORY DATA
   ============================================================ */

function collectCategoryData(history) {

    const categories = {};

    history.forEach(day => {

        if (!day || !day.indicators) {
            return;
        }

        Object.entries(day.indicators).forEach(
            ([category, indicator]) => {

                if (!categories[category]) {

                    categories[category] = {
                        category,
                        severities: [],
                        symptoms: [],
                        dates: []
                    };
                }


                /*
                 * Severity
                 */

                if (
                    typeof indicator.severity === "number"
                ) {

                    categories[category]
                        .severities
                        .push(indicator.severity);
                }


                /*
                 * Symptoms
                 */

                if (Array.isArray(indicator.symptoms)) {

                    categories[category]
                        .symptoms
                        .push(...indicator.symptoms);
                }


                /*
                 * Date
                 */

                if (day.date) {

                    categories[category]
                        .dates
                        .push(day.date);
                }
            }
        );
    });

    return categories;
}


/* ============================================================
   CALCULATE TREND
   ============================================================ */

function calculateAssistantTrend(severities) {

    if (
        !Array.isArray(severities) ||
        severities.length <
        ASSISTANT_RULE_CONFIG.minimumDaysForTrend
    ) {

        return {
            trend: "insufficient_data",
            difference: 0
        };
    }


    const first = severities[0];

    const latest =
        severities[severities.length - 1];

    const difference =
        latest - first;


    if (
        difference >=
        ASSISTANT_RULE_CONFIG.increasingTrendDifference
    ) {

        return {
            trend: "increasing",
            difference
        };
    }


    if (
        difference <=
        -ASSISTANT_RULE_CONFIG.increasingTrendDifference
    ) {

        return {
            trend: "decreasing",
            difference
        };
    }


    return {
        trend: "stable",
        difference
    };
}


/* ============================================================
   CALCULATE CATEGORY ANALYSIS
   ============================================================ */

function analyzeAssistantCategory(categoryData) {

    const severities =
        categoryData.severities || [];

    if (!severities.length) {

        return {
            category: categoryData.category,
            status: "insufficient_data",
            severity: null,
            averageSeverity: null,
            trend: "insufficient_data",
            difference: 0,
            symptoms: []
        };
    }


    const latestSeverity =
        severities[severities.length - 1];


    const averageSeverity =
        severities.reduce(
            (sum, value) => sum + value,
            0
        ) / severities.length;


    const trend =
        calculateAssistantTrend(severities);


    /*
     * Determine status.
     */

    let status = "normal";


    if (
        latestSeverity >=
        ASSISTANT_RULE_CONFIG.highSeverity
    ) {

        status = "high";

    } else if (
        latestSeverity >=
        ASSISTANT_RULE_CONFIG.elevatedSeverity
    ) {

        status = "elevated";
    }


    /*
     * A worsening trend can also trigger a flag.
     */

    const worsening =
        trend.trend === "increasing";


    const flagged =
        status === "elevated" ||
        status === "high" ||
        worsening;


    return {

        category: categoryData.category,

        status,

        flagged,

        severity: latestSeverity,

        averageSeverity,

        trend: trend.trend,

        difference: trend.difference,

        worsening,

        symptoms: [
            ...new Set(
                categoryData.symptoms || []
            )
        ],

        dates:
            categoryData.dates || []
    };
}


/* ============================================================
   ANALYZE ALL CATEGORIES
   ============================================================ */

function analyzeAssistantHealth() {

    const history =
        getRecentAssistantHistory();


    if (!history.length) {

        return {

            status: "no_data",

            daysAnalyzed: 0,

            categories: [],

            flags: []
        };
    }


    const categoryData =
        collectCategoryData(history);


    const categories =
        Object.values(categoryData)
            .map(analyzeAssistantCategory);


    const flags =
        categories.filter(
            category => category.flagged
        );


    return {

        status: "analyzed",

        daysAnalyzed: history.length,

        categories,

        flags
    };
}


/* ============================================================
   FIND HIGHEST PRIORITY INDICATOR
   ============================================================ */

function getAssistantPriorityFlag() {

    const analysis =
        analyzeAssistantHealth();


    if (!analysis.flags.length) {
        return null;
    }


    /*
     * Highest severity first.
     * If severity is equal, worsening trends come first.
     */

    const sorted =
        [...analysis.flags].sort(
            (a, b) => {

                if (
                    b.severity !==
                    a.severity
                ) {

                    return b.severity -
                           a.severity;
                }


                if (
                    b.worsening !==
                    a.worsening
                ) {

                    return b.worsening
                        ? 1
                        : -1;
                }


                return 0;
            }
        );


    return sorted[0];
}


/* ============================================================
   CREATE RULE-BASED ALERT
   ============================================================ */

function createAssistantAlert(flag) {

    if (!flag) {
        return null;
    }


    let message = "";


    const category =
        formatAssistantCategory(
            flag.category
        );


    if (flag.status === "high") {

        message =
            `${category} has a high recorded severity ` +
            `in the most recent data.`;

    } else if (flag.status === "elevated") {

        message =
            `${category} has an elevated recorded severity ` +
            `in the most recent data.`;

    } else if (flag.worsening) {

        message =
            `${category} shows an increasing trend ` +
            `in the recent recorded data.`;

    }


    return {

        category: flag.category,

        title: `${category} monitoring alert`,

        message,

        severity: flag.severity,

        trend: flag.trend,

        symptoms: flag.symptoms,

        reason: getAssistantRuleReason(flag)
    };
}


/* ============================================================
   EXPLAIN WHY SOMETHING WAS FLAGGED
   ============================================================ */

function getAssistantRuleReason(flag) {

    const reasons = [];


    if (
        flag.status === "high"
    ) {

        reasons.push(
            "The latest recorded severity is high."
        );
    }


    if (
        flag.status === "elevated"
    ) {

        reasons.push(
            "The latest recorded severity is elevated."
        );
    }


    if (
        flag.worsening
    ) {

        reasons.push(
            "The recent data shows an increasing trend."
        );
    }


    if (
        flag.symptoms &&
        flag.symptoms.length
    ) {

        reasons.push(
            `Recorded symptoms include ${flag.symptoms.join(", ")}.`
        );
    }


    if (!reasons.length) {

        reasons.push(
            "The recent data contains an indicator that should be monitored."
        );
    }


    return reasons.join(" ");
}


/* ============================================================
   GET PROTOCOL CATEGORY
   ============================================================ */

function getProtocolForFlag(flag) {

    if (!flag) {
        return null;
    }


    /*
     * protocols.js exposes getCosmicProtocol().
     */

    if (
        typeof getCosmicProtocol === "function"
    ) {

        return getCosmicProtocol(
            flag.category
        );
    }


    /*
     * If protocols.js isn't loaded, return null.
     */

    return null;
}


/* ============================================================
   COMBINE RULE + PROTOCOL
   ============================================================ */

function buildAssistantRecommendation(flag) {

    if (!flag) {
        return null;
    }


    const protocol =
        getProtocolForFlag(flag);


    const alert =
        createAssistantAlert(flag);


    return {

        category: flag.category,

        title:
            protocol?.name ||
            formatAssistantCategory(
                flag.category
            ),

        alert,

        guidance:
            protocol?.guidance || [],

        escalation:
            protocol?.professional_care ||
            "Consider appropriate professional evaluation if symptoms persist or worsen."
    };
}


/* ============================================================
   RUN COMPLETE RULE ENGINE
   ============================================================ */

function runAssistantRules() {

    const analysis =
        analyzeAssistantHealth();


    if (
        analysis.status === "no_data"
    ) {

        return {

            status: "no_data",

            message:
                "There is not enough recorded health data to analyze yet.",

            flags: [],

            recommendations: []
        };
    }


    const recommendations =
        analysis.flags.map(
            buildAssistantRecommendation
        );


    return {

        status: "complete",

        daysAnalyzed:
            analysis.daysAnalyzed,

        categories:
            analysis.categories,

        flags:
            analysis.flags,

        recommendations
    };
}


/* ============================================================
   FORMAT CATEGORY NAMES
   ============================================================ */

function formatAssistantCategory(category) {

    const names = {

        musculoskeletal:
            "Musculoskeletal health",

        cardiovascular:
            "Cardiovascular health",

        immuneGeneral:
            "General health",

        respiratory:
            "Respiratory health",

        mentalBehavioral:
            "Mental and behavioral wellbeing",

        sleep:
            "Sleep and recovery",

        otherSymptoms:
            "Other symptoms"
    };


    return names[category] || category;
}