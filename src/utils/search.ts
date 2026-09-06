export function cleanSearchString(str: string | undefined | null): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function matchProductSearch(
  product: { productName: string; barcode: string; skuCode?: string; category?: string; brand?: string },
  searchQuery: string
): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;

  const rawQuery = searchQuery.toLowerCase().trim();
  const cleanQuery = cleanSearchString(searchQuery);

  // 1. Direct raw substring match
  if (
    (product.productName && product.productName.toLowerCase().includes(rawQuery)) ||
    (product.barcode && product.barcode.includes(rawQuery)) ||
    (product.skuCode && product.skuCode.toLowerCase().includes(rawQuery))
  ) {
    return true;
  }

  // If query clean version is empty (e.g., user only typed punctuation like "."), raw match above handled it
  if (!cleanQuery) return false;

  // 2. Symbol-tolerant cleaned match (strips dots, =, +, ', -, slashes, spaces, etc.)
  const cleanName = cleanSearchString(product.productName);
  const cleanBarcode = cleanSearchString(product.barcode);
  const cleanSku = cleanSearchString(product.skuCode);

  if (cleanName.includes(cleanQuery)) return true;
  if (cleanBarcode.includes(cleanQuery)) return true;
  if (cleanSku && cleanSku.includes(cleanQuery)) return true;

  return false;
}

export function matchTextSearch(targetText: string | undefined | null, searchQuery: string): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;
  if (!targetText) return false;

  const rawQuery = searchQuery.toLowerCase().trim();
  if (targetText.toLowerCase().includes(rawQuery)) return true;

  const cleanQuery = cleanSearchString(searchQuery);
  if (!cleanQuery) return false;

  const cleanTarget = cleanSearchString(targetText);
  return cleanTarget.includes(cleanQuery);
}
