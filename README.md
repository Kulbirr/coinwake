# Crypto Wake Up Call

Build a Modern Crypto Price Alert & Profit Calculator Platform
Build a polished, modern crypto platform focused on price alerts, profit calculations, portfolio tracking, and market-cap-based targets.
The product should feel like a premium crypto dashboard — dark, modern, responsive, fast, and easy to understand. It should work beautifully on both desktop and mobile.
Core Product Concept
Users should be able to:
Search for any supported cryptocurrency.
View its current price, market cap, liquidity, volume, and basic market information.
Create price alerts.
Receive a loud alarm/browser notification when their target price is reached.
Calculate potential profit based on:
How many coins they own.
Their average/current purchase price.
Their current investment value.
Their current market cap.
Their target market cap.
Their target price.
Save coins to a personal portfolio/watchlist.
Create multiple alerts for the same coin.
Track whether alerts are active, triggered, or disabled.

1. Landing Page
   Create a premium landing page.
   Hero section:
   "Never Miss Your Crypto Target."
   Subtitle:
   "Set price and market-cap alerts, calculate your potential profits, and let CoinWake watch the market for you."
   Primary CTA:
   Start Tracking
   Secondary CTA:
   Try Profit Calculator
   Show a visually impressive crypto dashboard preview.
   Feature cards:
   🔔 Smart Price Alerts
   🚨 Loud CoinWake
   💰 Profit Calculator
   📈 Market Cap Targets
   👀 Watchlists
   📱 Push Notifications
2. Main Dashboard
   Create a dashboard with a left sidebar.
   Sidebar:
   Dashboard
   My Portfolio
   Price Alerts
   Profit Calculator
   Watchlist
   Market
   Settings
   Top navigation:
   Search crypto
   Notifications
   User profile
   Dashboard should contain:
   Portfolio Summary
   Cards:
   Portfolio Value
   Total Invested
   Total Profit
   ROI %
   Example:
   Portfolio Value
   $12,450
Invested
$5,000
   Profit
   +$7,450
   ROI
   +149%
3. Crypto Search
   Create a global crypto search.
   Users should be able to search:
   Bitcoin
   Ethereum
   Solana
   BONK
   PEPE
   etc.
   Search results should show:
   Coin logo
   Name
   Symbol
   Current price
   24h change
   Market cap
   Clicking a coin opens its detailed page.
4. Coin Detail Page
   Create a beautiful detailed crypto page.
   Header:
   Coin logo
   Coin name
   Symbol
   Current price
   24h change
   Market cap
   24h volume
   Liquidity if available
   Buttons:
   Set Alert
   Calculate Profit
   Add to Portfolio
   Add to Watchlist
   Price Chart
   Show an interactive price chart.
   Time ranges:
   1H
   24H
   7D
   30D
   3M
   1Y
   Allow users to visually see their alert levels on the chart.
   Example:
   Current Price: $0.00045
Alert:
$0.001
   The alert should appear as a horizontal line on the chart.
5. Price Alert System
   This is one of the most important features.
   Users can create alerts such as:
   Price Above
   "Alert me when SOL reaches $250"
Price Below
"Alert me when SOL falls below $180"
   Allow multiple alerts per coin.
   Example:
   SOL:
   🟢 $250 — Take Profit
🟢 $300 — Major Target
   🟢 $500 — Moon Target
🔴 $180 — Stop Watch
   Alert Creation UI
   Modal:
   Coin:
   SOL
   Condition:
   [ Price reaches ]
   Target:
   $250
   Notification:
   ☑ Browser Notification
   ☑ Loud Alarm
   ☑ Push Notification
   Optional:
   Alert name:
   "First Take Profit"
   Button:
   Create Alert
6. Loud Alarm
   When the target is reached, create a highly visible alarm screen.
   Example:
   🚨🚨🚨
   PRICE ALERT
   SOL REACHED $250
Previous Price:
$249.82
   Target:
   $250
Current:
$250.07
   Buttons:
   STOP ALARM
   SNOOZE 5 MIN
   VIEW COIN
   Play a loud repeating alarm sound until the user presses STOP.
   Use browser notification APIs and Web Push where supported.
   Clearly handle browser autoplay restrictions by requiring the user to enable/test alarm sounds beforehand.
7. Profit Calculator
   Create a dedicated Profit Calculator page.
   This should be one of the main features.
   The calculator must support both:
   Price-based calculation
   AND
   Market-cap-based calculation
   Calculator Inputs
   Coin:
   [ Search Coin ]
   Coins Held:
   [ 175,000 ]
   Current Price:
   [ $0.00045 ]
OR
Current Market Cap:
[ $450,000 ]
   Purchase Price:
   [ $0.00030 ]
Investment:
Automatically calculate this.
Target Price:
[ $0.001 ]
   OR
   Target Market Cap:
   [ $1,000,000 ]
