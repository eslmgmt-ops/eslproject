import { NextRequest, NextResponse } from "next/server";
import { fetchTreezProducts, getTreezProductListId } from "@/lib/treez";

const ALLOWED_ORIGINS = new Set([
  "http://ebs50.local",
  "http://169.254.139.79",
  "http://169.254.139.79/",
]);

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiscountSchedule {
  type: string;           // "DO_NOT" | "WEEK" | "CUSTOM" | "MONTH"
  start_date: string;     // "2025-11-24T00:00"
  end_date: string;       // "2026-01-01T23:59"
  repeat?: string | {
    interval_type?: string;
    days?: string[];
    end?: string | null;
  };
}

interface DiscountCondition {
  discount_condition_type: string;   // "Schedule" | "Fulfillment Type" | "Customer Group" | "Bogo Condition"
  discount_condition_value: string;
  discount_condition_schedule?: DiscountSchedule;
}

interface TreezDiscount {
  discount_id: string;
  discount_title: string;
  discount_method: string;       // "PERCENT" | "DOLLAR" | "BOGO" | "COST"
  discount_amount: number;       // For PERCENT: 40 means 40%
  discount_affinity: string;     // "Pre-Cart" | "Cart"
  discount_stackable: string;
  discount_product_groups: string[];
  discount_condition_detail: DiscountCondition[];
}

// ─── PST Schedule Checker ─────────────────────────────────────────────────────

// All Treez schedules are in PST/PDT (America/Los_Angeles)
function getTimeMinutes(isoLike: string): number {
  const m = isoLike.match(/T(\d{2}):(\d{2})/);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  const d = new Date(isoLike);
  return d.getHours() * 60 + d.getMinutes();
}

function inferWeekdayFromText(text: string | undefined): string | null {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes("monday") || /\bmon\b/.test(t)) return "Monday";
  if (t.includes("tuesday") || /\btue\b/.test(t)) return "Tuesday";
  if (t.includes("wednesday") || /\bwed\b/.test(t)) return "Wednesday";
  if (t.includes("thursday") || /\bthu\b/.test(t)) return "Thursday";
  if (t.includes("friday") || /\bfri\b/.test(t)) return "Friday";
  if (t.includes("saturday") || /\bsat\b/.test(t)) return "Saturday";
  if (t.includes("sunday") || /\bsun\b/.test(t)) return "Sunday";
  return null;
}

const CANONICAL_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Map API values like "Monday", "MON", "WED" to canonical English weekday names. */
function normalizeToFullWeekday(raw: string | undefined | null): string | null {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  for (const d of CANONICAL_WEEKDAYS) {
    if (lower === d.toLowerCase()) return d;
  }
  return inferWeekdayFromText(s);
}

function isDiscountActiveNow(discount: TreezDiscount): boolean {
  // Get current time in PST
  const nowPST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
  const nowDate = nowPST;
  const nowTimeMinutes = nowPST.getHours() * 60 + nowPST.getMinutes();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[nowPST.getDay()];

  const scheduleConditions = discount.discount_condition_detail?.filter(
    (c) => c.discount_condition_type === "Schedule"
  );

  // Business rule: if schedule/start-end is missing, do NOT apply discount.
  if (!scheduleConditions || scheduleConditions.length === 0) return false;

  return scheduleConditions.some((condition) => {
    const schedule = condition.discount_condition_schedule;
    if (!schedule?.start_date || !schedule?.end_date) return false;

    const start = new Date(schedule.start_date); // e.g. "2025-11-24T00:00"
    const end = new Date(schedule.end_date);     // e.g. "2026-01-01T23:59"
    const startTimeMinutes = getTimeMinutes(schedule.start_date);
    const endTimeMinutes = getTimeMinutes(schedule.end_date);

    // DO_NOT repeat — one-time discount with a date range
    // e.g. start: 2025-11-24, end: 2026-01-01 → valid if today is within that range
    if (schedule.type === "DO_NOT") {
      // Compare dates only (ignore time) for multi-day ranges
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const nowDateOnly = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
      return nowDateOnly >= startDateOnly && nowDateOnly <= endDateOnly;
    }

    // WEEK / CUSTOM repeat — check day of week + time window
    if (schedule.type === "WEEK" || schedule.type === "CUSTOM") {
      const repeat = schedule.repeat as { days?: string[]; end?: string | null } | undefined;

      // Check if repeat has ended
      if (repeat?.end) {
        const repeatEnd = new Date(repeat.end);
        if (nowDate > repeatEnd) return false;
      }

      // Check day of week: every entry in repeat.days (CUSTOM can list multiple weekdays).
      const allowedDays: string[] = [];
      if (repeat?.days && Array.isArray(repeat.days) && repeat.days.length > 0) {
        for (const d of repeat.days) {
          const n = normalizeToFullWeekday(d);
          if (n) allowedDays.push(n);
        }
      } else if (typeof schedule.repeat === "string") {
        const n = inferWeekdayFromText(schedule.repeat);
        if (n) allowedDays.push(n);
      }
      if (allowedDays.length === 0) {
        const n = inferWeekdayFromText(condition.discount_condition_value);
        if (n) allowedDays.push(n);
      }
      if (allowedDays.length === 0) return false;
      if (!allowedDays.includes(todayName)) return false;

      // Check time window
      return nowTimeMinutes >= startTimeMinutes && nowTimeMinutes <= endTimeMinutes;
    }

    // MONTH repeat — check time window (simplified)
    if (schedule.type === "MONTH") {
      return nowTimeMinutes >= startTimeMinutes && nowTimeMinutes <= endTimeMinutes;
    }

    return true;
  });
}

