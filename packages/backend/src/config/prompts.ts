export const AIPrompts = {
    ENRICH_NODE: (title: string, category: string) => `
        You are a travel expert.
        The user wants to start a journey or explore: "${title}" (${category}).

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
    `
};
