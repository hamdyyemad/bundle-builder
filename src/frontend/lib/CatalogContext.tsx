"use client";

import { createContext, useContext, type ReactNode } from "react";

import { EMPTY_CATALOG, type BundleCatalog } from "@/frontend/lib/bundle";

const CatalogContext = createContext<BundleCatalog>(EMPTY_CATALOG);

/**
 * Carries the server-fetched catalog to client components.
 *
 * The catalog now comes from the database, which can only be read on the
 * server; this lets the client tree keep consuming it synchronously.
 */
export function CatalogProvider({
  catalog,
  children,
}: {
  catalog: BundleCatalog;
  children: ReactNode;
}) {
  return (
    <CatalogContext.Provider value={catalog}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog(): BundleCatalog {
  return useContext(CatalogContext);
}
