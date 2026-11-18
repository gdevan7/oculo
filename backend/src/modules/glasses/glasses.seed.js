// Initial catalog: the seven frames shown in the app. `npm run db:seed` writes it to PostgreSQL, and the
// in-memory repository starts from it when no DATABASE_URL is set. frontend/src/data/glasses.js keeps an
// offline copy for the browser; test/seed-sync.test.js fails if the two drift apart.
export const glassesSeed = [
  {
    "id": "cloud",
    "name": "Cloud",
    "subtitle": "Everyday Essential",
    "description": "A clean, lightweight frame for an effortless everyday look.",
    "style": "classic",
    "price": 300000,
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
    "price": 250000,
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
    "price": 200000,
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
    "price": 200000,
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
    "price": 500000,
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
    "price": 300000,
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
    "price": 350000,
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
  }
];
