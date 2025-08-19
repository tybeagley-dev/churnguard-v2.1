import { BigQuery } from '@google-cloud/bigquery';

export class BigQueryDataService {
  private client: BigQuery | null = null;
  private isDemo: boolean;

  constructor() {
    this.isDemo = process.env.DEMO_MODE === 'true';
    
    if (!this.isDemo) {
      let credentials: any = undefined;
      
      // Support both service account file and environment variables
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        try {
          credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        } catch (error) {
          console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS:', error);
        }
      } else if (process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
        // Build credentials from individual env vars
        credentials = {
          type: 'service_account',
          project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
          private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
          private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
          client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: process.env.GOOGLE_CLOUD_CLIENT_X509_CERT_URL
        };
      }
      
      try {
        this.client = new BigQuery({
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'data-warehouse-432614',
          credentials: credentials,
        });
        console.log('✅ BigQuery client initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize BigQuery client:', error);
        console.log('🔄 Falling back to demo mode');
        this.isDemo = true;
      }
    } else {
      console.log('🎭 Running in demo mode - using mock data');
    }
  }

  async executeQuery(query: string): Promise<any[]> {
    if (this.isDemo || !this.client) {
      console.log('🎭 Demo mode: Returning mock data instead of executing query');
      return this.getMockDataForQuery(query);
    }

    try {
      console.log('Executing BigQuery query...');
      const [job] = await this.client.createQueryJob({
        query,
        location: 'US',
        jobTimeoutMs: 30000,
      });
      
      const [rows] = await job.getQueryResults();
      console.log(`Query completed successfully, returned ${rows.length} rows`);
      return rows;
    } catch (error) {
      console.error('BigQuery error:', error);
      throw new Error(`BigQuery execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getMockDataForQuery(query: string): any[] {
    // Return appropriate mock data based on query pattern
    if (query.includes('account_metrics') || query.includes('accounts.accounts')) {
      return this.getMockAccountData();
    } else if (query.includes('historical') || query.includes('monthly_data')) {
      return this.getMockHistoricalData();
    } else if (query.includes('monthly_risk') || query.includes('trends')) {
      return this.getMockTrendsData();
    } else if (query.includes('account_weekly_rollup') && query.includes('accountId')) {
      return this.getMockAccountHistory();
    }
    return [];
  }

  private getMockAccountData(): any[] {
    return [
      {
        account_id: 'acc_001',
        account_name: 'Burger Palace Downtown',
        csm_owner: 'Sarah Chen',
        status: 'LAUNCHED',
        total_spend: 24500,
        spend_delta: 8,
        total_texts_delivered: 15680,
        texts_delta: 12,
        coupons_redeemed: 1250,
        redemptions_delta: -3,
        active_subs_cnt: 2890,
        risk_level: 'low'
      },
      {
        account_id: 'acc_002',
        account_name: 'Pizza Corner Express',
        csm_owner: 'Mike Rodriguez',
        status: 'LAUNCHED',
        total_spend: 18200,
        spend_delta: -5,
        total_texts_delivered: 12450,
        texts_delta: 3,
        coupons_redeemed: 890,
        redemptions_delta: 16,
        active_subs_cnt: 2156,
        risk_level: 'medium'
      },
      {
        account_id: 'acc_003',
        account_name: 'Taco Fiesta Chain',
        csm_owner: 'Jessica Park',
        status: 'PAUSED',
        total_spend: 8900,
        spend_delta: -22,
        total_texts_delivered: 5230,
        texts_delta: -19,
        coupons_redeemed: 234,
        redemptions_delta: -45,
        active_subs_cnt: 1078,
        risk_level: 'high'
      },
      {
        account_id: 'acc_004',
        account_name: 'Healthy Bowls Co',
        csm_owner: 'David Kim',
        status: 'LAUNCHED',
        total_spend: 31200,
        spend_delta: 19,
        total_texts_delivered: 22100,
        texts_delta: 25,
        coupons_redeemed: 1890,
        redemptions_delta: 28,
        active_subs_cnt: 4250,
        risk_level: 'low'
      },
      {
        account_id: 'acc_005',
        account_name: 'Coffee Bean Central',
        csm_owner: 'Lisa Wong',
        status: 'LAUNCHED',
        total_spend: 14600,
        spend_delta: 3,
        total_texts_delivered: 9870,
        texts_delta: -1,
        coupons_redeemed: 567,
        redemptions_delta: 8,
        active_subs_cnt: 1845,
        risk_level: 'medium'
      }
    ];
  }

  private getMockHistoricalData(): any[] {
    return [
      { month: '2024-01', monthLabel: 'January 2024', spendAdjusted: 2.8, totalAccounts: 145, totalRedemptions: 89, totalSubscribers: 12.4, totalTextsSent: 45 },
      { month: '2024-02', monthLabel: 'February 2024', spendAdjusted: 3.1, totalAccounts: 152, totalRedemptions: 94, totalSubscribers: 13.1, totalTextsSent: 48 },
      { month: '2024-03', monthLabel: 'March 2024', spendAdjusted: 2.9, totalAccounts: 148, totalRedemptions: 87, totalSubscribers: 12.8, totalTextsSent: 44 },
      { month: '2024-04', monthLabel: 'April 2024', spendAdjusted: 3.4, totalAccounts: 159, totalRedemptions: 102, totalSubscribers: 14.2, totalTextsSent: 52 },
      { month: '2024-05', monthLabel: 'May 2024', spendAdjusted: 3.2, totalAccounts: 156, totalRedemptions: 98, totalSubscribers: 13.7, totalTextsSent: 49 },
      { month: '2024-06', monthLabel: 'June 2024', spendAdjusted: 3.6, totalAccounts: 163, totalRedemptions: 108, totalSubscribers: 15.1, totalTextsSent: 55 },
      { month: '2024-07', monthLabel: 'July 2024', spendAdjusted: 3.8, totalAccounts: 167, totalRedemptions: 112, totalSubscribers: 15.8, totalTextsSent: 58 },
      { month: '2024-08', monthLabel: 'August 2024', spendAdjusted: 3.5, totalAccounts: 161, totalRedemptions: 105, totalSubscribers: 14.9, totalTextsSent: 54 },
      { month: '2024-09', monthLabel: 'September 2024', spendAdjusted: 3.9, totalAccounts: 171, totalRedemptions: 118, totalSubscribers: 16.2, totalTextsSent: 61 },
      { month: '2024-10', monthLabel: 'October 2024', spendAdjusted: 4.1, totalAccounts: 175, totalRedemptions: 125, totalSubscribers: 17.1, totalTextsSent: 64 },
      { month: '2024-11', monthLabel: 'November 2024', spendAdjusted: 3.7, totalAccounts: 165, totalRedemptions: 115, totalSubscribers: 15.6, totalTextsSent: 57 },
      { month: '2024-12', monthLabel: 'December 2024', spendAdjusted: 4.3, totalAccounts: 182, totalRedemptions: 135, totalSubscribers: 18.4, totalTextsSent: 68 }
    ];
  }

  private getMockTrendsData(): any[] {
    return [
      { month: 'January 2024', highRisk: 23, mediumRisk: 45, lowRisk: 77, total: 145 },
      { month: 'February 2024', highRisk: 19, mediumRisk: 48, lowRisk: 85, total: 152 },
      { month: 'March 2024', highRisk: 26, mediumRisk: 42, lowRisk: 80, total: 148 },
      { month: 'April 2024', highRisk: 21, mediumRisk: 52, lowRisk: 86, total: 159 },
      { month: 'May 2024', highRisk: 18, mediumRisk: 49, lowRisk: 89, total: 156 },
      { month: 'June 2024', highRisk: 24, mediumRisk: 55, lowRisk: 84, total: 163 }
    ];
  }

  private getMockAccountHistory(): any[] {
    return [
      { week_yr: '2024W32', week_label: '2024-08-05', total_spend: 2150, total_texts_delivered: 1890, coupons_redeemed: 145, active_subs_cnt: 2890 },
      { week_yr: '2024W31', week_label: '2024-07-29', total_spend: 2080, total_texts_delivered: 1820, coupons_redeemed: 138, active_subs_cnt: 2875 },
      { week_yr: '2024W30', week_label: '2024-07-22', total_spend: 2220, total_texts_delivered: 1950, coupons_redeemed: 152, active_subs_cnt: 2910 },
      { week_yr: '2024W29', week_label: '2024-07-15', total_spend: 1980, total_texts_delivered: 1780, coupons_redeemed: 142, active_subs_cnt: 2860 },
      { week_yr: '2024W28', week_label: '2024-07-08', total_spend: 2350, total_texts_delivered: 2100, coupons_redeemed: 168, active_subs_cnt: 2920 },
      { week_yr: '2024W27', week_label: '2024-07-01', total_spend: 2190, total_texts_delivered: 1890, coupons_redeemed: 155, active_subs_cnt: 2895 },
      { week_yr: '2024W26', week_label: '2024-06-24', total_spend: 2050, total_texts_delivered: 1750, coupons_redeemed: 128, active_subs_cnt: 2870 },
      { week_yr: '2024W25', week_label: '2024-06-17', total_spend: 2280, total_texts_delivered: 2000, coupons_redeemed: 160, active_subs_cnt: 2905 },
      { week_yr: '2024W24', week_label: '2024-06-10', total_spend: 2120, total_texts_delivered: 1850, coupons_redeemed: 142, active_subs_cnt: 2880 },
      { week_yr: '2024W23', week_label: '2024-06-03', total_spend: 2400, total_texts_delivered: 2150, coupons_redeemed: 175, active_subs_cnt: 2935 },
      { week_yr: '2024W22', week_label: '2024-05-27', total_spend: 2180, total_texts_delivered: 1920, coupons_redeemed: 148, active_subs_cnt: 2890 },
      { week_yr: '2024W21', week_label: '2024-05-20', total_spend: 2090, total_texts_delivered: 1800, coupons_redeemed: 135, active_subs_cnt: 2865 }
    ];
  }

  // Get account data for dashboard table
  async getAccountData(): Promise<any[]> {
    const query = `
      WITH account_metrics AS (
        SELECT 
          a.id as account_id,
          a.name as account_name,
          a.status,
          COALESCE(u.name, 'Unassigned') as csm_owner,
          a.hubspotid as hubspot_id,
          
          -- Current week metrics
          COALESCE(w.total_spend, 0) as total_spend,
          COALESCE(t.total_texts_delivered, 0) as total_texts_delivered,
          COALESCE(c.coupons_redeemed, 0) as coupons_redeemed,
          COALESCE(s.active_subs_cnt, 0) as active_subs_cnt,
          
          -- Risk indicators
          CASE 
            WHEN w.total_spend < 100 THEN 'high'
            WHEN w.total_spend < 500 THEN 'medium'
            ELSE 'low'
          END as risk_level,
          
          -- Mock delta values for now
          ROUND(RAND() * 100 - 50) as spend_delta,
          ROUND(RAND() * 20 - 10) as texts_delta,
          ROUND(RAND() * 10 - 5) as redemptions_delta
          
        FROM dbt_models.accounts a
        LEFT JOIN (SELECT 'Unassigned' as name) u ON TRUE
        LEFT JOIN (
          -- Get current week aggregated revenue data
          SELECT 
            account_id,
            SUM(total) as total_spend
          FROM dbt_models.total_revenue_by_account_and_date 
          WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
          GROUP BY account_id
        ) w ON w.account_id = a.id
        LEFT JOIN (
          -- Get current week text data via units table
          SELECT 
            u.account_id,
            COUNT(DISTINCT t.id) as total_texts_delivered
          FROM public.texts t
          JOIN units.units u ON u.id = t.unit_id
          WHERE t.direction = 'OUTGOING' AND t.status = 'DELIVERED'
            AND DATE(t.created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
          GROUP BY u.account_id
        ) t ON t.account_id = a.id
        LEFT JOIN (
          -- Get current week coupon redemptions
          SELECT 
            u.account_id,
            COUNT(DISTINCT c.id) as coupons_redeemed
          FROM promos.coupons c
          JOIN units.units u ON u.id = c.unit_id
          WHERE c.is_redeemed = TRUE
            AND DATE(c.redeemed_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
          GROUP BY u.account_id
        ) c ON c.account_id = a.id
        LEFT JOIN (
          -- Get current active subscriber count
          SELECT 
            u.account_id,
            COUNT(DISTINCT s.id) as active_subs_cnt
          FROM public.subscriptions s
          JOIN units.units u ON s.channel_id = u.id
          WHERE s.deactivated_at IS NULL OR DATE(s.deactivated_at) >= CURRENT_DATE()
          GROUP BY u.account_id
        ) s ON s.account_id = a.id
        
        WHERE a.launchedat IS NOT NULL
          AND a.status IN ('LAUNCHED', 'PAUSED')
        ORDER BY a.name
        LIMIT 100
      )
      SELECT * FROM account_metrics
    `;
    
    return this.executeQuery(query);
  }

  // Get 12-week historical data for account modal
  async getAccountHistory(accountId: string): Promise<any[]> {
    if (this.isDemo || !this.client) {
      console.log(`🎭 Demo mode: Returning mock account history for ${accountId}`);
      return this.getMockAccountHistory();
    }

    const query = `
      SELECT 
        CONCAT(EXTRACT(YEAR FROM date), 'W', FORMAT('%02d', EXTRACT(WEEK FROM date))) as week_yr,
        FORMAT_DATE('%Y-%m-%d', date) as week_label,
        COALESCE(total, 0) as total_spend,
        0 as total_texts_delivered,
        0 as coupons_redeemed,
        0 as active_subs_cnt
      FROM dbt_models.total_revenue_by_account_and_date
      WHERE account_id = @accountId
        AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 * 7 DAY)
      ORDER BY date DESC
      LIMIT 12
    `;
    
    const options = {
      query,
      location: 'US',
      params: { accountId },
    };
    
    const [job] = await this.client.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    return rows;
  }

  // Get historical performance data for dashboard charts
  async getHistoricalPerformance(): Promise<any[]> {
    const query = `
      WITH monthly_revenue AS (
        SELECT 
          FORMAT_DATE('%Y-%m', DATE_TRUNC(date, MONTH)) as month,
          FORMAT_DATE('%B %Y', DATE_TRUNC(date, MONTH)) as monthLabel,
          SUM(total) as spendAdjusted,
          COUNT(DISTINCT account_id) as totalAccounts
        FROM dbt_models.total_revenue_by_account_and_date
        WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 * 30 DAY)
        GROUP BY 1, 2
      ),
      monthly_texts AS (
        SELECT 
          FORMAT_DATE('%Y-%m', DATE_TRUNC(DATE(t.created_at), MONTH)) as month,
          COUNT(DISTINCT t.id) as totalTextsSent
        FROM public.texts t
        JOIN units.units u ON u.id = t.unit_id
        WHERE t.direction = 'OUTGOING' AND t.status = 'DELIVERED'
          AND DATE(t.created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 * 30 DAY)
        GROUP BY 1
      ),
      monthly_redemptions AS (
        SELECT 
          FORMAT_DATE('%Y-%m', DATE_TRUNC(DATE(c.redeemed_at), MONTH)) as month,
          COUNT(DISTINCT c.id) as totalRedemptions
        FROM promos.coupons c
        JOIN units.units u ON u.id = c.unit_id
        WHERE c.is_redeemed = TRUE
          AND DATE(c.redeemed_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 * 30 DAY)
        GROUP BY 1
      )
      SELECT 
        r.month,
        r.monthLabel,
        ROUND(r.spendAdjusted / 1000000, 1) as spendAdjusted,
        r.totalAccounts,
        COALESCE(rd.totalRedemptions, 0) as totalRedemptions,
        0 as totalSubscribers, -- Subscriber historical data requires more complex query
        COALESCE(t.totalTextsSent, 0) as totalTextsSent
      FROM monthly_revenue r
      LEFT JOIN monthly_texts t ON r.month = t.month
      LEFT JOIN monthly_redemptions rd ON r.month = rd.month
      ORDER BY r.month
      LIMIT 12
    `;
    
    return this.executeQuery(query);
  }

  // Get monthly trends for risk level bar chart
  async getMonthlyTrends(): Promise<any[]> {
    const query = `
      WITH monthly_risk AS (
        SELECT 
          FORMAT_DATE('%B %Y', DATE_TRUNC(date, MONTH)) as month,
          account_id,
          AVG(total) as avg_spend,
          
          CASE 
            WHEN AVG(total) < 100 THEN 'highRisk'
            WHEN AVG(total) < 500 THEN 'mediumRisk'
            ELSE 'lowRisk'
          END as risk_category
          
        FROM dbt_models.total_revenue_by_account_and_date
        WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 * 30 DAY)
        GROUP BY 1, 2
      )
      SELECT 
        month,
        SUM(CASE WHEN risk_category = 'highRisk' THEN 1 ELSE 0 END) as highRisk,
        SUM(CASE WHEN risk_category = 'mediumRisk' THEN 1 ELSE 0 END) as mediumRisk,
        SUM(CASE WHEN risk_category = 'lowRisk' THEN 1 ELSE 0 END) as lowRisk,
        COUNT(*) as total
      FROM monthly_risk
      GROUP BY month
      ORDER BY month
      LIMIT 6
    `;
    
    return this.executeQuery(query);
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (this.isDemo || !this.client) {
      return {
        success: true,
        message: 'Demo mode: Connection test successful (using mock data)'
      };
    }

    try {
      const testQuery = `SELECT 'connection_test' as status, CURRENT_TIMESTAMP() as timestamp`;
      const result = await this.executeQuery(testQuery);
      return {
        success: true,
        message: `BigQuery connection successful. Test result: ${JSON.stringify(result[0])}`
      };
    } catch (error) {
      return {
        success: false,
        message: `BigQuery connection failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

export const bigQueryDataService = new BigQueryDataService();