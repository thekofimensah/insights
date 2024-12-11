import { useState, useEffect, useRef } from 'react';
import { coinListCache } from '../../services/coinListCache';
// import { contractAddressCache } from '../../services/contractAddressCache';
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
      console.group('SearchInput: searchCoins Performance');
      const startTime = performance.now();

      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        console.time('Total search duration');
        const searchResults: SearchResult[] = [];
        
          if (query.length > 30) {
            console.log('Searching for contract address...');
            const contractResult = await coinListCache.findByAddress(query);
            if (contractResult) {
              console.log('Contract found:', contractResult);
              searchResults.push({
                id: contractResult.id,
                symbol: contractResult.symbol,
                name: contractResult.name,
                type: 'contract',
                market_cap: contractResult.market_cap,
                contract_addresses: contractResult.platforms
              });
          }
        }
        
        if (searchResults.length === 0) {
          console.time('Name/symbol search');
          const coins = await coinListCache.getCoinList();
          console.timeEnd('Name/symbol search');
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
              market_cap: coin.market_cap,
              contract_addresses: coin.platforms
            }));

          console.log('Name/Symbol matches:', nameSymbolResults);
          searchResults.push(...nameSymbolResults);
        }

        console.time('Setting results');
        setResults(searchResults);
        console.timeEnd('Setting results');

      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
        const endTime = performance.now();
        console.log(`Total execution time: ${(endTime - startTime).toFixed(2)}ms`);
        console.timeEnd('Total search duration');
        console.groupEnd();
      }
    };
  
    const timeoutId = setTimeout(searchCoins, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = async (result: SearchResult) => {
    console.group('SearchInput: handleResultClick Performance');
    const startTime = performance.now();
    
    try {
      console.time('Total handleResultClick duration');
      
      // Measure onSearch call
      console.time('onSearch duration');
      await onSearch(result.id);
      console.timeEnd('onSearch duration');
      
      // Measure UI updates
      console.time('UI updates');
      setQuery('');
      setShowResults(false);
      console.timeEnd('UI updates');
      
      // Log total duration
      const endTime = performance.now();
      console.log(`Total execution time: ${(endTime - startTime).toFixed(2)}ms`);
      
    } catch (error) {
      console.error('Error in handleResultClick:', error);
    } finally {
      console.timeEnd('Total handleResultClick duration');
      console.groupEnd();
    }
  };
  
  const formatMarketCap = (marketCap: number): string => {
    if (!marketCap) return 'N/A';
    
    if (marketCap >= 1e12) { // Trillion
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    }
    if (marketCap >= 1e9) { // Billion
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    }
    if (marketCap >= 1e6) { // Million
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    }
    if (marketCap >= 1e3) { // Thousand
      return `$${(marketCap / 1e3).toFixed(0)}K`;
    }
    return `$${marketCap.toFixed(0)}`;
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
                  {result.market_cap ? `${formatMarketCap(result.market_cap)}` : 'N/A'}
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