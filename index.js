const SmartGithubAgent = require('./src/SmartGithubAgent.js');
const RiskAssessmentSystem = require('./src/RiskAssessmentSystem.js');
const AdaptiveLearningSystem = require('./src/AdaptiveLearningSystem.js');
const AntiDetectionSystem = require('./src/AntiDetectionSystem.js');

/**
 * The CompleteAutomationSystem integrates all modules into a single, cohesive unit.
 * It manages the overall workflow from finding opportunities to learning from them.
 */
class CompleteAutomationSystem {
    constructor() {
        // Instantiate all the major system components
        this.agent = new SmartGithubAgent();
        this.riskAssessor = new RiskAssessmentSystem();
        this.learningSystem = new AdaptiveLearningSystem();
        this.antiDetection = new AntiDetectionSystem();
        console.log("CompleteAutomationSystem initialized.");
    }

    async start() {
        console.log("--- Starting Complete Automation System Run ---");

        // Use the anti-detection system's safety wrapper for the entire process
        await this.antiDetection.executeSafely(async () => {
            console.log("Searching for opportunities...");
            const opportunities = await this.agent.strategies.opportunityHunter.findRealOpportunities();

            if (!opportunities || opportunities.length === 0) {
                console.log("No new opportunities found.");
                return;
            }
            console.log(`Found ${opportunities.length} potential opportunities.`);

            // Process the first few opportunities found
            for (const opportunity of opportunities.slice(0, 3)) {
                const assessment = await this.riskAssessor.assessOpportunity(opportunity);
                console.log(`\nAssessing opportunity: "${opportunity.title}" -> Risk: ${assessment.riskLevel}`);

                if (assessment.recommendation.action !== "DECLINE_POLITELY") {
                    console.log("Recommendation: PROCEED. Crafting response...");
                    const response = await this.agent.strategies.naturalResponder.craftNaturalResponse(opportunity);

                    // In a real system, this response would be posted to the GitHub issue.
                    console.log(`--- Prepared Response for ${opportunity.html_url} ---`);
                    console.log(response);
                    console.log("----------------------------------------------------");

                    // Simulate tracking the outcome for the learning system
                    this.learningSystem.trackPerformance({
                        opportunity: { type: assessment.project.technicalComplexity > 6 ? 'complex' : 'simple' },
                        strategy: { pricing: 150 },
                        results: { clientResponded: true, proposalAccepted: true, paymentReceived: true, actualProfit: 150 }
                    });
                } else {
                    console.log(`Recommendation: DECLINE. Reason: ${assessment.recommendation.message}`);
                }
            }
        });

        console.log("\n--- Automation System Run Complete ---");
        const report = this.learningSystem.generatePerformanceReport();
        console.log("\n--- Performance Report ---");
        console.log(report.insights);
        console.log("--------------------------");
    }
}

/**
 * Main execution function to run the system.
 */
async function main() {
    const system = new CompleteAutomationSystem();
    try {
        await system.start();
    } catch (error) {
        console.error("A critical error occurred during the system run:", error);
    }
}

// Run the main function
main();
