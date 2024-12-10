import { format } from 'date-fns';
import type { TelegramMessage } from '../../types';

interface TelegramFeedProps {
  messages: TelegramMessage[];
}

export function TelegramFeed({ messages }: TelegramFeedProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Telegram Updates</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="border-b pb-2">
            <div className="flex justify-between items-start">
              <span className="font-medium">{message.author}</span>
              <span className="text-sm text-gray-500">
                {format(new Date(message.timestamp), 'MMM d, HH:mm')}
              </span>
            </div>
            <p className="mt-1 text-gray-700">{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}