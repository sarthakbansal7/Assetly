import React, { useState, useEffect } from 'react';
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

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (params: any) => void) => void;
      removeAllListeners: (event: string) => void;
    };
  }
}

const assetTypes = [
  'Real Estate',
  'Invoice',
  'Commodity',
  'Stocks',
  'CarbonCredit',
];

// Avalanche Fuji C-Chain network configuration
const AVALANCHE_FUJI_CHAIN_ID = '0xA869'; // 43113 in hex
const AVALANCHE_FUJI_CONFIG = {
  chainId: AVALANCHE_FUJI_CHAIN_ID,
  chainName: 'C-Chain Fuji',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://avascan.info/'],
};

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
  // Wallet connection state
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Dialog states
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
  const [listTokenId, setListTokenId] = useState('');
  const [listAmount, setListAmount] = useState('');
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
      // Validate required fields
      if (!listTokenId || !listAmount || !listPrice) {
        toast.error('Please fill all required fields');
        return;
      }
      
      // TODO: Implement actual listing logic here
      console.log('Listing asset:', { listTokenId, listAmount, listPrice });
      
      // Simulate listing success
      toast.success('Asset listed successfully!');
      setShowListDialog(false);
      
      // Reset form
      setListTokenId('');
      setListAmount('');
      setListPrice('');
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

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Check current network
  const checkNetwork = async () => {
    if (!isMetaMaskInstalled()) return false;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const isCorrect = chainId === AVALANCHE_FUJI_CHAIN_ID;
      setIsCorrectNetwork(isCorrect);
      return isCorrect;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  };

  // Connect wallet and automatically handle network
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Check current network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (chainId !== AVALANCHE_FUJI_CHAIN_ID) {
          // Automatically try to switch to Avalanche Fuji
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: AVALANCHE_FUJI_CHAIN_ID }],
            });
            setIsCorrectNetwork(true);
            toast.success('Connected and switched to C-Chain Fuji!');
          } catch (switchError: any) {
            // If network doesn't exist, add it automatically
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [AVALANCHE_FUJI_CONFIG],
                });
                setIsCorrectNetwork(true);
                toast.success('Connected and added C-Chain Fuji network!');
              } catch (addError) {
                console.error('Error adding network:', addError);
                toast.error('Failed to add C-Chain Fuji network');
                setIsCorrectNetwork(false);
              }
            } else {
              console.error('Error switching network:', switchError);
              toast.error('Failed to switch to C-Chain Fuji network');
              setIsCorrectNetwork(false);
            }
          }
        } else {
          setIsCorrectNetwork(true);
          toast.success('Wallet connected to C-Chain Fuji!');
        }
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('Please connect to MetaMask.');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Check wallet connection on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!isMetaMaskInstalled()) {
        setIsInitialLoading(false);
        return;
      }

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await checkNetwork();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount(null);
          setIsConnected(false);
          setIsCorrectNetwork(false);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        const isCorrect = chainId === AVALANCHE_FUJI_CHAIN_ID;
        setIsCorrectNetwork(isCorrect);
        if (isCorrect) {
          toast.success('Switched to Avalanche Fuji network');
        } else {
          toast.error('Please switch to Avalanche Fuji network');
        }
      });
    }

    // Cleanup event listeners
    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

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
          {/* Show connect wallet screen if not connected to correct network */}
          {!isConnected || !isCorrectNetwork ? (
            <div className="relative z-10 w-full max-w-md mx-auto">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-black mb-3">
                    Connect to Avalanche Fuji
                  </h2>
                  
                  <p className="text-gray-700 mb-8 leading-relaxed">
                    To access the Asset Issuer Dashboard, please connect your MetaMask wallet to the Avalanche Fuji C-Chain network.
                  </p>

                  {!isMetaMaskInstalled() ? (
                    <div className="space-y-4">
                      <p className="text-orange-600 text-sm">
                        MetaMask is required to use this application
                      </p>
                      <Button
                        onClick={() => window.open('https://metamask.io/download/', '_blank')}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Install MetaMask
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!isConnected ? (
                        <p className="text-blue-600 text-sm">Click below to connect your wallet</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-green-600 text-sm">
                            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
                          </p>
                          <p className="text-yellow-600 text-sm">Switching to Avalanche Fuji...</p>
                        </div>
                      )}
                      
                      <Button 
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {isConnecting && (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          )}
                          <span>
                            {isConnecting 
                              ? 'Connecting...' 
                              : !isConnected 
                                ? 'Connect Wallet' 
                                : 'Switch to Avalanche Fuji'
                            }
                          </span>
                        </div>
                      </Button>
                    </div>
                  )}

                  <div className="mt-6 text-xs text-gray-600 space-y-1">
                    <p>Network: Avalanche Fuji C-Chain (43113)</p>
                    <p>RPC: api.avax-test.network/ext/bc/C/rpc</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Show dashboard when connected to correct network */
            <div className="relative z-10 w-full max-w-7xl mx-auto">
              {/* Professional Dashboard Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
                  Asset Issuer Dashboard
                </h1>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-6">
                  Mint and manage your real-world assets on the blockchain
                </p>
                <div className="inline-flex items-center space-x-4 bg-black/10 backdrop-blur-sm rounded-full px-6 py-3 border border-black/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="w-px h-4 bg-black/20"></div>
                  <span className="text-gray-700 font-mono text-sm">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                  <div className="w-px h-4 bg-black/20"></div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-blue-600 font-medium">C-Chain Fuji</span>
                  </div>
                </div>
              </div>

            {/* Dashboard Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Mint Asset Card */}
              <div className="group bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-2xl border border-blue-500/20 hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 hover:border-blue-400/40">
                <div className="text-white">
                  <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-300 transition-colors duration-300 shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-100 transition-colors duration-300">Mint Asset</h3>
                  <p className="text-blue-100 mb-6 group-hover:text-blue-50 transition-colors duration-300">Create new tokenized real-world assets with custom properties and metadata.</p>
                  <Button 
                    onClick={() => setShowNFTDialog(true)}
                    className="w-full bg-white text-blue-800 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Mint Asset
                  </Button>
                </div>
              </div>

              {/* List Asset Card */}
              <div className="group bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 shadow-2xl border border-green-500/20 hover:shadow-green-500/20 transition-all duration-500 hover:scale-105 hover:border-green-400/40">
                <div className="text-white">
                  <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-300 transition-colors duration-300 shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-green-100 transition-colors duration-300">List on Marketplace</h3>
                  <p className="text-green-100 mb-6 group-hover:text-green-50 transition-colors duration-300">List your minted assets on the marketplace for trading and investment.</p>
                  <Button 
                    onClick={() => setShowListDialog(true)}
                    className="w-full bg-white text-green-800 hover:bg-green-50 font-semibold py-3 rounded-lg transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    List Asset
                  </Button>
                </div>
              </div>

              {/* Portfolio Overview Card */}
              <div className="group bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 shadow-2xl border border-purple-500/20 hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 hover:border-purple-400/40">
                <div className="text-white">
                  <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-300 transition-colors duration-300 shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-100 transition-colors duration-300">Portfolio</h3>
                  <p className="text-purple-100 mb-6 group-hover:text-purple-50 transition-colors duration-300">Track your issued assets performance and manage your portfolio.</p>
                  <Button 
                    className="w-full bg-white text-purple-800 hover:bg-purple-50 font-semibold py-3 rounded-lg transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    View Portfolio
                  </Button>
                </div>
              </div>
            </div>
          </div>
          )}

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
                          <option value="AVAX">AVAX</option>
                          <option value="USDC">USDC</option>
                          <option value="DAI">DAI</option>
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
                  <DialogDescription className="text-base text-neutral-600 dark:text-neutral-300 mb-4">Enter the token ID, amount, and price to list your asset on the marketplace.</DialogDescription>
                </DialogHeader>
                <form className="my-6 space-y-5" onSubmit={handleListAsset}>
                  <LabelInputContainer>
                    <Label htmlFor="listTokenId">Token ID</Label>
                    <Input id="listTokenId" value={listTokenId} onChange={e => setListTokenId(e.target.value)} placeholder="Enter token ID" type="number" className="shadow-input" />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="listAmount">Amount</Label>
                    <Input id="listAmount" value={listAmount} onChange={e => setListAmount(e.target.value)} placeholder="Enter amount to list" type="number" className="shadow-input" />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="listPrice">Price</Label>
                    <Input id="listPrice" value={listPrice} onChange={e => setListPrice(e.target.value)} placeholder="Enter price per token" type="number" className="shadow-input" />
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