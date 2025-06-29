import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LabelInputContainer } from '@/components/ui/form-utils';
import { BackgroundLines } from "@/components/ui/background-lines";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconMessage, IconUser } from "@tabler/icons-react";
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Copy } from 'lucide-react';

const assetTypes = [
  'Real Estate',
  'Invoice',
  'Commodity',
];

const navItems = [
  {
    name: "Home",
    link: "/",
    icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
  },
  {
    name: "About",
    link: "/about",
    icon: <IconUser className="h-4 w-4 text-neutral-500 dark:text-white" />,
  },
  {
    name: "Tokenize your asset",
    link: "/issuer",
    icon: <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />,
  },
];

const Issuer: React.FC = () => {
  const [showNFTDialog, setShowNFTDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);

  // NFT form state
  const [mintStep, setMintStep] = useState(1);
  const [nftTitle, setNftTitle] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [nftAssetType, setNftAssetType] = useState(0);
  const [nftPriceToken, setNftPriceToken] = useState('USDC');
  const [nftEarnXP, setNftEarnXP] = useState('32000');
  const [nftImageFile, setNftImageFile] = useState<File | null>(null);
  const [nftId, setNftId] = useState('');
  const [nftAmount, setNftAmount] = useState('');

  // List Asset form state
  const [listType, setListType] = useState<'nft'>('nft');
  const [listAssetId, setListAssetId] = useState('');
  const [listPrice, setListPrice] = useState('');

  // Success states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [mintedAssetId, setMintedAssetId] = useState<string | null>(null);

  const handleNftImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNftImageFile(e.target.files[0]);
    }
  };

  const handleMintNFT = async () => {
    try {
      // Simulate minting success
      const mockAssetId = `NFT-${Math.random().toString(36).substr(2, 9)}`;
      setMintedAssetId(mockAssetId);
      setShowSuccessDialog(true);
      setShowNFTDialog(false);
      toast.success('NFT minted successfully!');
    } catch (error) {
      toast.error('Failed to mint NFT');
    }
  };

  const handleListAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate listing success
      toast.success('Asset listed successfully!');
      setShowListDialog(false);
    } catch (error) {
      toast.error('Failed to list asset');
    }
  };

  const resetNFTForm = () => {
    setMintStep(1);
    setNftTitle('');
    setNftDescription('');
    setNftImageFile(null);
    setNftAssetType(0);
    setNftPriceToken('USDC');
    setNftEarnXP('32000');
    setNftId('');
    setNftAmount('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header: match About page, always visible on refresh */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <FloatingNav navItems={navItems} />
        </div>
      </nav>
      <main className="w-full">
        <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 min-h-screen pt-40">
          <div className="relative z-10 w-full max-w-7xl mx-auto">
            {/* Professional Dashboard Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
                Asset Issuer Dashboard
              </h1>
              <p className="text-xl text-black-300 max-w-2xl mx-auto">
                Mint and manage your real-world assets on the blockchain
              </p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Mint Asset Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-2xl border border-blue-500/20">
                <div className="text-white">
                  <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Mint Asset</h3>
                  <p className="text-blue-100 mb-6">Create new tokenized real-world assets with custom properties and metadata.</p>
                  <Button 
                    onClick={() => setShowNFTDialog(true)}
                    className="w-full bg-white text-blue-800 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-all"
                  >
                    Mint Asset
                  </Button>
                </div>
              </div>

              {/* List Asset Card */}
              <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 shadow-2xl border border-green-500/20">
                <div className="text-white">
                  <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">List on Marketplace</h3>
                  <p className="text-green-100 mb-6">List your minted assets on the marketplace for trading and investment.</p>
                  <Button 
                    onClick={() => setShowListDialog(true)}
                    className="w-full bg-white text-green-800 hover:bg-green-50 font-semibold py-3 rounded-lg transition-all"
                  >
                    List Asset
                  </Button>
                </div>
              </div>

              {/* Portfolio Overview Card */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 shadow-2xl border border-purple-500/20">
                <div className="text-white">
                  <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Portfolio</h3>
                  <p className="text-purple-100 mb-6">Track your issued assets performance and manage your portfolio.</p>
                  <Button 
                    className="w-full bg-white text-purple-800 hover:bg-purple-50 font-semibold py-3 rounded-lg transition-all"
                  >
                    View Portfolio
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* NFT Mint Dialog */}
          <Dialog open={showNFTDialog} onOpenChange={(open) => {
              if (!open) {
                resetNFTForm();
              }
              setShowNFTDialog(open);
            }}>
              <DialogContent className="sm:max-w-lg rounded-2xl border border-neutral-200/30 dark:border-neutral-800 bg-white/90 dark:bg-black/90 shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Mint Real-World Asset NFT</DialogTitle>
                  <DialogDescription className="text-base text-neutral-600 dark:text-neutral-300 mb-4">
                    {mintStep === 1
                      ? "Enter display details for your asset (these are for frontend display only)."
                      : "Enter the ID and amount for minting your RWA NFT."}
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto scrollbar-hide my-6 pr-2" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                  {mintStep === 1 ? (
                    <form className="space-y-5">
                      <LabelInputContainer>
                        <Label htmlFor="nftTitle">Title</Label>
                        <Input id="nftTitle" value={nftTitle} onChange={e => setNftTitle(e.target.value)} placeholder="Enter asset title" type="text" className="shadow-input" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="nftDescription">Description</Label>
                        <Input id="nftDescription" value={nftDescription} onChange={e => setNftDescription(e.target.value)} placeholder="Enter description" type="text" className="shadow-input" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="nftImage">Upload Image</Label>
                        <div className="flex flex-col gap-2">
                          <Input
                            id="nftImage"
                            type="file"
                            accept="image/*"
                            onChange={handleNftImageUpload}
                            className="shadow-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                          />
                          {nftImageFile && (
                            <div className="relative w-32 h-32">
                              <img
                                src={URL.createObjectURL(nftImageFile)}
                                alt="Preview"
                                className="rounded-lg object-cover w-full h-full"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => setNftImageFile(null)}
                              >
                                ×
                              </Button>
                            </div>
                          )}
                        </div>
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="nftAssetType">Asset Type</Label>
                        <select id="nftAssetType" value={nftAssetType} onChange={e => setNftAssetType(Number(e.target.value))} className="shadow-input rounded-md px-3 py-2">
                          {assetTypes.map((type, idx) => (
                            <option key={type} value={idx}>{type}</option>
                          ))}
                        </select>
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="nftPriceToken">Price Token</Label>
                        <select id="nftPriceToken" value={nftPriceToken} onChange={e => setNftPriceToken(e.target.value)} className="shadow-input rounded-md px-3 py-2">
                          <option value="USDC">USDC</option>
                          
                          <option value="USDT">USDT</option>
                          {/* Add more tokens as needed */}
                        </select>
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="nftEarnXP">Earn XP</Label>
                        <Input id="nftEarnXP" value={nftEarnXP} onChange={e => setNftEarnXP(e.target.value)} placeholder="32000" type="number" className="shadow-input" />
                      </LabelInputContainer>
                    </form>
                  ) : (
                    <form className="space-y-5">
                      <LabelInputContainer>
                        <Label htmlFor="nftId">ID</Label>
                        <Input id="nftId" value={nftId} onChange={e => setNftId(e.target.value)} placeholder="Enter asset ID" type="number" className="shadow-input" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="nftAmount">Amount</Label>
                        <Input id="nftAmount" value={nftAmount} onChange={e => setNftAmount(e.target.value)} placeholder="Enter amount" type="number" className="shadow-input" />
                      </LabelInputContainer>
                    </form>
                  )}
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => { resetNFTForm(); setShowNFTDialog(false); }} className="rounded-md">
                    Cancel
                  </Button>
                  {mintStep === 1 ? (
                    <Button 
      type="button" 
      onClick={() => {
        if (!nftTitle || !nftDescription || !nftImageFile) {
          toast.error('Please fill all required fields');
          return;
        }
        setMintStep(2);
      }} 
      className="bg-marketplace-blue text-white hover:bg-marketplace-blue/90 rounded-md"
    >
      Next
    </Button>
                  ) : (
                    <>
                      <Button type="button" variant="outline" onClick={() => setMintStep(1)} className="rounded-md">
                        Back
                      </Button>
                      <Button 
        type="button"
        onClick={() => {
          if (!nftId || !nftAmount) {
            toast.error('Please fill all required fields');
            return;
          }
          handleMintNFT();
        }}
        className="bg-marketplace-blue text-white hover:bg-marketplace-blue/90 rounded-md"
      >
        Mint NFT
      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* FT Mint Dialog - REMOVED */}

            {/* List Asset Dialog */}
          <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
              <DialogContent className="sm:max-w-lg rounded-2xl border border-neutral-200/30 dark:border-neutral-800 bg-white/90 dark:bg-black/90 shadow-2xl p-6 md:p-10">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">List Asset to Marketplace</DialogTitle>
                  <DialogDescription className="text-base text-neutral-600 dark:text-neutral-300 mb-4">Fill in the details to list your RWA NFT on the marketplace.</DialogDescription>
                </DialogHeader>
                <form className="my-6 space-y-5" onSubmit={handleListAsset}>
                  <LabelInputContainer>
                    <Label htmlFor="listAssetId">Asset Object ID</Label>
                    <Input id="listAssetId" value={listAssetId} onChange={e => setListAssetId(e.target.value)} placeholder="Enter Asset NFT Object ID" type="text" className="shadow-input font-mono text-sm" />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="listPrice">Price (u64)</Label>
                    <Input id="listPrice" value={listPrice} onChange={e => setListPrice(e.target.value)} placeholder="Enter listing price" type="number" className="shadow-input" />
                  </LabelInputContainer>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowListDialog(false)} className="rounded-md">Cancel</Button>
                    <Button type="submit" className="bg-green-600 text-white hover:bg-green-700 rounded-md">List Asset</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Success Dialog for Minting NFT */}
          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
              <DialogContent className="sm:max-w-md rounded-2xl border border-neutral-200/30 dark:border-neutral-800 bg-white/90 dark:bg-black/90 shadow-2xl p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white mb-2">NFT Minted Successfully!</DialogTitle>
                  <DialogDescription className="text-base text-neutral-600 dark:text-neutral-300 mb-4">
                    Your NFT has been minted. You can view it on the blockchain explorer or manage it in your wallet.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <div className="flex flex-col">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">NFT Object ID</span>
                      <span className="text-lg font-semibold text-neutral-900 dark:text-white break-all">{mintedAssetId}</span>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(mintedAssetId)}>
                      <Copy className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                    </Button>
                  </div>
                  <Button asChild variant="default" onClick={() => { setShowSuccessDialog(false); setMintedAssetId(null); }}>
                    <Link to="/issuer" className="w-full h-full">Go to Dashboard</Link>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
        </BackgroundLines>
      </main>
    </div>
  );
};

export default Issuer;