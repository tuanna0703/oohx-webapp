import type { Screen, Owner } from './types'

// screen_id có thể chứa ':' (MAC address) — thay bằng '~' trong URL (safe, không cần encode)
export function screenHref(id: string): string {
  return `/screens/${id.replace(/:/g, '~')}`
}

// Decode URL param '~' → ':' để lấy lại screen_id gốc
export function decodeScreenId(param: string): string {
  return param.replace(/~/g, ':')
}

const DEF = { weekly: 0, price_per_slot_vnd: 0, slot_duration_sec: 15, slots_per_loop: 8, min_booking_days: 7, orientation: 'landscape' as const }

export const screens: Screen[] = [
  { ...DEF, id: 'mock-1',  name: 'Billboard Nút Giao Cầu Giấy',    loc: 'Xuân Thủy, Cầu Giấy, Hà Nội',         venue: 'Outdoor', type: 'Billboard', size: '14×6m', weekly: 380000, lat: 21.0380, lng: 105.7992, color: 'green',  thumb: 'bg2', owner: 'adtrue',  owner_name: 'AdTRUE Media' },
  { ...DEF, id: 'mock-2',  name: 'Vincom Mega Mall — Atrium L1',    loc: 'Royal City, Thanh Xuân, Hà Nội',       venue: 'Retail',  type: 'LCD',       size: '75"',   weekly: 120000, lat: 20.9963, lng: 105.8045, color: 'blue',   thumb: 'bg1', owner: 'vingroup', owner_name: 'Vingroup Retail Media' },
  { ...DEF, id: 'mock-3',  name: 'The Coffee House — Nguyễn Huệ',   loc: 'Lê Thánh Tôn, Quận 1, HCM',           venue: 'F&B',     type: 'LCD',       size: '55"',   weekly:  85000, lat: 10.7769, lng: 106.7009, color: 'orange', thumb: 'bg3', owner: 'tch',     owner_name: 'The Coffee House' },
  { ...DEF, id: 'mock-4',  name: 'AEON Mall Hà Đông — Entrance',    loc: 'Dương Nội, Hà Đông, Hà Nội',          venue: 'Retail',  type: 'LED',       size: '8×3m',  weekly: 210000, lat: 20.9710, lng: 105.7628, color: 'blue',   thumb: 'bg4', owner: 'aeon',    owner_name: 'AEON Vietnam' },
  { ...DEF, id: 'mock-5',  name: 'Lotte Center Lobby',              loc: '54 Liễu Giai, Ba Đình, Hà Nội',       venue: 'Office',  type: 'LCD',       size: '65"',   weekly:  45000, lat: 21.0380, lng: 105.8341, color: 'blue',   thumb: 'bg5', owner: 'savills', owner_name: 'Savills Vietnam' },
  { ...DEF, id: 'mock-6',  name: 'GS25 Hoàn Kiếm',                 loc: 'Đinh Tiên Hoàng, Hoàn Kiếm, HN',      venue: 'F&B',     type: 'LCD',       size: '32"',   weekly:  32000, lat: 21.0281, lng: 105.8527, color: 'green',  thumb: 'bg6', owner: 'tch',     owner_name: 'The Coffee House' },
  { ...DEF, id: 'mock-7',  name: 'Bitexco Financial Tower',         loc: '2 Hải Triều, Quận 1, HCM',            venue: 'Office',  type: 'LED',       size: '10×4m', weekly: 160000, lat: 10.7716, lng: 106.7040, color: 'blue',   thumb: 'bg1', owner: 'savills', owner_name: 'Savills Vietnam' },
  { ...DEF, id: 'mock-8',  name: 'Sân bay Nội Bài — Terminal 2',   loc: 'Sóc Sơn, Hà Nội',                     venue: 'Transit', type: 'LCD',       size: '75"',   weekly: 280000, lat: 21.2187, lng: 105.8038, color: 'green',  thumb: 'bg2', owner: 'adtrue',  owner_name: 'AdTRUE Media' },
  { ...DEF, id: 'mock-9',  name: 'Parkson Hùng Vương',             loc: 'Quận 5, TP. Hồ Chí Minh',             venue: 'Retail',  type: 'LCD',       size: '65"',   weekly:  95000, lat: 10.7551, lng: 106.6603, color: 'orange', thumb: 'bg3', owner: 'vingroup', owner_name: 'Vingroup Retail Media' },
  { ...DEF, id: 'mock-10', name: 'Landmark 81 Sky View',            loc: 'Bình Thạnh, TP. Hồ Chí Minh',         venue: 'Entertainment', type: 'LED', size: '12×5m', weekly: 220000, lat: 10.7944, lng: 106.7218, color: 'blue',   thumb: 'bg4', owner: 'aeon',    owner_name: 'AEON Vietnam' },
  { ...DEF, id: 'mock-11', name: 'Đà Nẵng — Cầu Rồng Billboard',   loc: 'Bạch Đằng, Hải Châu, Đà Nẵng',        venue: 'Outdoor', type: 'Billboard', size: '16×7m', weekly: 195000, lat: 16.0621, lng: 108.2271, color: 'green',  thumb: 'bg2', owner: 'adtrue',  owner_name: 'AdTRUE Media' },
  { ...DEF, id: 'mock-12', name: 'Vinmart+ Cầu Giấy',              loc: 'Trần Đăng Ninh, Cầu Giấy, HN',        venue: 'Retail',  type: 'LCD',       size: '43"',   weekly:  28000, lat: 21.0358, lng: 105.8014, color: 'blue',   thumb: 'bg1', owner: 'vingroup', owner_name: 'Vingroup Retail Media' },
]

