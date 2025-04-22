declare module 'newsapi' {
  interface Article {
    source: {
      id: string | null;
      name: string;
    };
    author: string | null;
    title: string;
    description: string;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string;
  }

  interface NewsAPIResponse {
    status: string;
    totalResults: number;
    articles: Article[];
  }

  interface Options {
    q?: string;
    sources?: string;
    domains?: string;
    from?: string;
    to?: string;
    language?: string;
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
    page?: number;
    pageSize?: number;
  }

  class NewsAPI {
    constructor(apiKey: string);
    v2: {
      everything(options: Options): Promise<NewsAPIResponse>;
      topHeadlines(options: Options): Promise<NewsAPIResponse>;
    };
  }

  export default NewsAPI;
} 