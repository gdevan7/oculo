// Initial catalog: the frames shown in the app. `npm run db:seed` writes it to PostgreSQL, and the
// in-memory repository starts from it when no DATABASE_URL is set. frontend/src/data/glasses.js keeps an
// offline copy for the browser; test/seed-sync.test.js fails if the two drift apart.
export const glassesSeed = [
  {
    "id": "cloud",
    "name": "Cloud",
    "subtitle": "Everyday Essential",
    "description": "A clean, lightweight frame for an effortless everyday look.",
    "style": "classic",
    "price": 0,
    "sort_order": 0,
    "active": true,
    "colors": [
      {
        "id": "black",
        "name": "Classic Black",
        "hex": "#17191D",
        "model_url": "/models/model-0/model_0_black.glb"
      },
      {
        "id": "dusty-rose",
        "name": "Dusty Rose",
        "hex": "#B98286",
        "model_url": "/models/model-0/model_0_dusty_rose.glb"
      },
      {
        "id": "sage-green",
        "name": "Sage Green",
        "hex": "#899B83",
        "model_url": "/models/model-0/model_0_sage_green.glb"
      },
      {
        "id": "slate-blue-grey",
        "name": "Slate Blue Grey",
        "hex": "#71818C",
        "model_url": "/models/model-0/model_0_slate_blue_grey.glb"
      }
    ]
  },
  {
    "id": "frankie",
    "name": "Frankie",
    "subtitle": "Modern Tortoise",
    "description": "Warm tortoiseshell details with a timeless silhouette.",
    "style": "tortoise",
    "price": 0,
    "sort_order": 1,
    "active": true,
    "colors": [
      {
        "id": "tortoiseshell",
        "name": "Tortoiseshell",
        "hex": "#70452F",
        "model_url": "/models/model-1/model_1_tortoiseshell.glb"
      },
      {
        "id": "honey-amber",
        "name": "Honey Amber",
        "hex": "#C28A43",
        "model_url": "/models/model-1/model_1_honey_amber.glb"
      },
      {
        "id": "taupe-grey",
        "name": "Taupe Grey",
        "hex": "#8D8279",
        "model_url": "/models/model-1/model_1_taupe_grey.glb"
      },
      {
        "id": "burgundy-wine",
        "name": "Burgundy Wine",
        "hex": "#632D42",
        "model_url": "/models/model-1/model_1_burgundy_wine.glb"
      }
    ]
  },
  {
    "id": "monroe",
    "name": "Monroe",
    "subtitle": "Classic Black",
    "description": "A confident black frame that goes with just about everything.",
    "style": "black",
    "price": 0,
    "sort_order": 2,
    "active": true,
    "colors": [
      {
        "id": "black",
        "name": "Matte Black",
        "hex": "#17191D",
        "model_url": "/models/model-2/model_2_black.glb"
      },
      {
        "id": "gold",
        "name": "Gold",
        "hex": "#C6A15B",
        "model_url": "/models/model-2/model_2_gold.glb"
      },
      {
        "id": "rose-gold",
        "name": "Rose Gold",
        "hex": "#B98278",
        "model_url": "/models/model-2/model_2_rose_gold.glb"
      },
      {
        "id": "silver",
        "name": "Silver",
        "hex": "#AEB5BC",
        "model_url": "/models/model-2/model_2_silver.glb"
      }
    ]
  },
  {
    "id": "noir",
    "name": "Noir",
    "subtitle": "Contemporary Acetate",
    "description": "A versatile silhouette with four distinctive finishes.",
    "style": "classic",
    "price": 0,
    "sort_order": 3,
    "active": true,
    "colors": [
      {
        "id": "black-lens",
        "name": "Black Lens",
        "hex": "#24272B",
        "model_url": "/models/model-3/model_3_black_lens.glb"
      },
      {
        "id": "burgundy-wine",
        "name": "Burgundy Wine",
        "hex": "#713747",
        "model_url": "/models/model-3/model_3_burgundy_wine.glb"
      },
      {
        "id": "havana-brown",
        "name": "Havana Brown",
        "hex": "#80563A",
        "model_url": "/models/model-3/model_3_havana_brown.glb"
      },
      {
        "id": "ivory-cream",
        "name": "Ivory Cream",
        "hex": "#D9CDB7",
        "model_url": "/models/model-3/model_3_ivory_cream.glb"
      }
    ]
  },
  {
    "id": "browline",
    "name": "Browline",
    "subtitle": "Refined Browline",
    "description": "A defined browline profile with contrasting metal details.",
    "style": "tortoise",
    "price": 0,
    "sort_order": 4,
    "active": true,
    "colors": [
      {
        "id": "browline-merged",
        "name": "Classic Browline",
        "hex": "#4D4037",
        "model_url": "/models/model-4/model_4_browline_merged.glb"
      },
      {
        "id": "brown-gold",
        "name": "Brown Gold",
        "hex": "#87603C",
        "model_url": "/models/model-4/model_4_brown_gold.glb"
      },
      {
        "id": "burgundy-rose-gold",
        "name": "Burgundy Rose Gold",
        "hex": "#783E50",
        "model_url": "/models/model-4/model_4_burgundy_rose_gold.glb"
      },
      {
        "id": "navy-silver",
        "name": "Navy Silver",
        "hex": "#34465D",
        "model_url": "/models/model-4/model_4_navy_silver.glb"
      }
    ]
  },
  {
    "id": "heritage",
    "name": "Heritage",
    "subtitle": "Modern Browline",
    "description": "A second browline design with a distinct frame construction.",
    "style": "tortoise",
    "price": 0,
    "sort_order": 5,
    "active": true,
    "colors": [
      {
        "id": "browline",
        "name": "Browline",
        "hex": "#4B3B30",
        "model_url": "/models/model-5/model_5_browline.glb"
      },
      {
        "id": "brown-gold",
        "name": "Brown Gold",
        "hex": "#87603C",
        "model_url": "/models/model-5/model_5_brown_gold.glb"
      },
      {
        "id": "burgundy-rose-gold",
        "name": "Burgundy Rose Gold",
        "hex": "#783E50",
        "model_url": "/models/model-5/model_5_burgundy_rose_gold.glb"
      },
      {
        "id": "navy-silver",
        "name": "Navy Silver",
        "hex": "#34465D",
        "model_url": "/models/model-5/model_5_navy_silver.glb"
      }
    ]
  },
  {
    "id": "evergreen",
    "name": "Evergreen",
    "subtitle": "Everyday Metal",
    "description": "A clean everyday frame in understated natural tones.",
    "style": "classic",
    "price": 0,
    "sort_order": 6,
    "active": true,
    "colors": [
      {
        "id": "black",
        "name": "Black",
        "hex": "#202326",
        "model_url": "/models/model-6/model_6_black.glb"
      },
      {
        "id": "forest-green",
        "name": "Forest Green",
        "hex": "#435B4A",
        "model_url": "/models/model-6/model_6_forest_green.glb"
      },
      {
        "id": "gunmetal-grey",
        "name": "Gunmetal Grey",
        "hex": "#697178",
        "model_url": "/models/model-6/model_6_gunmetal_grey.glb"
      },
      {
        "id": "havana-brown",
        "name": "Havana Brown",
        "hex": "#806044",
        "model_url": "/models/model-6/model_6_havana_brown.glb"
      }
    ]
  },
  {
    "id": "maverick",
    "name": "Maverick",
    "subtitle": "Classic Aviator",
    "description": "A timeless teardrop aviator with sun-washed yellow lenses.",
    "style": "aviator",
    "price": 0,
    "sort_order": 7,
    "active": true,
    "colors": [
      {
        "id": "black",
        "name": "Black",
        "hex": "#17191D",
        "model_url": "/models/model-7/model_7_black.glb"
      },
      {
        "id": "gold",
        "name": "Gold",
        "hex": "#C6A15B",
        "model_url": "/models/model-7/model_7_gold.glb"
      },
      {
        "id": "rose-gold",
        "name": "Rose Gold",
        "hex": "#B98278",
        "model_url": "/models/model-7/model_7_rose_gold.glb"
      }
    ]
  },
  {
    "id": "lola",
    "name": "Lola",
    "subtitle": "Retro Cat-Eye",
    "description": "A playful retro cat-eye with swept-up corners and clear lenses.",
    "style": "cat-eye",
    "price": 0,
    "sort_order": 8,
    "active": true,
    "colors": [
      {
        "id": "black",
        "name": "Black",
        "hex": "#17191D",
        "model_url": "/models/model-8/model_8_black.glb"
      },
      {
        "id": "emerald-green",
        "name": "Emerald Green",
        "hex": "#2F6B52",
        "model_url": "/models/model-8/model_8_emerald_green.glb"
      },
      {
        "id": "navy-blue",
        "name": "Navy Blue",
        "hex": "#3B4C80",
        "model_url": "/models/model-8/model_8_navy_blue.glb"
      }
    ]
  },
  {
    "id": "archer",
    "name": "Archer",
    "subtitle": "Slim Rectangle",
    "description": "A slim rectangular frame with warm sepia lenses and a quiet, modern profile.",
    "style": "rectangle",
    "price": 0,
    "sort_order": 9,
    "active": true,
    "colors": [
      {
        "id": "dark-brown",
        "name": "Dark Brown",
        "hex": "#7B5A41",
        "model_url": "/models/model-9/model_9_dark_brown.glb"
      },
      {
        "id": "antique-gold",
        "name": "Antique Gold",
        "hex": "#C7AA68",
        "model_url": "/models/model-9/model_9_antique_gold.glb"
      },
      {
        "id": "copper",
        "name": "Copper",
        "hex": "#C48762",
        "model_url": "/models/model-9/model_9_copper.glb"
      }
    ]
  },
  {
    "id": "orbit",
    "name": "Orbit",
    "subtitle": "Round Metal",
    "description": "Perfectly round metal frames with soft green-yellow tinted lenses.",
    "style": "round",
    "price": 0,
    "sort_order": 10,
    "active": true,
    "colors": [
      {
        "id": "black",
        "name": "Black",
        "hex": "#17191D",
        "model_url": "/models/model-10/model_10_black.glb"
      },
      {
        "id": "gold",
        "name": "Gold",
        "hex": "#C6A15B",
        "model_url": "/models/model-10/model_10_gold.glb"
      },
      {
        "id": "silver",
        "name": "Silver",
        "hex": "#AEB5BC",
        "model_url": "/models/model-10/model_10_silver.glb"
      }
    ]
  },
  {
    "id": "sorbet",
    "name": "Sorbet",
    "subtitle": "Slim Pastel",
    "description": "A slim, wide frame in soft pastel shades with rose-gradient lenses.",
    "style": "slim",
    "price": 0,
    "sort_order": 11,
    "active": true,
    "colors": [
      {
        "id": "lavender",
        "name": "Lavender",
        "hex": "#BCA6EA",
        "model_url": "/models/model-11/model_11_lavender.glb"
      },
      {
        "id": "white",
        "name": "White",
        "hex": "#F4F4F6",
        "model_url": "/models/model-11/model_11_white.glb"
      },
      {
        "id": "aqua",
        "name": "Aqua",
        "hex": "#6FDCD2",
        "model_url": "/models/model-11/model_11_aqua.glb"
      }
    ]
  },
  {
    "id": "navigator",
    "name": "Navigator",
    "subtitle": "Square Aviator",
    "description": "An oversized square aviator with a double bridge and clear lenses.",
    "style": "square-aviator",
    "price": 0,
    "sort_order": 12,
    "active": true,
    "colors": [
      {
        "id": "black",
        "name": "Black",
        "hex": "#17191D",
        "model_url": "/models/model-12/model_12_black.glb"
      },
      {
        "id": "gold",
        "name": "Gold",
        "hex": "#C6A15B",
        "model_url": "/models/model-12/model_12_gold.glb"
      },
      {
        "id": "silver",
        "name": "Silver",
        "hex": "#AEB5BC",
        "model_url": "/models/model-12/model_12_silver.glb"
      }
    ]
  },
  {
    "id": "rebel",
    "name": "Rebel",
    "subtitle": "Bold Square",
    "description": "A bold square frame with gradient and tinted lenses for a confident look.",
    "style": "square",
    "price": 0,
    "sort_order": 13,
    "active": true,
    "colors": [
      {
        "id": "midnight-blue",
        "name": "Midnight Blue",
        "hex": "#2F3A5A",
        "model_url": "/models/model-13/model_13_midnight_blue.glb"
      },
      {
        "id": "black-red-lens",
        "name": "Black Red Lens",
        "hex": "#B83A3F",
        "model_url": "/models/model-13/model_13_black_red_lens.glb"
      }
    ]
  },
  {
    "id": "apex",
    "name": "Apex",
    "subtitle": "Sport Half-Rim",
    "description": "A lightweight sport half-rim with dark lenses and vivid frame colors.",
    "style": "sport",
    "price": 0,
    "sort_order": 14,
    "active": true,
    "colors": [
      {
        "id": "metallic-green",
        "name": "Metallic Green",
        "hex": "#2FA36B",
        "model_url": "/models/model-14/model_14_metallic_green.glb"
      },
      {
        "id": "yellow",
        "name": "Yellow",
        "hex": "#E8C72A",
        "model_url": "/models/model-14/model_14_yellow.glb"
      }
    ]
  },
  {
    "id": "horizon",
    "name": "Horizon",
    "subtitle": "Sport Shield",
    "description": "A wrap-around sport shield with a bold single lens for full coverage.",
    "style": "shield",
    "price": 0,
    "sort_order": 15,
    "active": true,
    "colors": [
      {
        "id": "black-blue-lens",
        "name": "Black Blue Lens",
        "hex": "#4A8FEF",
        "model_url": "/models/model-15/model_15_black_blue_lens.glb"
      },
      {
        "id": "black-red-mirror",
        "name": "Black Red Mirror",
        "hex": "#D93A40",
        "model_url": "/models/model-15/model_15_black_red_mirror.glb"
      },
      {
        "id": "white-orange-lens",
        "name": "White Orange Lens",
        "hex": "#F5A445",
        "model_url": "/models/model-15/model_15_white_orange_lens.glb"
      }
    ]
  },
  {
    "id": "atlas",
    "name": "Atlas",
    "subtitle": "Retro Double Bridge",
    "description": "A retro double-bridge frame with warm tinted lenses and a 70s attitude.",
    "style": "retro",
    "price": 0,
    "sort_order": 16,
    "active": true,
    "colors": [
      {
        "id": "amber-brown",
        "name": "Amber Brown",
        "hex": "#8F6547",
        "model_url": "/models/model-16/model_16_amber_brown.glb"
      },
      {
        "id": "forest-green",
        "name": "Forest Green",
        "hex": "#3A7A5B",
        "model_url": "/models/model-16/model_16_forest_green.glb"
      },
      {
        "id": "navy-blue",
        "name": "Navy Blue",
        "hex": "#3B518F",
        "model_url": "/models/model-16/model_16_navy_blue.glb"
      }
    ]
  }
];
