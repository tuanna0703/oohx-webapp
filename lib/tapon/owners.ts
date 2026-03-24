// TapON SSP — Owners service
// GET /inventory/owners
// GET /inventory/owners/:slug

import { sspFetchJson } from './client'
import type { TapOnOwner, TapOnOwnerDetail, OwnersListResponse } from './types'

export interface OwnersParams {
  featured?: boolean
  limit?:    number
  page?:     number
}

export async function getOwners(params: OwnersParams = {}): Promise<OwnersListResponse> {
  const qs = new URLSearchParams()
  if (params.featured !== undefined) qs.set('featured', String(params.featured))
  if (params.limit    !== undefined) qs.set('limit',    String(params.limit))
  if (params.page     !== undefined) qs.set('page',     String(params.page))
  const query = qs.toString() ? `?${qs}` : ''
  return sspFetchJson<OwnersListResponse>(`/inventory/owners${query}`)
}

export async function getOwner(slug: string): Promise<TapOnOwnerDetail> {
  if (!slug) throw new Error('slug is required')
  return sspFetchJson<TapOnOwnerDetail>(`/inventory/owners/${encodeURIComponent(slug)}`)
}

// Re-export types for convenience
export type { TapOnOwner, TapOnOwnerDetail }
