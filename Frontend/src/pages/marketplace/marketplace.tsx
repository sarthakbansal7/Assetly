import React, { useEffect, useState } from 'react';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';

interface MarketplaceListing {
  asset_id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data fetch - replace with your API call
    const fetchListings = async () => {
      try {
        const mockData: MarketplaceListing[] = [
          // Real Estate Listings
          {
            asset_id: 're-001',
            name: 'Luxury Villa in Miami',
            description: 'Stunning 5-bedroom villa with ocean views and private pool',
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
            price: '450',
            attributes: [
              { trait_type: 'Asset Type', value: 'Real Estate' },
              { trait_type: 'Location', value: 'Miami, FL' },
              { trait_type: 'Size', value: '5,200 sqft' },
              { trait_type: 'Bedrooms', value: '5' }
            ]
          },
          {
            asset_id: 're-002',
            name: 'Modern Downtown Loft',
            description: 'Contemporary loft in the heart of the city',
            image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e',
            price: '280',
            attributes: [
              { trait_type: 'Asset Type', value: 'Real Estate' },
              { trait_type: 'Location', value: 'New York, NY' },
              { trait_type: 'Size', value: '2,100 sqft' },
              { trait_type: 'Bedrooms', value: '2' }
            ]
          },
          
          // Invoice Listings
          {
            asset_id: 'inv-001',
            name: 'Tech Corp Invoice Bundle',
            description: 'Bundle of verified corporate invoices from Tech Corp',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
            price: '75',
            attributes: [
              { trait_type: 'Asset Type', value: 'Invoice' },
              { trait_type: 'Issuer', value: 'Tech Corp' },
              { trait_type: 'Due Date', value: '2025-12-31' },
              { trait_type: 'Risk Rating', value: 'AA' }
            ]
          },
          {
            asset_id: 'inv-002',
            name: 'Manufacturing Corp Receivables',
            description: 'High-quality receivables from Manufacturing Corp',
            image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
            price: '120',
            attributes: [
              { trait_type: 'Asset Type', value: 'Invoice' },
              { trait_type: 'Issuer', value: 'Manufacturing Corp' },
              { trait_type: 'Due Date', value: '2025-09-15' },
              { trait_type: 'Risk Rating', value: 'A' }
            ]
          },

          // Commodity Listings
          {
            asset_id: 'com-001',
            name: 'Premium Gold Bullion',
            description: '1kg of 99.99% pure gold bullion',
            image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d',
            price: '180',
            attributes: [
              { trait_type: 'Asset Type', value: 'Commodity' },
              { trait_type: 'Weight', value: '1 kg' },
              { trait_type: 'Purity', value: '99.99%' },
              { trait_type: 'Storage', value: 'Secured Vault' }
            ]
          },
          {
            asset_id: 'com-002',
            name: 'Silver Reserve Package',
            description: 'Investment grade silver bars, total 100 oz',
            image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d',
            price: '85',
            attributes: [
              { trait_type: 'Asset Type', value: 'Commodity' },
              { trait_type: 'Weight', value: '100 oz' },
              { trait_type: 'Purity', value: '99.9%' },
              { trait_type: 'Storage', value: 'Secured Vault' }
            ]
          },

          // Stock Listings
          {
            asset_id: 'stk-001',
            name: 'Apple Inc. Shares',
            description: 'Tokenized shares of Apple Inc. (AAPL)',
            image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
            price: '195',
            attributes: [
              { trait_type: 'Asset Type', value: 'Stocks' },
              { trait_type: 'Symbol', value: 'AAPL' },
              { trait_type: 'Exchange', value: 'NASDAQ' },
              { trait_type: 'Sector', value: 'Technology' }
            ]
          },
          {
            asset_id: 'stk-002',
            name: 'Tesla Inc. Shares',
            description: 'Tokenized shares of Tesla Inc. (TSLA)',
            image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89',
            price: '245',
            attributes: [
              { trait_type: 'Asset Type', value: 'Stocks' },
              { trait_type: 'Symbol', value: 'TSLA' },
              { trait_type: 'Exchange', value: 'NASDAQ' },
              { trait_type: 'Sector', value: 'Automotive' }
            ]
          },

          // Carbon Credit Listings
          {
            asset_id: 'cc-001',
            name: 'Amazon Rainforest Conservation',
            description: 'Premium carbon credits from verified Amazon conservation project',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
            price: '25',
            attributes: [
              { trait_type: 'Asset Type', value: 'CarbonCredit' },
              { trait_type: 'Standard', value: 'VCS' },
              { trait_type: 'Project Type', value: 'Forest Conservation' },
              { trait_type: 'CO2 Offset', value: '1 tonne' }
            ]
          },
          {
            asset_id: 'cc-002',
            name: 'Renewable Energy Credits',
            description: 'Carbon credits from wind and solar energy projects',
            image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7',
            price: '18',
            attributes: [
              { trait_type: 'Asset Type', value: 'CarbonCredit' },
              { trait_type: 'Standard', value: 'Gold Standard' },
              { trait_type: 'Project Type', value: 'Renewable Energy' },
              { trait_type: 'CO2 Offset', value: '1 tonne' }
            ]
          }
        ];
        setListings(mockData);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen h-screen w-full bg-white flex items-center justify-center">
        <BackgroundBeamsWithCollision>
          <div className="text-black text-xl">Loading listings...</div>
        </BackgroundBeamsWithCollision>
      </div>
    );
  }

