const Campaign = require("../models/Campaign");

// Synonym dictionary to expand interest keywords for semantic matching
const SYNONYM_MAP = {
  education: ["school", "student", "study", "learning", "books", "literacy", "college", "tuition", "teach", "teacher"],
  healthcare: ["medical", "hospital", "health", "doctor", "medicine", "cancer", "patient", "treatment", "clinic", "disease", "surgery"],
  children: ["child", "kids", "orphan", "young", "youth", "baby", "pediatric"],
  "rural development": ["rural", "village", "farmer", "agriculture", "panchayat", "infrastructure", "well", "farming"],
  environment: ["tree", "nature", "green", "climate", "forest", "eco", "pollution", "solar", "renewable", "recycle"],
  food: ["hunger", "meal", "ration", "feeding", "nutrition", "starvation", "hungry", "groceries"],
  "animal welfare": ["animal", "dog", "cat", "pet", "shelter", "rescue", "stray", "cow", "vet", "wildlife"],
  "disaster relief": ["disaster", "relief", "flood", "earthquake", "cyclone", "emergency", "victim", "rehabilitation", "rescue"],
  "women empowerment": ["women", "woman", "female", "girl", "empowerment", "self-help", "maternity", "widow"],
};

/**
 * Clean and tokenize text into lowercase word stems
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Fallback NLP-based recommendation algorithm (TF-IDF & Weighted Text Similarity)
 */
function computeNlpRecommendations(campaigns, interests = [], query = "") {
  const normalizedInterests = interests.map((i) => i.toLowerCase().trim());
  const queryTokens = tokenize(query);

  // Expand target keywords using synonyms
  const targetKeywords = new Set();
  normalizedInterests.forEach((interest) => {
    targetKeywords.add(interest);
    tokenize(interest).forEach((t) => targetKeywords.add(t));
    if (SYNONYM_MAP[interest]) {
      SYNONYM_MAP[interest].forEach((syn) => targetKeywords.add(syn));
    }
  });

  // Also look up synonyms for any matches in SYNONYM_MAP for words in query
  queryTokens.forEach((qToken) => {
    targetKeywords.add(qToken);
    Object.keys(SYNONYM_MAP).forEach((key) => {
      if (key.includes(qToken) || SYNONYM_MAP[key].includes(qToken)) {
        targetKeywords.add(key);
        SYNONYM_MAP[key].forEach((syn) => targetKeywords.add(syn));
      }
    });
  });

  const targetKeywordsArr = Array.from(targetKeywords);

  const scoredCampaigns = campaigns.map((campaign) => {
    const titleTokens = tokenize(campaign.title);
    const descTokens = tokenize(campaign.description);
    const categoryLower = (campaign.category || "").toLowerCase();

    let categoryScore = 0;
    let titleScore = 0;
    let descScore = 0;
    const matchedTopics = new Set();

    // 1. Category Matching (Weight: 35 points)
    normalizedInterests.forEach((interest) => {
      if (categoryLower.includes(interest) || interest.includes(categoryLower)) {
        categoryScore += 35;
        matchedTopics.add(campaign.category || interest);
      }
    });

    // 2. Title Matching (Weight: 35 points max)
    targetKeywordsArr.forEach((kw) => {
      if (titleTokens.includes(kw)) {
        titleScore += 12;
        // Identify matched user interest
        normalizedInterests.forEach((inst) => {
          if (inst.includes(kw) || (SYNONYM_MAP[inst] && SYNONYM_MAP[inst].includes(kw))) {
            matchedTopics.add(inst);
          }
        });
      }
    });

    // 3. Description Matching (Weight: 30 points max)
    targetKeywordsArr.forEach((kw) => {
      if (descTokens.includes(kw)) {
        descScore += 5;
        normalizedInterests.forEach((inst) => {
          if (inst.includes(kw) || (SYNONYM_MAP[inst] && SYNONYM_MAP[inst].includes(kw))) {
            matchedTopics.add(inst);
          }
        });
      }
    });

    // Compute raw total score
    let totalScore = categoryScore + Math.min(titleScore, 35) + Math.min(descScore, 30);

    // If query is provided, add bonus for direct query keyword match
    queryTokens.forEach((qToken) => {
      if (titleTokens.includes(qToken)) totalScore += 10;
      if (descTokens.includes(qToken)) totalScore += 5;
    });

    // Scale score smoothly between 68% and 98% for matched campaigns
    let percentageScore = 0;
    if (totalScore > 0) {
      percentageScore = Math.min(98, Math.max(68, Math.round(65 + (totalScore / 80) * 33)));
    }

    // Build human-readable explanation
    const topicList = Array.from(matchedTopics);
    let reason = "";
    if (topicList.length > 0) {
      reason = `This campaign strongly aligns with your interest in ${topicList.join(" and ")}.`;
    } else if (normalizedInterests.length > 0) {
      reason = `Recommended campaign in ${campaign.category || "community causes"}.`;
    } else {
      reason = "Recommended based on high impact and active community support.";
    }

    return {
      campaign,
      score: percentageScore,
      rawScore: totalScore,
      reason,
    };
  });

  // If user provided interests or query, strictly return campaigns that genuinely matched (rawScore > 0)
  const hasUserCriteria = normalizedInterests.length > 0 || queryTokens.length > 0;
  let validMatches = [];
  
  if (hasUserCriteria) {
    validMatches = scoredCampaigns.filter((item) => item.rawScore > 0);
  } else {
    // Default general recommendations when no criteria selected
    validMatches = scoredCampaigns.map((item) => ({
      ...item,
      score: item.score || 80,
      reason: "Popular active campaign supported by our community.",
    }));
  }

  // Sort by rawScore & percentageScore descending
  validMatches.sort((a, b) => b.rawScore - a.rawScore || b.score - a.score);

  return validMatches.slice(0, 5).map(({ campaign, score, reason }) => ({
    campaign,
    score,
    reason,
  }));
}

