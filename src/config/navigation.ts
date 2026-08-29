// Canonical owner of the public route registry. Slugs are written literally here
// and nowhere else, so an adopter renaming a route edits exactly one file.
// Identifiers are stable across renames; labels and slugs are adopter-owned.
export const navigation = [
  { id: "home", href: "/", label: "Inicio" },
  { id: "about", href: "/nosotros/", label: "Nosotros" },
  { id: "services", href: "/servicios/", label: "Servicios" },
  { id: "contact", href: "/contacto/", label: "Contacto" },
] as const;

export type NavigationId = (typeof navigation)[number]["id"];

export const routeFor = (id: NavigationId): string => {
  const entry = navigation.find((item) => item.id === id);
  if (!entry) throw new Error(`unknown navigation route: ${id}`);
  return entry.href;
};

// Public routes reached from context rather than primary navigation. They are
// excluded from the sitemap and serve noindex.
export const contextualRoutes = {
  privacy: "/aviso-de-privacidad/",
  formSuccess: "/gracias/",
} as const;

// The navigation route that hosts the contact form. A contract test asserts it
// stays registered.
export const contactRoute = routeFor("contact");
