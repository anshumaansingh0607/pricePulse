import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Bell,
  LogIn,
  Rabbit,
  Shield,
  TrendingDown,
} from "lucide-react";
import AuthButton from "@/components/AuthButton";
import AddProductForm from "@/components/AddProductForm";
import { createClient } from "@/utils/supabase/server";
import { getProducts } from "@/app/actions";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
const products = user ? await getProducts() : [];


  const FEATURES = [
    {
      icon: Rabbit,
      title: "Lightning Fast",
      description:
        "Deal Drop extracts prices in seconds, handling JavaScript and dynamic content",
    },
    {
      icon: Shield,
      title: "Always Reliable",
      description:
        "Works across all major e-commerce sites with built-in anti-bot protection",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description:
        "Get notified instantly when prices drop below your target",
    },
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/pricepulse-logo.png"
              alt="Price Pulse Logo"
              width={100}
              height={100}
              className="h-10 w-auto"
            />
          </div>

          {/* Auth Button */}
          <AuthButton user={user} />
        </div>
      </header>

      {/* HERO */}
      <section className="py-24 px-4 bg-orange-50/40">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
            Made with ❤️ by Anshuman
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Never Miss a Price Drop
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Track prices across top online stores and get notified the moment prices fall.
            Save money effortlessly.
          </p>

          {/* Add Product */}
          <AddProductForm user={user} />

          {/* FEATURES */}
          {products.length === 0 && (
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white p-6 rounded-xl border border-gray-200"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
{user && products.length > 0 && (
  <section className="max-w-7xl mx-auto px-4 pb-20">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-bold text-gray-900">
        {" "}
        Your Tracked Products
      </h3>

      <span className="text-sm text-gray-500">
        {products.length}{" "}
        {products.length === 1 ? "product" : "products"}
      </span>
    </div>
    <div className="grid gap-6 md:grid-cols-2 items-start">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

  </section>
)}

      {/* EMPTY STATE */}
      {user && products.length === 0 && (
        <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12">
            <TrendingDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products yet
            </h3>

            <p className="text-gray-600">
              Add your first product above to start tracking prices!
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
