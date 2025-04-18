import { NextResponse } from "next/server";
import { TenderModel } from "@/app/model/tenderModel";
import { cache } from "../../../lib/cache";
import { connectDB } from "../../db";

const CACHE_KEY = "keyword-cloud";
const CACHE_DURATION = 10 * 60; // 10 minutes, longer because processing is heavier

// List of common stop words to exclude
const STOP_WORDS = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "did",
  "do",
  "does",
  "doing",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "let's",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  // Tender-specific common words that aren't meaningful
  "tender",
  "tenders",
  "service",
  "services",
  "supply",
  "deliver",
  "delivery",
  "provide",
  "provision",
  "appointment",
  "required",
  "requirements",
  "project",
  "projects",
  "period",
  "request",
  "years",
  "proposal",
]);

// Domain-specific minimum character length to avoid abbreviations and short words
const MIN_WORD_LENGTH = 4;

// Maximum number of keywords to return
const MAX_KEYWORDS = 100;

async function getKeywordCloudData() {
  await connectDB();

  // Get tender descriptions from active tenders
  const activeTenders = await TenderModel.find({
    closingDate: { $gte: new Date() },
    description: { $exists: true, $ne: "" },
  })
    .select("description -_id")
    .limit(500); // Limit to prevent excessive processing

  // Process all descriptions
  const wordCounts = {};

  activeTenders.forEach((tender) => {
    if (!tender.description) return;

    // Convert to lowercase and remove special characters
    const words = tender.description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/);

    // Count word frequencies, but skip stop words and short words
    words.forEach((word) => {
      if (word && !STOP_WORDS.has(word) && word.length >= MIN_WORD_LENGTH) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  // Convert to array of objects for the word cloud
  const keywords = Object.entries(wordCounts)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value) // Sort by frequency, most frequent first
    .slice(0, MAX_KEYWORDS); // Take only top words

  return keywords;
}

export async function GET(request) {
  try {
    const cachedData = await cache.get(CACHE_KEY);
    if (cachedData) {
      console.log(`Cache hit for ${CACHE_KEY}`);
      return NextResponse.json({ success: true, data: cachedData });
    }

    console.log(`Cache miss for ${CACHE_KEY}, fetching from DB.`);
    const data = await getKeywordCloudData();

    await cache.set(CACHE_KEY, data, CACHE_DURATION);
    console.log(`Cache set for ${CACHE_KEY}`);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error generating keyword cloud data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
