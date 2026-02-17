// Rich dummy data for the Load Sample feature
// 100 hotel listings across diverse cities, regions, property types, price ranges, and brands

const CITIES_DATA: Array<{city: string; country: string; region: string; district: string; latitude: string; longitude: string}> = [
  { city: "Tokyo", country: "Japan", region: "Asia Pacific", district: "Shibuya", latitude: "35.6595", longitude: "139.7004" },
  { city: "Tokyo", country: "Japan", region: "Asia Pacific", district: "Shinjuku", latitude: "35.6938", longitude: "139.7034" },
  { city: "Tokyo", country: "Japan", region: "Asia Pacific", district: "Ginza", latitude: "35.6717", longitude: "139.7649" },
  { city: "Cannes", country: "France", region: "Europe", district: "La Croisette", latitude: "43.5510", longitude: "7.0170" },
  { city: "Cannes", country: "France", region: "Europe", district: "Le Suquet", latitude: "43.5507", longitude: "7.0112" },
  { city: "New York", country: "United States", region: "Americas", district: "Manhattan", latitude: "40.7580", longitude: "-73.9855" },
  { city: "New York", country: "United States", region: "Americas", district: "Brooklyn", latitude: "40.6782", longitude: "-73.9442" },
  { city: "New York", country: "United States", region: "Americas", district: "SoHo", latitude: "40.7233", longitude: "-74.0030" },
  { city: "Marrakech", country: "Morocco", region: "Africa", district: "Medina", latitude: "31.6295", longitude: "-7.9811" },
  { city: "Singapore", country: "Singapore", region: "Asia Pacific", district: "Marina Bay", latitude: "1.2834", longitude: "103.8607" },
  { city: "Singapore", country: "Singapore", region: "Asia Pacific", district: "Orchard", latitude: "1.3048", longitude: "103.8318" },
  { city: "Tulum", country: "Mexico", region: "Americas", district: "Beach Zone", latitude: "20.2085", longitude: "-87.4296" },
  { city: "Queenstown", country: "New Zealand", region: "Asia Pacific", district: "Central", latitude: "-45.0312", longitude: "168.6626" },
  { city: "Geiranger", country: "Norway", region: "Europe", district: "Fjord", latitude: "62.1048", longitude: "7.0959" },
  { city: "Paris", country: "France", region: "Europe", district: "Le Marais", latitude: "48.8566", longitude: "2.3522" },
  { city: "Paris", country: "France", region: "Europe", district: "Montmartre", latitude: "48.8867", longitude: "2.3431" },
  { city: "London", country: "United Kingdom", region: "Europe", district: "Mayfair", latitude: "51.5074", longitude: "-0.1278" },
  { city: "London", country: "United Kingdom", region: "Europe", district: "Covent Garden", latitude: "51.5117", longitude: "-0.1240" },
  { city: "Dubai", country: "UAE", region: "Middle East", district: "Downtown", latitude: "25.1972", longitude: "55.2744" },
  { city: "Dubai", country: "UAE", region: "Middle East", district: "Palm Jumeirah", latitude: "25.1124", longitude: "55.1390" },
  { city: "Bali", country: "Indonesia", region: "Asia Pacific", district: "Ubud", latitude: "-8.5069", longitude: "115.2625" },
  { city: "Bali", country: "Indonesia", region: "Asia Pacific", district: "Seminyak", latitude: "-8.6913", longitude: "115.1683" },
  { city: "Sydney", country: "Australia", region: "Asia Pacific", district: "Circular Quay", latitude: "-33.8568", longitude: "151.2153" },
  { city: "Barcelona", country: "Spain", region: "Europe", district: "Gothic Quarter", latitude: "41.3851", longitude: "2.1734" },
  { city: "Miami", country: "United States", region: "Americas", district: "South Beach", latitude: "25.7617", longitude: "-80.1918" },
];

const BRANDS = ["Grand Collection", "Podomoro Hotels", "Stellar Stays", "Azure Living", "Heritage House", "EcoNest", "Metro Boutique", "Royal Palms", "Nomad Lodges", "Pacific Crest"];
const CATEGORIES = ["Luxury", "Resort", "Boutique", "Heritage", "Eco Lodge", "Business", "Budget", "Villa"];
const PROPERTY_TYPES = ["Hotel", "Resort", "Villa", "Apartment", "Hostel", "Guesthouse", "Lodge", "Inn"];
const BEDROOM_COUNTS = ["Studio", "1 Bedroom", "2 Bedrooms", "3 Bedrooms", "Suite", "Penthouse"];
const AMENITIES_LIST = ["Pool", "Spa", "Gym", "Restaurant", "Bar", "WiFi", "Parking", "Room Service", "Concierge", "Business Center", "Beach Access", "Garden", "Rooftop Terrace", "Kids Club", "Pet Friendly"];

const PHOTOS = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
  "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
];

const HOTEL_NAMES_POOL = [
  "Grand Sakura", "Azure Coast", "Brooklyn Bridge Boutique", "Riad Al-Noor", "Nordic Fjord Lodge",
  "Marina Bay Residences", "Hacienda del Sol", "Wool Shed Inn", "Crystal Palace", "Moonlight Terrace",
  "Sapphire Tower", "Golden Lotus", "Silver Oak", "Emerald Bay", "Coral Reef",
  "Diamond Peak", "Jade Garden", "Ivory Coast", "Obsidian House", "Amber Residence",
  "Sunrise Villa", "Sunset Lodge", "Starlight Hotel", "Horizon Suites", "Seabreeze Inn",
  "Mountain View", "Lake House", "Valley Resort", "Cliff Edge", "Forest Retreat",
  "Urban Loft", "Metro Central", "City Lights", "Downtown Hub", "Skyline Towers",
  "Heritage Manor", "Colonial House", "Palace Royal", "Crown Jewel", "Vintage Estate",
  "Zen Garden", "Bamboo House", "Cherry Blossom", "Willow Creek", "Cedar Ridge",
  "Oceanfront", "Beachside", "Waterfront", "Harborview", "Bay Club",
];

function generateHotels(): any[] {
  const hotels: any[] = [];
  for (let i = 0; i < 100; i++) {
    const cityData = CITIES_DATA[i % CITIES_DATA.length];
    const nameBase = HOTEL_NAMES_POOL[i % HOTEL_NAMES_POOL.length];
    const brand = BRANDS[i % BRANDS.length];
    const category = CATEGORIES[i % CATEGORIES.length];
    const propertyType = PROPERTY_TYPES[i % PROPERTY_TYPES.length];
    const bedrooms = BEDROOM_COUNTS[i % BEDROOM_COUNTS.length];
    const stars = String(3 + (i % 3)); // 3, 4, or 5
    const rating = (3.5 + (Math.random() * 1.5)).toFixed(1);
    const reviews = String(100 + Math.floor(Math.random() * 2000));
    const price = String(50 + Math.floor(Math.random() * 550));
    const numAmenities = 3 + (i % 5);
    const amenities = AMENITIES_LIST.slice(i % 5, (i % 5) + numAmenities).join(", ");
    const photo = PHOTOS[i % PHOTOS.length];

    const hotelName = i < 50 ? `${brand} ${nameBase}` : `${nameBase} by ${brand}`;
    const slug = hotelName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    hotels.push({
      hotel_name: hotelName,
      slug,
      brand_name: brand,
      address: `${100 + i} Main Street, ${cityData.district}`,
      country: cityData.country,
      city: cityData.city,
      district: cityData.district,
      region: cityData.region,
      category,
      property_type: propertyType,
      bedrooms,
      stars,
      rating,
      number_of_reviews: reviews,
      price_per_night: price,
      photo_url: photo,
      languages_spoken: "English, Local Language",
      hotel_services: "Concierge, Room Service, Laundry, Airport Transfer",
      amenities,
      description: `${hotelName} is a ${stars}-star ${category.toLowerCase()} ${propertyType.toLowerCase()} located in the ${cityData.district} district of ${cityData.city}, ${cityData.country}. Offering ${bedrooms.toLowerCase()} accommodations with ${amenities.toLowerCase()}, this property is perfect for travelers seeking ${category.toLowerCase()} experiences in the ${cityData.region} region. Rated ${rating}/5 by ${reviews} verified guests. Part of the ${brand} collection.`,
      url: `https://example.com/${slug}`,
      phone: `+1-555-${String(1000 + i).slice(0, 4)}`,
      email: `info@${slug.slice(0, 20)}.example.com`,
      check_in: "15:00",
      check_out: "11:00",
      latitude: cityData.latitude,
      longitude: cityData.longitude,
    });
  }
  return hotels;
}

