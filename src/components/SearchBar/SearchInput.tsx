import { useState, useEffect, useRef } from 'react';
import { coinListCache } from '../../services/coinListCache';
import type { SearchResult } from '../../types/api';
import DataEnhancer from '../../services/dataEnhancer';
import { fallbackLookup } from '../../services/fallbackLookup';
import { fetchDexScreenerTokens } from '../../services/api';

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
        
        if (query.length > 30) {
          const contractResult = await coinListCache.findByAddress(query);
          if (contractResult) {
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
              market_cap: coin.market_cap,
              contract_addresses: coin.platforms
            }));

          searchResults.push(...nameSymbolResults);
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    const timeoutId = setTimeout(searchCoins, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = async (result: SearchResult) => {
    try {
      let updatedData = null;
      
      // Check if we need to fetch market cap from DexScreener
      if (!result.market_cap && result.contract_addresses) {
        const addresses = Object.values(result.contract_addresses).filter(Boolean);
        if (addresses.length > 0) {
          const dexData = await fetchDexScreenerTokens(addresses);
          if (dexData.pairs && dexData.pairs.length > 0) {
            const marketCap = dexData.pairs[0].marketCap;
            if (marketCap) {
              result.market_cap = marketCap;
              // Update cache with new market cap
              const coins = await coinListCache.getCoinList();
              const coinIndex = coins.findIndex(c => c.id === result.id);
              if (coinIndex !== -1) {
                coins[coinIndex].market_cap = marketCap;
                await coinListCache.saveCacheToLocalStorage();
              }
            }
          }
        }
      }

      // If still no market cap, try fallback lookup
      if (!result.market_cap) {
        const [updatedCoin] = await fallbackLookup.lookupMissingDataBatch([{
          id: result.id,
          symbol: result.symbol,
          name: result.name,
          market_cap: result.market_cap,
          platforms: result.contract_addresses
        }]);
        updatedData = updatedCoin;
      }

      if (updatedData) {
        await DataEnhancer.updateCoinData(result.id, updatedData);
      } else {
        await DataEnhancer.updateCoinData(result.id);
      }
      
      await onSearch(result.id);
      setQuery('');
      setShowResults(false);
    } catch (error) {
      console.error('Error in handleResultClick:', error);
    }
  };
  
  const formatMarketCap = (marketCap: number): string => {
    if (!marketCap) return 'N/A';
    
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(0)}K`;
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
                  {formatMarketCap(result.market_cap || 0)}
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