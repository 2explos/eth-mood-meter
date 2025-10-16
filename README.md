ETH Mood Meter - Farcaster Mini-App
A production-ready Farcaster mini-app built with Next.js 14, TypeScript, and Ethers v6 that allows users to vote on their Ethereum sentiment (Bullish or Bearish) on Base network.
Features

✅ Vote once per day (Bullish or Bearish)
✅ Real-time sentiment tracking
✅ Works as Farcaster miniapp and standalone web page
✅ Base network integration via Ethers v6
✅ Mobile-first responsive design
✅ Auto-refresh counts every 10 seconds
✅ LocalStorage vote tracking
✅ MetaMask/Web3 wallet integration

Prerequisites

Node.js 18+ and npm
EthMoodMeter contract deployed on Base
Vercel account (for deployment)
Farcaster account (for miniapp registration)

Installation

Clone and install dependencies:

bashnpm install

Create .env.local file:

bashcp .env.example .env.local

Configure environment variables:

bash# .env.local
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_RPC=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_CONTRACT=0xYourContractAddressHere

Run development server:

bashnpm run dev
Visit http://localhost:3000
Environment Variables
VariableDescriptionDefaultRequiredNEXT_PUBLIC_URLYour app's public URL-✅ YesNEXT_PUBLIC_RPCBase RPC endpointhttps://mainnet.base.orgNoNEXT_PUBLIC_CHAIN_IDNetwork chain ID8453NoNEXT_PUBLIC_CONTRACTEthMoodMeter contract address-✅ Yes
Deploying to Vercel

Push code to GitHub
Import project in Vercel:

Go to vercel.com
Click "New Project"
Import your GitHub repository


Configure environment variables:

Add all variables from .env.local
Set NEXT_PUBLIC_URL to your Vercel domain


Deploy:

bash   vercel --prod
Generating Farcaster Account Association
To register your mini-app with Farcaster, you need to generate account association credentials:

Install Farcaster Auth Kit:

bash   npm install @farcaster/auth-kit

Generate credentials using Farcaster's tools:

Visit Farcaster Developer Portal
Follow the account association protocol
Generate header, payload, and signature


Update manifest route:
Replace placeholders in app/.well-known/farcaster.json/route.ts:

typescript   header: "YOUR_GENERATED_HEADER",
   payload: "YOUR_GENERATED_PAYLOAD",
   signature: "YOUR_GENERATED_SIGNATURE",

Verify manifest:

bash   curl https://your-domain.com/.well-known/farcaster.json
Switching to Base Sepolia (Testnet)
For testing, use Base Sepolia testnet:

Update .env.local:

bash   NEXT_PUBLIC_RPC=https://sepolia.base.org
   NEXT_PUBLIC_CHAIN_ID=84532
   NEXT_PUBLIC_CONTRACT=0xYourSepoliaContractAddress

Get testnet ETH:

Visit Base Sepolia Faucet
Request testnet tokens


Deploy contract to Sepolia (if needed)

Project Structure
├── app/
│   ├── page.tsx                    # Main page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   └── .well-known/farcaster.json/
│       └── route.ts                # Farcaster manifest
├── components/
│   └── MoodWidget.tsx              # Main UI component
├── lib/
│   ├── abi.ts                      # Contract ABI
│   ├── utils.ts                    # Utility functions
│   └── contract.ts                 # Contract interactions
├── hooks/
│   └── useFarcasterContext.ts      # Farcaster context hook
└── .env.local                      # Environment variables
Contract Interface
The EthMoodMeter contract implements:
solidityfunction vote(uint256 fid, uint8 mood) external
function today() external view returns (uint256 day, uint256 bullish, uint256 bearish)
function totals() external view returns (uint256 bullish, uint256 bearish)
Where mood: 0 = Bearish, 1 = Bullish
Adding Static Assets
Place these images in the public/ folder:

icon.png - App icon (512x512px recommended)
preview.png - Preview image (1200x630px)
splash.png - Splash screen (1200x1200px)

Troubleshooting
Contract calls failing:

Verify NEXT_PUBLIC_CONTRACT address is correct
Ensure RPC endpoint is working
Check network (Base mainnet vs Sepolia)

Wallet not connecting:

Install MetaMask or compatible wallet
Switch to Base network in wallet
Ensure wallet has ETH for gas

Manifest not loading:

Verify NEXT_PUBLIC_URL is set correctly
Check .well-known/farcaster.json route is accessible
Ensure CORS is configured properly

Security Notes

Never commit private keys or sensitive data
Use environment variables for all configuration
Validate all user inputs
Rate limit voting on contract level
Implement proper error handling

License
MIT
Support
For issues or questions:

Check GitHub Issues
Review Farcaster documentation
Review Base network documentation


Built with ❤️ for the Farcaster and Base communities
