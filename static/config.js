/* ============================================================
   TECHNOVA — SHOP TEMPLATE CONFIG
   ============================================================
   THIS IS THE ONLY FILE YOU EDIT FOR A NEW SHOP.
   Change the values below → the whole website rebrands itself:
   name, colors, products, prices (PKR), WhatsApp, address, hours.
   ============================================================ */

window.SHOP_CONFIG = {

  /* ---------- BRAND ---------- */
  brand: {
    name: "TechNova",              // shop name (shown in navbar, hero, footer)
    tagline: "Your Local Tech Hub",
    heroTitle: "Next-Gen Tech.",
    heroTitleAccent: "Local Prices.",   // the glowing accent line
    heroSub: "Laptops, mobiles and accessories — genuine products, honest prices, right in your neighborhood. Visit us or order on WhatsApp.",
    logoText: "TN",                // 2 letters shown in the logo tile
    defaultTheme: "black"          // "black" or "white" — first visit theme (user can switch anytime)
  },

  /* ---------- CONTACT ---------- */
  contact: {
    phone: "+92 300 1234567",
    whatsapp: "923001234567",      // digits only, with country code — powers all WhatsApp buttons
    email: "hello@technova.pk",
    address: "Shop #12, Main Electronics Market, Saddar, Karachi",
    mapQuery: "Electronics Market Saddar Karachi",  // used for the "Get Directions" link
    hours: [
      ["Mon – Sat", "11:00 AM – 10:00 PM"],
      ["Sunday",    "2:00 PM – 9:00 PM"]
    ],
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/"
  },

  /* ---------- STATS STRIP ---------- */
  stats: [
    { value: "10+", label: "Years in Business" },
    { value: "15k+", label: "Happy Customers" },
    { value: "500+", label: "Products in Stock" },
    { value: "4.9★", label: "Customer Rating" }
  ],

  /* ---------- ABOUT PAGE ---------- */
  about: {
    lead: "We are your neighborhood tech shop — online.",
    paragraphs: [
      "TechNova started as a small counter in the local electronics market and grew into one of the most trusted tech shops in the area. We believe buying a laptop or phone should be simple: honest prices, genuine products, and a real person you can talk to.",
      "Everything we sell is checked and tested before it reaches you. If something goes wrong, you know exactly where to find us — no call centers, no run-around, just walk in or message us on WhatsApp.",
      "This website lets you browse our live stock, add items to your cart and place your order on WhatsApp in seconds. Delivery inside the city, pickup from the shop, or installment plans — your choice."
    ]
  },

  /* ---------- PRODUCT CATEGORIES (fallback only — real data comes from the admin panel / database) ---------- */
  categories: ["All", "Laptops", "Mobiles", "Audio", "Accessories"],

  /* ---------- PRODUCTS (prices in PKR) ---------- */
  products: [
    { name: "HP EliteBook 840 G8", category: "Laptops", price: 145000, oldPrice: 165000,
      badge: "Hot", icon: "laptop", desc: "i5 11th Gen · 16GB · 512GB SSD" },
    { name: "Dell Latitude 7420", category: "Laptops", price: 132000,
      icon: "laptop", desc: "i7 11th Gen · 16GB · 256GB SSD" },
    { name: "MacBook Air M1", category: "Laptops", price: 235000, badge: "Premium",
      icon: "laptop", desc: "8GB · 256GB · Space Gray" },
    { name: "Samsung Galaxy A55", category: "Mobiles", price: 118000,
      icon: "phone", desc: "8GB · 256GB · PTA Approved" },
    { name: "iPhone 13", category: "Mobiles", price: 195000, badge: "Hot",
      icon: "phone", desc: "128GB · Non-Active · Factory Sealed" },
    { name: "Redmi Note 13 Pro", category: "Mobiles", price: 74500, oldPrice: 82000,
      icon: "phone", desc: "12GB · 256GB · PTA Approved" },
    { name: "AirPods Pro 2", category: "Audio", price: 62000,
      icon: "earbuds", desc: "ANC · USB-C · 1 Year Warranty" },
    { name: "JBL Flip 6", category: "Audio", price: 32500,
      icon: "speaker", desc: "Portable · Waterproof · 12h Battery" },
    { name: "Anker 65W GaN Charger", category: "Accessories", price: 8900, badge: "New",
      icon: "charger", desc: "Fast Charge · Dual USB-C" },
    { name: "Logitech MX Master 3S", category: "Accessories", price: 27000,
      icon: "mouse", desc: "Wireless · Silent Clicks · 8K DPI" },
    { name: "Mechanical Keyboard K68", category: "Accessories", price: 12500,
      icon: "keyboard", desc: "RGB · Blue Switches · Hot-Swap" },
    { name: "Sony WH-CH520", category: "Audio", price: 18500,
      icon: "headphones", desc: "Wireless · 50h Battery" }
  ],

  /* ---------- SERVICES / WHY US ---------- */
  services: [
    { icon: "shield", title: "Genuine Products", desc: "Every product is original with official or shop warranty. No copies, no refurbs sold as new." },
    { icon: "wrench", title: "Repair Center", desc: "Screen, battery, board-level repairs for laptops and mobiles — same-day for most jobs." },
    { icon: "truck", title: "Home Delivery", desc: "Free delivery inside the city on orders above Rs 5,000. Cash on delivery available." },
    { icon: "swap", title: "Exchange Offers", desc: "Trade in your old device and upgrade — fair market valuation on the spot." },
    { icon: "card", title: "Easy Installments", desc: "0% markup installment plans available on selected laptops and phones." },
    { icon: "headset", title: "After-Sales Support", desc: "Free checkup and software support for 3 months after every purchase." }
  ],

  /* ---------- TESTIMONIALS ---------- */
  testimonials: [
    { name: "Ahmed R.", text: "Bought my EliteBook here — best price in the whole market and it came with warranty. Highly recommended!", stars: 5 },
    { name: "Fatima K.", text: "They fixed my iPhone screen in 2 hours while other shops said 2 days. Genuine part, fair price.", stars: 5 },
    { name: "Bilal S.", text: "Ordered AirPods on WhatsApp, delivered the same evening. This is how local shops should work.", stars: 5 }
  ],

  /* ---------- WATERMARK (do not remove) ---------- */
  credits: {
    madeBy:   { name: "Ayan", url: "https://www.instagram.com/ayan._.bhaiii/" },
    planedBy: { name: "Ahad", url: "https://www.instagram.com/ahadahad6171/" }
  }
};
