/**
 * Animal Species Matching Utility
 * Accurately maps products in catalog to target livestock / animal species.
 */
export function matchesAnimal(product, animalName) {
  if (!animalName || animalName === "all" || animalName === "All") return true;

  const target = animalName.toLowerCase().trim();
  const name = (product.name || "").toLowerCase();
  const type = (product.type || "").toLowerCase();
  const tag = (product.tag || "").toLowerCase();
  const category = (product.category || "").toLowerCase();

  // First check explicit structured arrays from backend (suitableFor, targetAnimals, animals)
  const animalsList = [
    ...(Array.isArray(product.suitableFor) ? product.suitableFor : []),
    ...(Array.isArray(product.targetAnimals) ? product.targetAnimals : []),
    ...(Array.isArray(product.animals) ? product.animals : []),
  ].map((a) => String(a).toLowerCase());

  if (animalsList.length > 0) {
    if (target === "cow" || target === "cattle" || target === "bovine") {
      if (animalsList.some((a) => a === "cow" || a === "cattle" || a === "bovine" || a.includes("cow") || a.includes("cattle"))) return true;
    } else if (target === "cock" || target === "hen" || target === "poultry" || target === "chicken" || target === "broiler" || target === "rooster" || target === "birds") {
      if (animalsList.some((a) => a === "cock" || a === "hen" || a === "poultry" || a === "chicken" || a === "broiler" || a === "rooster" || a.includes("poultry") || a.includes("hen") || a.includes("cock"))) return true;
    } else if (target === "dog" || target === "dogs" || target === "pet" || target === "pets" || target === "canine") {
      if (animalsList.some((a) => a === "dog" || a === "dogs" || a === "pet" || a === "pets" || a === "canine" || a.includes("dog") || a.includes("pet"))) return true;
    } else if (target === "fish" || target === "aquaculture" || target === "aqua" || target === "fisheries") {
      if (animalsList.some((a) => a === "fish" || a === "aquaculture" || a === "aqua" || a === "fisheries" || a.includes("fish") || a.includes("aqua"))) return true;
    } else if (animalsList.some((a) => a === target || a.includes(target) || target.includes(a))) {
      return true;
    }
  }

  // 1. Cow / Cattle / Bovine
  if (target === "cow" || target === "cattle" || target === "bovine") {
    // Exclude pet dog/cat products and fish aquaculture
    if (name.includes("pet") || name.includes("dog") || name.includes("cat") || name.includes("aqua") || name.includes("fish")) {
      return false;
    }
    return (
      category === "cattle-dairy" ||
      name.includes("cattle") || name.includes("bovine") || name.includes("cow") ||
      name.includes("calci") || name.includes("milk") || name.includes("mast") ||
      name.includes("hoof") || name.includes("ener-boost") || name.includes("hydro-lyte") ||
      name.includes("mineral") || name.includes("vit-ad3e") || name.includes("liv-") ||
      type.includes("cattle") || type.includes("livestock") || type.includes("lactation") || type.includes("cow") ||
      tag.includes("bestseller") || tag.includes("high energy")
    );
  }

  // 2. Buffalo
  if (target === "buffalo") {
    if (name.includes("pet") || name.includes("dog") || name.includes("cat") || name.includes("aqua") || name.includes("fish")) {
      return false;
    }
    return (
      category === "cattle-dairy" ||
      name.includes("buffalo") || name.includes("milk") || name.includes("calci") ||
      name.includes("mineral") || name.includes("ener-boost") || name.includes("hydro-lyte") ||
      name.includes("vit-ad3e") || name.includes("bovine") || name.includes("mast") ||
      type.includes("lactation") || type.includes("livestock") || type.includes("calcium")
    );
  }

  // 3. Cock / Hen / Poultry / Birds / Broiler / Chicken
  if (target === "cock" || target === "hen" || target === "poultry" || target === "chicken" || target === "broiler" || target === "rooster" || target === "birds") {
    // Must not be dog/cat pet or fish
    if (name.includes("pet") || name.includes("dog") || name.includes("cat") || name.includes("flea") || name.includes("aqua") || name.includes("fish")) {
      return false;
    }
    return (
      category === "poultry-pets" ||
      name.includes("poultry") || name.includes("broiler") || name.includes("layer") ||
      name.includes("flock") || name.includes("cock") || name.includes("hen") || name.includes("chicken") ||
      type.includes("poultry") || type.includes("broiler") || type.includes("cock") || type.includes("hen") ||
      tag.includes("flock") || tag.includes("growth booster") || tag.includes("shell quality") ||
      name.includes("multi-vit") || name.includes("hydro-lyte")
    );
  }

  // 4. Companion Pets (Dogs, Cats)
  if (target === "pets" || target === "pet" || target === "dog" || target === "dogs" || target === "cat" || target === "cats") {
    // Must not be poultry or large cattle exclusive
    if (name.includes("poultry") || name.includes("broiler") || name.includes("bovine") || name.includes("aqua") || name.includes("fish")) {
      return false;
    }
    return (
      name.includes("pet") || name.includes("dog") || name.includes("canine") ||
      name.includes("cat") || name.includes("feline") || name.includes("arthro") ||
      name.includes("joint") || name.includes("flea") || name.includes("derma") ||
      name.includes("shampoo") || type.includes("pet") || type.includes("canine") || type.includes("dog") ||
      tag.includes("pet care") || tag.includes("joint health") || tag.includes("coat defense") ||
      tag.includes("skin & coat") || name.includes("multi-vit") || name.includes("wound-heal")
    );
  }

  // 5. Goats / Caprine
  if (target === "goats" || target === "goat" || target === "caprine") {
    if (name.includes("pet") || name.includes("dog") || name.includes("cat") || name.includes("aqua") || name.includes("fish")) {
      return false;
    }
    return (
      name.includes("goat") || name.includes("ovi") || name.includes("ruminant") ||
      type.includes("goat") || type.includes("sheep") || type.includes("ruminant") ||
      name.includes("mineral") || name.includes("hydro-lyte") || name.includes("ener-boost") ||
      name.includes("multi-vit") || name.includes("liv-pro") || name.includes("liv-herbal") ||
      name.includes("wound-heal") || tag.includes("ruminant")
    );
  }

  // 6. Sheep / Ovine
  if (target === "sheep" || target === "ovine") {
    if (name.includes("pet") || name.includes("dog") || name.includes("cat") || name.includes("aqua") || name.includes("fish")) {
      return false;
    }
    return (
      name.includes("sheep") || name.includes("ovi") || name.includes("ruminant") ||
      type.includes("sheep") || type.includes("goat") || type.includes("ruminant") ||
      name.includes("mineral") || name.includes("hydro-lyte") || name.includes("ener-boost") ||
      name.includes("multi-vit") || name.includes("liv-pro") || name.includes("liv-herbal") ||
      name.includes("wound-heal") || tag.includes("ruminant")
    );
  }

  // 7. Fish / Aquaculture / Fisheries
  if (target === "fish" || target === "aquaculture" || target === "aqua" || target === "fisheries") {
    return (
      category === "poultry-pets" ||
      name.includes("aqua") || name.includes("fish") || name.includes("shrimp") ||
      type.includes("aqua") || type.includes("fish") || type.includes("water conditioner") ||
      tag.includes("aquaculture") || tag.includes("fisheries")
    );
  }

  // Generic fallback
  const singular = target.endsWith("s") ? target.slice(0, -1) : target;
  return (
    name.includes(target) || name.includes(singular) ||
    type.includes(target) || type.includes(singular) ||
    category.includes(target) || category.includes(singular)
  );
}
