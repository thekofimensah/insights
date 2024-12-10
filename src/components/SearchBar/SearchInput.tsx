import { useState, useEffect, useRef } from 'react';
import { coinListCache } from '../../services/coinListCache';
import { contractAddressCache } from '../../services/contractAddressCache';
import type { SearchResult } from '../../types/api';

interface SearchInputProps {
  onSearch: (coinId: string) => void;
}

export function SearchInput({ onSearch }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchCoins = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
  
      setIsLoading(true);
      try {
        const searchResults: SearchResult[] = [];
        
        // Check if query looks like a contract address
        if (query.length > 30 && query.startsWith('0x')) {
          const contractResult = await contractAddressCache.findByAddress(query);
          if (contractResult) {
            searchResults.push({
              ...contractResult,
              type: 'contract',
              market_cap: 0 // We'll need to fetch this separately if needed
            });
          }
        }

        // Search by name and symbol
        const coins = await coinListCache.getCoinList();
        const nameSymbolResults = coins
          .filter(coin => 
            coin.symbol.toLowerCase().includes(query.toLowerCase()) ||
            coin.name.toLowerCase().includes(query.toLowerCase())
          )
          .sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
          .slice(0, 10)
          .map(coin => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            type: coin.symbol.toLowerCase().includes(query.toLowerCase()) ? 'symbol' : 'name',
            market_cap: coin.market_cap
          }));

        setResults([...searchResults, ...nameSymbolResults]);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    const timeoutId = setTimeout(searchCoins, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    onSearch(result.id);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="w-full max-w-md relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search by name, symbol, or contract address"
          className="w-full px-4 py-2 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={`${result.id}-${index}`}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
            >
              <div>
                <span className="font-medium">{result.name}</span>
                <span className="text-gray-500 ml-2">({result.symbol.toUpperCase()})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {result.market_cap ? `$${(result.market_cap / 1e9).toFixed(1)}B` : 'N/A'}
                </span>
                <span className="text-xs text-gray-400 capitalize">{result.type}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}