const fetch = require('node-fetch');

class OpportunityHunter {
    constructor(config) {
        this.token = config.githubToken;
    }

    async findRealOpportunities() {
        const searchQueries = [
            // البحث عن طلبات المساعدة الصريحة
            "help wanted freelancer",
            "need developer urgent",
            "looking for contractor",
            "willing to pay developer",
            "hiring developer",
            "budget available",
            "need help ASAP",
            "freelance opportunity",
            "contract work available",

            // Issues مع كلمات مفتاحية تدل على الاستعداد للدفع
            "urgent fix needed",
            "production issue",
            "client waiting",
            "deadline tomorrow",
            "business critical",
            "enterprise project"
        ];

        const opportunities = [];

        for (const query of searchQueries) {
            // In a real scenario, we would handle pagination and rate limits.
            const results = await this.searchGithubIssues(query);
            if (results && results.items) {
                opportunities.push(...results.items);
            }
        }

        // The filter logic depends on properties that may not exist in the API response.
        // This is a placeholder for more sophisticated filtering.
        return this.filterGenuineOpportunities(opportunities);
    }

    async filterGenuineOpportunities(opportunities) {
        // This is a placeholder filter. A real implementation would require
        // much more sophisticated analysis of the issue, repository, and author.
        return opportunities.filter(opp => {
            const issueAgeInHours = (new Date() - new Date(opp.created_at)) / (1000 * 60 * 60);
            return issueAgeInHours < 48;
        });
    }

    async searchGithubIssues(query) {
        const searchParams = {
            q: `${query} is:issue is:open`,
            sort: 'created',
            order: 'desc',
            per_page: 50 // Requesting 50 items per page
        };

        const queryString = new URLSearchParams(searchParams).toString();

        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${this.token}`
        };

        try {
            const response = await fetch(`https://api.github.com/search/issues?${queryString}`, { headers });
            if (!response.ok) {
                console.error(`GitHub API error: ${response.status} ${response.statusText}`);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch from GitHub API:", error);
            return [];
        }
    }
}

module.exports = OpportunityHunter;
