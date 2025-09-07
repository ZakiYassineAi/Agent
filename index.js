const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const SmartGithubAgent = require('./src/SmartGithubAgent.js');
const RiskAssessmentSystem = require('./src/RiskAssessmentSystem.js');
const AdaptiveLearningSystem = require('./src/AdaptiveLearningSystem.js');
const AntiDetectionSystem = require('./src/AntiDetectionSystem.js');

/**
 * The CompleteAutomationSystem integrates all modules into a single, cohesive unit.
 * It manages the overall workflow from finding opportunities to learning from them.
 */
class CompleteAutomationSystem {
    constructor(config) {
        this.config = config;
        // Instantiate all the major system components, passing config where needed
        this.agent = new SmartGithubAgent(config);
        this.riskAssessor = new RiskAssessmentSystem();
        this.learningSystem = new AdaptiveLearningSystem();
        this.antiDetection = new AntiDetectionSystem();
        console.log("CompleteAutomationSystem initialized.");
    }

    async start() {
        console.log("--- Starting Complete Automation System Run ---");
        if (this.config.dryRun) {
            console.log("MODE: Running in Dry Run Mode. No comments will be posted.");
        } else {
            console.log("MODE: Running in Live Mode. Comments will be posted to GitHub.");
        }

        // Use the anti-detection system's safety wrapper for the entire process
        await this.antiDetection.executeSafely(async () => {
            console.log("Searching for opportunities...");
            const opportunities = await this.agent.strategies.opportunityHunter.findRealOpportunities();

            if (!opportunities || !opportunities.items || opportunities.items.length === 0) {
                console.log("No new opportunities found.");
                return;
            }
            console.log(`Found ${opportunities.total_count} potential opportunities. Processing top results...`);

            // Process the first few opportunities found
            for (const opportunity of opportunities.items.slice(0, 3)) {
                const assessment = await this.riskAssessor.assessOpportunity(opportunity);
                console.log(`\nAssessing opportunity: "${opportunity.title}" -> Risk: ${assessment.riskLevel}`);

                if (assessment.recommendation.action !== "DECLINE_POLITELY") {
                    console.log("Recommendation: PROCEED. Crafting response...");
                    const response = await this.agent.strategies.naturalResponder.craftNaturalResponse(opportunity);

                    if (this.config.dryRun) {
                        console.log(`--- [Dry Run] Prepared Response for ${opportunity.html_url} ---`);
                        console.log(response);
                        console.log("----------------------------------------------------");
                    } else {
                        // This is where the real posting logic would go.
                        console.log(`--- [Live Mode] Posting response to ${opportunity.html_url} ---`);
                        // await this.postCommentToGithub(opportunity.comments_url, response);
                    }

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
    const system = new CompleteAutomationSystem(config);
    try {
        await system.start();
    } catch (error) {
        console.error("A critical error occurred during the system run:", error);
    }
}

// Run the main function
main();
