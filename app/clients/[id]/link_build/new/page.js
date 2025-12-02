"use client";

import LinkBuildOrderPage from "../[orderId]/page";

// This page reuses the same component as [orderId]/page.js
// The orderId="new" is handled by the component to show create mode
export default function NewLinkBuildOrderPage() {
  return <LinkBuildOrderPage />;
}