8. Automatic Calculations
   Calculate:
   Current Holdings Value
   Coins Held × Current Price
   Initial Investment
   Coins Held × Purchase Price
   Target Holdings Value
   Coins Held × Target Price
   Profit
   Target Holdings Value − Initial Investment
   ROI
   Profit ÷ Initial Investment × 100
9. Market Cap Calculator
   This is extremely important for low-cap crypto.
   Allow users to enter:
   Current Market Cap:
   $450,000
Target Market Cap:
$10,000,000
   Coins Held:
   175,000
   Current Price:
   Automatically retrieve.
   Calculate target price using circulating supply:
   Target Price = Target Market Cap / Circulating Supply
   Then calculate:
   Target Holdings Value
   Profit
   ROI
   Multiple
   Example:
   Current Market Cap:
   $450K
Target Market Cap:
$10M
   Current Price:
   $0.00045
Target Price:
$0.01
   Coins Held:
   175,000
   Current Value:
   $78.75
Target Value:
$1,750
   Profit:
   +$1,671.25
   ROI:
   +2,122%
   Multiple:
   22.22x
10. Important Supply Logic
    Do NOT assume total supply is the same as circulating supply.
    Display:
    Total Supply
    Circulating Supply
    Max Supply
    Use circulating supply for market-cap-to-price calculations when available.
    Formula:
    Target Price =
    Target Market Cap ÷ Circulating Supply
    If circulating supply is unavailable, clearly tell the user that the calculation is an estimate.
    Allow the user to manually override supply.
11. Profit Scenario Table
    Create a powerful scenario calculator.
    Example:
    Target Market CapTarget PriceHoldings ValueProfitROI$1M$0.001$175$122.50157%$5M$0.005$875$822.501,057%$10M$0.01$1,750$1,697.502,157%$50M$0.05$8,750$8,697.5011,057%$100M$0.10$17,500$17,447.5022,157%
    Allow users to add/remove target scenarios.
    Provide quick buttons:
    +1M
    +5M
    +10M
    +50M
    +100M
12. Visual Profit Chart
    Create a chart showing:
    X-axis:
    Market Cap
    Y-axis:
    Portfolio Value
    Allow the user to visually understand how their holdings change as market cap increases.
    Show important target points.
    Example:
    $1M → $175
    $10M → $1,750
    $50M → $8,750
    $100M → $17,500
13. Portfolio
    Create a portfolio page.
    Users can add:
    Coin
    Quantity
    Average Buy Price
    Purchase Date
    Optional:
    Exchange
    Wallet
    Notes
    Automatically calculate:
    Current Value
    Invested
    Profit
    ROI
    Current Price
    24h Change
14. Portfolio Coin Card
    Example:
    SOL
    125.5 SOL
    Current:
    $201.42
Value:
$25,278
    Invested:
    $15,000
Profit:
+$10,278
    ROI:
    +68.52%
    Add:
    Set Alert
    Calculate Target
15. Watchlist
    Allow users to add coins to a watchlist.
    Show:
    Coin
    Price
    24h %
    Market Cap
    Volume
    User's target
    Distance to target
    Example:
    SOL
    $201
Target $250
    19.5% away
    🟢 Alert Active
16. Alert Management
    Create a dedicated alerts page.
    Tabs:
    Active
    Triggered
    Disabled
    Each alert should show:
    Coin
    Condition
    Target
    Current Price
    Distance
    Created
    Status
    Notification type
    Example:
    SOL
    Target ≥ $250
Current $201.42
    19.45% away
    🟢 ACTIVE
    [Edit] [Disable] [Delete]
17. Smart Alert Progress
    For every active alert, show how close the coin is to the target.
    Example:
    SOL
    Current:
    $201.42
Target:
$250
    Progress:
    80.57%
    ████████████████░░░░
    $48.58 remaining
    This should update in real time.
18. Notifications Center
    Create a notification center.
    Examples:
    🚨 SOL reached $250
💰 Your portfolio crossed $10,000
    📈 BTC increased 10% today
    🎯 BONK reached your market-cap target
    Allow users to mark notifications as read.
19. Real-Time Data
    Design the application so the backend can consume real-time cryptocurrency price feeds.
    Architecture should support:
    Frontend
    ↓
    Backend API
    ↓
    Price Service
    ↓
    Exchange/WebSocket/API providers
    Do NOT make every browser independently poll APIs.
    The backend should maintain centralized price data and distribute updates to connected clients using WebSockets.
20. Backend Architecture
    Build the frontend in a way that is ready to connect to a real backend.
    Recommended stack:
    Frontend:
    React
    TypeScript
    Tailwind CSS
    shadcn/ui
    Recharts
    Backend-ready architecture:
    Node.js
    Express/NestJS
    MongoDB
    Redis
    WebSockets
    Database entities:
    User
    id
    email
    name
    createdAt
    Coin
    id
    symbol
    name
    logo
    price
    marketCap
    circulatingSupply
    totalSupply
    volume24h
    updatedAt
    Portfolio
    id
    userId
    coinId
    quantity
    averageBuyPrice
    createdAt
    Alert
    id
    userId
    coinId
    condition
    targetPrice
    targetMarketCap
    notificationType
    status
    triggeredAt
    createdAt
    Watchlist
    id
    userId
    coinId
    createdAt