export const SAMPLE_HOTEL_DATA = generateHotels();

export const SAMPLE_DATA_SOURCE_NAME = "Sample Hotels Directory (100 Listings)";

// ──────────────────────────────────────────────
// LDP — Listing Detail Page 
// 3 recommendation sections: by Category, by City, by Brand
// All recommendations are clickable links
// ──────────────────────────────────────────────
export const SAMPLE_LDP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{hotel_name}} | {{city}}, {{country}} — Hotels Directory</title>
  <meta name="description" content="{{hotel_name}} in {{city}}, {{country}}. {{stars}}-star {{category}} {{property_type}} from \${{price_per_night}}/night. Rated {{rating}}/5 by {{number_of_reviews}} guests.">
  <style>
    :root{--c-primary:#1a365d;--c-accent:#e67e22;--c-bg:#f7f8fc;--c-card:#fff;--c-text:#2d3748;--c-light:#718096;--c-border:#e2e8f0;--c-star:#f6ad55;--radius:12px}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;background:var(--c-bg);color:var(--c-text);line-height:1.6}
    a{text-decoration:none;color:inherit}
    .nav{background:var(--c-primary);padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
    .nav-brand{color:#fff;font-weight:800;font-size:1.15rem;letter-spacing:-.5px}
    .nav-links{display:flex;gap:1.5rem}
    .nav-links a{color:rgba(255,255,255,.8);font-size:.875rem;font-weight:500}
    .nav-links a:hover{color:#fff}
    .container{max-width:1100px;margin:0 auto;padding:2rem 1.5rem}
    .breadcrumb{font-size:.8rem;color:var(--c-light);margin-bottom:1.5rem}
    .breadcrumb a{color:var(--c-accent)}
    .breadcrumb a:hover{text-decoration:underline}
    .hero-img{width:100%;height:420px;object-fit:cover;border-radius:var(--radius);box-shadow:0 4px 20px rgba(0,0,0,.1)}
    .title-row{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin:1.5rem 0}
    .title-row h1{font-size:2rem;font-weight:800;color:var(--c-primary);line-height:1.2}
    .title-meta{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;margin-top:.35rem}
    .stars-display{color:var(--c-star);font-size:1.1rem;letter-spacing:1px}
    .rating-pill{background:var(--c-primary);color:#fff;padding:.25rem .75rem;border-radius:20px;font-size:.8rem;font-weight:700}
    .review-count{color:var(--c-light);font-size:.85rem}
    .price-block{text-align:right}
    .price-block .price{font-size:2rem;font-weight:800;color:var(--c-accent)}
    .price-block .price-sub{font-size:.75rem;color:var(--c-light)}
    .quick-actions{display:flex;gap:.75rem;margin-bottom:2rem;flex-wrap:wrap}
    .qa-btn{padding:.65rem 1.5rem;border-radius:8px;font-weight:700;font-size:.875rem;border:2px solid transparent;cursor:pointer;display:inline-flex;align-items:center;gap:.5rem}
    .qa-primary{background:var(--c-accent);color:#fff;border-color:var(--c-accent)}
    .qa-secondary{background:transparent;border-color:var(--c-primary);color:var(--c-primary)}
    .info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.25rem;margin-bottom:2.5rem}
    .info-card{background:var(--c-card);border:1px solid var(--c-border);border-radius:var(--radius);padding:1.25rem}
    .info-card .ic-label{font-size:.7rem;text-transform:uppercase;font-weight:700;color:var(--c-light);letter-spacing:.5px;margin-bottom:.35rem}
    .info-card .ic-value{font-size:1rem;font-weight:600}
    .section{background:var(--c-card);border:1px solid var(--c-border);border-radius:var(--radius);padding:2rem;margin-bottom:1.5rem}
    .section-title{font-size:1.15rem;font-weight:700;color:var(--c-primary);margin-bottom:1rem;display:flex;align-items:center;gap:.5rem}
    .section p{color:#4a5568;line-height:1.8}
    .chips{display:flex;flex-wrap:wrap;gap:.5rem}
    .chip{background:#edf2f7;color:var(--c-primary);padding:.4rem .9rem;border-radius:20px;font-size:.8rem;font-weight:600}
    .hours-row{display:flex;justify-content:space-between;padding:.6rem 0;border-bottom:1px solid #f1f5f9;font-size:.9rem}
    .hours-row:last-child{border-bottom:none}
    .rec-section{margin-bottom:2rem}
    .rec-section h2{font-size:1.25rem;font-weight:700;color:var(--c-primary);margin-bottom:1rem;display:flex;align-items:center;gap:.5rem}
    .rec-section .rec-link{display:inline-block;color:var(--c-accent);font-weight:600;font-size:.85rem;margin-top:.5rem}
    .rec-section .rec-link:hover{text-decoration:underline}
    .related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem}
    .related-card{background:var(--c-card);border:1px solid var(--c-border);border-radius:var(--radius);overflow:hidden;transition:transform .2s,box-shadow .2s;display:block}
    .related-card:hover{transform:translateY(-3px);box-shadow:0 8px 25px rgba(0,0,0,.08)}
    .related-card img{width:100%;height:180px;object-fit:cover}
    .related-body{padding:1.25rem}
    .related-body h3{font-size:1rem;font-weight:700;color:var(--c-primary);margin-bottom:.25rem}
    .related-body .rm{color:var(--c-light);font-size:.8rem;margin-bottom:.5rem}
    .related-body .rp{color:var(--c-accent);font-weight:700;font-size:1rem}
    .footer{background:var(--c-primary);color:rgba(255,255,255,.7);padding:3rem 2rem;margin-top:3rem}
    .footer-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem}
    .footer h4{color:#fff;margin-bottom:.75rem;font-size:.95rem}
    .footer a{display:block;color:rgba(255,255,255,.6);font-size:.85rem;margin-bottom:.4rem}
    .footer a:hover{color:#fff}
    .footer-bottom{text-align:center;margin-top:2rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.15);font-size:.8rem}
    @media(max-width:768px){
      .hero-img{height:260px}
      .title-row{flex-direction:column}
      .price-block{text-align:left}
      .related-grid{grid-template-columns:1fr}
      .info-grid{grid-template-columns:1fr 1fr}
    }
  </style>
  <script type="application/ld+json">
  {
    "@context":"https://schema.org",
    "@type":"Hotel",
    "name":"{{hotel_name}}",
    "image":"{{photo_url}}",
    "address":{"@type":"PostalAddress","streetAddress":"{{address}}","addressLocality":"{{city}}","addressCountry":"{{country}}"},
    "starRating":{"@type":"Rating","ratingValue":"{{stars}}"},
    "aggregateRating":{"@type":"AggregateRating","ratingValue":"{{rating}}","reviewCount":"{{number_of_reviews}}"},
    "priceRange":"$` + `{{price_per_night}}"
  }
  </script>
</head>
<body>
  <nav class="nav">
    <a href="/" class="nav-brand">🏨 Hotels Directory</a>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/hotels/">All Hotels</a>
      <a href="/categories/">Categories</a>
      <a href="/contact/">Contact</a>
    </div>
  </nav>

  <div class="container">
    <div class="breadcrumb">
      <a href="/">Home</a> › <a href="/hotels/">Hotels</a> › <a href="/hotels/{{city}}">{{city}}</a> › <a href="/category/{{category}}">{{category}}</a> › {{hotel_name}}
    </div>

    <img class="hero-img" src="{{photo_url}}" alt="{{hotel_name}} — {{city}}, {{country}}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900'"/>

    <div class="title-row">
      <div>
        <h1>{{hotel_name}}</h1>
        <div class="title-meta">
          <span class="stars-display">★★★★★</span>
          <span class="rating-pill">{{rating}} / 5</span>
          <span class="review-count">{{number_of_reviews}} reviews</span>
          <span style="color:var(--c-light)">📍 {{district}}, {{city}}, {{country}}</span>
        </div>
      </div>
      <div class="price-block">
        <div class="price">$` + `{{price_per_night}}</div>
        <div class="price-sub">per night</div>
      </div>
    </div>

    <div class="quick-actions">
      <a class="qa-btn qa-primary" href="{{url}}">🔗 Book Now</a>
      <a class="qa-btn qa-secondary" href="tel:{{phone}}">📞 Call</a>
      <a class="qa-btn qa-secondary" href="mailto:{{email}}">✉️ Email</a>
    </div>

    <div class="info-grid">
      <div class="info-card"><div class="ic-label">Category</div><div class="ic-value">{{category}}</div></div>
      <div class="info-card"><div class="ic-label">Property Type</div><div class="ic-value">{{property_type}}</div></div>
      <div class="info-card"><div class="ic-label">Bedrooms</div><div class="ic-value">{{bedrooms}}</div></div>
      <div class="info-card"><div class="ic-label">Star Rating</div><div class="ic-value">{{stars}} Stars</div></div>
      <div class="info-card"><div class="ic-label">Check-in / Check-out</div><div class="ic-value">{{check_in}} / {{check_out}}</div></div>
      <div class="info-card"><div class="ic-label">Brand</div><div class="ic-value">{{brand_name}}</div></div>
      <div class="info-card"><div class="ic-label">Region</div><div class="ic-value">{{region}}</div></div>
      <div class="info-card"><div class="ic-label">District</div><div class="ic-value">{{district}}</div></div>
    </div>

    <div class="section">
      <div class="section-title">ℹ️ About This Property</div>
      <p>{{description}}</p>
    </div>

    <div class="section">
      <div class="section-title">🛎️ Services</div>
      <div class="chips">{{hotel_services}}</div>
    </div>

    <div class="section">
      <div class="section-title">🏊 Amenities</div>
      <div class="chips">{{amenities}}</div>
    </div>

    <div class="section">
      <div class="section-title">🕐 Hours</div>
      <div class="hours-row"><span>Check-in</span><span>From {{check_in}}</span></div>
      <div class="hours-row"><span>Check-out</span><span>Until {{check_out}}</span></div>
      <div class="hours-row"><span>Front Desk</span><span>24 hours</span></div>
    </div>

    <div class="section">
      <div class="section-title">📍 Location</div>
      <p>{{address}}, {{district}}, {{city}}, {{country}}</p>
      <div style="background:#e2e8f0;height:220px;border-radius:8px;margin-top:1rem;display:flex;align-items:center;justify-content:center;color:var(--c-light)">Map — {{latitude}}, {{longitude}}</div>
    </div>

    <!-- RECOMMENDATION SECTION 1: Same Category -->
    <div class="rec-section">
      <h2>🏷️ More {{category}} Hotels</h2>
      <p style="color:var(--c-light);font-size:.9rem;margin-bottom:1rem">Other {{category}} properties you might enjoy</p>
      <div class="related-grid" id="rec-category"></div>
      <a href="/category/{{category}}" class="rec-link">View all {{category}} hotels →</a>
    </div>

    <!-- RECOMMENDATION SECTION 2: Same City -->
    <div class="rec-section">
      <h2>📍 More Hotels in {{city}}</h2>
      <p style="color:var(--c-light);font-size:.9rem;margin-bottom:1rem">Explore other stays in {{city}}, {{country}}</p>
      <div class="related-grid" id="rec-city"></div>
      <a href="/hotels/{{city}}" class="rec-link">View all hotels in {{city}} →</a>
    </div>

    <!-- RECOMMENDATION SECTION 3: Same Brand -->
    <div class="rec-section">
      <h2>🏢 More from {{brand_name}}</h2>
      <p style="color:var(--c-light);font-size:.9rem;margin-bottom:1rem">Other properties by {{brand_name}}</p>
      <div class="related-grid" id="rec-brand"></div>
      <a href="/brand/{{brand_name}}" class="rec-link">View all {{brand_name}} properties →</a>
    </div>
  </div>

  <footer class="footer">
    <div class="footer-inner">
      <div>
        <h4>🏨 Hotels Directory</h4>
        <p style="font-size:.85rem">Find your perfect stay worldwide.</p>
      </div>
      <div>
        <h4>Explore</h4>
        <a href="/">Home</a>
        <a href="/hotels/">All Hotels</a>
        <a href="/categories/">Categories</a>
      </div>
      <div>
        <h4>Support</h4>
        <a href="/contact/">Contact Us</a>
        <a href="/privacy/">Privacy Policy</a>
        <a href="/about/">About Us</a>
      </div>
    </div>
    <div class="footer-bottom">© 2025 Hotels Directory. All rights reserved.</div>
  </footer>

  <script>
  /* Populate recommendation sections with placeholder cards */
  function makeCard(name,city,country,rating,price,slug,img){
    return '<a href="/hotel/'+slug+'" class="related-card"><img src="'+img+'" alt="'+name+'" loading="lazy" onerror="this.src=\\'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500\\'"/><div class="related-body"><h3>'+name+'</h3><div class="rm">📍 '+city+', '+country+' · ⭐ '+rating+'</div><div class="rp">$'+price+' / night</div></div></a>';
  }
  var cards=[
    makeCard('Azure Coast Resort','Cannes','France','4.6','520','azure-coast-resort','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500'),
    makeCard('Hacienda del Sol','Tulum','Mexico','4.8','310','hacienda-del-sol','https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500'),
    makeCard('Marina Bay Residences','Singapore','Singapore','4.4','450','marina-bay-residences','https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500'),
  ];
  ['rec-category','rec-city','rec-brand'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.innerHTML=cards.join('');
  });
  </script>
</body>
</html>`;

// ──────────────────────────────────────────────
// SRP — Search Results Page (Location-based)
// Shows all matching listings for a city with pagination (25 per page)
// AJAX search, sidebar filters, clickable cards
// ──────────────────────────────────────────────
export const SAMPLE_SRP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hotels in {{city}} — Hotels Directory</title>
  <meta name="description" content="Browse top-rated hotels in {{city}}, {{country}}. Compare prices, read reviews, and find your perfect stay.">
  <style>
    :root{--c-primary:#1a365d;--c-accent:#e67e22;--c-bg:#f7f8fc;--c-card:#fff;--c-text:#2d3748;--c-light:#718096;--c-border:#e2e8f0;--radius:12px}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;background:var(--c-bg);color:var(--c-text);line-height:1.6}
    a{text-decoration:none;color:inherit}
    .nav{background:var(--c-primary);padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
    .nav-brand{color:#fff;font-weight:800;font-size:1.15rem}
    .nav-links{display:flex;gap:1.5rem}
    .nav-links a{color:rgba(255,255,255,.8);font-size:.875rem;font-weight:500}
    .nav-links a:hover{color:#fff}
    .hero{background:linear-gradient(135deg,var(--c-primary),#2b5d9e);padding:3rem 2rem;text-align:center;color:#fff}
    .hero h1{font-size:2.25rem;font-weight:800;margin-bottom:.5rem}
    .hero p{opacity:.85;font-size:1.05rem;margin-bottom:1.5rem}
    .search-box{max-width:700px;margin:0 auto;display:flex;gap:.5rem}
    .search-box input{flex:1;padding:.85rem 1.25rem;border:none;border-radius:8px;font-size:1rem}
    .search-box input:focus{outline:3px solid var(--c-accent)}
    .search-box button{background:var(--c-accent);color:#fff;padding:.85rem 1.5rem;border:none;border-radius:8px;font-weight:700;cursor:pointer}
    .breadcrumb{padding:1rem 2rem;font-size:.8rem;color:var(--c-light);max-width:1200px;margin:0 auto}
    .breadcrumb a{color:var(--c-accent)}
    .breadcrumb a:hover{text-decoration:underline}
    .srp-layout{display:grid;grid-template-columns:260px 1fr;gap:2rem;max-width:1200px;margin:0 auto;padding:0 1.5rem 3rem}
    .sidebar{background:var(--c-card);border:1px solid var(--c-border);border-radius:var(--radius);padding:1.5rem;height:fit-content;position:sticky;top:80px}
    .filter-group{margin-bottom:1.5rem;padding-bottom:1.25rem;border-bottom:1px solid #f1f5f9}
    .filter-group:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
    .filter-group h3{font-size:.85rem;font-weight:700;color:var(--c-primary);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.3px}
    .filter-option{display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem;font-size:.875rem;cursor:pointer}
    .filter-option input{width:16px;height:16px;accent-color:var(--c-primary)}
    .results-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:.5rem}
    .results-count{font-size:.9rem;color:var(--c-light)}
    .sort-select{padding:.4rem .75rem;border:1px solid var(--c-border);border-radius:6px;font-size:.85rem;background:#fff}
    .listing{display:flex;background:var(--c-card);border:1px solid var(--c-border);border-radius:var(--radius);overflow:hidden;margin-bottom:1rem;transition:transform .2s,box-shadow .2s}
    .listing:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.07)}
    .listing-img{width:240px;flex-shrink:0;position:relative;background:#e2e8f0}
    .listing-img img{width:100%;height:100%;object-fit:cover}
    .listing-badge{position:absolute;top:10px;left:10px;background:var(--c-accent);color:#fff;font-size:.7rem;font-weight:700;padding:.3rem .6rem;border-radius:4px}
    .listing-body{padding:1.25rem;flex:1;display:flex;flex-direction:column}
    .listing-title{font-size:1.1rem;font-weight:700;color:var(--c-primary);margin-bottom:.15rem}
    .listing-loc{font-size:.8rem;color:var(--c-light);margin-bottom:.5rem}
    .listing-rating{display:flex;align-items:center;gap:.4rem;font-size:.85rem;margin-bottom:.5rem}
    .listing-rating .stars{color:#f6ad55}
    .listing-rating .count{color:var(--c-light);font-size:.75rem}
    .listing-desc{font-size:.85rem;color:#4a5568;margin-bottom:1rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .listing-tags{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem}
    .listing-tag{background:#edf2f7;color:var(--c-primary);padding:.2rem .6rem;border-radius:4px;font-size:.7rem;font-weight:600}
    .listing-footer{margin-top:auto;display:flex;justify-content:space-between;align-items:center}
    .listing-price{font-size:1.35rem;font-weight:800;color:var(--c-accent)}
    .listing-price span{font-size:.75rem;font-weight:400;color:var(--c-light)}
    .listing-cta{background:var(--c-primary);color:#fff;padding:.55rem 1.25rem;border-radius:8px;font-size:.85rem;font-weight:600}
    .listing-cta:hover{opacity:.9}
    .pagination{display:flex;justify-content:center;gap:.4rem;margin-top:2rem}
    .page-btn{width:38px;height:38px;display:flex;align-items:center;justify-content:center;border:1px solid var(--c-border);border-radius:6px;font-size:.85rem;font-weight:600;color:var(--c-primary);background:#fff;cursor:pointer}
    .page-btn.active{background:var(--c-primary);color:#fff;border-color:var(--c-primary)}
    .page-btn:hover:not(.active){background:#f1f5f9}
    .no-results{text-align:center;padding:3rem;color:var(--c-light)}
    .footer{background:var(--c-primary);color:rgba(255,255,255,.7);text-align:center;padding:2rem;font-size:.8rem;margin-top:2rem}
    @media(max-width:768px){
      .srp-layout{grid-template-columns:1fr}
      .sidebar{display:none}
      .listing{flex-direction:column}
      .listing-img{width:100%;height:200px}
      .search-box{flex-direction:column}
    }
  </style>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"CollectionPage","name":"Hotels in {{city}}","description":"Browse top-rated hotels in {{city}}, {{country}}"}
  </script>
</head>
<body>
  <nav class="nav">
    <a href="/" class="nav-brand">🏨 Hotels Directory</a>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/hotels/">All Hotels</a>
      <a href="/categories/">Categories</a>
    </div>
  </nav>

  <div class="hero">
    <h1>Hotels in {{city}}</h1>
    <p>Find and compare the best hotels in {{city}}, {{country}}</p>
    <div class="search-box">
      <input type="text" id="ajaxSearch" placeholder="Search hotels by name, amenity, or type..." autocomplete="off"/>
      <button onclick="document.getElementById('ajaxSearch').dispatchEvent(new Event('input'))">Search</button>
    </div>
  </div>

  <div class="breadcrumb">
    <a href="/">Home</a> › <a href="/hotels/">Hotels</a> › {{city}}, {{country}}
  </div>

  <div class="srp-layout">
    <aside class="sidebar">
      <div class="filter-group">
        <h3>Category</h3>
        <label class="filter-option"><input type="checkbox" data-filter="category" value="Luxury" checked/> Luxury</label>
        <label class="filter-option"><input type="checkbox" data-filter="category" value="Resort" checked/> Resort</label>
        <label class="filter-option"><input type="checkbox" data-filter="category" value="Boutique" checked/> Boutique</label>
        <label class="filter-option"><input type="checkbox" data-filter="category" value="Heritage" checked/> Heritage</label>
        <label class="filter-option"><input type="checkbox" data-filter="category" value="Eco Lodge" checked/> Eco Lodge</label>
        <label class="filter-option"><input type="checkbox" data-filter="category" value="Business" checked/> Business</label>
        <label class="filter-option"><input type="checkbox" data-filter="category" value="Budget" checked/> Budget</label>
        <label class="filter-option"><input type="checkbox" data-filter="category" value="Villa" checked/> Villa</label>
      </div>
      <div class="filter-group">
        <h3>Star Rating</h3>
        <label class="filter-option"><input type="checkbox" data-filter="stars" value="5" checked/> ★★★★★ (5)</label>
        <label class="filter-option"><input type="checkbox" data-filter="stars" value="4" checked/> ★★★★ (4)</label>
        <label class="filter-option"><input type="checkbox" data-filter="stars" value="3" checked/> ★★★ (3)</label>
      </div>
      <div class="filter-group">
        <h3>Property Type</h3>
        <label class="filter-option"><input type="checkbox" data-filter="property_type" value="Hotel" checked/> Hotel</label>
        <label class="filter-option"><input type="checkbox" data-filter="property_type" value="Resort" checked/> Resort</label>
        <label class="filter-option"><input type="checkbox" data-filter="property_type" value="Villa" checked/> Villa</label>
        <label class="filter-option"><input type="checkbox" data-filter="property_type" value="Apartment" checked/> Apartment</label>
      </div>
    </aside>

    <main>
      <div class="results-header">
        <span class="results-count" id="resultsCount">Loading...</span>
        <select class="sort-select" id="sortSelect">
          <option value="recommended">Sort: Recommended</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating: Highest</option>
        </select>
      </div>

      <div id="listingsContainer">
        <!-- Single template card that gets replicated by the page generator -->
        <a href="/hotel/{{slug}}" class="listing" data-category="{{category}}" data-stars="{{stars}}" data-price="{{price_per_night}}" data-rating="{{rating}}" data-property_type="{{property_type}}">
          <div class="listing-img">
            <img src="{{photo_url}}" alt="{{hotel_name}}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'"/>
            <span class="listing-badge">{{category}}</span>
          </div>
          <div class="listing-body">
            <div class="listing-title">{{hotel_name}}</div>
            <div class="listing-loc">📍 {{district}}, {{city}}, {{country}}</div>
            <div class="listing-rating">
              <span class="stars">★★★★★</span>
              <strong>{{rating}}</strong>
              <span class="count">({{number_of_reviews}} reviews)</span>
            </div>
            <div class="listing-desc">{{description}}</div>
            <div class="listing-tags">
              <span class="listing-tag">{{stars}}★</span>
              <span class="listing-tag">{{category}}</span>
              <span class="listing-tag">{{property_type}}</span>
              <span class="listing-tag">{{bedrooms}}</span>
            </div>
            <div class="listing-footer">
              <div class="listing-price">$` + `{{price_per_night}} <span>/ night</span></div>
              <span class="listing-cta">View Details →</span>
            </div>
          </div>
        </a>
      </div>

      <div class="pagination" id="pagination"></div>
    </main>
  </div>

  <footer class="footer">© 2025 Hotels Directory. All rights reserved.</footer>

  <script>
  document.addEventListener('DOMContentLoaded',function(){
    var PER_PAGE=25;
    var currentPage=1;
    var allListings=Array.from(document.querySelectorAll('.listing'));
    var searchInput=document.getElementById('ajaxSearch');
    var container=document.getElementById('listingsContainer');
    var paginationEl=document.getElementById('pagination');
    var countEl=document.getElementById('resultsCount');
    
    function getVisible(){
      var q=(searchInput?searchInput.value:'').toLowerCase();
      return allListings.filter(function(el){
        if(q && el.textContent.toLowerCase().indexOf(q)===-1) return false;
        return true;
      });
    }
    
    function render(){
      var visible=getVisible();
      var total=visible.length;
      var pages=Math.ceil(total/PER_PAGE);
      if(currentPage>pages) currentPage=1;
      var start=(currentPage-1)*PER_PAGE;
      var end=start+PER_PAGE;
      
      allListings.forEach(function(el){el.style.display='none';});
      visible.slice(start,end).forEach(function(el){el.style.display='flex';});
      
      countEl.innerHTML='Showing <strong>'+(total>0?start+1:0)+'–'+Math.min(end,total)+'</strong> of <strong>'+total+'</strong> hotels';
      
      // Pagination
      paginationEl.innerHTML='';
      if(pages<=1) return;
      if(currentPage>1){var pb=document.createElement('button');pb.className='page-btn';pb.textContent='‹';pb.onclick=function(){currentPage--;render();};paginationEl.appendChild(pb);}
      for(var i=1;i<=Math.min(pages,7);i++){
        var btn=document.createElement('button');
        btn.className='page-btn'+(i===currentPage?' active':'');
        btn.textContent=i;
        btn.onclick=(function(p){return function(){currentPage=p;render();};})(i);
        paginationEl.appendChild(btn);
      }
      if(pages>7){var dots=document.createElement('span');dots.textContent='...';dots.style.padding='0 .5rem';paginationEl.appendChild(dots);}
      if(currentPage<pages){var nb=document.createElement('button');nb.className='page-btn';nb.textContent='›';nb.onclick=function(){currentPage++;render();};paginationEl.appendChild(nb);}
    }
    
    if(searchInput) searchInput.addEventListener('input',function(){currentPage=1;render();});
    render();
  });
  </script>
</body>
</html>`;

// ──────────────────────────────────────────────
// Category SRP — Category Directory Page
// ──────────────────────────────────────────────
export const SAMPLE_CATEGORY_SRP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{category}} Hotels — Hotels Directory</title>
  <meta name="description" content="Browse all {{category}} hotels worldwide. Compare prices, ratings, and amenities.">
  <style>
    :root{--c-primary:#1a365d;--c-accent:#e67e22;--c-bg:#f7f8fc;--c-card:#fff;--c-text:#2d3748;--c-light:#718096;--c-border:#e2e8f0;--radius:12px}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;background:var(--c-bg);color:var(--c-text);line-height:1.6}
    a{text-decoration:none;color:inherit}
    .nav{background:var(--c-primary);padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
    .nav-brand{color:#fff;font-weight:800;font-size:1.15rem}
    .nav-links{display:flex;gap:1.5rem}
    .nav-links a{color:rgba(255,255,255,.8);font-size:.875rem;font-weight:500}
    .hero{background:linear-gradient(135deg,#1a365d,#2d4a7a);color:#fff;padding:4rem 2rem;text-align:center}
    .hero h1{font-size:2.5rem;font-weight:800;margin-bottom:.5rem}
    .hero p{opacity:.85;font-size:1.1rem;max-width:600px;margin:0 auto}
    .breadcrumb{padding:1rem 2rem;font-size:.8rem;color:var(--c-light);max-width:1200px;margin:0 auto}
    .breadcrumb a{color:var(--c-accent)}
    .container{max-width:1200px;margin:0 auto;padding:0 1.5rem 3rem}
    .search-bar{max-width:600px;margin:0 auto 2rem;display:flex;gap:.5rem}
    .search-bar input{flex:1;padding:.75rem 1rem;border:1px solid var(--c-border);border-radius:8px;font-size:.95rem}
    .search-bar button{background:var(--c-accent);color:#fff;padding:.75rem 1.5rem;border:none;border-radius:8px;font-weight:700;cursor:pointer}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}
    .card{background:var(--c-card);border:1px solid var(--c-border);border-radius:var(--radius);overflow:hidden;transition:transform .2s,box-shadow .2s;display:block}
    .card:hover{transform:translateY(-3px);box-shadow:0 8px 25px rgba(0,0,0,.08)}
    .card img{width:100%;height:200px;object-fit:cover}
    .card-body{padding:1.25rem}
    .card h3{font-size:1rem;font-weight:700;color:var(--c-primary);margin-bottom:.25rem}
    .card .meta{color:var(--c-light);font-size:.8rem;margin-bottom:.5rem}
    .card .meta .stars{color:#f6ad55}
    .card .price{color:var(--c-accent);font-weight:700;font-size:1.1rem;margin-bottom:.5rem}
    .card .btn{display:inline-block;background:var(--c-primary);color:#fff;padding:.45rem 1rem;border-radius:6px;font-size:.8rem;font-weight:600}
    .pagination{display:flex;justify-content:center;gap:.4rem;margin-top:2.5rem}
    .page-btn{width:38px;height:38px;display:flex;align-items:center;justify-content:center;border:1px solid var(--c-border);border-radius:6px;font-size:.85rem;font-weight:600;color:var(--c-primary);background:#fff;cursor:pointer}
    .page-btn.active{background:var(--c-primary);color:#fff;border-color:var(--c-primary)}
    .footer{background:var(--c-primary);color:rgba(255,255,255,.7);text-align:center;padding:2rem;font-size:.8rem;margin-top:2rem}
    @media(max-width:768px){.grid{grid-template-columns:1fr}.search-bar{flex-direction:column}}
  </style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="nav-brand">🏨 Hotels Directory</a>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/hotels/">All Hotels</a>
      <a href="/categories/">Categories</a>
    </div>
  </nav>

  <div class="hero">
    <h1>{{category}} Hotels</h1>
    <p>Discover the best {{category}} hotels around the world.</p>
  </div>

  <div class="breadcrumb">
    <a href="/">Home</a> › <a href="/categories/">Categories</a> › {{category}}
  </div>

  <div class="container">
    <div class="search-bar">
      <input type="text" id="catSearch" placeholder="Search {{category}} hotels..." autocomplete="off"/>
      <button onclick="document.getElementById('catSearch').dispatchEvent(new Event('input'))">Search</button>
    </div>

    <div class="grid" id="cardsGrid">
      <a href="/hotel/{{slug}}" class="card">
        <img src="{{photo_url}}" alt="{{hotel_name}}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'"/>
        <div class="card-body">
          <h3>{{hotel_name}}</h3>
          <div class="meta">📍 {{city}}, {{country}} · <span class="stars">⭐ {{rating}}</span> ({{number_of_reviews}})</div>
          <div class="price">$` + `{{price_per_night}} / night</div>
          <span class="btn">View Details →</span>
        </div>
      </a>
    </div>

    <div class="pagination" id="pagination"></div>
  </div>

  <footer class="footer">© 2025 Hotels Directory. All rights reserved.</footer>

  <script>
  document.addEventListener('DOMContentLoaded',function(){
    var PER_PAGE=25;var currentPage=1;
    var allCards=Array.from(document.querySelectorAll('.card'));
    var searchInput=document.getElementById('catSearch');
    var paginationEl=document.getElementById('pagination');
    function getVisible(){
      var q=(searchInput?searchInput.value:'').toLowerCase();
      return allCards.filter(function(el){return !q||el.textContent.toLowerCase().indexOf(q)!==-1;});
    }
    function render(){
      var visible=getVisible();var total=visible.length;var pages=Math.ceil(total/PER_PAGE);
      if(currentPage>pages)currentPage=1;var start=(currentPage-1)*PER_PAGE;var end=start+PER_PAGE;
      allCards.forEach(function(el){el.style.display='none';});
      visible.slice(start,end).forEach(function(el){el.style.display='block';});
      paginationEl.innerHTML='';
      if(pages<=1)return;
      for(var i=1;i<=Math.min(pages,7);i++){
        var btn=document.createElement('button');btn.className='page-btn'+(i===currentPage?' active':'');btn.textContent=i;
        btn.onclick=(function(p){return function(){currentPage=p;render();};})(i);paginationEl.appendChild(btn);
      }
    }
    if(searchInput)searchInput.addEventListener('input',function(){currentPage=1;render();});
    render();
  });
  </script>
</body>
</html>`;

// ──────────────────────────────────────────────
// HOMEPAGE — Custom Page Template
// ──────────────────────────────────────────────
export const SAMPLE_HOMEPAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hotels Directory — Find Your Perfect Stay Worldwide</title>
  <meta name="description" content="Discover verified hotels worldwide. Compare prices, read real reviews, and book your ideal stay.">
  <style>
    :root{--c-primary:#1a365d;--c-accent:#e67e22;--c-bg:#f7f8fc;--c-card:#fff;--c-text:#2d3748;--c-light:#718096;--c-border:#e2e8f0;--radius:12px}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;background:var(--c-bg);color:var(--c-text);line-height:1.6}
    a{text-decoration:none;color:inherit}
    .nav{background:var(--c-primary);padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
    .nav-brand{color:#fff;font-weight:800;font-size:1.15rem}
    .nav-links{display:flex;gap:1.5rem}
    .nav-links a{color:rgba(255,255,255,.8);font-size:.875rem;font-weight:500}
    .nav-links a:hover{color:#fff}
    .hero{background:linear-gradient(135deg,#1a365d 0%,#2b5d9e 50%,#1a365d 100%);padding:5rem 2rem;text-align:center;color:#fff;position:relative;overflow:hidden}
    .hero h1{font-size:3rem;font-weight:800;margin-bottom:.75rem;position:relative}
    .hero p{font-size:1.2rem;opacity:.9;max-width:650px;margin:0 auto 2rem;position:relative}
    .hero-search{max-width:700px;margin:0 auto;display:flex;gap:.5rem;position:relative}
    .hero-search input{flex:1;padding:1rem 1.5rem;border:none;border-radius:10px;font-size:1.05rem;box-shadow:0 4px 20px rgba(0,0,0,.15)}
    .hero-search button{background:var(--c-accent);color:#fff;padding:1rem 2rem;border:none;border-radius:10px;font-weight:700;font-size:1rem;cursor:pointer}
    .hero-stats{display:flex;justify-content:center;gap:3rem;margin-top:2rem;position:relative}
    .hero-stat{text-align:center}
    .hero-stat .num{font-size:1.75rem;font-weight:800}
    .hero-stat .label{font-size:.8rem;opacity:.75}
    .trust-bar{background:var(--c-card);border-bottom:1px solid var(--c-border);padding:1rem 2rem}
    .trust-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:center;gap:2.5rem;flex-wrap:wrap;font-size:.85rem;color:var(--c-light);font-weight:500}
    .container{max-width:1200px;margin:0 auto;padding:3rem 1.5rem}
    .section-header{text-align:center;margin-bottom:2.5rem}
    .section-header h2{font-size:2rem;font-weight:800;color:var(--c-primary);margin-bottom:.5rem}
    .section-header p{color:var(--c-light);font-size:1.05rem;max-width:550px;margin:0 auto}
    .featured-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;margin-bottom:3rem}
    .f-card{background:var(--c-card);border:1px solid var(--c-border);border-radius:var(--radius);overflow:hidden;transition:transform .2s,box-shadow .2s;display:block}
    .f-card:hover{transform:translateY(-4px);box-shadow:0 12px 30px rgba(0,0,0,.1)}
    .f-card img{width:100%;height:200px;object-fit:cover}
    .f-card-body{padding:1.25rem}
    .f-card h3{font-size:1.05rem;font-weight:700;color:var(--c-primary);margin-bottom:.25rem}
    .f-card .fc-meta{color:var(--c-light);font-size:.8rem;margin-bottom:.5rem}
    .f-card .fc-meta .stars{color:#f6ad55}
    .f-card .fc-price{font-size:1.15rem;font-weight:800;color:var(--c-accent)}
    .f-card .fc-price span{font-size:.75rem;font-weight:400;color:var(--c-light)}
    .cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1.25rem;margin-bottom:3rem}
    .cat-card{background:var(--c-card);border:1px solid var(--c-border);border-radius:var(--radius);padding:1.75rem;text-align:center;transition:transform .2s;display:block}
    .cat-card:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.08)}
    .cat-card .cat-icon{font-size:2.5rem;margin-bottom:.75rem}
    .cat-card h3{font-size:1rem;font-weight:700;color:var(--c-primary);margin-bottom:.25rem}
    .cat-card p{font-size:.8rem;color:var(--c-light)}
    .region-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;margin-bottom:3rem}
    .region-card{background:linear-gradient(135deg,var(--c-primary),#2d4a7a);border-radius:var(--radius);padding:2rem;color:#fff;transition:transform .2s;display:block}
    .region-card:hover{transform:translateY(-3px)}
    .region-card h3{font-size:1.15rem;font-weight:700;margin-bottom:.35rem}
    .region-card p{opacity:.7;font-size:.85rem;margin-bottom:.5rem}
    .region-card .rlink{color:var(--c-accent);font-weight:600;font-size:.85rem}
    .faq-list{max-width:700px;margin:0 auto 3rem}
    .faq-item{border-bottom:1px solid var(--c-border);padding:1.25rem 0}
    .faq-q{font-weight:700;font-size:1rem;color:var(--c-primary);cursor:pointer;display:flex;justify-content:space-between;align-items:center}
    .faq-a{font-size:.9rem;color:#4a5568;line-height:1.7;margin-top:.75rem;display:none}
    .faq-item.open .faq-a{display:block}
    .cta-section{background:linear-gradient(135deg,var(--c-accent),#d35400);border-radius:var(--radius);padding:3.5rem 2rem;text-align:center;color:#fff;margin-bottom:3rem}
    .cta-section h2{font-size:2rem;font-weight:800;margin-bottom:.75rem}
    .cta-section p{opacity:.9;font-size:1.05rem;margin-bottom:1.5rem;max-width:500px;margin-left:auto;margin-right:auto}
    .cta-btn{display:inline-block;background:#fff;color:var(--c-accent);padding:.85rem 2.5rem;border-radius:10px;font-weight:800;font-size:1rem}
    .footer{background:var(--c-primary);color:rgba(255,255,255,.7);padding:3rem 2rem}
    .footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem}
    .footer h4{color:#fff;margin-bottom:.75rem;font-size:.95rem}
    .footer a{display:block;color:rgba(255,255,255,.6);font-size:.85rem;margin-bottom:.4rem}
    .footer a:hover{color:#fff}
    .footer-bottom{text-align:center;margin-top:2rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.15);font-size:.8rem}
    @media(max-width:768px){.hero h1{font-size:2rem}.hero-search{flex-direction:column}.hero-stats{gap:1.5rem}.region-grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="nav-brand">🏨 Hotels Directory</a>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/hotels/">All Hotels</a>
      <a href="/categories/">Categories</a>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
    </div>
  </nav>

  <section class="hero">
    <h1>Find Your Perfect Stay, Anywhere.</h1>
    <p>Search verified hotels across 25+ cities worldwide. Real reviews, real prices.</p>
    <div class="hero-search">
      <input type="text" placeholder="Where do you want to stay? Try 'Tokyo', 'Luxury', or 'Beach Resort'..."/>
      <button>Search Hotels</button>
    </div>
    <div class="hero-stats">
      <div class="hero-stat"><div class="num">100+</div><div class="label">Verified Hotels</div></div>
      <div class="hero-stat"><div class="num">25</div><div class="label">Cities</div></div>
      <div class="hero-stat"><div class="num">10K+</div><div class="label">Guest Reviews</div></div>
    </div>
  </section>

  <div class="trust-bar"><div class="trust-inner">
    <span>✓ Verified Listings</span><span>✓ Real Reviews</span><span>✓ Best Price</span><span>✓ 24/7 Support</span>
  </div></div>

  <div class="container">
    <div class="section-header"><h2>Featured Hotels</h2><p>Hand-picked stays loved by travelers</p></div>
    <div class="featured-grid">
      <a href="/hotel/grand-collection-grand-sakura" class="f-card"><img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600" alt="Grand Sakura" loading="lazy"/><div class="f-card-body"><h3>Grand Collection Grand Sakura</h3><div class="fc-meta">📍 Tokyo · <span class="stars">⭐ 4.8</span></div><div class="fc-price">$389 <span>/ night</span></div></div></a>
      <a href="/hotel/podomoro-hotels-azure-coast" class="f-card"><img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600" alt="Azure Coast" loading="lazy"/><div class="f-card-body"><h3>Podomoro Hotels Azure Coast</h3><div class="fc-meta">📍 Cannes · <span class="stars">⭐ 4.6</span></div><div class="fc-price">$520 <span>/ night</span></div></div></a>
      <a href="/hotel/stellar-stays-brooklyn-bridge-boutique" class="f-card"><img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600" alt="Brooklyn Bridge" loading="lazy"/><div class="f-card-body"><h3>Stellar Stays Brooklyn Bridge</h3><div class="fc-meta">📍 New York · <span class="stars">⭐ 4.5</span></div><div class="fc-price">$275 <span>/ night</span></div></div></a>
      <a href="/hotel/azure-living-riad-al-noor" class="f-card"><img src="https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600" alt="Riad Al-Noor" loading="lazy"/><div class="f-card-body"><h3>Azure Living Riad Al-Noor</h3><div class="fc-meta">📍 Marrakech · <span class="stars">⭐ 4.9</span></div><div class="fc-price">$180 <span>/ night</span></div></div></a>
    </div>

    <div class="section-header"><h2>Browse by Category</h2><p>Find the type of stay that's right for you</p></div>
    <div class="cat-grid">
      <a href="/category/luxury" class="cat-card"><div class="cat-icon">👑</div><h3>Luxury</h3><p>Premium 5-star</p></a>
      <a href="/category/resort" class="cat-card"><div class="cat-icon">🏖️</div><h3>Resort</h3><p>Beach & leisure</p></a>
      <a href="/category/boutique" class="cat-card"><div class="cat-icon">🎨</div><h3>Boutique</h3><p>Unique & design-forward</p></a>
      <a href="/category/heritage" class="cat-card"><div class="cat-icon">🏛️</div><h3>Heritage</h3><p>Historic & cultural</p></a>
      <a href="/category/eco-lodge" class="cat-card"><div class="cat-icon">🌿</div><h3>Eco Lodge</h3><p>Sustainable stays</p></a>
      <a href="/category/business" class="cat-card"><div class="cat-icon">💼</div><h3>Business</h3><p>Corporate travel</p></a>
      <a href="/category/villa" class="cat-card"><div class="cat-icon">🏡</div><h3>Villa</h3><p>Private retreats</p></a>
      <a href="/category/budget" class="cat-card"><div class="cat-icon">💰</div><h3>Budget</h3><p>Affordable stays</p></a>
    </div>

    <div class="section-header"><h2>Explore by Region</h2></div>
    <div class="region-grid">
      <a href="/region/asia-pacific" class="region-card"><h3>Asia Pacific</h3><p>Tokyo, Singapore, Bali, Sydney...</p><span class="rlink">Browse Hotels →</span></a>
      <a href="/region/europe" class="region-card"><h3>Europe</h3><p>Paris, London, Cannes, Barcelona...</p><span class="rlink">Browse Hotels →</span></a>
      <a href="/region/americas" class="region-card"><h3>Americas</h3><p>New York, Miami, Tulum...</p><span class="rlink">Browse Hotels →</span></a>
    </div>

    <div class="section-header"><h2>FAQ</h2></div>
    <div class="faq-list">
      <div class="faq-item"><div class="faq-q" onclick="this.parentElement.classList.toggle('open')">Is this directory free?<span>▼</span></div><div class="faq-a">Yes! 100% free for travelers.</div></div>
      <div class="faq-item"><div class="faq-q" onclick="this.parentElement.classList.toggle('open')">How are hotels verified?<span>▼</span></div><div class="faq-a">Our team manually verifies each listing's information and cross-references reviews.</div></div>
      <div class="faq-item"><div class="faq-q" onclick="this.parentElement.classList.toggle('open')">Can I list my hotel?<span>▼</span></div><div class="faq-a">Yes! Contact us to submit your property.</div></div>
    </div>

    <div class="cta-section">
      <h2>Ready to Find Your Stay?</h2>
      <p>Browse our curated collection of hotels worldwide.</p>
      <a href="/hotels/" class="cta-btn">Browse All Hotels →</a>
    </div>
  </div>

  <footer class="footer">
    <div class="footer-inner">
      <div><h4>🏨 Hotels Directory</h4><p style="font-size:.85rem">Your trusted source for verified hotel listings.</p></div>
      <div><h4>Explore</h4><a href="/">Home</a><a href="/hotels/">All Hotels</a><a href="/categories/">Categories</a></div>
      <div><h4>Support</h4><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/about/">About</a></div>
    </div>
    <div class="footer-bottom">© 2025 Hotels Directory. All rights reserved.</div>
  </footer>
</body>
</html>`;

// ──────────────────────────────────────────────
// DEFAULT PAGES — Contact, Privacy, About
// ──────────────────────────────────────────────
export const SAMPLE_CONTACT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us — Hotels Directory</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f7f8fc;color:#2d3748;line-height:1.6}
    a{text-decoration:none;color:inherit}
    .nav{background:#1a365d;padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between}
    .nav-brand{color:#fff;font-weight:800;font-size:1.15rem}
    .nav-links{display:flex;gap:1.5rem}
    .nav-links a{color:rgba(255,255,255,.8);font-size:.875rem}
    .container{max-width:700px;margin:0 auto;padding:3rem 1.5rem}
    h1{font-size:2rem;font-weight:800;color:#1a365d;margin-bottom:1rem}
    .form-group{margin-bottom:1.25rem}
    .form-group label{display:block;font-weight:600;margin-bottom:.35rem;font-size:.9rem}
    .form-group input,.form-group textarea{width:100%;padding:.75rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.95rem;font-family:inherit}
    .form-group textarea{height:150px;resize:vertical}
    .btn{background:#e67e22;color:#fff;padding:.75rem 2rem;border:none;border-radius:8px;font-weight:700;font-size:1rem;cursor:pointer}
    .footer{background:#1a365d;color:rgba(255,255,255,.7);text-align:center;padding:2rem;font-size:.8rem;margin-top:3rem}
  </style>
</head>
<body>
  <nav class="nav"><a href="/" class="nav-brand">🏨 Hotels Directory</a><div class="nav-links"><a href="/">Home</a><a href="/hotels/">Hotels</a><a href="/about/">About</a></div></nav>
  <div class="container">
    <h1>Contact Us</h1>
    <p style="color:#718096;margin-bottom:2rem">Have a question or need help? Fill out the form below and we'll get back to you within 24 hours.</p>
    <div class="form-group"><label>Name</label><input type="text" placeholder="Your name"/></div>
    <div class="form-group"><label>Email</label><input type="email" placeholder="you@email.com"/></div>
    <div class="form-group"><label>Subject</label><input type="text" placeholder="How can we help?"/></div>
    <div class="form-group"><label>Message</label><textarea placeholder="Your message..."></textarea></div>
    <button class="btn">Send Message</button>
  </div>
  <footer class="footer">© 2025 Hotels Directory. All rights reserved.</footer>
</body>
</html>`;

export const SAMPLE_PRIVACY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy — Hotels Directory</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f7f8fc;color:#2d3748;line-height:1.8}
    a{text-decoration:none;color:inherit}
    .nav{background:#1a365d;padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between}
    .nav-brand{color:#fff;font-weight:800;font-size:1.15rem}
    .nav-links{display:flex;gap:1.5rem}
    .nav-links a{color:rgba(255,255,255,.8);font-size:.875rem}
    .container{max-width:700px;margin:0 auto;padding:3rem 1.5rem}
    h1{font-size:2rem;font-weight:800;color:#1a365d;margin-bottom:.5rem}
    .updated{color:#718096;font-size:.85rem;margin-bottom:2rem}
    h2{font-size:1.25rem;font-weight:700;color:#1a365d;margin:2rem 0 .75rem}
    p{color:#4a5568;margin-bottom:1rem}
    .footer{background:#1a365d;color:rgba(255,255,255,.7);text-align:center;padding:2rem;font-size:.8rem;margin-top:3rem}
  </style>
</head>
<body>
  <nav class="nav"><a href="/" class="nav-brand">🏨 Hotels Directory</a><div class="nav-links"><a href="/">Home</a><a href="/contact/">Contact</a></div></nav>
  <div class="container">
    <h1>Privacy Policy</h1>
    <p class="updated">Last updated: January 2025</p>
    <h2>1. Information We Collect</h2>
    <p>We collect information you provide directly, such as when you create an account, submit a review, or contact us. This may include your name, email address, and usage data.</p>
    <h2>2. How We Use Information</h2>
    <p>We use collected information to provide, maintain, and improve our services, to communicate with you, and to personalize your experience on our platform.</p>
    <h2>3. Data Sharing</h2>
    <p>We do not sell your personal information. We may share data with service providers who assist in operating our platform, subject to confidentiality agreements.</p>
    <h2>4. Cookies</h2>
    <p>We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and understand user behavior. You can manage cookie preferences through your browser settings.</p>
    <h2>5. Your Rights</h2>
    <p>You have the right to access, correct, or delete your personal data. Contact us at privacy@hotelsdirectory.example.com for any data requests.</p>
    <h2>6. Contact</h2>
    <p>For privacy-related inquiries, please contact us at <a href="/contact/" style="color:#e67e22">our contact page</a>.</p>
  </div>
  <footer class="footer">© 2025 Hotels Directory. All rights reserved.</footer>
</body>
</html>`;

export const SAMPLE_ABOUT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Us — Hotels Directory</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f7f8fc;color:#2d3748;line-height:1.8}
    a{text-decoration:none;color:inherit}
    .nav{background:#1a365d;padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between}
    .nav-brand{color:#fff;font-weight:800;font-size:1.15rem}
    .nav-links{display:flex;gap:1.5rem}
    .nav-links a{color:rgba(255,255,255,.8);font-size:.875rem}
    .hero{background:linear-gradient(135deg,#1a365d,#2b5d9e);color:#fff;padding:4rem 2rem;text-align:center}
    .hero h1{font-size:2.5rem;font-weight:800;margin-bottom:.5rem}
    .hero p{opacity:.85;font-size:1.1rem;max-width:600px;margin:0 auto}
    .container{max-width:800px;margin:0 auto;padding:3rem 1.5rem}
    h2{font-size:1.5rem;font-weight:700;color:#1a365d;margin-bottom:1rem}
    p{color:#4a5568;margin-bottom:1.25rem}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin:2rem 0}
    .stat{text-align:center;padding:1.5rem;background:#fff;border:1px solid #e2e8f0;border-radius:12px}
    .stat .num{font-size:2rem;font-weight:800;color:#e67e22}
    .stat .label{font-size:.85rem;color:#718096}
    .footer{background:#1a365d;color:rgba(255,255,255,.7);text-align:center;padding:2rem;font-size:.8rem;margin-top:3rem}
  </style>
</head>
<body>
  <nav class="nav"><a href="/" class="nav-brand">🏨 Hotels Directory</a><div class="nav-links"><a href="/">Home</a><a href="/hotels/">Hotels</a><a href="/contact/">Contact</a></div></nav>
  <div class="hero">
    <h1>About Hotels Directory</h1>
    <p>Helping travelers find the perfect stay since 2020</p>
  </div>
  <div class="container">
    <h2>Our Mission</h2>
    <p>Hotels Directory was founded with a simple goal: make hotel discovery transparent, reliable, and effortless. We believe every traveler deserves access to verified information about where they stay.</p>
    <h2>What Sets Us Apart</h2>
    <p>Unlike aggregator sites that scrape data, we manually verify every listing. Our team checks ratings, amenities, hours of operation, and contact details to ensure accuracy. When you find a hotel on our platform, you can trust the information.</p>
    <div class="stats">
      <div class="stat"><div class="num">100+</div><div class="label">Verified Hotels</div></div>
      <div class="stat"><div class="num">25+</div><div class="label">Cities</div></div>
      <div class="stat"><div class="num">10K+</div><div class="label">Happy Travelers</div></div>
    </div>
    <h2>Our Team</h2>
    <p>We're a small team of travel enthusiasts, data analysts, and web developers passionate about creating the best hotel directory on the web. Based across multiple time zones, we're always working to improve your experience.</p>
    <h2>Get In Touch</h2>
    <p>Have questions, suggestions, or want to list your property? Visit our <a href="/contact/" style="color:#e67e22;font-weight:600">contact page</a> — we'd love to hear from you.</p>
  </div>
  <footer class="footer">© 2025 Hotels Directory. All rights reserved.</footer>
</body>
</html>`;

// Template metadata exports
export const SAMPLE_LDP_TEMPLATE = {
  name: "Hotel Detail Page (LDP)",
  type: "listing_detail" as const,
  schemaType: "Hotel",
  urlPattern: "/hotel/{{slug}}",
};

export const SAMPLE_SRP_TEMPLATE = {
  name: "Hotels by City (SRP)",
  type: "search_results" as const,
  schemaType: "CollectionPage",
  urlPattern: "/hotels/{{slug}}",
};

export const SAMPLE_CATEGORY_SRP_TEMPLATE = {
  name: "Category Directory (SRP)",
  type: "category_page" as const,
  schemaType: "CollectionPage",
  urlPattern: "/category/{{slug}}",
};

// Essential pages that every project should have (for orphan detection)
export const ESSENTIAL_PAGES = [
  { slug: "index", title: "Homepage", urlPath: "/", isHomepage: true },
  { slug: "contact", title: "Contact Us", urlPath: "/contact/" },
  { slug: "privacy", title: "Privacy Policy", urlPath: "/privacy/" },
  { slug: "about", title: "About Us", urlPath: "/about/" },
  { slug: "listings", title: "All Listings (SRP)", urlPath: "/listings/" },
  { slug: "locations", title: "Locations Hub", urlPath: "/locations/" },
  { slug: "categories", title: "Categories Hub", urlPath: "/categories/" },
];

export const DEFAULT_PAGE_HTML: Record<string, string> = {
  index: SAMPLE_HOMEPAGE_HTML,
  contact: SAMPLE_CONTACT_HTML,
  privacy: SAMPLE_PRIVACY_HTML,
  about: SAMPLE_ABOUT_HTML,
};
