import { format } from 'date-fns';
import type { NewsArticle } from '../../types';

interface NewsFeedProps {
  articles: NewsArticle[];
}

export function NewsFeed({ articles }: NewsFeedProps) {
  const negativeNews = articles.filter(article => article.sentiment === 'negative');
  const otherNews = articles.filter(article => article.sentiment !== 'negative');

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Latest News</h2>
      
      {negativeNews.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-red-600 mb-2">Critical Updates</h3>
          <div className="space-y-4">
            {negativeNews.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {otherNews.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <div className="border-b pb-4">
      <a 
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:text-blue-600"
      >
        <h4 className="font-medium">{article.title}</h4>
      </a>
      <p className="text-gray-600 mt-1">{article.summary}</p>
      <span className="text-sm text-gray-500">
        {format(new Date(article.timestamp), 'MMM d, HH:mm')}
      </span>
    </div>
  );
}