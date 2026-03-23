// Trang test tạm — xóa sau khi debug xong
export default function TestMapPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontFamily: 'monospace', marginBottom: '12px' }}>
        Google Maps Debug
      </h2>
      <p style={{ fontFamily: 'monospace', fontSize: '13px', marginBottom: '16px', color: apiKey ? 'green' : 'red' }}>
        API Key: {apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)} (${apiKey.length} chars)` : '❌ MISSING'}
      </p>
      {/* Map container */}
      <div id="test-map" style={{ width: '100%', height: '500px', border: '1px solid #ccc' }} />
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          function initMap() {
            var map = new google.maps.Map(document.getElementById('test-map'), {
              center: { lat: 16.0, lng: 106.0 },
              zoom: 6
            });
            document.getElementById('status').innerText = '✅ Map loaded OK';
            document.getElementById('status').style.color = 'green';
          }
          window.initMap = initMap;
        })();
      `}} />
      <script
        src={\`https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&v=weekly\`}
        async
      />
      <p id="status" style={{ fontFamily: 'monospace', marginTop: '12px', color: 'orange' }}>
        Đang load map...
      </p>
    </div>
  )
}
