import { useQuery } from "@tanstack/react-query";
import { RiskScore } from "@shared/schema";
import { DashboardAnalytics } from "@/types/api";

export function useRiskScores() {
  return useQuery<RiskScore[]>({
    queryKey: ["/api/risk-scores/latest"],
  });
}

export function useAccountRiskHistory(accountId: number) {
  return useQuery<RiskScore[]>({
    queryKey: [`/api/accounts/${accountId}/risk-scores`],
    enabled: !!accountId,
  });
}

export function useDashboardAnalytics() {
  return useQuery<DashboardAnalytics>({
    queryKey: ["/api/accounts"],
    queryFn: async () => {
      const response = await fetch('/api/accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const accounts = await response.json();
      
      // Calculate analytics from accounts data (same logic as our clean backend)
      return {
        totalAccounts: accounts.length,
        highRiskCount: accounts.filter((acc: any) => acc.risk_level === 'high').length,
        mediumRiskCount: accounts.filter((acc: any) => acc.risk_level === 'medium').length,
        lowRiskCount: accounts.filter((acc: any) => acc.risk_level === 'low').length,
        totalRevenue: accounts.reduce((sum: number, acc: any) => sum + (acc.total_spend || 0), 0),
      };
    },
  });
}
