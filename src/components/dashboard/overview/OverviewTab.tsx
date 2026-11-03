'use client';

import React from 'react';
import MerchantHeaderWidget from './MerchantHeaderWidget';
import OnboardingProgressCard from './OnboardingProgressCard';
import HealthKpiGrid from './HealthKpiGrid';
import ActionRequiredBanner from './ActionRequiredBanner';
import SalesRevenueChart from './SalesRevenueChart';
import RecentOrdersTableWidget from './RecentOrdersTableWidget';
import TopSellingProductsWidget from './TopSellingProductsWidget';
import QuickActionToolbar from './QuickActionToolbar';
import WhatsAppSupportWidget from './WhatsAppSupportWidget';

type OverviewTabProps = {
  domain?: string;
  storeName?: string;
  planName?: string;
  todaySales?: number;
  yesterdaySales?: number;
  pendingOrdersCount?: number;
  totalCustomersCount?: number;
  totalProductsCount?: number;
  onNavigateTab?: (tab: string, sub?: string, subsub?: string) => void;
};

export default function OverviewTab({
  domain = 'test-4',
  storeName = 'আমার অনলাইন শপ',
  planName = 'Starter Plan',
  todaySales = 12450,
  yesterdaySales = 9800,
  pendingOrdersCount = 3,
  totalCustomersCount = 142,
  totalProductsCount = 18,
  onNavigateTab,
}: OverviewTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative pb-12">
      
      {/* 1. Top Quick Action Toolbar, Live BST Clock & CSV Export */}
      <QuickActionToolbar domain={domain} onNavigateTab={onNavigateTab} />

      {/* 2. Header Widget */}
      <MerchantHeaderWidget
        storeName={storeName}
        domain={domain}
        planName={planName}
        storeStatus="live"
      />

      {/* 3. Action Required Banner (Urgent Pending Items) */}
      <ActionRequiredBanner
        pendingOrdersCount={pendingOrdersCount}
        lowStockProductsCount={1}
        onNavigateTab={onNavigateTab}
      />

      {/* 4. Health KPI Cards Grid */}
      <HealthKpiGrid
        todaySales={todaySales}
        yesterdaySales={yesterdaySales}
        pendingOrdersCount={pendingOrdersCount}
        totalCustomersCount={totalCustomersCount}
        totalProductsCount={totalProductsCount}
        onNavigateTab={onNavigateTab}
      />

      {/* 5. Sales & Revenue Analytics Chart */}
      <SalesRevenueChart />

      {/* 6. Recent Activity & Top Selling Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersTableWidget onNavigateTab={onNavigateTab} />
        </div>
        <div>
          <TopSellingProductsWidget />
        </div>
      </div>

      {/* 7. Onboarding Progress Checklist */}
      <OnboardingProgressCard
        hasLogo={true}
        hasProduct={true}
        hasPaymentGateway={true}
        hasFirstOrder={false}
        onNavigateTab={(tab) => onNavigateTab && onNavigateTab(tab)}
      />

      {/* 8. Step 64: WhatsApp Floating Support Widget */}
      <WhatsAppSupportWidget domain={domain} />

    </div>
  );
}