// TapON SSP — Stats service
// GET /inventory/stats

import { sspFetchJson } from './client'
import type { InventoryStats } from './types'

export async function getStats(): Promise<InventoryStats> {
  return sspFetchJson<InventoryStats>('/inventory/stats')
}
