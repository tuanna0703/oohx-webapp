export interface Screen {
  id: number
  name: string
  loc: string
  venue: string
  type: string
  size: string
  weekly: number
  lat: number
  lng: number
  color: 'green' | 'blue' | 'orange'
  thumb: string
  owner: string
}

export interface Owner {
  slug: string
  name: string
  emoji: string
  tagline: string
  coverBg: string
  about: string
  founded: number
  screens: number
  cities: number
  venues: string[]
  website: string
  email: string
  phone: string
  lat: number
  lng: number
}

export type VenueType = 'Outdoor' | 'Retail' | 'F&B' | 'Office' | 'Transit' | 'Entertainment'
