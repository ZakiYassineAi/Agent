const OpportunityHunter = require('./OpportunityHunter.js');
const NaturalResponder = require('./NaturalResponder.js');
const USDTPaymentSystem = require('./USDTPaymentSystem.js');
const TrialBeforePayment = require('./TrialBeforePayment.js');

/**
 * The main agent class that orchestrates the different strategies.
 */
class SmartGithubAgent {
    constructor() {
        this.strategies = {
            opportunityHunter: new OpportunityHunter(),
            naturalResponder: new NaturalResponder(),
            usdtPaymentSystem: new USDTPaymentSystem(),
            trialSystem: new TrialBeforePayment()
        };
        console.log("SmartGithubAgent initialized with all strategies.");
    }

    /**
     * The main execution loop for the agent.
     * This is a simplified version to demonstrate the workflow.
     */
    async run() {
        console.log("--- Starting Agent Run ---");

        // 1. Find opportunities
        const opportunities = await this.strategies.opportunityHunter.findRealOpportunities();
        console.log(`Found ${opportunities.length} potential opportunities.`);

        if (opportunities.length === 0) {
            console.log("No new opportunities found. Ending run.");
            return;
        }

        // For this example, we'll just process the first opportunity.
        const opportunity = opportunities[0];
        console.log(`Processing opportunity: "${opportunity.title}"`);

        // 2. Craft a response (which includes analysis and delay)
        const response = await this.strategies.naturalResponder.craftNaturalResponse(opportunity);
        console.log("\nCrafted response to be sent:\n---");
        console.log(response);
        console.log("---\n");

        // 3. Generate a payment proposal
        const analysis = await this.strategies.naturalResponder.analyzeIssue(opportunity); // Re-analyzing for proposal
        const proposal = this.strategies.usdtPaymentSystem.generatePaymentProposal(opportunity, analysis);
        console.log("Generated Payment Proposal:", proposal);

        // In a real implementation, the response would be posted to the GitHub issue.
        console.log("Agent run complete. In a real scenario, the response would now be posted.");
    }
}

module.exports = SmartGithubAgent;
