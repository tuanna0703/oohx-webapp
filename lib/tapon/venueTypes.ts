// TapON SSP — Venue Types service
// GET /inventory/venue-types

import { sspFetchJson } from './client'
import type { VenueTypeNode, VenueTypesResponse } from './types'

export async function getVenueTypes(): Promise<VenueTypeNode[]> {
  const res = await sspFetchJson<VenueTypesResponse>('/inventory/venue-types')
  return res.data
}
