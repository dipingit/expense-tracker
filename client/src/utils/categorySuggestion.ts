// Rule-based category suggestions based on keywords in description
const categoryKeywords: Record<string, string[]> = {
  "groceries": [
    "grocery", "supermarket", "whole foods", "trader joe's", "safeway", "kroger", 
    "target", "walmart", "costco", "market", "food store", "produce", "vegetables",
    "fruits", "milk", "bread", "meat", "seafood"
  ],
  "dining": [
    "restaurant", "cafe", "coffee", "pizza", "burger", "sushi", "thai", "chinese",
    "mexican", "italian", "diner", "bar", "pub", "tavern", "lunch", "dinner",
    "breakfast", "brunch", "starbucks", "mcdonald", "subway", "chipotle", "taco bell",
    "kfc", "popeyes", "chick-fil-a", "food delivery", "doordash", "grubhub"
  ],
  "transportation": [
    "uber", "uride", "lyft", "taxi", "gas", "petrol", "fuel", "car", "parking", "metro",
    "transit", "bus", "train", "airline", "flight", "toll", "parking meter",
    "ev charging", "car wash", "maintenance", "auto", "vehicle"
  ],
  "subscription": [
    "spotify", "netflix", "hulu", "disney", "amazon prime", "youtube"
  ],
  "utilities": [
    "electricity", "water", "gas bill", "internet", "phone", "mobile", "wifi",
    "utility", "power", "electric", "broadband", "telecom", "verizon", "comcast",
    "at&t", "t-mobile", "movie", "cinema", "concert"
  ],
  "housing": [
    "rent", "mortgage", "landlord", "lease", "apartment", "home", "house payment",
    "property tax", "maintenance", "deposit"
  ],
  "shopping": [
    "amazon", "ebay", "shop", "mall", "store", "retail", "clothes", "fashion",
    "apparel", "shoes", "dress", "decathlon", "bestbuy", "electronics",
    "apple", "tech", "gadget", "computer", "phone", "laptop", "monitor", "playstation"
  ],
  "health": [
    "gym", "fitness", "yoga", "doctor", "hospital", "pharmacy", "medicine",
    "health", "dental", "dentist", "clinic", "therapist", "trainer", "exercise",
    "sport", "wellness", "medical", "prescription", "supplement"
  ],
  "travel": [
    "hotel", "motel", "airbnb", "booking", "resort", "vacation", "trip", "luggage",
    "travel agency", "passport", "visa", "gas station"
  ]
};

/**
 * Suggest a category based on the description text
 * @param description - The expense description
 * @param categories - Array of available category objects
 * @returns The suggested category name or null
 */
export const suggestCategory = (
  description: string,
  categories: Array<{ id: number; name: string }>
): string | null => {
  if (!description.trim()) {
    return null;
  }

  const lowerDescription = description.toLowerCase();

  // Find matching category based on keywords
  for (const [keywordKey, keywords] of Object.entries(categoryKeywords)) {
    // Check if any keyword matches the description
    for (const keyword of keywords) {
      if (lowerDescription.includes(keyword)) {
        // Find a matching category from available categories
        // First try exact match with keyword key
        let matchedCategory = categories.find(
          cat => cat.name.toLowerCase() === keywordKey
        );
        
        // If no exact match, try partial match
        if (!matchedCategory) {
          matchedCategory = categories.find(
            cat => cat.name.toLowerCase().includes(keywordKey) ||
                   keywordKey.includes(cat.name.toLowerCase())
          );
        }
        
        // Return the matched category name if found
        if (matchedCategory) {
          return matchedCategory.name;
        }
      }
    }
  }

  return null;
};

export default suggestCategory;

