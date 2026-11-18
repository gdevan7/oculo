// Built-in catalog. Used as-is when no API is configured, and as the base the API rows are merged into.
export const fallbackCatalog = [
  {
    id: "black", name: "Cloud", subtitle: "Everyday Essential",
    description: "A clean, lightweight frame for an effortless everyday look.",
    frame_color: "#17191D", style: "classic", color_id: "black",
    model_url: "/models/model-0/model_0_black.glb", price: 300000,
    colors: [
      { id: "black", name: "Classic Black", hex: "#17191D", model_url: "/models/model-0/model_0_black.glb" },
      { id: "dusty-rose", name: "Dusty Rose", hex: "#B98286", model_url: "/models/model-0/model_0_dusty_rose.glb" },
      { id: "sage-green", name: "Sage Green", hex: "#899B83", model_url: "/models/model-0/model_0_sage_green.glb" },
      { id: "slate-blue-grey", name: "Slate Blue Grey", hex: "#71818C", model_url: "/models/model-0/model_0_slate_blue_grey.glb" }
    ]
  },
  {
    id: "tortoiseshell", name: "Frankie", subtitle: "Modern Tortoise",
    description: "Warm tortoiseshell details with a timeless silhouette.",
    frame_color: "#70452F", style: "tortoise", color_id: "tortoiseshell",
    model_url: "/models/model-1/model_1_tortoiseshell.glb", price: 250000,
    colors: [
      { id: "tortoiseshell", name: "Tortoiseshell", hex: "#70452F", model_url: "/models/model-1/model_1_tortoiseshell.glb" },
      { id: "honey-amber", name: "Honey Amber", hex: "#C28A43", model_url: "/models/model-1/model_1_honey_amber.glb" },
      { id: "taupe-grey", name: "Taupe Grey", hex: "#8D8279", model_url: "/models/model-1/model_1_taupe_grey.glb" },
      { id: "burgundy-wine", name: "Burgundy Wine", hex: "#632D42", model_url: "/models/model-1/model_1_burgundy_wine.glb" }
    ]
  },
  {
    id: "black", name: "Monroe", subtitle: "Classic Black",
    description: "A confident black frame that goes with just about everything.",
    frame_color: "#171717", style: "black", color_id: "black",
    model_url: "/models/model-2/model_2_black.glb", price: 200000,
    colors: [
      { id: "black", name: "Matte Black", hex: "#17191D", model_url: "/models/model-2/model_2_black.glb" },
      { id: "gold", name: "Gold", hex: "#C6A15B", model_url: "/models/model-2/model_2_gold.glb" },
      { id: "rose-gold", name: "Rose Gold", hex: "#B98278", model_url: "/models/model-2/model_2_rose_gold.glb" },
      { id: "silver", name: "Silver", hex: "#AEB5BC", model_url: "/models/model-2/model_2_silver.glb" }
    ]
  },
{
    id: "model-3", name: "Noir", subtitle: "Contemporary Acetate",
    description: "A versatile silhouette with four distinctive finishes.",
    frame_color: "#17191D", style: "classic", color_id: "black-lens",
    model_url: "/models/model-3/model_3_black_lens.glb", price: 200000,
    colors: [
      { id: "black-lens", name: "Black Lens", hex: "#24272B", model_url: "/models/model-3/model_3_black_lens.glb" },
      { id: "burgundy-wine", name: "Burgundy Wine", hex: "#713747", model_url: "/models/model-3/model_3_burgundy_wine.glb" },
      { id: "havana-brown", name: "Havana Brown", hex: "#80563A", model_url: "/models/model-3/model_3_havana_brown.glb" },
      { id: "ivory-cream", name: "Ivory Cream", hex: "#D9CDB7", model_url: "/models/model-3/model_3_ivory_cream.glb" }
    ]
  },
  {
    id: "model-4", name: "Browline", subtitle: "Refined Browline",
    description: "A defined browline profile with contrasting metal details.",
    frame_color: "#59402F", style: "tortoise", color_id: "browline-merged",
    model_url: "/models/model-4/model_4_browline_merged.glb", price: 500000,
    colors: [
      { id: "browline-merged", name: "Classic Browline", hex: "#4D4037", model_url: "/models/model-4/model_4_browline_merged.glb" },
      { id: "brown-gold", name: "Brown Gold", hex: "#87603C", model_url: "/models/model-4/model_4_brown_gold.glb" },
      { id: "burgundy-rose-gold", name: "Burgundy Rose Gold", hex: "#783E50", model_url: "/models/model-4/model_4_burgundy_rose_gold.glb" },
      { id: "navy-silver", name: "Navy Silver", hex: "#34465D", model_url: "/models/model-4/model_4_navy_silver.glb" }
    ]
  },
  {
    id: "model-5", name: "Heritage", subtitle: "Modern Browline",
    description: "A second browline design with a distinct frame construction.",
    frame_color: "#5B4638", style: "tortoise", color_id: "browline",
    model_url: "/models/model-5/model_5_browline.glb", price: 300000,
    colors: [
      { id: "browline", name: "Browline", hex: "#4B3B30", model_url: "/models/model-5/model_5_browline.glb" },
      { id: "brown-gold", name: "Brown Gold", hex: "#87603C", model_url: "/models/model-5/model_5_brown_gold.glb" },
      { id: "burgundy-rose-gold", name: "Burgundy Rose Gold", hex: "#783E50", model_url: "/models/model-5/model_5_burgundy_rose_gold.glb" },
      { id: "navy-silver", name: "Navy Silver", hex: "#34465D", model_url: "/models/model-5/model_5_navy_silver.glb" }
    ]
  },
  {
    id: "model-6", name: "Evergreen", subtitle: "Everyday Metal",
    description: "A clean everyday frame in understated natural tones.",
    frame_color: "#202326", style: "classic", color_id: "black",
    model_url: "/models/model-6/model_6_black.glb", price: 350000,
    colors: [
      { id: "black", name: "Black", hex: "#202326", model_url: "/models/model-6/model_6_black.glb" },
      { id: "forest-green", name: "Forest Green", hex: "#435B4A", model_url: "/models/model-6/model_6_forest_green.glb" },
      { id: "gunmetal-grey", name: "Gunmetal Grey", hex: "#697178", model_url: "/models/model-6/model_6_gunmetal_grey.glb" },
      { id: "havana-brown", name: "Havana Brown", hex: "#806044", model_url: "/models/model-6/model_6_havana_brown.glb" }
    ]
  }
];
