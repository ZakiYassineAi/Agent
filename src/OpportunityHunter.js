const fetch = require('node-fetch');

class OpportunityHunter {
    constructor(config) {
        this.token = config.githubToken;
    }

    async findRealOpportunities() {
        const searchQueries = [
            // General Freelance & Contract Work
            "help wanted freelancer", "freelance opportunity", "looking for contractor",
            "contract work available", "freelancer needed", "contractor needed",
            // Urgency & Payment Indicators
            "need developer urgent", "willing to pay developer", "hiring developer",
            "budget available", "paid gig", "paid task", "compensation", "bounty",
            "looking to hire",
            // Problem & Project Based
            "urgent fix needed", "production issue", "business critical",
            "client waiting", "deadline approaching",
            // Tech-Specific Examples
            "React developer needed", "Python freelance help", "Node.js expert wanted",
            "Urgent Django fix"
        ];

        const chunkSize = 5; // Group queries into chunks of 5 to avoid API query length limits
        const queryChunks = [];
        for (let i = 0; i < searchQueries.length; i += chunkSize) {
            const chunk = searchQueries.slice(i, i + chunkSize);
            const combinedQuery = chunk
                .map(q => q.includes(' ') ? `"${q}"` : q)
                .join(' OR ');
            queryChunks.push(combinedQuery);
        }

        console.log(`Executing ${queryChunks.length} search query chunks...`);

        // Run all chunked searches concurrently for efficiency
        const allResults = await Promise.all(
            queryChunks.map(query => this.searchGithubIssues(query))
        );

        // Flatten the array of arrays of items into a single array of opportunities
        const opportunities = allResults
            .filter(result => result && result.items)
            .flatMap(result => result.items);

        // The filter logic can now be applied to the combined results.
        return this.filterGenuineOpportunities(opportunities);
    }

    async filterGenuineOpportunities(opportunities) {
        const uniqueOpportunities = [];
        const seenIds = new Set();

        for (const opp of opportunities) {
            if (!seenIds.has(opp.id)) {
                seenIds.add(opp.id);
                uniqueOpportunities.push(opp);
            }
        }
        console.log(`Found ${opportunities.length} total results, filtered down to ${uniqueOpportunities.length} unique opportunities.`);

        const negativeKeywords = ['course', 'learn', 'tutorial', 'marketing', 'seo', 'design', 'lesson', 'class'];

        const timeFiltered = uniqueOpportunities.filter(opp => {
            const issueAgeInHours = (new Date() - new Date(opp.created_at)) / (1000 * 60 * 60);
            return issueAgeInHours < 48;
        });

        const keywordFiltered = timeFiltered.filter(opp => {
            const title = opp.title.toLowerCase();
            return !negativeKeywords.some(keyword => title.includes(keyword));
        });

        console.log(`Filtered from ${timeFiltered.length} to ${keywordFiltered.length} opportunities after checking negative keywords.`);

        return keywordFiltered;
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
