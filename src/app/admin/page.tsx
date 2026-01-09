"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardTab from "@/components/admin/DashboardTab";
import InquiriesTab from "@/components/admin/InquiriesTab";
import UsersTab from "@/components/admin/UsersTab";
import EmployeesTab from "@/components/admin/EmployeesTab";
import ProductsTab from "@/components/admin/ProductsTab";
import StockTab from "@/components/admin/StockTab";
import PaymentsTab from "@/components/admin/PaymentsTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import InvoiceTab from "@/components/admin/InvoiceTab";

export default function AdminPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const tab = searchParams?.get("tab") || "dashboard";
    setActiveTab(tab);
  }, [searchParams]);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "inquiries":
        return <InquiriesTab />;
      case "users":
        return <UsersTab />;
      case "employees":
        return <EmployeesTab />;
      case "products":
        return <ProductsTab />;
      case "stock":
        return <StockTab />;
      case "payments":
        return <PaymentsTab />;
      case "invoices":
        return <InvoiceTab />;
      case "analytics":
        return <AnalyticsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return <div className="max-w-7xl mx-auto">{renderTab()}</div>;
}
