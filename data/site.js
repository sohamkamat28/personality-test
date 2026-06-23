export const site = {
  name: "Bean Theory Coffee",
  fullName: "Bean Theory Coffee — Specialty Coffee & Artisanal Bakes",
  tagline: "Brewed with intention. Served with soul.",
  phone: "+91 82918 16147",
  phoneHref: "+918291816147",
  instagram: "@beantheory_coffee",
  instagramUrl: "https://www.instagram.com/beantheory_coffee/",
  swiggyUrl: "https://www.swiggy.com/search?query=Bean%20Theory%20Coffee%20Thane",
  addressLine1: "Shop 12, Block 3, Emerald Plaza",
  addressLine2: "Hiranandani Meadows, Vasant Vihar",
  addressLine3: "Thane West — 400610, Maharashtra",
  address:
    "Shop 12, Block 3, Emerald Plaza, Hiranandani Meadows, Vasant Vihar, Thane West — 400610, Maharashtra",
  maps:
    "https://www.google.com/maps/search/?api=1&query=Bean%20Theory%20Coffee%20Shop%2012%20Block%203%20Emerald%20Plaza%20Hiranandani%20Meadows%20Thane%20West%20400610",
  mapEmbed:
    "https://www.google.com/maps?q=Bean%20Theory%20Coffee%2C%20Shop%2012%2C%20Block%203%2C%20Emerald%20Plaza%2C%20Hiranandani%20Meadows%2C%20Thane%20West%20400610&output=embed",
  hours: [["Monday - Sunday", "11:00 AM - 10:00 PM"]],
  lastOrders: "Last orders: 9:30 PM",
  rating: "4.4 / 5",
  rank: "#9 of 437 coffeehouses in Thane"
};

export const photos = {
  hero: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2200&q=85",
  flatlay: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=85",
  interior: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=85",
  bar: "https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=1200&q=85",
  pastry: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=1200&q=85",
  pour: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=85"
};

export const gallery = [
  ["Coffee", "V60 mornings, measured slowly and served clean.", "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=85"],
  ["Food & Bakes", "Croissant sandwiches that earned their place on the counter.", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85"],
  ["Interiors", "Warm corners for laptops, books, and long no-rush afternoons.", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=85"],
  ["Coffee", "Vietnamese cold coffee, slow-dripped and condensed-milk sweet.", "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1000&q=85"],
  ["Food & Bakes", "Cookies baked fresh enough to make the table go quiet.", "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1000&q=85"],
  ["People", "Regulars who came for coffee and stayed for the room.", "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1000&q=85"],
  ["Interiors", "The Emerald Plaza hideaway with a little evening glow.", "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1000&q=85"],
  ["Coffee", "Espresso, milk, and a bar that knows what it is doing.", "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1000&q=85"],
  ["Food & Bakes", "Brownies, choux, and the dessert-first argument.", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=85"],
  ["People", "The kind of table where a quick coffee becomes two hours.", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85"],
  ["Interiors", "Power points, playlists, and a staff that lets you settle in.", "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=85"],
  ["Coffee", "A cup with intention, not just caffeine.", "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=85"]
].map(([category, caption, src], index) => ({ id: index + 1, category, caption, src }));
