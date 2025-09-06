class DynamicPricing {
    calculateFairPrice(analysis) {
        const basePrices = {
            "simple_bug": 75,
            "feature_request": 150,
            "performance_issue": 200,
            "architecture_problem": 350,
            "complex_integration": 500,
            "bug_fix": 75, // Alias from analysis stub
            "issue": 100 // Default
        };

        let basePrice = basePrices[analysis.problemType] || 100;

        // These properties would be populated by a more sophisticated analysis module.
        // We use default values here to ensure the calculation works.
        const multipliers = {
            urgency: (analysis.isUrgent || analysis.urgencyLevel === 'high') ? 1.5 : 1,
            complexity: (analysis.complexityScore || 3) / 5, // Default complexity: 3/5
            techStack: (analysis.popularTechStack === false) ? 1.2 : 1, // Penalty for niche tech
            projectSize: (analysis.isLargeProject) ? 1.3 : 1,
            timeline: (analysis.needsFastDelivery) ? 1.4 : 1
        };

        let finalPrice = basePrice;
        for (const multiplier of Object.values(multipliers)) {
            finalPrice *= multiplier;
        }

        // Round to the nearest $25
        return Math.round(finalPrice / 25) * 25;
    }
}

module.exports = DynamicPricing;
