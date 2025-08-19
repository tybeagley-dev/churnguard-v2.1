# ChurnGuard 2.1

ChurnGuard 2.1 combines the best of both worlds:
- **Frontend**: Proven ChurnGuard 2.0 interface with working CSM dropdowns, risk calculations, and toggles
- **Backend**: Clean ChurnGuard 3.0 architecture with single `BigQueryDataService`
- **Data**: Complete integration with BigQuery for texts, coupons, subscribers, and revenue

## Architecture

### Clean Backend
- Single `BigQueryDataService` (no more 6 messy services)
- Simple route handling with all necessary API endpoints
- Direct BigQuery integration with proper table joins

### Proven Frontend
- Battle-tested ChurnGuard 2.0 React components
- Working dashboard with all features
- Proper authentication and navigation

## Setup

1. **Environment Variables**
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS="your-bigquery-credentials-json"
   GOOGLE_CLOUD_PROJECT_ID="your-project-id"
   NODE_ENV="production"
   ```

2. **Install & Run**
   ```bash
   npm install
   npm run build
   npm start
   ```

## API Endpoints

- `GET /api/accounts` - All accounts with risk scores
- `GET /api/bigquery/accounts/monthly` - Monthly account data
- `GET /api/bigquery/account-history/:accountId` - Account history
- `GET /api/historical-performance` - Historical performance charts
- `GET /api/monthly-trends` - Monthly risk trends
- `GET /api/risk-scores/latest` - Latest risk scores
- Authentication endpoints for login/logout

## Key Features

✅ **Complete Data**: Texts, coupons, subscribers, revenue  
✅ **Clean Architecture**: Single source of truth  
✅ **Proven UI**: Working CSM dropdowns, toggles, risk calculations  
✅ **BigQuery Integration**: Real-time data from production warehouse  
✅ **Safe Deployment**: No breaking changes to existing systems  

## Deployment

Ready for Replit deployment with GitHub sync.