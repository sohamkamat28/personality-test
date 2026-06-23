export const menuCategories = [
  { id: "all", label: "All" },
  { id: "coffee", label: "Coffee" },
  { id: "drinks", label: "Drinks" },
  { id: "food", label: "Food" },
  { id: "desserts", label: "Desserts & Bakes" }
];

const rows = [
  ["coffee", "Espresso", "Single origin shot. Ask your server about today's bean.", "₹100", "Espresso Based"],
  ["coffee", "Americano", "Espresso + hot water. Clear, clean, honest.", "₹130", "Espresso Based"],
  ["coffee", "Cappuccino", "Equal parts espresso, steamed milk, foam.", "₹150", "Espresso Based"],
  ["coffee", "Flat White", "Double ristretto, microfoam. The coffee purist's latte.", "₹160", "Espresso Based"],
  ["coffee", "Latte", "Espresso + steamed milk. Creamy, mild, easy.", "₹160", "Espresso Based"],
  ["coffee", "Moccachino", "Espresso + chocolate + milk. The fan favourite.", "₹180", "Espresso Based"],
  ["coffee", "Iced Latte", "Cold espresso over ice, topped with milk.", "₹180", "Espresso Based"],
  ["coffee", "Iced Mocha", "Cold espresso, chocolate sauce, milk, ice.", "₹190", "Espresso Based"],
  ["coffee", "V60 Pour-Over", "Manual pour, clean cup. Single-origin. Rotates seasonally.", "₹200", "Brew Methods"],
  ["coffee", "AeroPress", "Full-immersion, bold, low-acid. The traveller's brew.", "₹190", "Brew Methods"],
  ["coffee", "ChemEx", "6-cup glass brewer. Crisp, clear, almost tea-like.", "₹200", "Brew Methods"],
  ["coffee", "Vietnamese Coffee", "Slow drip over sweetened condensed milk. Iced.", "₹180", "Brew Methods"],
  ["coffee", "Orange Coffee Toniq", "Cold brew + fresh orange + soda. House signature.", "₹210", "Brew Methods"],
  ["coffee", "Lebanese Coffee", "Cardamom-spiced, strong, traditional. Acquired taste.", "₹170", "Brew Methods"],
  ["food", "Butter Croissant", "Classic, flaky, baked fresh. Best before noon.", "₹120", "Croissants & Sandwiches"],
  ["food", "Croissant Sandwich (Veg)", "Butter croissant + cheese + roasted veg.", "₹190", "Croissants & Sandwiches"],
  ["food", "Founder's Favourite Chicken Sandwich", "House-spiced chicken, layers of flavour. The signature.", "₹220", "Croissants & Sandwiches"],
  ["food", "Grilled Cheese Sandwich", "Three-cheese blend, toasted sourdough.", "₹200", "Croissants & Sandwiches"],
  ["food", "French Toast", "Brioche French toast, maple drizzle, dusted.", "₹180", "Croissants & Sandwiches"],
  ["food", "Hummus Bowl", "Warm pita, house hummus, olive oil, paprika.", "₹220", "Light Meals"],
  ["food", "Power Salad", "Mixed greens, cherry tomato, seeds, lemon tahini.", "₹210", "Light Meals"],
  ["drinks", "Bean Theory Hot Chocolate", "House recipe. Thick, dark, everything.", "₹190", "Non-Coffee"],
  ["drinks", "Matcha Latte", "Ceremonial-grade matcha, oat or whole milk.", "₹200", "Non-Coffee"],
  ["drinks", "Seasonal Special", "Rotates monthly. Ask your server.", "Market price", "Non-Coffee"],
  ["desserts", "Choco-Chunk Cookie", "Made fresh daily. Gooey. Warm edges.", "₹80", "Desserts & Bakes"],
  ["desserts", "Brownie", "Dense, fudgy, not too sweet.", "₹90", "Desserts & Bakes"],
  ["desserts", "Biscuit / Shortbread", "Butter-forward, crumbly, pairs with anything.", "₹60", "Desserts & Bakes"],
  ["desserts", "Crème Brûlée", "Seasonal. Torch-finished tableside.", "₹180", "Desserts & Bakes"],
  ["desserts", "Chocolate Cookie", "Slightly crispier variant. Dark cocoa.", "₹80", "Desserts & Bakes"]
];

const featuredNames = [
  "Founder's Favourite Chicken Sandwich",
  "Vietnamese Coffee",
  "Bean Theory Hot Chocolate",
  "V60 Pour-Over",
  "Choco-Chunk Cookie"
];

const tagByCategory = {
  coffee: "Coffee",
  drinks: "Drinks",
  food: "Food",
  desserts: "Bakes"
};

export const menuItems = rows.map(([category, name, description, price, group], index) => ({
  id: index + 1,
  category,
  categoryLabel: tagByCategory[category],
  name,
  description,
  price,
  group,
  featured: featuredNames.includes(name)
}));

export const signatureItems = menuItems
  .filter((item) => item.featured)
  .map((item, index) => ({
    ...item,
    image: [
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=760&q=85",
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=760&q=85",
      "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=760&q=85",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=760&q=85",
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=760&q=85"
    ][index]
  }));
