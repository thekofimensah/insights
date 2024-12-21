import { fetchDetailedCoinData } from '@/services/api';
import { updateCoin } from './queries';
import { transformCoinData } from './transforms';

export async function enrichCoinData(id: string): Promise<void> {
  const detailedData = await fetchDetailedCoinData(id);
  const enrichedData = transformCoinData(detailedData);
  await updateCoin(id, enrichedData);
}