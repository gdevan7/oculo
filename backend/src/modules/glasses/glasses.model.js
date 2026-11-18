// Domain shape (also the database shape):
//   { id, name, subtitle, description, style, price, sort_order, active,
//     colors: [{ id, name, hex, model_url }] }   // the first color is the default

export function buildGlasses(input) {
  return {
    id: input.id,
    name: input.name.trim(),
    subtitle: input.subtitle ?? "",
    description: input.description ?? "",
    style: input.style ?? "classic",
    price: input.price ?? 0,
    sort_order: input.sort_order ?? 0,
    active: input.active ?? true,
    colors: input.colors.map(({ id, name, hex, model_url }) => ({ id, name, hex, model_url })),
  };
}

// What the API sends. frame_color, model_url and color_id describe the default (first) color,
// which is what the catalog card shows before a visitor picks another color.
export function toApi(glasses) {
  const [first] = glasses.colors;
  return {
    id: glasses.id,
    name: glasses.name,
    subtitle: glasses.subtitle,
    description: glasses.description,
    style: glasses.style,
    price: glasses.price,
    sort_order: glasses.sort_order,
    active: glasses.active,
    frame_color: first.hex,
    model_url: first.model_url,
    color_id: first.id,
    colors: glasses.colors.map(({ id, name, hex, model_url }) => ({ id, name, hex, model_url })),
  };
}
