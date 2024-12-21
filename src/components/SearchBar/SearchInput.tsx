import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchCoins } from '@/lib/search'
import { debugDB } from '@/utils/debug'
import { formatLargeNumber } from '@/utils/formatters'

interface SearchInputProps {
  onSearch: (coinId: string) => void
}

export function SearchInput({ onSearch }: SearchInputProps) {
  const [query, setQuery] = useState('')

  const { data: coins, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchCoins(query),
    enabled: query.length >= 2,
  })

  const handleSelect = (coinId: string) => {
    debugDB('Selected coin: %s', coinId)
    onSearch(coinId)
    setQuery('')
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a cryptocurrency..."
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}

      {query.length >= 2 && coins?.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {coins.map((coin) => (
            <button
              key={coin.id}
              onClick={() => handleSelect(coin.id)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
            >
              <div>
                <span className="font-medium">{coin.name}</span>
                <span className="text-gray-500 ml-2">({coin.symbol.toUpperCase()})</span>
              </div>
              {coin.market_cap && (
                <span className="text-sm text-gray-400">
                  MC: ${formatLargeNumber(coin.market_cap)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}