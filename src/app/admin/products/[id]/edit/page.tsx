"use client";

import { use } from "react";
import { ProductForm } from "@/components/admin/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminProductEditPage({ params }: Props) {
  const resolvedParams = use(params);
  return (
    <div className="p-4 md:p-8">
      <ProductForm productId={resolvedParams.id} />
    </div>
  );
}
