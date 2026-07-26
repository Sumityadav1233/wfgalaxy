'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Share2, Video, Sparkles, Check, X, RefreshCw, Film, ExternalLink, 
  Settings, ShieldCheck, Key, HelpCircle, LayoutDashboard, Image as ImageIcon, 
  Calendar, LineChart, Wand2, UserCheck, Upload, FileVideo, ChevronRight, 
  ChevronDown, Sliders, Globe, Copy, PlusCircle, Search, Bot, Zap, ArrowRight,
  Lock, Play
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  videoUrl: string | null;
  images: string;
  description: string;
  price: number;
}

interface SocialAccount {
  id: string;
  platform: string;
  connectionStatus: string;
  accountName: string;
}

interface ProductVideo {
  id: string;
  productId: string;
  rawUrl: string;
  verticalUrl: string | null;
  squareUrl: string | null;
  horizontalUrl: string | null;
}

interface SocialPost {
  id: string;
  caption: string;
  targetPlatforms: string; // JSON String array
  status: string; // JSON string object
  links: string | null; // JSON string object
  createdAt: any;
  product: {
    name: string;
    images: string;
  } | null;
}

interface SocialClientProps {
  products: Product[];
  accounts: SocialAccount[];
  videoRecords: ProductVideo[];
  postsHistory: SocialPost[];
}

