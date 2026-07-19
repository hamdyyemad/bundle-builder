/**
 * Seeds the catalog from src/frontend/data/bundle/*.json — the data the app shipped
 * with before the DB existed, so seeding is a no-op change from the UI's view.
 *
 * Idempotent: upserts by id and prunes rows no longer present in the JSON.
 */
import "dotenv/config";

import { ItemKind } from "@prisma/client";

import catalog from "../src/frontend/data/bundle/catalog.json";
import categories from "../src/frontend/data/bundle/category.json";
import { prisma } from "../src/backend/repository/db";

/** Money lives as integer cents in the DB; JSON carries dollars. */
function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

type JsonVariant = { id: string; label: string; image: string };

type JsonItem = {
  id: string;
  stepId?: number;
  category: string;
  name: string;
  description: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  priceLabel?: string;
  compareAtSuffix?: string;
  selectable?: boolean;
  defaultSelected?: boolean;
  locked?: boolean;
  included?: boolean;
  countInStock?: number;
  variants?: JsonVariant[];
};

async function seedCategories() {
  for (const [index, category] of categories.entries()) {
    await prisma.category.upsert({
      where: { id: category.id },
      create: { id: category.id, label: category.label, sortOrder: index },
      update: { label: category.label, sortOrder: index },
    });
  }
  return categories.map((category) => category.id);
}

async function seedSteps() {
  for (const step of catalog.steps) {
    await prisma.step.upsert({
      where: { id: step.id },
      create: {
        id: step.id,
        title: step.title,
        nextLabel: step.nextLabel,
        icon: step.icon,
        categoryId: step.category,
      },
      update: {
        title: step.title,
        nextLabel: step.nextLabel,
        icon: step.icon,
        categoryId: step.category,
      },
    });
  }
  return catalog.steps.map((step) => step.id);
}

async function seedItem(item: JsonItem, kind: ItemKind, sortOrder: number) {
  const fields = {
    kind,
    stepId: item.stepId ?? null,
    categoryId: item.category,
    name: item.name,
    description: item.description,
    image: item.image,
    priceCents: toCents(item.price),
    compareAtPriceCents:
      item.compareAtPrice != null ? toCents(item.compareAtPrice) : null,
    priceLabel: item.priceLabel ?? null,
    compareAtSuffix: item.compareAtSuffix ?? null,
    selectable: item.selectable ?? false,
    defaultSelected: item.defaultSelected ?? false,
    locked: item.locked ?? false,
    included: item.included ?? false,
    countInStock: item.countInStock ?? null,
    sortOrder,
  };

  await prisma.item.upsert({
    where: { id: item.id },
    create: { id: item.id, ...fields },
    update: fields,
  });

  const variants = item.variants ?? [];
  for (const [index, variant] of variants.entries()) {
    await prisma.variant.upsert({
      where: { itemId_id: { itemId: item.id, id: variant.id } },
      create: {
        itemId: item.id,
        id: variant.id,
        label: variant.label,
        image: variant.image,
        sortOrder: index,
      },
      update: { label: variant.label, image: variant.image, sortOrder: index },
    });
  }

  // Drop variants removed from the JSON since the last seed.
  await prisma.variant.deleteMany({
    where: { itemId: item.id, id: { notIn: variants.map((v) => v.id) } },
  });
}

async function seedItems() {
  const groups: Array<[JsonItem[], ItemKind]> = [
    [catalog.products as JsonItem[], ItemKind.PRODUCT],
    [(catalog.plans ?? []) as JsonItem[], ItemKind.PLAN],
    [(catalog.advantages ?? []) as JsonItem[], ItemKind.ADVANTAGE],
  ];

  const seenIds: string[] = [];
  for (const [items, kind] of groups) {
    for (const [index, item] of items.entries()) {
      await seedItem(item, kind, index);
      seenIds.push(item.id);
    }
  }
  return seenIds;
}

async function main() {
  const categoryIds = await seedCategories();
  const stepIds = await seedSteps();
  const itemIds = await seedItems();

  await prisma.catalogSettings.upsert({
    where: { id: 1 },
    create: { id: 1, financingLabel: catalog.financingLabel },
    update: { financingLabel: catalog.financingLabel },
  });

  // Prune in FK-safe order: items reference steps and categories.
  await prisma.item.deleteMany({ where: { id: { notIn: itemIds } } });
  await prisma.step.deleteMany({ where: { id: { notIn: stepIds } } });
  await prisma.category.deleteMany({ where: { id: { notIn: categoryIds } } });

  console.log(
    `Seeded ${categoryIds.length} categories, ${stepIds.length} steps, ${itemIds.length} items.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
