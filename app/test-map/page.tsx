// Trang test tạm — xóa sau khi debug xong
export default function TestMapPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''
  const scriptSrc = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&v=weekly`

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontFamily: 'monospace', marginBottom: '12px' }}>Google Maps Debug</h2>
      <p style={{ fontFamily: 'monospace', fontSize: '13px', marginBottom: '16px', color: apiKey ? 'green' : 'red' }}>
        API Key: {apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)} (${apiKey.length} chars)` : '❌ MISSING'}
      </p>
      <div id="test-map" style={{ width: '100%', height: '500px', border: '1px solid #ccc' }} />
      <p id="map-status" style={{ fontFamily: 'monospace', marginTop: '12px', color: 'orange' }}>
        Đang load map...
      </p>
      <script dangerouslySetInnerHTML={{
        __html: `
          window.initMap = function() {
            new google.maps.Map(document.getElementById('test-map'), {
              center: { lat: 16.0, lng: 106.0 },
              zoom: 6
            });
            var el = document.getElementById('map-status');
            if (el) { el.innerText = 'Map loaded OK'; el.style.color = 'green'; }
          };
        `
      }} />
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src={scriptSrc} />
    </div>
  )
}