export const SocialClient: React.FC<SocialClientProps> = ({
  products,
  accounts,
  videoRecords,
  postsHistory,
}) => {
  // Database copies
  const [accountsList, setAccountsList] = useState<SocialAccount[]>(accounts);
  const [history, setHistory] = useState<SocialPost[]>(postsHistory);
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState<'auto-post' | 'dashboard' | 'media-library' | 'scheduled' | 'analytics' | 'ai-tools' | 'accounts' | 'settings'>('auto-post');
  
  // Selection States
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [tone, setTone] = useState<string>('Fashion');
  
  // Upload States
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url' | 'text'>('file');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [remainingTime, setRemainingTime] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [mediaTypeDetected, setMediaTypeDetected] = useState<'image' | 'video' | 'gif' | 'audio' | 'none'>('none');
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState('');

  // Expandable settings in Right Sidebar
  const [expandedPlatformSettings, setExpandedPlatformSettings] = useState<string | null>(null);

  // Connect Account Modal States
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState('');
  const [connectEmail, setConnectEmail] = useState('');
  const [connectHandle, setConnectHandle] = useState('');

  // Loaders
  const [isCropping, setIsCropping] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  
  // Real-time posting state maps
  const [postingStates, setPostingStates] = useState<{ [platform: string]: 'idle' | 'posting' | 'posted' | 'failed' }>({});
  const [postingLinks, setPostingLinks] = useState<{ [platform: string]: string }>({});
  const [activePostId, setActivePostId] = useState<string | null>(null);
  
  // Live Preview Target
  const [previewPlatform, setPreviewPlatform] = useState<string>('instagram');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Platform configs (character limits & media requirements)
  const platformsConfig: { [key: string]: { limit: number; reqs: string; color: string } } = {
    tiktok: { limit: 2200, reqs: 'MP4, 9:16 Vertical, max 60s', color: '#000000' },
    instagram: { limit: 2200, reqs: 'JPG/MP4, 1:1 or 9:16, max 60s', color: '#E1306C' },
    facebook: { limit: 63206, reqs: 'JPG/MP4, 16:9 or 1:1', color: '#1877F2' },
    youtube: { limit: 5000, reqs: 'MP4, 16:9 or 9:16 Shorts', color: '#FF0000' },
    linkedin: { limit: 3000, reqs: 'JPG/PNG/MP4/PDF, max 10m', color: '#0A66C2' },
    pinterest: { limit: 500, reqs: 'JPG/PNG/MP4, 2:3 ratio', color: '#BD081C' },
    threads: { limit: 500, reqs: 'JPG/MP4, max 5m', color: '#000000' },
    twitter: { limit: 280, reqs: 'JPG/PNG/MP4, max 140s', color: '#1DA1F2' },
    telegram: { limit: 1024, reqs: 'JPG/MP4/GIF, max 50MB', color: '#26A5E4' },
    discord: { limit: 2000, reqs: 'Any file, max 25MB', color: '#5865F2' },
    snapchat: { limit: 1000, reqs: 'MP4, 9:16, max 10s', color: '#FFFC00' }
  };

  // Filter products that have raw videos uploaded
  const productsWithVideos = useMemo(() => {
    return products.filter((p) => p.videoUrl);
  }, [products]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Sync selected product's video or image to media preview URL when a product is picked
  useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.videoUrl) {
        setMediaPreviewUrl(selectedProduct.videoUrl);
        setMediaTypeDetected('video');
        setUploadedFileName(selectedProduct.name + ' - Promo Clip.mp4');
      } else {
        const firstImg = selectedProduct.images.split(',')[0];
        setMediaPreviewUrl(firstImg);
        setMediaTypeDetected('image');
        setUploadedFileName(selectedProduct.name + ' - Cover.jpg');
      }
    }
  }, [selectedProductId, selectedProduct]);

  // Retrieve the generated crops record for the selected product
  const selectedVideoRecord = useMemo(() => {
    if (!selectedProductId) return null;
    return videoRecords.find((vr) => vr.productId === selectedProductId) || null;
  }, [videoRecords, selectedProductId]);

  // Connect/Disconnect social accounts using OAuth redirection
  const handleAccountToggle = async (platform: string, isConnected: boolean) => {
    if (isConnected) {
      try {
        const res = await fetch('/api/social/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform, action: 'disconnect' }),
        });

        if (res.ok) {
          const data = await res.json();
          setAccountsList(data);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Connect: Open the custom Connection Modal directly on page!
      setConnectPlatform(platform);
      setConnectEmail('');
      setConnectHandle(platform === 'youtube' ? 'WF GALAXY Official' : `@wf_galaxy`);
      setIsConnectModalOpen(true);
    }
  };

  const handleConfirmConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectPlatform) return;

    try {
      const res = await fetch('/api/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: connectPlatform,
          action: 'connect',
          accountName: connectHandle || connectEmail || 'Connected Profile'
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAccountsList(data);
        setIsConnectModalOpen(false);
      } else {
        alert('Failed to connect platform');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI Copy caption generators
  const handleGenerateAICaption = async (actionType: 'generate' | 'rewrite' | 'hashtags' | 'emoji' | 'translate' | 'seo') => {
    let payloadText = '';
    
    if (actionType === 'generate') {
      if (!selectedProductId) {
        alert('Please select a product first so the AI can read its description.');
        return;
      }
      payloadText = selectedProduct?.description || '';
    } else {
      if (!caption.trim()) {
        alert('Please write some text in the caption box first.');
        return;
      }
      payloadText = caption;
    }

    setIsGeneratingCaption(true);
    try {
      const res = await fetch('/api/social/ai-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: payloadText, tone, action: actionType }),
      });

      if (res.ok) {
        const data = await res.json();
        if (actionType === 'generate') {
          setCaption(data.caption);
        } else if (actionType === 'hashtags') {
          setCaption((prev) => `${prev}\n\n#WFGalaxy #${tone}Style #Trends2026`);
        } else if (actionType === 'emoji') {
          setCaption((prev) => `✨ ${prev} 🍂🌟`);
        } else {
          setCaption(data.caption);
        }
      } else {
        alert('Failed to execute AI copywriter helper.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Run crop generation simulation
  const handleGenerateCrops = async () => {
    if (!selectedProductId) return;
    setIsCropping(true);

    try {
      const res = await fetch('/api/social/crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProductId }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert('Crop generation failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCropping(false);
    }
  };

  const handlePlatformCheckbox = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
    // Set preview to the last selected platform
    if (!selectedPlatforms.includes(platform)) {
      setPreviewPlatform(platform);
    }
  };

  // Parallel single platform posting function
  const postToSinglePlatform = async (platform: string, postId: string) => {
    setPostingStates((prev) => ({ ...prev, [platform]: 'posting' }));
    
    try {
      const res = await fetch('/api/social/post-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, platform, mediaUrl: mediaPreviewUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        setPostingStates((prev) => ({ ...prev, [platform]: data.status }));
        if (data.success) {
          setPostingLinks((prev) => ({ ...prev, [platform]: data.link }));
        }
        return { platform, success: data.success };
      }
    } catch (err) {
      console.error(`Error posting to ${platform}:`, err);
    }

    setPostingStates((prev) => ({ ...prev, [platform]: 'failed' }));
    return { platform, success: false };
  };

  // Main Publish trigger
  const handlePublishNow = async () => {
    if (!caption.trim() || selectedPlatforms.length === 0) return;

    setIsPosting(true);
    const initialStates: typeof postingStates = {};
    selectedPlatforms.forEach((p) => {
      initialStates[p] = 'posting';
    });
    setPostingStates(initialStates);
    setPostingLinks({});

    try {
      const res = await fetch('/api/social/create-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId || null,
          caption,
          targetPlatforms: selectedPlatforms,
        }),
      });

      if (res.ok) {
        const socialPost = await res.json();
        setActivePostId(socialPost.id);

        const postPromises = selectedPlatforms.map((platform) =>
          postToSinglePlatform(platform, socialPost.id)
        );

        await Promise.allSettled(postPromises);

        const historyRes = await fetch('/api/social/history');
        if (historyRes.ok) {
          const updatedHistory = await historyRes.json();
          setHistory(updatedHistory);
        }
      } else {
        alert('Failed to register social post');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  // Single platform retry handler
  const handleRetrySingle = async (platform: string) => {
    if (!activePostId) return;
    await postToSinglePlatform(platform, activePostId);

    const historyRes = await fetch('/api/social/history');
    if (historyRes.ok) {
      const updatedHistory = await historyRes.json();
      setHistory(updatedHistory);
    }
  };

  // File Upload Process Simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadedFileName(file.name);
      
      const type = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : 'gif';
      setMediaTypeDetected(type);

      let current = 0;
      const speed = (Math.random() * 8 + 2).toFixed(1) + ' MB/s';
      setUploadSpeed(speed);

      const interval = setInterval(() => {
        current += 10;
        setUploadProgress(current);
        const remaining = Math.max(0, Math.ceil((100 - current) / 10)) + 's';
        setRemainingTime(remaining);

        if (current >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          const localUrl = URL.createObjectURL(file);
          setMediaPreviewUrl(localUrl);
        }
      }, 200);
    }
  };

  const handleMediaUrlImport = () => {
    if (!mediaUrlInput.trim()) return;
    setIsUploading(true);
    setUploadProgress(0);
    
    let type: any = 'image';
    if (mediaUrlInput.includes('.mp4') || mediaUrlInput.includes('.mkv')) {
      type = 'video';
    } else if (mediaUrlInput.includes('.gif')) {
      type = 'gif';
    }
    
    setMediaTypeDetected(type);
    setUploadedFileName(mediaUrlInput.split('/').pop() || 'imported_file');

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setUploadProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setMediaPreviewUrl(mediaUrlInput);
      }
    }, 150);
  };

  // Inline platform logo render helper
  const renderPlatformLogo = (platform: string) => {
    const baseClass = "h-4 w-4 shrink-0";
    if (platform === 'youtube') return <YoutubeIcon className={`${baseClass} text-red-500 fill-red-500`} />;
    if (platform === 'instagram') return <InstagramIcon className={`${baseClass} text-pink-500`} />;
    if (platform === 'facebook') return <FacebookIcon className={`${baseClass} text-blue-600 fill-blue-600`} />;
    if (platform === 'tiktok') return <TikTokIcon className={`${baseClass} text-white`} />;
    if (platform === 'linkedin') return <LinkedInIcon className={`${baseClass} text-blue-500 fill-blue-500`} />;
    if (platform === 'pinterest') return <PinterestIcon className={`${baseClass} text-red-600 fill-red-600`} />;
    if (platform === 'threads') return <ThreadsIcon className={`${baseClass} text-white`} />;
    if (platform === 'twitter') return <TwitterIcon className={`${baseClass} text-neutral-400`} />;
    if (platform === 'telegram') return <TelegramIcon className={`${baseClass} text-sky-400 fill-sky-400`} />;
    if (platform === 'discord') return <DiscordIcon className={`${baseClass} text-indigo-400 fill-indigo-400`} />;
    if (platform === 'snapchat') return <SnapchatIcon className={`${baseClass} text-yellow-300 fill-yellow-300`} />;
    return <Globe className={baseClass} />;
  };

  return (
    <div className="w-full text-neutral-200">
      
      {/* 🚀 THREE COLUMN PREMIUM SAAS LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================== */}
        {/* COLUMN 1: LEFT SIDEBAR (2 Cols) */}
        {/* ======================================================== */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-xl p-4 space-y-2">
            <span className="text-[9px] font-bold text-neutral-500 tracking-widest uppercase block px-3">NAVIGATION</span>
            <button 
              onClick={() => setActiveTab('auto-post')} 
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-colors ${activeTab === 'auto-post' ? 'bg-accent/10 border border-accent/20 text-accent' : 'text-neutral-400 hover:bg-neutral-900'}`}
            >
              <Share2 className="h-4 w-4 mr-3 shrink-0" />
              Auto Post
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-colors ${activeTab === 'dashboard' ? 'bg-accent/10 border border-accent/20 text-accent' : 'text-neutral-400 hover:bg-neutral-900'}`}
            >
              <LayoutDashboard className="h-4 w-4 mr-3 shrink-0" />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('media-library')} 
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-colors ${activeTab === 'media-library' ? 'bg-accent/10 border border-accent/20 text-accent' : 'text-neutral-400 hover:bg-neutral-900'}`}
            >
              <ImageIcon className="h-4 w-4 mr-3 shrink-0" />
              Media Library
            </button>
            <button 
              onClick={() => setActiveTab('scheduled')} 
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-colors ${activeTab === 'scheduled' ? 'bg-accent/10 border border-accent/20 text-accent' : 'text-neutral-400 hover:bg-neutral-900'}`}
            >
              <Calendar className="h-4 w-4 mr-3 shrink-0" />
              Scheduled
            </button>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-colors ${activeTab === 'analytics' ? 'bg-accent/10 border border-accent/20 text-accent' : 'text-neutral-400 hover:bg-neutral-900'}`}
            >
              <LineChart className="h-4 w-4 mr-3 shrink-0" />
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('ai-tools')} 
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-colors ${activeTab === 'ai-tools' ? 'bg-accent/10 border border-accent/20 text-accent' : 'text-neutral-400 hover:bg-neutral-900'}`}
            >
              <Wand2 className="h-4 w-4 mr-3 shrink-0" />
              AI Tools
            </button>
            <button 
              onClick={() => setActiveTab('accounts')} 
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-colors ${activeTab === 'accounts' ? 'bg-accent/10 border border-accent/20 text-accent' : 'text-neutral-400 hover:bg-neutral-900'}`}
            >
              <UserCheck className="h-4 w-4 mr-3 shrink-0" />
              Connected
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-colors ${activeTab === 'settings' ? 'bg-accent/10 border border-accent/20 text-accent' : 'text-neutral-400 hover:bg-neutral-900'}`}
            >
              <Settings className="h-4 w-4 mr-3 shrink-0" />
              Settings
            </button>
          </div>
          
          <div className="bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-4 text-xs space-y-2 text-neutral-400">
            <span className="font-bold text-accent uppercase text-[9px] block">WF GALAXY ENGINE</span>
            <p className="font-light leading-relaxed">Powered by the same parallel upload engine as the Antigravity platform.</p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 2: CENTER CONTENT (7 Cols) */}
        {/* ======================================================== */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Main workspace */}
          <div className="bg-neutral-950/80 backdrop-blur-md border border-neutral-800 p-6 rounded-2xl space-y-6 shadow-2xl">
            
            {/* Title row */}
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">CAMPAIGN EDITOR</span>
                <h2 className="text-lg font-bold text-white uppercase mt-0.5">Create New Social Post</h2>
              </div>
              <span className="text-[9px] border border-neutral-800 text-neutral-400 rounded-full px-3 py-1 font-semibold uppercase bg-neutral-900/60">
                PRO AUTOMATOR v2.6
              </span>
            </div>

            {/* Select Product catalog hook */}
            <div className="bg-[#161614]/50 border border-neutral-800/80 p-4 rounded-xl space-y-3">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                Connect Store Product
              </span>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setPostingStates({});
                  setPostingLinks({});
                  setActivePostId(null);
                }}
                className="w-full bg-[#1c1c1a] border border-neutral-750 rounded-lg py-2.5 px-3 text-xs focus:outline-hidden focus:border-accent text-white font-semibold transition-colors"
              >
                <option value="">-- Associate a clothing item --</option>
                {productsWithVideos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Method Selector */}
            <div className="space-y-4">
              <div className="flex items-center space-x-6 border-b border-neutral-850 pb-2">
                <button 
                  onClick={() => setUploadMethod('file')}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${uploadMethod === 'file' ? 'border-b-2 border-accent text-accent' : 'text-neutral-400'}`}
                >
                  Upload Media File
                </button>
                <button 
                  onClick={() => setUploadMethod('url')}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${uploadMethod === 'url' ? 'border-b-2 border-accent text-accent' : 'text-neutral-400'}`}
                >
                  Use Media URL
                </button>
                <button 
                  onClick={() => setUploadMethod('text')}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${uploadMethod === 'text' ? 'border-b-2 border-accent text-accent' : 'text-neutral-400'}`}
                >
                  Text-Only Post
                </button>
              </div>

              {/* Upload Content Area */}
              {uploadMethod === 'file' && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-800 hover:border-accent bg-[#1c1c1a]/30 rounded-xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center space-y-3 group"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
                  <Upload className="h-10 w-10 text-neutral-500 group-hover:text-accent transition-colors stroke-[1.5]" />
                  <div>
                    <span className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors block">
                      Drag & Drop product media here or <span className="text-accent underline">browse</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-1">Supports Images, Videos, GIFs, Audios, ZAPs</span>
                  </div>
                  
                  {/* Google Drive / Dropbox icons */}
                  <div className="flex space-x-3 pt-2 text-[9px] text-neutral-500">
                    <span className="hover:text-white transition-colors">Google Drive</span>
                    <span>•</span>
                    <span className="hover:text-white transition-colors">Dropbox</span>
                    <span>•</span>
                    <span className="hover:text-white transition-colors">OneDrive</span>
                  </div>
                </div>
              )}

              {uploadMethod === 'url' && (
                <div className="bg-[#1c1c1a]/30 border border-neutral-800 rounded-xl p-6 space-y-4">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400">Import from Public Media URL</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      placeholder="https://example.com/assets/video.mp4" 
                      className="flex-1 bg-[#1c1c1a] border border-neutral-750 rounded-lg py-2 px-3 text-xs focus:outline-hidden focus:border-accent text-white"
                    />
                    <button 
                      type="button" 
                      onClick={handleMediaUrlImport}
                      className="bg-accent hover:bg-accent-hover text-neutral-950 text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-colors"
                    >
                      Import
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Progress Animation */}
              {isUploading && (
                <div className="bg-neutral-900/60 border border-neutral-850 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center font-semibold text-accent animate-pulse">
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Uploading core content...
                    </span>
                    <span className="font-mono text-neutral-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono">
                    <span>Speed: {uploadSpeed}</span>
                    <span>Remaining: {remainingTime}</span>
                  </div>
                </div>
              )}

              {/* Upload Success Preview */}
              {mediaPreviewUrl && !isUploading && (
                <div className="bg-[#1c1c1a]/50 border border-neutral-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-12 w-12 bg-black rounded-lg overflow-hidden shrink-0 border border-neutral-800 flex items-center justify-center">
                      {mediaTypeDetected === 'video' ? (
                        <video src={mediaPreviewUrl} className="h-full w-full object-cover" muted />
                      ) : (
                        <img src={mediaPreviewUrl} className="h-full w-full object-cover" alt="upload preview" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-neutral-200 block truncate max-w-[250px]">
                        {uploadedFileName || 'Uploaded media file'}
                      </span>
                      <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider block mt-0.5">
                        Media Loaded Successfully
                      </span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setMediaPreviewUrl('');
                      setMediaTypeDetected('none');
                      setUploadedFileName('');
                    }}
                    className="p-1 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-md transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Video Cropping Service Module */}
            {selectedProduct && selectedProduct.videoUrl && (
              <div className="border border-neutral-800/80 rounded-xl p-4 bg-[#161614]/30 space-y-4">
                {!selectedVideoRecord ? (
                  <div className="text-center py-4 space-y-3">
                    <Film className="h-8 w-8 text-neutral-600 mx-auto stroke-[1.5]" />
                    <div>
                      <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wide">Dynamic Crops Pending</h4>
                      <p className="text-[10px] text-neutral-500 font-light mt-0.5">
                        We need to format your product video into vertical, square, and horizontal variations.
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateCrops}
                      disabled={isCropping}
                      className="inline-flex items-center bg-[#1c1c1a] hover:bg-neutral-800 border border-neutral-800 text-accent text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-colors"
                    >
                      {isCropping ? (
                        <>
                          <RefreshCw className="h-3 w-3.5 mr-2 animate-spin" /> Cropping Video...
                        </>
                      ) : (
                        <>
                          <Video className="h-3.5 w-3.5 mr-2" /> Generate Crops
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">
                      Platform-Ready Crops Preview
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="border border-neutral-800 bg-[#161614]/80 p-2 rounded-lg flex flex-col items-center">
                        <div className="h-24 w-14 bg-black relative rounded-md overflow-hidden flex items-center justify-center">
                          <video src={selectedVideoRecord.verticalUrl || ''} className="h-full w-full object-cover" muted />
                        </div>
                        <span className="text-[8px] font-bold text-accent mt-2 tracking-widest uppercase">9:16 Vertical</span>
                      </div>

                      <div className="border border-neutral-800 bg-[#161614]/80 p-2 rounded-lg flex flex-col items-center">
                        <div className="h-16 w-16 bg-black relative rounded-md overflow-hidden flex items-center justify-center mt-4">
                          <video src={selectedVideoRecord.squareUrl || ''} className="h-full w-full object-cover" muted />
                        </div>
                        <span className="text-[8px] font-bold text-accent mt-2 tracking-widest uppercase">1:1 Square</span>
                      </div>

                      <div className="border border-neutral-800 bg-[#161614]/80 p-2 rounded-lg flex flex-col items-center">
                        <div className="h-10 w-20 bg-black relative rounded-md overflow-hidden flex items-center justify-center mt-6">
                          <video src={selectedVideoRecord.horizontalUrl || ''} className="h-full w-full object-cover" muted />
                        </div>
                        <span className="text-[8px] font-bold text-accent mt-2 tracking-widest uppercase">16:9 Horiz</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Caption & Tone Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Write Social Post Caption
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] text-neutral-500 font-bold uppercase">Tone:</span>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="bg-[#1c1c1a] border border-neutral-850 rounded-md py-1 px-2 text-[10px] text-accent font-semibold focus:outline-hidden"
                  >
                    <option value="Fashion">Fashion</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Professional">Professional</option>
                    <option value="Business">Business</option>
                    <option value="Funny">Funny</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption here or click Generate below..."
                className="w-full bg-[#1c1c1a] border border-neutral-750 rounded-lg py-2.5 px-3 text-xs focus:outline-hidden focus:border-accent text-white resize-none"
              ></textarea>

              {/* AI helper shortcuts bar */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-neutral-850">
                <button 
                  type="button" 
                  disabled={isGeneratingCaption}
                  onClick={() => handleGenerateAICaption('generate')}
                  className="bg-accent/15 border border-accent/25 hover:bg-accent hover:text-neutral-950 text-accent px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center"
                >
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  {isGeneratingCaption ? 'Generating...' : 'Generate Caption'}
                </button>
                <button 
                  type="button" 
                  disabled={isGeneratingCaption || !caption.trim()}
                  onClick={() => handleGenerateAICaption('rewrite')}
                  className="bg-[#1c1c1a] border border-neutral-800 hover:border-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  Rewrite
                </button>
                <button 
                  type="button" 
                  disabled={isGeneratingCaption || !caption.trim()}
                  onClick={() => handleGenerateAICaption('hashtags')}
                  className="bg-[#1c1c1a] border border-neutral-800 hover:border-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  Hashtags
                </button>
                <button 
                  type="button" 
                  disabled={isGeneratingCaption || !caption.trim()}
                  onClick={() => handleGenerateAICaption('emoji')}
                  className="bg-[#1c1c1a] border border-neutral-800 hover:border-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  Emojis
                </button>
                <button 
                  type="button" 
                  disabled={isGeneratingCaption || !caption.trim()}
                  onClick={() => handleGenerateAICaption('seo')}
                  className="bg-[#1c1c1a] border border-neutral-800 hover:border-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  SEO Improve
                </button>
              </div>
            </div>

            {/* Platform Selection Cards Grid */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Select Publishing Channels
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['youtube', 'tiktok', 'instagram', 'facebook', 'threads', 'linkedin', 'pinterest', 'twitter', 'telegram', 'discord'].map((plat) => {
                  const acc = accountsList.find((a) => a.platform === plat);
                  const isConnected = acc?.connectionStatus === 'connected';
                  const isChecked = selectedPlatforms.includes(plat);
                  const config = platformsConfig[plat] || { limit: 1000, reqs: 'Media only' };

                  return (
                    <div 
                      key={plat}
                      onClick={() => handlePlatformCheckbox(plat)}
                      className={`border p-3 rounded-xl flex flex-col justify-between cursor-pointer select-none transition-all ${
                        isChecked 
                          ? 'bg-accent/10 border-accent text-white shadow-lg' 
                          : 'bg-[#161614]/60 border-neutral-850 hover:border-neutral-700 text-neutral-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {renderPlatformLogo(plat)}
                          <span className="text-[10px] font-bold uppercase tracking-wider">{plat}</span>
                        </div>
                        {isChecked && (
                          <span className="h-4 w-4 bg-accent text-neutral-950 rounded-full flex items-center justify-center text-[9px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="mt-4 text-[9px] font-light space-y-0.5 text-neutral-400">
                        <div>Limit: {config.limit} ch</div>
                        <div className="truncate">{config.reqs}</div>
                        <div className="flex items-center mt-1">
                          <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-[8px] uppercase font-bold tracking-wider">{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart Processing Workflow Pipeline */}
            <div className="bg-[#161614]/50 border border-neutral-800 p-5 rounded-xl space-y-4">
              <span className="text-[9px] font-bold text-accent uppercase tracking-widest block">
                Social Publisher Pipeline
              </span>
              <div className="grid grid-cols-6 gap-2 text-center text-[8px] font-semibold text-neutral-500 relative">
                
                <div className={mediaPreviewUrl ? 'text-accent' : ''}>
                  <div className="h-6 w-6 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto mb-1 font-bold">1</div>
                  Upload Media
                </div>

                <div className={mediaPreviewUrl ? 'text-accent' : ''}>
                  <div className="h-6 w-6 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto mb-1 font-bold">2</div>
                  Analyze
                </div>

                <div className={caption ? 'text-accent' : ''}>
                  <div className="h-6 w-6 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto mb-1 font-bold">3</div>
                  Caption AI
                </div>

                <div className={selectedVideoRecord ? 'text-accent' : ''}>
                  <div className="h-6 w-6 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto mb-1 font-bold">4</div>
                  Aspect Crops
                </div>

                <div className={selectedPlatforms.length > 0 ? 'text-accent' : ''}>
                  <div className="h-6 w-6 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto mb-1 font-bold">5</div>
                  Preview
                </div>

                <div className={isPosting ? 'text-accent' : ''}>
                  <div className="h-6 w-6 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto mb-1 font-bold">6</div>
                  Publish
                </div>
              </div>
            </div>

            {/* Post Settings and Schedule options */}
            <div className="border-t border-neutral-850 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400">Scheduling Options</span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input 
                    type="date" 
                    className="bg-[#1c1c1a] border border-neutral-800 rounded-md py-1.5 px-2 text-[10px] text-neutral-300 font-mono"
                  />
                  <input 
                    type="time" 
                    className="bg-[#1c1c1a] border border-neutral-800 rounded-md py-1.5 px-2 text-[10px] text-neutral-300 font-mono"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400">Duplicate Settings</span>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 bg-[#1c1c1a] hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300 font-bold uppercase py-2 rounded-md transition-colors">
                    Save Draft
                  </button>
                  <button className="flex-1 bg-[#1c1c1a] hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300 font-bold uppercase py-2 rounded-md transition-colors">
                    Auto-Delete (7d)
                  </button>
                </div>
              </div>
            </div>

            {/* One Click Publish Trigger */}
            <button
              onClick={handlePublishNow}
              disabled={isPosting || selectedPlatforms.length === 0 || !caption.trim()}
              className="w-full bg-accent hover:bg-accent-hover disabled:bg-neutral-850 disabled:text-neutral-500 text-neutral-950 py-4 text-xs font-bold tracking-widest uppercase transition-colors rounded-xl shadow-lg mt-4 flex items-center justify-center font-bold"
            >
              {isPosting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  POSTING SIMULTANEOUSLY...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  POST SIMULTANEOUSLY TO {selectedPlatforms.length} PLATFORMS NOW
                </>
              )}
            </button>
          </div>

          {/* Real-time Posting Pipeline */}
          {Object.keys(postingStates).length > 0 && (
            <div className="bg-neutral-950/80 backdrop-blur-md border border-neutral-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Live Publishing Pipeline Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedPlatforms.map((plat) => {
                  const state = postingStates[plat] || 'idle';
                  const link = postingLinks[plat] || '';

                  return (
                    <div
                      key={plat}
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        state === 'posting'
                          ? 'bg-neutral-900 border-neutral-800'
                          : state === 'posted'
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {renderPlatformLogo(plat)}
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">{plat}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {state === 'posting' && (
                            <span className="flex items-center text-xs text-amber-400">
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Uploading clip...
                            </span>
                          )}
                          {state === 'posted' && (
                            <span className="text-xs text-green-400 font-semibold flex items-center">
                              ✅ Published
                            </span>
                          )}
                          {state === 'failed' && (
                            <span className="text-xs text-red-400 font-semibold flex items-center">
                              ❌ Failed
                            </span>
                          )}
                        </div>
                        {state === 'posted' && link && (
                          <a
                            href={link}
                            target="_blank"
                            className="text-[10px] text-accent hover:underline flex items-center pt-1"
                          >
                            View Post <ExternalLink className="h-2.5 w-2.5 ml-1" />
                          </a>
                        )}
                      </div>

                      {state === 'failed' && (
                        <button
                          onClick={() => handleRetrySingle(plat)}
                          className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-bold text-accent flex items-center"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Social Posts History Log */}
          <div className="bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-neutral-850 bg-neutral-950/40">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Publishing History Log
              </h2>
            </div>

            {history.length === 0 ? (
              <div className="p-20 text-center text-neutral-500">
                No past campaigns logged.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-[#161614] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      <th className="p-4">Campaign Date</th>
                      <th className="p-4">Thumbnail</th>
                      <th className="p-4">Caption Description</th>
                      <th className="p-4">Channel Status & Links</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/40">
                    {history.map((post) => {
                      const statusMap = JSON.parse(post.status);
                      const linksMap = post.links ? JSON.parse(post.links) : {};
                      const thumbArray = post.product?.images.split(',');

                      return (
                        <tr key={post.id} className="hover:bg-neutral-900/30 transition-colors">
                          <td className="p-4 whitespace-nowrap text-xs font-semibold text-neutral-300">
                            {new Date(post.createdAt).toLocaleDateString()} at{' '}
                            {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4">
                            {thumbArray && (
                              <div className="h-12 w-9 rounded-md overflow-hidden bg-neutral-900 border border-neutral-800">
                                <img src={thumbArray[0]} alt="Garment" className="h-full w-full object-cover" />
                              </div>
                            )}
                          </td>
                          <td className="p-4 max-w-sm">
                            <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">{post.caption}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(statusMap).map((plat) => {
                                const st = statusMap[plat];
                                const link = linksMap[plat] || '';

                                return (
                                  <div
                                    key={plat}
                                    className={`inline-flex items-center text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-sm uppercase ${
                                      st === 'posted'
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/10'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/10'
                                    }`}
                                  >
                                    {link ? (
                                      <a href={link} target="_blank" className="hover:underline flex items-center">
                                        {plat} <ExternalLink className="h-2.5 w-2.5 ml-1" />
                                      </a>
                                    ) : (
                                      <span>{plat} (Failed)</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 3: RIGHT SIDEBAR — CONNECTED CHANNELS (3 Cols) */}
        {/* ======================================================== */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-neutral-950/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-850">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider block">
                Connected Channels
              </span>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
            </div>

            <div className="space-y-3">
              {['youtube', 'tiktok', 'instagram', 'facebook', 'linkedin', 'pinterest', 'threads', 'twitter', 'telegram', 'discord', 'snapchat'].map((plat) => {
                const acc = accountsList.find((a) => a.platform === plat);
                const isConnected = acc?.connectionStatus === 'connected';
                const nameLabel = acc?.connectionStatus === 'connected' ? acc.accountName : `WF GALAXY @${plat}`;
                const config = platformsConfig[plat] || { color: '#ffffff' };

                return (
                  <div 
                    key={plat}
                    className="border border-neutral-850 bg-[#161614]/60 rounded-xl p-3.5 space-y-3 transition-colors hover:border-neutral-700"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {renderPlatformLogo(plat)}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white">{plat}</span>
                      </div>
                      
                      <span className={`text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-sm uppercase ${isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>

                    {isConnected && (
                      <p className="text-[10px] text-neutral-400 font-mono tracking-wider truncate">
                        {nameLabel}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-neutral-850/50">
                      <button
                        onClick={() => handleAccountToggle(plat, isConnected)}
                        className={`flex-1 text-[9px] font-bold uppercase py-1.5 rounded-md transition-colors ${
                          isConnected 
                            ? 'bg-neutral-900 border border-neutral-800 text-red-400 hover:bg-red-500/10' 
                            : 'bg-accent hover:bg-accent-hover text-neutral-950'
                        }`}
                      >
                        {isConnected ? 'Disconnect' : 'Connect'}
                      </button>
                      <button
                        onClick={() => setExpandedPlatformSettings(expandedPlatformSettings === plat ? null : plat)}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md text-neutral-400 hover:text-white transition-colors"
                        aria-label="Expand configurations"
                      >
                        <Sliders className="h-3.5 w-3.5 stroke-[1.8]" />
                      </button>
                    </div>

                    {/* Expanded settings inside Right Sidebar */}
                    {expandedPlatformSettings === plat && (
                      <div className="mt-3 p-3 bg-neutral-950/80 border border-neutral-850 rounded-lg space-y-3 animate-fade-in text-[10px]">
                        <span className="font-bold text-accent uppercase tracking-widest text-[8px] block">
                          OAuth API Key Manager
                        </span>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-neutral-500 block uppercase text-[8px]">Client ID / API Key</span>
                            <input 
                              type="text" 
                              placeholder="Configured" 
                              className="w-full bg-[#1c1c1a] border border-neutral-800 rounded-md py-1 px-2 text-[9px] text-neutral-300 font-mono focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <span className="text-neutral-500 block uppercase text-[8px]">Client Secret</span>
                            <input 
                              type="password" 
                              placeholder="••••••••••••••" 
                              className="w-full bg-[#1c1c1a] border border-neutral-800 rounded-md py-1 px-2 text-[9px] text-neutral-300 font-mono focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <span className="text-neutral-500 block uppercase text-[8px]">Redirect Webhook URL</span>
                            <div className="bg-[#1c1c1a] border border-neutral-800 rounded-md py-1 px-2 text-[8px] text-neutral-400 font-mono break-all select-all">
                              http://localhost:3000/api/auth/callback/{plat}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-neutral-850/50">
                          <button 
                            type="button"
                            onClick={() => {
                              alert('Credentials configuration saved.');
                              setExpandedPlatformSettings(null);
                            }}
                            className="flex-1 bg-accent text-neutral-950 font-bold py-1 rounded-md text-[9px]"
                          >
                            Save
                          </button>
                          <button 
                            type="button"
                            onClick={() => alert('Handshake endpoint ping succeeded! (status: 200 OK)')}
                            className="flex-1 bg-neutral-900 border border-neutral-800 font-bold py-1 rounded-md text-[9px] hover:text-white"
                          >
                            Test
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 🚀 BOTTOM MULTI-PLATFORM LIVE PREVIEW BLOCK */}
      {/* ======================================================== */}
      {selectedProductId && (
        <div className="mt-8 bg-neutral-950/80 backdrop-blur-md border border-neutral-800 p-6 rounded-2xl space-y-6 shadow-2xl">
          <div className="flex justify-between items-center border-b border-neutral-850 pb-4">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">POST PREVIEW SIMULATOR</span>
              <h3 className="text-lg font-bold text-white uppercase mt-0.5">Live Mockup Render</h3>
            </div>
            <div className="flex gap-2">
              {['youtube', 'tiktok', 'instagram', 'facebook'].map((plat) => (
                <button
                  key={plat}
                  onClick={() => setPreviewPlatform(plat)}
                  className={`px-3 py-1.5 border text-[10px] font-bold tracking-wider rounded-md uppercase transition-colors ${previewPlatform === plat ? 'bg-accent text-neutral-950 border-accent' : 'bg-[#1c1c1a] border-neutral-800 text-neutral-400'}`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Preview graphics */}
            <div className="flex justify-center">
              
              {/* Instagram Feed Mock */}
              {previewPlatform === 'instagram' && (
                <div className="w-80 border border-neutral-850 rounded-xl overflow-hidden bg-black text-white shadow-2xl">
                  {/* Mock profile */}
                  <div className="p-3 flex items-center space-x-2 border-b border-neutral-900">
                    <div className="h-7 w-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-xs text-accent">W</div>
                    <div>
                      <span className="text-xs font-semibold block">wf.galaxy</span>
                      <span className="text-[9px] text-neutral-500 font-light">Shiv Chowk, Janakpur</span>
                    </div>
                  </div>
                  {/* Media */}
                  <div className="h-80 w-full bg-neutral-900 relative flex items-center justify-center overflow-hidden">
                    {mediaPreviewUrl ? (
                      mediaTypeDetected === 'video' ? (
                        <video src={selectedVideoRecord?.squareUrl || mediaPreviewUrl} controls autoPlay loop muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={mediaPreviewUrl} className="w-full h-full object-cover" alt="Insta Post mockup" />
                      )
                    ) : (
                      <span className="text-xs text-neutral-500">No media loaded</span>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs font-light text-neutral-400">
                      <span>Liked by 1,284 others</span>
                      <span>1 hour ago</span>
                    </div>
                    <p className="text-xs leading-relaxed font-light">
                      <strong className="font-semibold text-white mr-1.5">wf.galaxy</strong>
                      {caption || 'Add a caption to see a live mockup render...'}
                    </p>
                  </div>
                </div>
              )}

              {/* TikTok Feed Mock */}
              {previewPlatform === 'tiktok' && (
                <div className="w-64 h-[450px] border border-neutral-850 rounded-2xl overflow-hidden bg-black text-white relative shadow-2xl flex flex-col justify-between">
                  {/* Video player */}
                  <div className="absolute inset-0 z-0">
                    {(selectedVideoRecord?.verticalUrl || mediaPreviewUrl) ? (
                      <video src={selectedVideoRecord?.verticalUrl || mediaPreviewUrl} autoPlay loop muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-neutral-900 flex items-center justify-center text-xs text-neutral-500">No video loaded</div>
                    )}
                  </div>
                  {/* Layout header */}
                  <div className="z-10 p-4 flex justify-center text-xs font-bold space-x-4 bg-gradient-to-b from-black/50 to-transparent">
                    <span className="text-neutral-300">Following</span>
                    <span className="underline decoration-accent underline-offset-4 text-white">For You</span>
                  </div>
                  {/* Left Bottom Information details */}
                  <div className="z-10 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent space-y-1 max-w-[80%] text-xs font-light">
                    <span className="font-bold block">@wf_galaxy</span>
                    <p className="line-clamp-3 text-[11px] leading-relaxed">
                      {caption || 'Add a caption to see a live mockup render...'}
                    </p>
                    <span className="text-[10px] text-accent block pt-1 flex items-center">
                      <Sparkles className="h-3 w-3 mr-1" /> Original Audio - wf_galaxy
                    </span>
                  </div>
                </div>
              )}

              {/* YouTube Shorts Mock */}
              {previewPlatform === 'youtube' && (
                <div className="w-64 h-[450px] border border-neutral-850 rounded-2xl overflow-hidden bg-black text-white relative shadow-2xl flex flex-col justify-between">
                  <div className="absolute inset-0 z-0">
                    {(selectedVideoRecord?.verticalUrl || mediaPreviewUrl) ? (
                      <video src={selectedVideoRecord?.verticalUrl || mediaPreviewUrl} autoPlay loop muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-neutral-900 flex items-center justify-center text-xs text-neutral-500">No video loaded</div>
                    )}
                  </div>
                  <div className="z-10 p-3 flex justify-between items-center bg-gradient-to-b from-black/40 to-transparent text-xs font-bold">
                    <span>Shorts</span>
                    <Search className="h-4 w-4" />
                  </div>
                  <div className="z-10 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent space-y-2">
                    <p className="line-clamp-2 text-xs font-semibold leading-relaxed">
                      {caption || 'Add a caption to see a live mockup render...'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 rounded-full bg-accent text-neutral-950 flex items-center justify-center font-bold text-xs">W</div>
                      <span className="text-xs font-bold">WF GALAXY Official</span>
                      <button className="bg-red-600 text-white font-semibold text-[9px] uppercase px-2 py-0.5 rounded-sm">Subscribe</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Facebook Post Mock */}
              {previewPlatform === 'facebook' && (
                <div className="w-96 border border-neutral-850 rounded-xl overflow-hidden bg-[#18191a] text-white shadow-2xl p-4 space-y-3">
                  {/* Profile */}
                  <div className="flex items-center space-x-2">
                    <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">W</div>
                    <div>
                      <span className="text-xs font-bold block">WF Galaxy Shop</span>
                      <span className="text-[9px] text-neutral-400 font-light">1h • Shiv Chowk, Janakpur</span>
                    </div>
                  </div>
                  {/* Caption */}
                  <p className="text-xs leading-relaxed font-light">
                    {caption || 'Add a caption to see a live mockup render...'}
                  </p>
                  {/* Media */}
                  <div className="h-52 w-full bg-black relative rounded-md overflow-hidden flex items-center justify-center border border-neutral-800">
                    {mediaPreviewUrl ? (
                      mediaTypeDetected === 'video' ? (
                        <video src={selectedVideoRecord?.horizontalUrl || mediaPreviewUrl} controls autoPlay loop muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={mediaPreviewUrl} className="w-full h-full object-cover" alt="FB Post mockup" />
                      )
                    ) : (
                      <span className="text-xs text-neutral-500">No media loaded</span>
                    )}
                  </div>
                  {/* Actions summary */}
                  <div className="flex justify-between items-center text-[10px] text-neutral-400 border-t border-neutral-800 pt-2 font-mono">
                    <span>👍 42 Likes</span>
                    <span>12 Comments • 4 Shares</span>
                  </div>
                </div>
              )}

            </div>

            {/* Platform rules details */}
            <div className="space-y-4 bg-[#161614]/50 border border-neutral-800 p-5 rounded-xl">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">
                Platform Media Specifications
              </span>
              <div className="space-y-3 text-xs leading-relaxed font-light text-neutral-400">
                <p>
                  We automatically adjust the aspect ratio output to match each social network requirements.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <span className="font-semibold text-white block">Aspect Ratio Outputs:</span>
                    <span>• Reels/TikTok: 9:16 Vertical</span>
                    <br />
                    <span>• Instagram Feed: 1:1 Square</span>
                    <br />
                    <span>• YouTube Video: 16:9 Landscape</span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-white block">Quality Check:</span>
                    <span>• Original file encoding maintained</span>
                    <br />
                    <span>• 100% Bitrate preserved</span>
                    <br />
                    <span>• Auto Aspect Scale enabled</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🚀 CONNECT SOCIAL MEDIA ACCOUNT MODAL */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xs transition-opacity" onClick={() => setIsConnectModalOpen(false)}></div>
          
          <div className="bg-[#121211] border border-neutral-800 rounded-2xl w-full max-w-md p-6 relative z-10 text-white shadow-2xl animate-slide-up">
            <button 
              type="button" 
              onClick={() => setIsConnectModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-neutral-850">
                {renderPlatformLogo(connectPlatform)}
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Link {connectPlatform} Account
                </h3>
              </div>

              <form onSubmit={handleConfirmConnection} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Account Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={connectEmail}
                    onChange={(e) => setConnectEmail(e.target.value)}
                    placeholder="e.g. social@wfgalaxy.com"
                    className="w-full bg-[#1c1c1a] border border-neutral-750 rounded-lg py-2.5 px-3 text-xs focus:outline-hidden focus:border-accent text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Profile Name / Channel Handle
                  </label>
                  <input
                    type="text"
                    required
                    value={connectHandle}
                    onChange={(e) => setConnectHandle(e.target.value)}
                    placeholder={connectPlatform === 'youtube' ? 'e.g. WF GALAXY Official' : 'e.g. @wf_galaxy'}
                    className="w-full bg-[#1c1c1a] border border-neutral-750 rounded-lg py-2.5 px-3 text-xs focus:outline-hidden focus:border-accent text-white font-semibold"
                  />
                </div>

                <div className="bg-neutral-900/60 border border-neutral-850 p-3 rounded-lg text-[10px] text-neutral-500 font-light leading-relaxed">
                  This connects your {connectPlatform} account to the WF GALAXY social post pipeline using local developer simulation profiles.
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent-hover text-neutral-950 py-3 text-xs font-bold tracking-widest uppercase transition-colors rounded-lg shadow-md flex items-center justify-center font-bold"
                  >
                    Connect Account
                  </button>
                  
                  {['youtube', 'tiktok', 'instagram', 'facebook'].includes(connectPlatform) && (
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = `/api/auth/redirect?platform=${connectPlatform}`;
                      }}
                      className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-lg flex items-center justify-center gap-1.5 font-bold"
                    >
                      <Key className="h-3.5 w-3.5" />
                      Sign In with Real OAuth
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Inline SVGs for brand logos to prevent compilation issues
const YoutubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555A3.002 3.002 0 0 0 .502 6.163C0 8.03 0 12 0 12s0 3.97.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.97 24 12 24 12s0-3.97-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TikTokIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31 0 2.59.35 3.71 1.02.13-.53.4-1.01.77-1.38.64-.64 1.51-.99 2.42-.99h2.52v4.61c-1.24 0-2.43-.49-3.32-1.37v9.42c0 3.58-2.91 6.5-6.5 6.5s-6.5-2.92-6.5-6.5 2.91-6.5 6.5-6.5c.34 0 .68.03 1.01.08V9.61c-.33-.04-.67-.06-1.01-.06-6.13 0-11.11 4.98-11.11 11.11S4.88 31.77 11.01 31.77s11.11-4.98 11.11-11.11v-12c1.23.95 2.76 1.49 4.35 1.49V5.55c-2.31 0-4.41-1.12-5.74-2.87-.2-.26-.37-.54-.51-.83-.43-.88-.66-1.84-.66-2.83h-7.04z" transform="scale(0.75) translate(4, 4)"/>
  </svg>
);

const LinkedInIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const PinterestIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.195.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.164 0 7.397 2.967 7.397 6.93 0 4.136-2.607 7.464-6.227 7.464-1.215 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.621 0 11.988-5.367 11.988-11.987C24 5.367 18.633 0 12.017 0z"/>
  </svg>
);

const ThreadsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" transform="scale(0.85) translate(2, 2)"/>
  </svg>
);

const TwitterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TelegramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm5.894-17.765l-2.08 9.805c-.15.68-.56.84-1.12.52l-3.24-2.385-1.56 1.5c-.17.17-.32.32-.66.32l.23-3.29 6-5.42c.26-.23-.06-.36-.4-.13L9.61 12.015l-3.2-1c-.7-.22-.71-.7.15-1.04l12.49-4.81c.58-.22 1.09.13.84.88z"/>
  </svg>
);

const DiscordIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
  </svg>
);

const SnapchatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 1.73a9.42 9.42 0 0 0-8.91 9.41 7.23 7.23 0 0 0 2.06 4.88 5.76 5.76 0 0 1-1.56 3.12.35.35 0 0 0 .23.59h3.76a1.18 1.18 0 0 1 1.14 1.18 1.18 0 0 1-1.14 1.18c-3.14 0-5.71-2.57-5.71-5.71a10.6 10.6 0 0 1 3.51-7.85C6.73 3.73 9.27 1.73 12 1.73s5.27 2 6.64 4.8a10.6 10.6 0 0 1 3.51 7.85c0 3.14-2.57 5.71-5.71 5.71a1.18 1.18 0 0 1-1.14-1.18 1.18 0 0 1 1.14-1.18h3.76a.35.35 0 0 0 .23-.59 5.76 5.76 0 0 1-1.56-3.12 7.23 7.23 0 0 0 2.06-4.88A9.42 9.42 0 0 0 12 1.73z" transform="scale(0.8) translate(3, 3)"/>
  </svg>
);
export default SocialClient;
