import { format } from 'date-fns';
import type { TwitterPost } from '../../types';

interface TwitterFeedProps {
  posts: TwitterPost[];
}

export function TwitterFeed({ posts }: TwitterFeedProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Twitter Updates</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="border-b pb-4">
            <p className="text-gray-700">{post.content}</p>
            <div className="mt-2 flex gap-4 text-sm text-gray-500">
              <span>❤️ {post.metrics.likes}</span>
              <span>🔄 {post.metrics.reposts}</span>
              <span>👁️ {post.metrics.views}</span>
              <span>✓ {post.metrics.verifiedComments}</span>
            </div>
            <span className="text-sm text-gray-500">
              {format(new Date(post.timestamp), 'MMM d, HH:mm')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}