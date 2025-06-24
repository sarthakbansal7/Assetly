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
  const [showFTDialog, setShowFTDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);

  // NFT form state
  const [mintStep, setMintStep] = useState(1);
  const [nftTitle, setNftTitle] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [nftAssetType, setNftAssetType] = useState(0);
  const [nftPriceToken, setNftPriceToken] = useState('USDC');
  const [nftEarnXP, setNftEarnXP] = useState('32000');
  const [nftValuation, setNftValuation] = useState('');
  const [nftHasMaturity, setNftHasMaturity] = useState(false);
  const [nftMaturity, setNftMaturity] = useState('');
  const [nftHasApy, setNftHasApy] = useState(false);
  const [nftApy, setNftApy] = useState('');
  const [nftImageFile, setNftImageFile] = useState<File | null>(null);

  // FT form state
  const [ftMintStep, setFtMintStep] = useState(1);
  const [ftTitle, setFtTitle] = useState('');
  const [ftDescription, setFtDescription] = useState('');
  const [ftAssetType, setFtAssetType] = useState(0);
  const [ftPriceToken, setFtPriceToken] = useState('USDC');
  const [ftEarnXP, setFtEarnXP] = useState('32000');
  const [ftTotalSupply, setFtTotalSupply] = useState('');
  const [ftImageFile, setFtImageFile] = useState<File | null>(null);

  // List Asset form state
  const [listType, setListType] = useState<'nft' | 'ft'>('nft');
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

  const handleFtImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFtImageFile(e.target.files[0]);
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

  const handleMintFT = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate minting success
      const mockAssetId = `FT-${Math.random().toString(36).substr(2, 9)}`;
      setMintedAssetId(mockAssetId);
      setShowSuccessDialog(true);
      setShowFTDialog(false);
      toast.success('FT minted successfully!');
    } catch (error) {
      toast.error('Failed to mint FT');
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
    setNftValuation('');
    setNftHasMaturity(false);
    setNftMaturity('');
    setNftHasApy(false);
    setNftApy('');
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
        <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 min-h-screen pt-32">
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Move Welcome text to top */}
            <div className="w-full max-w-3xl rounded-2xl border border-neutral-200/30 dark:border-neutral-800 bg-white/80 dark:bg-black/80 shadow-xl p-8 mb-12">
              <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 font-bold tracking-tight mb-8">
                Welcome to{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500">
                  Issuer Dashboard
                </span>
              </h2>
              <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center mb-8">
                Manage and issue your RWA tokens, track performance, and handle distributions.
              </p>
              {/* Mint buttons vertical, styled like admin dashboard */}
              <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl mx-auto mb-4 justify-center">
                <div className="flex flex-col gap-4 w-full max-w-xs">
                  <Button className="h-12 w-full text-lg font-semibold bg-marketplace-blue text-white rounded-lg shadow hover:bg-marketplace-blue/90 transition-all" onClick={() => setShowNFTDialog(true)}>
                    Mint Non fungible Asset
                  </Button>
                  <Button className="h-12 w-full text-lg font-semibold bg-marketplace-blue text-white rounded-lg shadow hover:bg-marketplace-blue/90 transition-all" onClick={() => setShowFTDialog(true)}>
                    Mint Fungible Asset
                  </Button>
                </div>
                {/* List Asset Section */}
                <div className="flex flex-col items-center justify-center w-full max-w-xs">
                  <div className="text-center text-base font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Already minted your asset?</div>
                  <Button className="h-12 w-full text-lg font-semibold bg-marketplace-blue text-white rounded-lg shadow hover:bg-marketplace-blue/90 transition-all" onClick={() => setShowListDialog(true)}>
                    List Asset to Market
                  </Button>
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
                      : "Fill in the details to mint a new RWA NFT."}
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
                        <Label htmlFor="nftValuation">Valuation (u64)</Label>
                        <Input id="nftValuation" value={nftValuation} onChange={e => setNftValuation(e.target.value)} placeholder="Enter asset valuation" type="number" className="shadow-input" />
                      </LabelInputContainer>
                      <div className="flex items-center gap-2">
                        <input id="nftHasMaturity" type="checkbox" checked={nftHasMaturity} onChange={e => setNftHasMaturity(e.target.checked)} />
                        <Label htmlFor="nftHasMaturity">Has Maturity?</Label>
                      </div>
                      {nftHasMaturity && (
                        <LabelInputContainer>
                          <Label htmlFor="nftMaturity">Maturity (u64)</Label>
                          <Input id="nftMaturity" value={nftMaturity} onChange={e => setNftMaturity(e.target.value)} placeholder="Enter maturity value" type="number" className="shadow-input" />
                        </LabelInputContainer>
                      )}
                      <div className="flex items-center gap-2">
                        <input id="nftHasApy" type="checkbox" checked={nftHasApy} onChange={e => setNftHasApy(e.target.checked)} />
                        <Label htmlFor="nftHasApy">Has APY?</Label>
                      </div>
                      {nftHasApy && (
                        <LabelInputContainer>
                          <Label htmlFor="nftApy">APY (u64)</Label>
                          <Input id="nftApy" value={nftApy} onChange={e => setNftApy(e.target.value)} placeholder="Enter APY value" type="number" className="shadow-input" />
                        </LabelInputContainer>
                      )}
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
        onClick={handleMintNFT}
        className="bg-marketplace-blue text-white hover:bg-marketplace-blue/90 rounded-md"
      >
        Mint NFT
      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* FT Mint Dialog */}
            <Dialog open={showFTDialog} onOpenChange={setShowFTDialog}>
              <DialogContent className="sm:max-w-lg rounded-2xl border border-neutral-200/30 dark:border-neutral-800 bg-white/90 dark:bg-black/90 shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Mint Real-World Asset Fungible Token</DialogTitle>
                  <DialogDescription className="text-base text-neutral-600 dark:text-neutral-300 mb-4">
                    {ftMintStep === 1
                      ? "Enter display details for your asset (these are for frontend display only)."
                      : "Fill in the details to mint a new RWA Fungible Token."}
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto scrollbar-hide my-6 pr-2" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                  {ftMintStep === 1 ? (
                    <form className="space-y-5">
                      <LabelInputContainer>
                        <Label htmlFor="ftTitle">Title</Label>
                        <Input id="ftTitle" value={ftTitle} onChange={e => setFtTitle(e.target.value)} placeholder="Enter asset title" type="text" className="shadow-input" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="ftDescription">Description</Label>
                        <Input id="ftDescription" value={ftDescription} onChange={e => setFtDescription(e.target.value)} placeholder="Enter description" type="text" className="shadow-input" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="ftImage">Upload Image</Label>
                        <div className="flex flex-col gap-2">
                          <Input
                            id="ftImage"
                            type="file"
                            accept="image/*"
                            onChange={handleFtImageUpload}
                            className="shadow-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                          />
                          {ftImageFile && (
                            <div className="relative w-32 h-32">
                              <img
                                src={URL.createObjectURL(ftImageFile)}
                                alt="Preview"
                                className="rounded-lg object-cover w-full h-full"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => setFtImageFile(null)}
                              >
                                ×
                              </Button>
                            </div>
                          )}
                        </div>
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="ftAssetType">Asset Type</Label>
                        <select id="ftAssetType" value={ftAssetType} onChange={e => setFtAssetType(Number(e.target.value))} className="shadow-input rounded-md px-3 py-2">
                          {assetTypes.map((type, idx) => (
                            <option key={type} value={idx}>{type}</option>
                          ))}
                        </select>
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="ftPriceToken">Price Token</Label>
                        <select id="ftPriceToken" value={ftPriceToken} onChange={e => setFtPriceToken(e.target.value)} className="shadow-input rounded-md px-3 py-2">
                          <option value="USDC">USDC</option>
                          <option value="USDT">USDT</option>
                          {/* Add more tokens as needed */}
                        </select>
                      </LabelInputContainer>
                      
                      <LabelInputContainer>
                        <Label htmlFor="ftEarnXP">Earn XP</Label>
                        <Input id="ftEarnXP" value={ftEarnXP} onChange={e => setFtEarnXP(e.target.value)} placeholder="32000" type="number" className="shadow-input" />
                      </LabelInputContainer>
                    </form>
                  ) : (
                    <form className="space-y-5" onSubmit={handleMintFT}>
                     
                      
                      
                      <LabelInputContainer>
                        <Label htmlFor="ftTotalSupply">Total Supply (u64)</Label>
                        <Input id="ftTotalSupply" value={ftTotalSupply} onChange={e => setFtTotalSupply(e.target.value)} placeholder="Enter total supply" type="number" className="shadow-input" />
                      </LabelInputContainer>
                    
                    </form>
                  )}
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowFTDialog(false)} className="rounded-md">Cancel</Button>
                  <Button type="submit" className="bg-marketplace-blue text-white hover:bg-marketplace-blue/90 rounded-md">Mint FT</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* List Asset Dialog */}
            <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
              <DialogContent className="sm:max-w-lg rounded-2xl border border-neutral-200/30 dark:border-neutral-800 bg-white/90 dark:bg-black/90 shadow-2xl p-6 md:p-10">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">List Asset to Marketplace</DialogTitle>
                  <DialogDescription className="text-base text-neutral-600 dark:text-neutral-300 mb-4">Fill in the details to list your asset (NFT or FT) on the marketplace.</DialogDescription>
                </DialogHeader>
                <form className="my-6 space-y-5" onSubmit={handleListAsset}>
                  <LabelInputContainer>
                    <Label htmlFor="listType">Asset Type</Label>
                    <select id="listType" value={listType} onChange={e => setListType(e.target.value as 'nft' | 'ft')} className="shadow-input rounded-md px-3 py-2">
                      <option value="nft">NFT</option>
                      <option value="ft">Fungible Token</option>
                    </select>
                  </LabelInputContainer>
                  
                 
                  <LabelInputContainer>
                    <Label htmlFor="listAssetId">Asset Object ID</Label>
                    <Input id="listAssetId" value={listAssetId} onChange={e => setListAssetId(e.target.value)} placeholder="Enter Asset NFT/FT Object ID" type="text" className="shadow-input font-mono text-sm" />
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

            
          </div>
        </BackgroundLines>
      </main>
    </div>
  );
};

export default Issuer;