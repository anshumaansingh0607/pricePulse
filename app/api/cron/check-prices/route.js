import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeProduct } from "@/lib/firecrawl";

export async function GET() {
  return NextResponse.json({
    message: "Price check endpoint is working. Use POST to trigger.",
  });
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*");

    if (productsError) throw productsError;

    // --- ADDED ERROR LOGGING HERE ---
    const results = {
      total: products.length,
      updated: 0,
      failed: 0,
      priceChanges: 0,
      alertsSent: 0,
      errors: [] // This will store the reason for failure
    };

    for (const product of products) {
      try {
        console.log(`Checking product: ${product.url}`);
        const productData = await scrapeProduct(product.url);

        // CHECK 1: Did scraping work?
        if (!productData) {
           results.failed++;
           results.errors.push(`Scraper returned null for ${product.id}`);
           continue;
        }

        // CHECK 2: Is price missing?
        if (!productData.currentPrice) {
          results.failed++;
          results.errors.push(`Price missing. Data found: ${JSON.stringify(productData)}`);
          continue;
        }

        const newPrice = parseFloat(productData.currentPrice);
        const oldPrice = parseFloat(product.current_price);

        await supabase.from("products").update({
          current_price: newPrice,
          currency: productData.currencyCode || product.currency,
          name: productData.productName || product.name,
          image_url: productData.productImageUrl || product.image_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

        if (oldPrice !== newPrice) {
          await supabase.from("price_history").insert({
            product_id: product.id,
            price: newPrice,
            currency: productData.currencyCode || product.currency,
          });

          results.priceChanges++;
          
          // CHECK 3: Price Drop Logic
          if (newPrice < oldPrice) {
            const { data: { user } } = await supabase.auth.admin.getUserById(product.user_id);

            if (user?.email) {
              const emailResult = await sendPriceDropAlert(
                user.email,
                product,
                oldPrice,
                newPrice
              );
              if (emailResult.success) {
                results.alertsSent++;
              } else {
                 results.errors.push(`Email failed: ${JSON.stringify(emailResult.error)}`);
              }
            } else {
               results.errors.push(`User email not found for user_id: ${product.user_id}`);
            }
          }
        }
        results.updated++;

      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        results.failed++;
        // CAPTURE THE CRASH REASON
        results.errors.push(`Crash on product ${product.id}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Price check completed",
      results,
    });

  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}