import { Product } from './ProductList';

// Helper to escape values safely for CSV (RFC 4180)
const escapeCSVCell = (val: any): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

// Robust Line Splitter that handles quotes and commas/semicolons
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

// Clean Header Key (Removes spaces, underscores, dashes, quotes, and converts to lowercase)
const normalizeHeaderKey = (key: string): string => {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// 1. EXPORT ENGINE: Uses 'Product_ID' instead of 'ID' to prevent Excel SYLK error
export const exportProductsToCSV = (products: Product[]) => {
  const headers = [
    'Product_ID',        // FIXED: 'Product_ID' instead of 'ID' prevents SYLK error in Excel!
    'Numeric_ID',
    'Product_Name',
    'Slug',
    'Product_Type',
    'SKU',
    'Regular_Price',
    'Sale_Price',
    'Stock_Quantity',
    'Stock_Status',
    'Categories',
    'Brand',
    'Tags',
    'Featured_Image',
    'Gallery_Images',
    'Video_URLs',
    'Short_Description',
    'Description',
    'Status',
    'Created_At',
  ];

  const rows = products.map((p: any, idx) => {
    const numericId = p.numericId || p.id?.replace(/[^0-9]/g, '') || (101 + idx);
    const categoriesStr = Array.isArray(p.categories) ? p.categories.join(' | ') : p.categories || '';
    const tagsStr = Array.isArray(p.tags) ? p.tags.join(' | ') : p.tags || '';
    const galleryStr = Array.isArray(p.images) ? p.images.join(' | ') : p.galleryImages || '';
    const videoStr = Array.isArray(p.videoUrls) ? p.videoUrls.join(' | ') : p.videoUrl || '';

    return [
      escapeCSVCell(p.id || `prod-${numericId}`),
      escapeCSVCell(numericId),
      escapeCSVCell(p.name || p.title || 'Untitled Product'),
      escapeCSVCell(p.slug || ''),
      escapeCSVCell(p.type || 'simple'),
      escapeCSVCell(p.sku || ''),
      escapeCSVCell(p.regularPrice ?? p.price ?? 0),
      escapeCSVCell(p.salePrice ?? ''),
      escapeCSVCell(p.stockQuantity ?? 10),
      escapeCSVCell(p.stockStatus || 'instock'),
      escapeCSVCell(categoriesStr),
      escapeCSVCell(p.brand || ''),
      escapeCSVCell(tagsStr),
      escapeCSVCell(p.featuredImage || p.productImage || ''),
      escapeCSVCell(galleryStr),
      escapeCSVCell(videoStr),
      escapeCSVCell(p.shortDescription || ''),
      escapeCSVCell(p.description || ''),
      escapeCSVCell(p.status || 'published'),
      escapeCSVCell(p.createdAt || new Date().toISOString()),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `products-catalog-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 2. IMPORT ENGINE: Smart Flexible Header Matching (Matches 'Regular price', 'regular_price', 'Price', etc.)
export const parseCSVToProducts = (csvText: string): Product[] => {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const rawHeaders = parseCSVLine(lines[0]);
  const headerMap: Record<string, number> = {};

  rawHeaders.forEach((h, idx) => {
    const cleanKey = normalizeHeaderKey(h);
    headerMap[cleanKey] = idx;
  });

  // Helper to find column index by multiple possible aliases
  const getIndex = (aliases: string[]): number => {
    for (const alias of aliases) {
      const norm = normalizeHeaderKey(alias);
      if (headerMap[norm] !== undefined) {
        return headerMap[norm];
      }
    }
    return -1;
  };

  const idIdx = getIndex(['productid', 'id', 'numericid']);
  const nameIdx = getIndex(['productname', 'name', 'title']);
  const skuIdx = getIndex(['sku']);
  const typeIdx = getIndex(['producttype', 'type']);
  const regPriceIdx = getIndex(['regularprice', 'price', 'regular_price']);
  const salePriceIdx = getIndex(['saleprice', 'sale_price']);
  const stockQtyIdx = getIndex(['stockquantity', 'stock', 'stock_quantity']);
  const stockStatusIdx = getIndex(['stockstatus', 'instock', 'stock_status']);
  const catIdx = getIndex(['categories', 'category']);
  const tagIdx = getIndex(['tags', 'tag']);
  const brandIdx = getIndex(['brand', 'brands']);
  const imgIdx = getIndex(['featuredimage', 'image', 'productimage', 'featured_image']);
  const galleryIdx = getIndex(['galleryimages', 'images']);
  const videoIdx = getIndex(['videourls', 'video_url', 'videourl']);
  const shortDescIdx = getIndex(['shortdescription', 'short_description']);
  const descIdx = getIndex(['description']);
  const statusIdx = getIndex(['status', 'published']);

  const parsedProducts: Product[] = [];
  let fallbackId = Date.now();

  for (let i = 1; i < lines.length; i++) {
    const rowCells = parseCSVLine(lines[i]);
    if (rowCells.length < 1) continue;

    const getVal = (idx: number) => (idx !== -1 && idx < rowCells.length ? rowCells[idx].replace(/^"|"\$/g, '').replace(/""/g, '"').trim() : '');

    fallbackId += 1;
    const rawId = getVal(idIdx);
    const numericId = Number(rawId.replace(/[^0-9]/g, '')) || fallbackId;
    const name = getVal(nameIdx) || `Imported Product #${numericId}`;
    const regPrice = Number(getVal(regPriceIdx)) || 0;
    const saleVal = getVal(salePriceIdx);
    const salePrice = saleVal ? Number(saleVal) : undefined;
    const stockQty = Number(getVal(stockQtyIdx)) || 10;

    const rawCats = getVal(catIdx);
    const categories = rawCats ? rawCats.split(/\||,/).map((c) => c.trim()).filter(Boolean) : ['Uncategorized'];

    const rawTags = getVal(tagIdx);
    const tags = rawTags ? rawTags.split(/\||,/).map((t) => t.trim()).filter(Boolean) : [];

    const rawGallery = getVal(galleryIdx);
    const galleryImages = rawGallery ? rawGallery.split('|').map((g) => g.trim()).filter(Boolean) : [];

    parsedProducts.push({
      id: rawId || `prod-${numericId}`,
      numericId,
      name,
      title: name,
      type: (getVal(typeIdx) || 'simple') as any,
      sku: getVal(skuIdx),
      regularPrice: regPrice,
      salePrice,
      stockQuantity: stockQty,
      stockStatus: (getVal(stockStatusIdx) || (stockQty > 0 ? 'instock' : 'outofstock')) as any,
      categories,
      tags,
      brand: getVal(brandIdx),
      featuredImage: getVal(imgIdx),
      images: galleryImages,
      videoUrl: getVal(videoIdx),
      shortDescription: getVal(shortDescIdx),
      description: getVal(descIdx),
      status: (getVal(statusIdx) || 'published') as any,
      createdAt: new Date().toISOString(),
    });
  }

  return parsedProducts;
};