  // Filter listings by category
  const realEstateListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'real estate';
  }) || [];

  const invoiceListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'invoice';
  }) || [];

  const commodityListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'commodity';
  }) || [];

  const stockListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'stocks';
  }) || [];

  const carbonCreditListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'carboncredit';
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      {/* Professional Header */}
      <header className="backdrop-blur-lg bg-white/80 border-b border-slate-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  RWA Marketplace
                </h1>
                <p className="text-xs text-slate-500">Real World Assets</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <span className="text-slate-600 hover:text-slate-800 cursor-pointer transition-colors">Explore</span>
                <span className="text-slate-600 hover:text-slate-800 cursor-pointer transition-colors">About</span>
                <span className="text-slate-600 hover:text-slate-800 cursor-pointer transition-colors">Help</span>
              </div>
              <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-12 pb-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
            Discover Real World Assets
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Invest in tokenized real-world assets with complete transparency and security
          </p>
        </div>

        {/* Professional Tabs */}
        <Tabs defaultValue="realEstate" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="inline-flex bg-white/60 backdrop-blur-sm p-1 rounded-2xl shadow-lg border border-slate-200/50">
              <ProfessionalTab title="Real Estate" icon="🏘️" value="realEstate" />
              <ProfessionalTab title="Invoices" icon="📄" value="invoices" />
              <ProfessionalTab title="Commodities" icon="⚡" value="commodities" />
              <ProfessionalTab title="Stocks" icon="📈" value="stocks" />
              <ProfessionalTab title="Carbon Credits" icon="🌱" value="carbonCredits" />
            </TabsList>
          </div>

          <TabsContent value="realEstate">
            <ProfessionalListingsGrid listings={realEstateListings} category="Real Estate" />
          </TabsContent>
          <TabsContent value="invoices">
            <ProfessionalListingsGrid listings={invoiceListings} category="Invoices" />
          </TabsContent>
          <TabsContent value="commodities">
            <ProfessionalListingsGrid listings={commodityListings} category="Commodities" />
          </TabsContent>
          <TabsContent value="stocks">
            <ProfessionalListingsGrid listings={stockListings} category="Stocks" />
          </TabsContent>
          <TabsContent value="carbonCredits">
            <ProfessionalListingsGrid listings={carbonCreditListings} category="Carbon Credits" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Professional Tab Component
const ProfessionalTab: React.FC<{
  title: string;
  icon: string;
  value: string;
}> = ({ title, icon, value }) => (
  <TabsTrigger 
    value={value}
    className="px-6 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300 font-medium text-slate-700 data-[state=active]:text-slate-900"
  >
    <span className="mr-2 text-lg">{icon}</span>
    {title}
  </TabsTrigger>
);

// Professional Listings Grid
const ProfessionalListingsGrid: React.FC<{ 
  listings: MarketplaceListing[];
  category: string;
}> = ({ listings, category }) => {
  const [activeListing, setActiveListing] = useState<MarketplaceListing | null>(null);

  if (listings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No {category} Available</h3>
        <p className="text-slate-600">Check back later for new listings in this category.</p>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {activeListing && (
          <ProfessionalExpandedDetail 
            listing={activeListing} 
            onClose={() => setActiveListing(null)} 
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((listing, index) => (
          <motion.div
            key={listing.asset_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            layoutId={`listing-${listing.asset_id}`}
            onClick={() => setActiveListing(listing)}
            className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200/50 hover:border-blue-200/50 overflow-hidden hover:scale-[1.02]"
          >
            <div className="relative overflow-hidden">
              <img 
                src={listing.image} 
                alt={listing.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700 border border-slate-200/50">
                  {listing.attributes.find(attr => attr.trait_type === 'Asset Type')?.value}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-slate-200/50">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-800 transition-colors line-clamp-1">
                {listing.name}
              </h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                {listing.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {listing.price} ETH
                  </p>
                  <p className="text-xs text-slate-500">≈ ${(parseFloat(listing.price) * 2500).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">+50 XP</p>
                  <p className="text-xs text-slate-500">Reward</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-slate-600">Available Now</span>
                </div>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Purchase functionality coming soon!');
                  }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

// Professional Expanded Detail Component
const ProfessionalExpandedDetail: React.FC<{
  listing: MarketplaceListing;
  onClose: () => void;
}> = ({ listing, onClose }) => (
  <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-y-auto">
        <div className="lg:w-1/2 relative">
          <img
            src={listing.image}
            alt={listing.name}
            className="w-full h-64 lg:h-full object-cover"
          />
          <div className="absolute bottom-6 left-6">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-slate-700 border border-slate-200/50">
              {listing.attributes.find(attr => attr.trait_type === 'Asset Type')?.value}
            </span>
          </div>
        </div>

        <div className="lg:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{listing.name}</h2>
            
            <div className="mb-6">
              <div className="flex items-baseline space-x-4 mb-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {listing.price} ETH
                </span>
                <span className="text-lg text-slate-500">≈ ${(parseFloat(listing.price) * 2500).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Available</span>
                </div>
                <span>•</span>
                <span>+50 XP Reward</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
              <p className="text-slate-600 leading-relaxed">{listing.description}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Asset Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.attributes?.map((attr) => (
                  <div key={attr.trait_type} className="bg-slate-50 rounded-xl p-4 border border-slate-200/50">
                    <div className="text-slate-500 text-sm font-medium">{attr.trait_type}</div>
                    <div className="text-slate-900 font-semibold mt-1">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Close
            </button>
            <button 
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              onClick={() => alert('Purchase functionality coming soon!')}
            >
              Purchase Asset
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export default Marketplace;