/**
 * External LLM API Call (Gemini / OpenAI) with automatic fallback
 */
async function callExternalLlmApi(campaigns, interests, query, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are an AI Recommendation Engine for a Donation Platform.
Donor Selected Interests: ${JSON.stringify(interests)}
Donor Free-text Query: "${query || "N/A"}"

Available Campaigns:
${JSON.stringify(
  campaigns.map((c) => ({
    id: String(c._id),
    title: c.title,
    category: c.category,
    description: c.description,
  }))
)}

Analyze the donor's preferences and rank the top matching campaigns.
Return ONLY valid JSON (no markdown formatting, no code fences) as an array of objects:
[
  {
    "id": "campaign_id_string",
    "score": number_between_70_and_98,
    "reason": "1-2 sentence concise explanation of why this campaign was recommended."
  }
]`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) throw new Error("Empty response from LLM API");

  // Clean JSON response (strip markdown fences if present)
  const cleanJson = textContent.replace(/```json/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleanJson);

  // Map parsed recommendations back to actual MongoDB campaign objects
  const results = [];
  for (const item of parsed) {
    const matched = campaigns.find((c) => String(c._id) === String(item.id));
    if (matched) {
      results.push({
        campaign: matched,
        score: Number(item.score) || 85,
        reason: item.reason || "Recommended based on your preferences.",
      });
    }
  }

  return results.slice(0, 5);
}

/**
 * Main Service Function: Get Campaign Recommendations
 */
async function getCampaignRecommendations(interests = [], query = "") {
  // Retrieve all active campaigns from MongoDB
  const campaigns = await Campaign.find().sort({ createdAt: -1 });

  if (!campaigns || campaigns.length === 0) {
    return [];
  }

  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      console.log("Using external Gemini LLM for campaign recommendations...");
      const llmResults = await callExternalLlmApi(campaigns, interests, query, apiKey);
      if (llmResults && llmResults.length > 0) {
        return llmResults;
      }
    } catch (err) {
      console.warn("External AI LLM call failed, falling back to NLP engine:", err.message);
    }
  }

  // Fallback to internal NLP recommendation algorithm
  return computeNlpRecommendations(campaigns, interests, query);
}

module.exports = {
  getCampaignRecommendations,
  computeNlpRecommendations,
};
