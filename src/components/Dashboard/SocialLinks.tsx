import { FaTwitter, FaTelegram, FaGlobe, FaGithub } from 'react-icons/fa';

interface SocialLinksProps {
  socialData: {
    twitter: {
      handle: string | null;
      followers: number;
    };
    telegram: string | null;
    homepage: string | null;
    github: string | null;
  };
}

export function SocialLinks({ socialData }: SocialLinksProps) {
  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="flex gap-4 items-center">
      {socialData.twitter.handle && (
        <a
          href={`https://twitter.com/${socialData.twitter.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-600 hover:text-blue-400"
        >
          <FaTwitter className="h-5 w-5" />
          <span className="text-sm">
            @{socialData.twitter.handle}
            {socialData.twitter.followers > 0 && (
              <span className="ml-1 text-gray-500">
                ({formatFollowers(socialData.twitter.followers)})
              </span>
            )}
          </span>
        </a>
      )}

      {socialData.telegram && (
        <a
          href={`https://t.me/${socialData.telegram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
        >
          <FaTelegram className="h-5 w-5" />
          <span className="text-sm">@{socialData.telegram}</span>
        </a>
      )}

      {socialData.homepage && (
        <a
          href={socialData.homepage}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <FaGlobe className="h-5 w-5" />
          <span className="text-sm">Website</span>
        </a>
      )}

      {socialData.github && (
        <a
          href={socialData.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FaGithub className="h-5 w-5" />
          <span className="text-sm">GitHub</span>
        </a>
      )}
    </div>
  );
}