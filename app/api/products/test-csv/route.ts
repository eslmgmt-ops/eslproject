import { NextRequest, NextResponse } from "next/server";

const CSV_HEADERS = [
  "ProductId",
  "TreezUUID",
  "Barcode",
  "Description",
  "Brandname",
  "Group",
  "StandardPrice",
  "SellPrice",
  "Discount",
  "DiscountTitle",
  "Content",
  "Unit",
  "NotUsed",
];

// Mock product data generator
function generateMockProducts(count: number = 50): string[] {
  const products: string[] = [];
  
  const brands = ["Green Valley", "Happy Herbs", "Cloud Nine", "Peak Wellness", "Sunset Farms"];
  const categories = ["Flower", "Edibles", "Concentrates", "Vape", "Pre-Rolls"];
  const units = ["g", "mg", "ml", "EA"];
  
  for (let i = 1; i <= count; i++) {
    const standardPrice = (10 + Math.random() * 90).toFixed(2);
    const hasDiscount = Math.random() > 0.7; // 30% chance of discount
    const discountPercent = hasDiscount ? (10 + Math.random() * 30).toFixed(2) : "";
    const sellPrice = hasDiscount 
      ? (parseFloat(standardPrice) * (1 - parseFloat(discountPercent) / 100)).toFixed(2)
      : standardPrice;
    const discountTitle = hasDiscount ? "Happy Hour Special" : "";
    
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const size = (Math.random() * 10).toFixed(1);
    const unit = units[Math.floor(Math.random() * units.length)];
    
    const row = [
      String(i).padStart(3, "0"),
      `mock-uuid-${i}-${Date.now()}`,
      `123456789${String(i).padStart(4, "0")}`,
      `${brand} ${category} #${i}`,
      brand,
      category,
      standardPrice,
      sellPrice,
      discountPercent,
      discountTitle,
      size,
      unit,
      "",
    ];
    
    products.push(row.map(escapeCSV).join(","));
  }
  
  return products;
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const count = parseInt(searchParams.get("count") || "50", 10);
  const delay = parseInt(searchParams.get("delay") || "0", 10);
  
  // Optional artificial delay for testing
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  const productCount = Math.min(Math.max(1, count), 5000);
  
  console.log(`[Test CSV API] Generating ${productCount} mock products`);
  
  const products = generateMockProducts(productCount);
  const csv = [CSV_HEADERS.join(","), ...products].join("\n");
  
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="test-products.csv"',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
      "Access-Control-Max-Age": "86400",
    },
  });
}