// ─── Discount Resolver ────────────────────────────────────────────────────────

// Get the best (highest %) active PERCENT discount for a product
// Uses product.discounts[] directly — no extra API call needed
function getBestActiveDiscount(product: Record<string, unknown>): {
  percent: number;
  title: string;
} | null {
  const discounts = product.discounts as TreezDiscount[] | undefined;
  if (!discounts || discounts.length === 0) return null;

  let best: { percent: number; title: string } | null = null;

  for (const d of discounts) {
    // Phase 1: PERCENT only
    if (d.discount_method !== "PERCENT") continue;

    const amount = Number(d.discount_amount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    // Check if this discount is currently active (PST schedule)
    if (!isDiscountActiveNow(d)) continue;

    // Pick highest % — conflict resolution rule
    if (!best || amount > best.percent) {
      best = { percent: amount, title: d.discount_title };
    }
  }

  return best;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function csvEscape(value: unknown): string {
  const s = value === undefined || value === null ? "" : String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function getBarcodeOrFallback(product: Record<string, unknown>, index: number): string {
  const barcodes = product.product_barcodes as Array<{ sku?: string; barcode?: string }> | undefined;
  const barcode = barcodes?.[0]?.barcode ?? product.barcode;
  if (barcode !== undefined && barcode !== null && String(barcode).trim() !== "") {
    return String(barcode).trim();
  }
  return `${Date.now()}${index + 1}`.slice(-12);
}

function toStandardPrice(product: Record<string, unknown>): number {
  const pricing = product.pricing as {
    price_sell?: number;
    tier_pricing_detail?: Array<{ price_per_value?: number }>;
  } | undefined;
  const raw = pricing?.price_sell ?? pricing?.tier_pricing_detail?.[0]?.price_per_value ?? 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

// ─── CORS Helper ──────────────────────────────────────────────────────────────

function applyCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-API-Key");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function OPTIONS(request: NextRequest) {
  return applyCors(request, new NextResponse(null, { status: 204 }));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get("location") || "FRONT OF HOUSE";
  const format = (searchParams.get("format") || "").toLowerCase();
  const wantsCsv = format === "csv" || request.headers.get("accept")?.includes("text/csv");
  const rawLimit = searchParams.get("limit");
  const parsedLimit = rawLimit ? Number(rawLimit) : undefined;
  const limit =
    parsedLimit !== undefined && Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(Math.floor(parsedLimit), 5000)
      : undefined;

  try {
    // API Key Security (optional but recommended)
    const apiKey = process.env.OPTICON_API_KEY;
    if (apiKey) {
      const requestApiKey = request.headers.get("x-api-key") || 
                           request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
                           searchParams.get("api_key");
      
      if (!requestApiKey || requestApiKey !== apiKey) {
        console.warn(`[Location API] Unauthorized access attempt from ${request.headers.get("x-forwarded-for") || "unknown"}`);
        return applyCors(request, NextResponse.json(
          { error: "Unauthorized: Invalid or missing API key" },
          { status: 401 }
        ));
      }
    }

    console.log(`[Location API] Fetching products for location: ${location}`);

    if (wantsCsv) {
      // Stream CSV to avoid memory issues with large datasets
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          const startTime = Date.now();
          
          try {
            // Send CSV headers first
            controller.enqueue(encoder.encode(CSV_HEADERS.join(",") + "\n"));
            
            let page = 1;
            let totalProducts = 0;
            let totalDiscounts = 0;
            let hasMore = true;
            const pageSize = limit ? Math.min(limit, 500) : 500; // Adjust batch size for limits
            
            console.log(`[Location API] Starting stream - pageSize: ${pageSize}, limit: ${limit || 'none'}`);
            
            while (hasMore && (!limit || totalProducts < limit)) {
              console.log(`[Location API] Fetching page ${page} (batch size: ${pageSize})`);
              
              const fetchedProducts = await fetchTreezProducts({
                active: "ALL",
                above_threshold: true,
                sellable_quantity_in_location: location,
                include_discounts: true,
                page_size: pageSize,
                page: page,
              });
              
              if (fetchedProducts.length === 0) {
                hasMore = false;
                break;
              }
              
              // Process and stream each product
              for (let i = 0; i < fetchedProducts.length; i++) {
                if (limit && totalProducts >= limit) {
                  hasMore = false;
                  break;
                }
                
                const product = fetchedProducts[i] as Record<string, unknown>;
                const cfg = product.product_configurable_fields as Record<string, unknown> | undefined;
                const treezUuid = getTreezProductListId(product as any);
                const standardPriceNum = toStandardPrice(product);
                const standardPrice = standardPriceNum.toFixed(2);
                
                let sellPrice = standardPrice;
                let discount = "";
                let discountTitle = "";
                
                const bestDiscount = getBestActiveDiscount(product);
                if (bestDiscount) {
                  const salePrice = Math.max(0, standardPriceNum * (1 - bestDiscount.percent / 100));
                  sellPrice = salePrice.toFixed(2);
                  discount = bestDiscount.percent.toFixed(2);
                  discountTitle = bestDiscount.title;
                  totalDiscounts++;
                } else {
                  const pricing = product.pricing as {
                    discounted_price?: number;
                    discount_percent?: number;
                  } | undefined;
                  
                  if (pricing?.discounted_price !== undefined && pricing.discounted_price !== null) {
                    const n = Number(pricing.discounted_price);
                    if (Number.isFinite(n) && n > 0 && n < standardPriceNum) {
                      sellPrice = n.toFixed(2);
                      discount = pricing.discount_percent
                        ? Number(pricing.discount_percent).toFixed(2)
                        : "";
                      discountTitle = "Product-Level Discount";
                    }
                  }
                }
                
                const row = [
                  String(totalProducts + 1).padStart(3, "0"),
                  treezUuid,
                  getBarcodeOrFallback(product, totalProducts),
                  String(cfg?.name ?? product.name ?? product.productName ?? ""),
                  String(cfg?.brand ?? product.brand ?? product.brandName ?? ""),
                  String(product.category_type ?? product.category ?? product.categoryName ?? ""),
                  standardPrice,
                  sellPrice,
                  discount,
                  discountTitle,
                  String(cfg?.size ?? ""),
                  String(cfg?.size_unit ?? "EA"),
                  "",
                ].map(csvEscape);
                
                controller.enqueue(encoder.encode(row.join(",") + "\n"));
                totalProducts++;
              }
              
              // Check if we got fewer products than requested (last page)
              if (fetchedProducts.length < pageSize) {
                hasMore = false;
              }
              
              page++;
              
              // Safety check
              if (page > 100) {
                console.warn(`[Location API] Stopped at page 100 for safety`);
                hasMore = false;
              }
            }
            
            const elapsed = Date.now() - startTime;
            console.log(`[Location API] ✓ Streamed ${totalProducts} products, ${totalDiscounts} with active discounts in ${elapsed}ms`);
            controller.close();
          } catch (error: any) {
            console.error("[Location API] Stream error:", error);
            controller.error(error);
          }
        },
      });
      
      const response = new NextResponse(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `inline; filename="treez-${location.replace(/\s+/g, "-").toLowerCase()}.csv"`,
          "Transfer-Encoding": "chunked",
        },
      });
      
      return applyCors(request, response);
    }

    // JSON response - keep original behavior with memory-safe limit
    const treezPageSize = limit !== undefined ? Math.max(limit, 100) : 500;
    const fetchedProducts = await fetchTreezProducts({
      active: "ALL",
      above_threshold: true,
      sellable_quantity_in_location: location,
      include_discounts: true,
      page_size: treezPageSize,
      page: 1,
    });
    const products = limit ? fetchedProducts.slice(0, limit) : fetchedProducts.slice(0, 500);

    const discountCount = products.filter(
      (p) => getBestActiveDiscount(p as Record<string, unknown>) !== null
    ).length;

    console.log(`[Location API] Fetched ${products.length} products, ${discountCount} with active discounts`);

    const enrichedProducts = products.map((product: Record<string, unknown>) => {
      const standardPriceNum = toStandardPrice(product);
      const bestDiscount = getBestActiveDiscount(product);
      return {
        ...product,
        resolved_discount: bestDiscount
          ? {
              discount_title: bestDiscount.title,
              discount_percent: bestDiscount.percent,
              standard_price: standardPriceNum,
              sale_price: parseFloat(
                Math.max(0, standardPriceNum * (1 - bestDiscount.percent / 100)).toFixed(2)
              ),
            }
          : null,
      };
    });

    return applyCors(request, NextResponse.json({
      success: true,
      location,
      limit: limit ?? null,
      total: enrichedProducts.length,
      discounts_applied: discountCount,
      products: enrichedProducts,
    }));

  } catch (error: any) {
    console.error("[Location API] Error:", error);
    if (wantsCsv) {
      return applyCors(request, new NextResponse(`${CSV_HEADERS.join(",")}\n`, {
        status: 200,
        headers: { "Content-Type": "text/csv; charset=utf-8" },
      }));
    }
    return applyCors(request, NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    ));
  }
}
