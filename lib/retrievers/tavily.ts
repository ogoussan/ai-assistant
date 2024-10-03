import { WebSearchResult } from "../types";

const { TAVILY_API_KEY } = process.env;

if (!TAVILY_API_KEY) {
  throw new Error('TAVILY_API_KEY is not defined in the environment variables.');
}

export async function searchWeb(query: string): Promise<WebSearchResult | undefined> {
  const searchUrl = `https://api.tavily.com/search`;
  console.log(`Searching web for '${query}'`)

  try {
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 10,
        include_images: false,
        include_answer: false,
        include_raw_content: false,
        include_domains: [],
        exclude_domains: [],
        use_cache: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data as WebSearchResult;
  } catch (error) {
    console.error('Web search failed:', error);
    return undefined;
  }
}
