export const AIPrompts = {
    ENRICH_NODE: (title: string, category: string, context?: string) => `
        You are a travel expert.
        The user wants to start a journey or explore: "${title}" (${category})${context ? `\n        Specific Context/Location: "${context}"` : ''}.

        Provide a rich, inspiring description for this starting point.
        Also suggest a refined title and category if appropriate.

        Output JSON only:
        {
            "title": "Refined Title",
            "category": "Refined Category",
            "content": {
                "description": "Inspiring description...",
                "bestTimeVisit": "...",
                "tags": ["tag1", "tag2"]
            }
        }
    `,

    GENERATE_CHILDREN: (parentTitle: string, parentCategory: string, parentDescription: string, userJourney: string) => `
        You are a travel expert.
        User Journey: ${userJourney}
        Current Location/Context: ${parentTitle} (${parentCategory})
        Description: ${parentDescription}

        Generate 3 to 5 child nodes connected to this current node.
        Mix of categories: Destination, Activity, Accommodation, Food, Culture.
        
        Output JSON array format only:
        [
            {
                "title": "Title",
                "category": "Category",
                "type": "template",
                "content": { ...specific fields... }
            }
        ]
        Ensure valid JSON. Do not include markdown code blocks.
    `,

    GENERATE_SECTIONS: (city: string, context?: string) => `
        You are a seasoned editor for a high-end travel magazine.
        Create a curated guide for: "${city}"${context ? ` (${context})` : ''}.

        We need 3 distinct collections:
        1. "Highlights" (Top 4 sights/landmarks)
        2. "Culinary Scene" (Top 4 dishes or restaurants)
        3. "Stays" (Top 3 neighborhoods or hotels)

        Output strict JSON:
        {
            "sections": [
                {
                    "id": "highlights",
                    "title": "Highlights",
                    "items": [
                        { "title": "Name", "type": "Sight", "description": "Short 1-line vibe check." }
                    ]
                },
                {
                    "id": "food",
                    "title": "Culinary Scene",
                    "items": [
                        { "title": "Name", "type": "Food", "description": "Short 1-line vibe check." }
                    ]
                },
                {
                    "id": "stays",
                    "title": "Stays", 
                    "items": [
                        { "title": "Name", "type": "Stay", "description": "Short 1-line vibe check." }
                    ]
                }
            ]
        }
    `
};
