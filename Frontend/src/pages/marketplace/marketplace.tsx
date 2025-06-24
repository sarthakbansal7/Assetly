import React, { useEffect, useState, useRef, useId } from 'react';
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

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div 
            className="text-2xl font-bold text-marketplace-blue cursor-pointer hover:opacity-80"
            onClick={() => navigate('/')}
          >
            Home
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="realEstate" className="w-full">
          <TabsList className="w-[800px] mx-auto grid grid-cols-3 gap-4 mb-8 bg-transparent">
            <TabCard
              title="Real Estate"
              subtitle="Premium Properties"
              bgImage="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60"
              value="realEstate"
            />
            <TabCard
              title="Invoices"
              subtitle="Corporate Finance"
              bgImage="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=60"
              value="invoices"
            />
            <TabCard
              title="Commodities"
              subtitle="Physical Assets"
              bgImage="https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=60"
              value="commodities"
            />
          </TabsList>

          <TabsContent value="realEstate">
            <ListingsGrid listings={realEstateListings} />
          </TabsContent>
          <TabsContent value="invoices">
            <ListingsGrid listings={invoiceListings} />
          </TabsContent>
          <TabsContent value="commodities">
            <ListingsGrid listings={commodityListings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ListingsGrid component
const ListingsGrid: React.FC<{ listings: MarketplaceListing[] }> = ({ listings }) => {
  const [activeListing, setActiveListing] = useState<MarketplaceListing | null>(null);
  const id = useId();

  return (
    <>
      <AnimatePresence>
        {activeListing && (
          <ExpandedDetail 
            listing={activeListing} 
            onClose={() => setActiveListing(null)} 
          />
        )}
      </AnimatePresence>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-500">
          <div className="col-span-2">Assets</div>
          <div>Price</div>
          <div>Category</div>
          <div>Type</div>
          <div>Earn XP</div>
          <div>Actions</div>
        </div>

        <div className="divide-y">
          {listings.map((listing) => (
            <motion.div
              key={listing.asset_id}
              layoutId={`listing-${listing.asset_id}`}
              onClick={() => setActiveListing(listing)}
              className="grid grid-cols-7 gap-4 p-4 items-center hover:bg-gray-50 cursor-pointer"
            >
              <div className="col-span-2 flex items-center gap-3">
                <img 
                  src={listing.image} 
                  alt={listing.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <div className="font-medium">{listing.name}</div>
                  <div className="text-sm text-gray-500">{listing.description.substring(0, 50)}...</div>
                </div>
              </div>
              <div className="font-medium">{listing.price} ETH</div>
              <div>{listing.attributes.find(attr => attr.trait_type === 'Asset Type')?.value}</div>
              <div>{listing.attributes[1]?.value || 'N/A'}</div>
              <div className="text-green-600">+50 XP</div>
              <div>
                <button 
                  className="px-4 py-1.5 bg-marketplace-blue text-white rounded-lg hover:bg-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add purchase logic here
                    alert('Purchase functionality coming soon!');
                  }}
                >
                  Buy Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

// Components for the marketplace UI

// ExpandedDetail Component
const ExpandedDetail: React.FC<{
  listing: MarketplaceListing;
  onClose: () => void;
}> = ({ listing, onClose }) => (
  <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40"
      onClick={onClose}
    />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
      >
        <CloseIcon />
      </button>

      <div className="aspect-video w-full">
        <img
          src={listing.image}
          alt={listing.name}
          className="w-full h-full object-cover rounded-t-2xl"
        />
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{listing.name}</h2>
          <div className="text-3xl font-bold text-marketplace-blue mt-2">
            {Number(listing.price).toLocaleString()} ETH
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-600">{listing.description}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Asset Details</h3>
          <div className="grid grid-cols-2 gap-4">
            {listing.attributes?.map((attr) => (
              <div key={attr.trait_type} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-600">{attr.trait_type}</div>
                <div className="font-medium">{attr.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// TabCard Component
const TabCard: React.FC<{
  title: string;
  subtitle: string;
  bgImage: string;
  value: string;
}> = ({ title, subtitle, bgImage, value }) => (  <TabsTrigger 
    value={value}
    className="relative w-full h-[70px] overflow-hidden rounded-xl border-none p-0 data-[state=active]:bg-transparent shadow-lg transition-all hover:scale-105"
  >
    <div 
      className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-110"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/50" />
    </div>
    <div className="relative z-10 p-4 text-left text-white">
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-sm text-white/80">{subtitle}</p>
    </div>
  </TabsTrigger>
);

// CloseIcon Component
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

export default Marketplace;