export const owners: Record<string, Owner> = {
  adtrue: {
    slug: 'adtrue',
    name: 'AdTRUE Media',
    emoji: '🛣️',
    tagline: 'Hệ thống Billboard & OOH lớn nhất miền Bắc',
    coverBg: 'linear-gradient(135deg,#0D0F2B,#1A1D3D)',
    about: 'AdTRUE Media là công ty truyền thông ngoài trời hàng đầu tại Việt Nam, chuyên khai thác mạng lưới Billboard LED và LCD tại các nút giao thông trọng điểm, trung tâm thương mại và khu đô thị lớn. Với hơn 10 năm kinh nghiệm, AdTRUE cung cấp giải pháp quảng cáo OOH hiệu quả cho các thương hiệu trong nước và quốc tế.',
    founded: 2014,
    screens: 95,
    cities: 12,
    venues: ['Outdoor', 'Transit', 'Billboard'],
    website: 'adtrue.vn',
    email: 'contact@adtrue.vn',
    phone: '+84 24 3888 9999',
    lat: 21.0285,
    lng: 105.8542,
  },
  vingroup: {
    slug: 'vingroup',
    name: 'Vingroup Retail Media',
    emoji: '🏪',
    tagline: 'Mạng lưới màn hình trong hệ sinh thái Vingroup',
    coverBg: 'linear-gradient(135deg,#003087,#0050CC)',
    about: 'Vingroup Retail Media khai thác hệ thống màn hình kỹ thuật số trong toàn bộ chuỗi trung tâm thương mại Vincom, siêu thị VinMart/WinMart và các tiện ích thuộc hệ sinh thái Vingroup.',
    founded: 2018,
    screens: 320,
    cities: 28,
    venues: ['Retail', 'Office', 'Entertainment'],
    website: 'vingroup.net',
    email: 'media@vingroup.net',
    phone: '+84 24 3974 9999',
    lat: 21.0278,
    lng: 105.8342,
  },
  tch: {
    slug: 'tch',
    name: 'The Coffee House Media',
    emoji: '☕',
    tagline: 'Tiếp cận giới trẻ tại hơn 180 cửa hàng TCH',
    coverBg: 'linear-gradient(135deg,#2D1B00,#7B4500)',
    about: 'The Coffee House Media cung cấp giải pháp quảng cáo trong chuỗi 180+ cửa hàng The Coffee House trên toàn quốc.',
    founded: 2019,
    screens: 180,
    cities: 15,
    venues: ['F&B', 'Retail'],
    website: 'thecoffeehouse.com',
    email: 'media@thecoffeehouse.com',
    phone: '+84 28 3838 9999',
    lat: 10.7769,
    lng: 106.7009,
  },
  aeon: {
    slug: 'aeon',
    name: 'AEON Vietnam Media',
    emoji: '🏬',
    tagline: 'Premium in-mall advertising tại 6 đại siêu thị AEON',
    coverBg: 'linear-gradient(135deg,#CC0000,#990000)',
    about: 'AEON Vietnam Media quản lý hệ thống màn hình quảng cáo trong 6 trung tâm mua sắm AEON Mall tại Hà Nội và TP.HCM.',
    founded: 2020,
    screens: 140,
    cities: 4,
    venues: ['Retail', 'Entertainment', 'F&B'],
    website: 'aeon.com.vn',
    email: 'media@aeon.com.vn',
    phone: '+84 24 6288 9999',
    lat: 20.9710,
    lng: 105.7628,
  },
  savills: {
    slug: 'savills',
    name: 'Savills Office Network',
    emoji: '🏢',
    tagline: 'Quảng cáo trong hệ thống tòa nhà văn phòng hạng A',
    coverBg: 'linear-gradient(135deg,#1B3A5C,#2B5F8A)',
    about: 'Savills Office Network khai thác màn hình quảng cáo trong các tòa nhà văn phòng hạng A và B+ tại Hà Nội và TP.HCM.',
    founded: 2021,
    screens: 88,
    cities: 3,
    venues: ['Office'],
    website: 'savills.com.vn',
    email: 'media@savills.com.vn',
    phone: '+84 24 3946 9999',
    lat: 21.0380,
    lng: 105.8341,
  },
}

export const locations = [
  { name:'Hà Nội', count:480 },
  { name:'TP. Hồ Chí Minh', count:420 },
  { name:'Đà Nẵng', count:180 },
  { name:'Hải Phòng', count:95 },
  { name:'Cần Thơ', count:72 },
  { name:'Bình Dương', count:68 },
  { name:'Đồng Nai', count:54 },
  { name:'Khánh Hòa', count:48 },
  { name:'Thừa Thiên Huế', count:42 },
  { name:'Quảng Nam', count:38 },
  { name:'Bà Rịa - Vũng Tàu', count:35 },
  { name:'Nghệ An', count:32 },
  { name:'Thanh Hóa', count:28 },
  { name:'Lâm Đồng', count:25 },
  { name:'Bắc Ninh', count:22 },
  { name:'Hưng Yên', count:18 },
  { name:'Hải Dương', count:16 },
  { name:'Quảng Bình', count:15 },
  { name:'Bình Thuận', count:14 },
  { name:'Phú Yên', count:12 },
]

export const iconSVG: Record<string, string> = {
  Outdoor: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  Retail: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>',
  'F&B': '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>',
  Transit: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  Office: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  Entertainment: '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
  Billboard: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
}

export const bgMap: Record<string, string> = {
  Outdoor: 'bg2', Retail: 'bg1', 'F&B': 'bg3', Transit: 'bg4', Office: 'bg5', Entertainment: 'bg6',
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + ' ₫'
}

export function getOwnerScreens(ownerSlug: string): Screen[] {
  return screens.filter(s => s.owner === ownerSlug)
}