21. Alert Engine
    Design the backend around an alert engine.
    Concept:
    Price Feed
    ↓
    Update Coin Price
    ↓
    Find active alerts for coin
    ↓
    Evaluate condition
    ↓
    If condition matched
    ↓
    Trigger alert
    ↓
    Mark alert triggered
    ↓
    Send notification
    For example:
    SOL price:
    $249.98
Target:
$250
    No alert.
    Price becomes:
    $250.01
    Trigger:
    🚨 ALERT
    Then:
    alert.status = "TRIGGERED"
22. One-Time vs Recurring Alerts
    Allow users to choose:
    One-Time
    Trigger once and automatically disable.
    Recurring
    Continue triggering whenever the condition is reached again.
    Add cooldown to prevent notification spam.
    Example:
    Cooldown:
    5 minutes
23. Authentication
    Implement:
    Email/password login
    Google login if supported
    Forgot password
    User profile
    All portfolio and alerts must belong to the authenticated user.
24. Responsive Design
    The application must be mobile-first.
    Desktop:
    Sidebar + large dashboard.
    Mobile:
    Bottom navigation:
    Dashboard
    Portfolio
    Alerts
    Calculator
    Profile
    Make the alarm experience especially optimized for mobile.
25. Design System
    Use a premium dark crypto UI.
    Style:
    Dark background
    Glassmorphism where appropriate
    Subtle gradients
    Rounded cards
    Clean typography
    Strong visual hierarchy
    Green for profit
    Red for losses
    Yellow/orange for alerts
    Blue/purple accent for primary actions
    Avoid excessive neon effects.
    The interface should feel like a serious financial/crypto product rather than a gambling website.
    Use smooth animations for:
    Price changes
    Alert triggering
    Cards
    Charts
    Modals
26. Dashboard Example
    The dashboard should visually prioritize:
    Total Portfolio
    $12,450
+$2,450 (+24.5%)
    Active Alerts
    🔔 7 Active
    SOL → $250
BONK → $0.00005
    BTC → $125,000
Top Holdings
BTC
$5,200
    41.7%
    ETH
    $3,100
24.9%
SOL
$2,500
    20.1%
    Profit Calculator
    Quick calculator:
    Coin
    Quantity
    Buy Price
    Target Price
    Target Market Cap
    Calculate Profit
27. Quick Calculator Widget
    Put a calculator directly on the dashboard.
    Inputs:
    Coin
    Coins Held
    Buy Price
    Target Price / Market Cap
    Output immediately:
    Investment
    Current Value
    Target Value
    Profit
    ROI
    Multiple
    Example:
    "Your $1,000 investment would become $12,450"
    Make this visually prominent.
28. Important UX Details
    Never make users manually calculate anything.
    If the user enters:
    Coin:
    BONK
    Quantity:
    175,000
    Purchase Price:
    $0.0003
Target Market Cap:
$100M
    Automatically fetch:
    Current price
    Current market cap
    Circulating supply
    Then calculate everything.
    Show formulas in a small "How calculated?" expandable section for transparency.
29. Data Provider Abstraction
    Do not tightly couple the UI to one crypto API.
    Create a data-provider abstraction so providers can later be swapped.
    Example:
    CryptoDataProvider
    Methods:
    getCoin()
    getPrice()
    getMarketData()
    getChart()
    getSupply()
    This will make it possible to support different providers later.
30. Build Priority
    Build the MVP in this order:
    Phase 1
    Authentication
    Dashboard
    Crypto search
    Coin detail
    Profit calculator
    Portfolio
    Phase 2
    Price alerts
    Alert management
    Browser notifications
    Loud alarm
    Phase 3
    WebSockets
    Real-time prices
    Push notifications
    Redis alert engine
    Phase 4
    Advanced market-cap calculator
    Scenario tables
    Advanced alerts
    Mobile PWA
    Premium features
    Final Product Goal
    The final application should feel like:
    CoinMarketCap + Portfolio Tracker + Profit Calculator + Alarm Clock
    The unique selling point is:
    "Set your target. Go live your life. We'll wake you up when crypto gets there."
    Make the UI highly polished and production-quality rather than a basic CRUD dashboard.
    Use realistic mock crypto data initially so the entire application is functional and visually demonstrable even before connecting a live crypto API.Build the frontend using a responsive, mobile-first architecture and keep all business logic/API interactions separated from UI components so the same backend can later be consumed by a React Native or Expo mobile application.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e08b4c1b-2352-4848-964c-0f02928214a3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
