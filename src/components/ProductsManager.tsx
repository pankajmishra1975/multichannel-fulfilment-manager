import React, { useState, useRef } from 'react';
import { Product, Category } from '../types';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Save, 
  Upload, 
  Download, 
  AlertTriangle, 
  Check, 
  DollarSign, 
  Scale, 
  RefreshCw,
  FileSpreadsheet,
  X,
  PlusCircle,
  TrendingUp,
  Sliders,
  Maximize2,
  Sparkles,
  Loader2,
  Link,
  Trash2,
  Boxes,
  CloudLightning,
  Globe,
  FolderTree
} from 'lucide-react';

const storeListings = [
  { channelSku: 'AMZ-EARBUDS-PRO-BLK', title: 'Wireless Noise-Cancelling Earbuds Pro (Active Black Edition)', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=60', channel: 'amazon' },
  { channelSku: 'AMZ-CABLE-USB-6FT', title: '6ft Nylon Braided USB-C Charging Cable (Fast Charge Core)', image: 'https://images.unsplash.com/photo-1589615224935-07d409439d0c?w=200&auto=format&fit=crop&q=60', channel: 'amazon' },
  { channelSku: 'EBAY-BAMBOO-BOARDS-3PC', title: '3-Piece Eco-Friendly Bamboo Cutting Board Set (Organic Master)', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&auto=format&fit=crop&q=60', channel: 'ebay' },
  { channelSku: 'EBAY-BLENDER-PRO-1200', title: 'Commercial Grade Professional Kitchen Blender 1200W Turbo', image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=200&auto=format&fit=crop&q=60', channel: 'ebay' },
  { channelSku: 'AMZ-OFFICE-CHAIR-MOCK', title: 'Ergonomic Mesh Swivel Desk Chair (Adjustable Executive Lumbar)', image: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=200&auto=format&fit=crop&q=60', channel: 'amazon' },
  { channelSku: 'EBAY-YOGA-MAT-PRO', title: 'Premium Anti-Slip Yoga Exercise Mat (High Density Fitness Grip)', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=200&auto=format&fit=crop&q=60', channel: 'ebay' }
];

interface ProductsManagerProps {
  products: Product[];
  categories: Category[];
  inventoryThreshold: number;
  onUpdateThreshold: (threshold: number) => Promise<void>;
  onSyncProducts: (channel: 'all' | 'amazon' | 'ebay') => Promise<void>;
  onUpdateProduct: (productDetails: any) => Promise<void>;
  onImportProducts: (itemsToImport: any[]) => Promise<void>;
  onCreateCategory?: (category: Category) => void;
  onUpdateCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
  unitSystem?: string;
  currency?: string;
}

export default function ProductsManager({
  products,
  categories = [],
  inventoryThreshold,
  onUpdateThreshold,
  onSyncProducts,
  onUpdateProduct,
  onImportProducts,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  unitSystem,
  currency = 'USD'
}: ProductsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'categories' | 'mapping' | 'extraction' | 'listing'>('catalog');
  
  // Extraction States
  const [extractChannel, setExtractChannel] = useState<'amazon' | 'ebay' | 'shopify' | 'woocommerce' | 'magento'>('amazon');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedItems, setExtractedItems] = useState<any[]>([]);

  // Listing Configurator States
  const [selectedProductForListing, setSelectedProductForListing] = useState<string>('');
  const [listingChannel, setListingChannel] = useState<'amazon' | 'ebay' | 'shopify'>('amazon');
  const [listingTemplate, setListingTemplate] = useState('default');
  const [listingPrice, setListingPrice] = useState<number>(0);
  const [listingSku, setListingSku] = useState('');
  const [listingTitle, setListingTitle] = useState('');
  const [isPublishingListing, setIsPublishingListing] = useState(false);
  // Channel-specific required attributes (dynamic)
  const [listingAttributes, setListingAttributes] = useState<Record<string, string>>({});
  const [skuMappings, setSkuMappings] = useState<any[]>([]);
  const [isFetchingMappings, setIsFetchingMappings] = useState(false);
  const [mappingForm, setMappingForm] = useState({ channelSku: '', warehouseSku: '', channel: 'amazon' });
  const [isAddingMapping, setIsAddingMapping] = useState(false);
  const [mappingSearch, setMappingSearch] = useState('');
  const [mappingSuccessMsg, setMappingSuccessMsg] = useState<string | null>(null);
  
  // Smart Auto-Mapping Assistant States
  const [runningAiMatches, setRunningAiMatches] = useState<Record<string, boolean>>({});
  const [aiOverrideSuggestions, setAiOverrideSuggestions] = useState<Record<string, any>>({});
  const [customOverrideSkus, setCustomOverrideSkus] = useState<Record<string, string>>({});
  const [isAutoMappingBulk, setIsAutoMappingBulk] = useState(false);

  const currencySymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
  const weightUnit = unitSystem === 'metric' ? 'g' : 'oz';

  // Heuristic Offline Matching Engine
  const getOfflineMappingSuggestion = (listing: any) => {
    let bestMatch: any = null;
    let bestScore = -1;
    let bestType = 'hybrid';
    let bestReason = '';

    for (const p of products) {
      let skuScore = 0;
      let titleScore = 0;
      let imageScore = 0;
      let reasons: string[] = [];

      const cleanCSku = (listing.channelSku || "").toLowerCase();
      const cleanWSku = (p.sku || "").toLowerCase();

      // 1. SKU Matching Score (max 45)
      if (cleanCSku === cleanWSku) {
        skuScore = 45;
        reasons.push("SKU is an exact match");
      } else {
        const cParts = cleanCSku.split(/[-_\s]+/);
        const wParts = cleanWSku.split(/[-_\s]+/);
        let overlaps = 0;
        for (const part of cParts) {
          if (part.length > 2 && wParts.includes(part)) {
            overlaps++;
          }
        }
        if (overlaps > 0) {
          skuScore = 15 + Math.min(overlaps * 10, 25);
          reasons.push(`SKU segments match ("${overlaps} identifiers")`);
        } else if (cleanCSku.substring(0, 3) === cleanWSku.substring(0, 3)) {
          skuScore = 10;
          reasons.push("SKU shares same channel prefix");
        }
      }

      // 2. Title Semantics Word Match (max 40)
      const cWords = (listing.title || "").toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter((w: string) => w.length > 2);
      const pWords = (p.name || "").toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter((w: string) => w.length > 2);
      const stopwords = ["with", "and", "the", "for", "out", "new", "pro", "premium", "inch", "high", "speed", "edition", "turbo", "core"];
      const filteredCW = cWords.filter((w: string) => !stopwords.includes(w));
      const filteredPW = pWords.filter((w: string) => !stopwords.includes(w));

      const matchingWords = filteredCW.filter((w: string) => filteredPW.includes(w));
      if (matchingWords.length > 0) {
        titleScore = (matchingWords.length / Math.max(filteredPW.length, 1)) * 40;
        reasons.push(`Words overlap: "${matchingWords.slice(0, 3).join(', ')}"`);
      }

      // 3. Image Keywords Match (max 15)
      const cImgUrl = (listing.image || '').toLowerCase();
      const pImgUrl = (p.image || '').toLowerCase();
      const imageKeywords = ["earbuds", "cable", "chair", "blender", "board", "cutting", "watch", "yoga", "mat"];
      let imageMatchedWord = '';
      for (const kw of imageKeywords) {
        if (cImgUrl.includes(kw) && pImgUrl.includes(kw)) {
          imageScore = 15;
          imageMatchedWord = kw;
          break;
        }
      }
      if (imageScore > 0) {
        reasons.push(`Images match category "${imageMatchedWord}"`);
      }

      const totalScore = skuScore + titleScore + imageScore;
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestMatch = p;
        if (skuScore > 20 && titleScore > 20) {
          bestType = 'hybrid';
        } else if (skuScore > titleScore) {
          bestType = 'sku';
        } else {
          bestType = 'title';
        }
        bestReason = reasons.join(', ') || 'Partial matching identifiers detected.';
      }
    }

    const confidence = Math.min(Math.round(bestScore), 100);
    if (confidence < 15 || !bestMatch) {
      return {
        suggestedWarehouseSku: '',
        suggestedProductName: '',
        confidence: 0,
        matchReason: 'No physical warehouse product in the catalog matches this external store listing.',
        matchType: 'hybrid'
      };
    }

    return {
      suggestedWarehouseSku: bestMatch.sku,
      suggestedProductName: bestMatch.name,
      confidence,
      matchReason: bestReason,
      matchType: bestType
    };
  };

  // Run AI-Powered Gemini Deep Match API
  const handleVerifyWithAi = async (listing: any) => {
    setRunningAiMatches(prev => ({ ...prev, [listing.channelSku]: true }));
    try {
      const res = await fetch('/api/ai/sku-mappings/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelSku: listing.channelSku,
          channelTitle: listing.title,
          channelImage: listing.image,
          channel: listing.channel
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAiOverrideSuggestions(prev => ({ ...prev, [listing.channelSku]: data }));
      } else {
        alert(data.error || 'Failed to generate smart recommendations.');
      }
    } catch (e: any) {
      console.error('Error running AI Matcher:', e);
      alert('An error occurred during AI Deep Matching: ' + (e.message || e));
    } finally {
      setRunningAiMatches(prev => ({ ...prev, [listing.channelSku]: false }));
    }
  };

  // Apply single mapping rule
  const handleApplySuggestion = async (channelSku: string, warehouseSku: string, channel: string) => {
    if (!warehouseSku) {
      alert('Please select or verify the warehouse product to map first!');
      return;
    }

    // Validation check: Warn user if target warehouse SKU is already mapped to another channel SKU to prevent duplicate routing
    const alreadyMapped = skuMappings.find(m => m.warehouseSku === warehouseSku && m.channelSku !== channelSku);
    let isForced = false;
    if (alreadyMapped) {
      const proceed = window.confirm(`Warning: The target SKU "${warehouseSku}" is already mapped to another channel SKU "${alreadyMapped.channelSku}" (${alreadyMapped.channel}).\n\nMapping a target SKU to multiple channel SKUs can lead to duplicate routing issues.\n\nAre you sure you want to proceed?`);
      if (!proceed) {
        return;
      }
      isForced = true;
    }

    try {
      const res = await fetch('/api/sku-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelSku, warehouseSku, channel, force: isForced })
      });
      if (res.ok) {
        await fetchSkuMappings();
        setMappingSuccessMsg(`Successfully mapped external SKU [${channelSku}] to [${warehouseSku}]!`);
        setTimeout(() => setMappingSuccessMsg(null), 3500);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to map SKU.');
      }
    } catch (e) {
      console.error(e);
      alert('Error mapping connection.');
    }
  };

  // Auto-Apply all confident matching rules (> 60%)
  const handleAutoApplyAllConfident = async (unmappedListings: any[]) => {
    const confidentMatches = unmappedListings.map(listing => {
      const aiResult = aiOverrideSuggestions[listing.channelSku];
      const heuristicResult = getOfflineMappingSuggestion(listing);
      const match = aiResult || heuristicResult;
      const finalSku = customOverrideSkus[listing.channelSku] || match.suggestedWarehouseSku;
      return {
        listing,
        warehouseSku: finalSku,
        confidence: match.confidence
      };
    }).filter(item => item.warehouseSku && item.confidence >= 60);

    if (confidentMatches.length === 0) {
      alert('No mappings found with confidence score above 60%. Please map them manually or run AI Deep Match to verify.');
      return;
    }

    // Validation check: check if any confident bulk mappings have warehouse SKUs already mapped to other channel SKUs
    const duplicateTargetMatches = confidentMatches.filter(item => 
      skuMappings.some(m => m.warehouseSku === item.warehouseSku && m.channelSku !== item.listing.channelSku)
    );

    if (duplicateTargetMatches.length > 0) {
      const listNames = duplicateTargetMatches.map(item => `- Target SKU "${item.warehouseSku}" for listing "${item.listing.title}"`).join('\n');
      const proceed = window.confirm(`Warning: Some of the target warehouse SKUs in this bulk operation are already mapped to other channel SKUs:\n\n${listNames}\n\nThis might lead to duplicate routing. Do you want to proceed anyway?`);
      if (!proceed) return;
    }

    setIsAutoMappingBulk(true);
    let successCount = 0;
    try {
      for (const item of confidentMatches) {
        const hasDuplicate = skuMappings.some(m => m.warehouseSku === item.warehouseSku && m.channelSku !== item.listing.channelSku);
        const res = await fetch('/api/sku-mappings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelSku: item.listing.channelSku,
            warehouseSku: item.warehouseSku,
            channel: item.listing.channel,
            force: hasDuplicate
          })
        });
        if (res.ok) {
          successCount++;
        }
      }
      await fetchSkuMappings();
      setMappingSuccessMsg(`Successfully bulk mapped ${successCount} external store listings!`);
      setTimeout(() => setMappingSuccessMsg(null), 4500);
    } catch (e) {
      console.error(e);
      alert('Error during bulk mapping execution.');
    } finally {
      setIsAutoMappingBulk(false);
    }
  };
  
  // Bundle creation states
  const [isCreatingBundle, setIsCreatingBundle] = useState(false);
  const [bundleForm, setBundleForm] = useState<{
    sku: string;
    name: string;
    description: string;
    sellingPrice: string;
    buyingPrice: string;
    components: { sku: string; quantity: number }[];
  }>({
    sku: '',
    name: '',
    description: '',
    sellingPrice: '29.99',
    buyingPrice: '10.00',
    components: [{ sku: '', quantity: 1 }]
  });

  const fetchSkuMappings = async () => {
    setIsFetchingMappings(true);
    try {
      const res = await fetch('/api/sku-mappings');
      const data = await res.json();
      setSkuMappings(data);
    } catch (e) {
      console.error('Error fetching SKU mappings:', e);
    } finally {
      setIsFetchingMappings(false);
    }
  };

  React.useEffect(() => {
    fetchSkuMappings();
  }, []);

  const unmappedListings = storeListings.filter(listing => 
    !skuMappings.some(m => m.channelSku === listing.channelSku)
  );

  const [thresholdInput, setThresholdInput] = useState(inventoryThreshold.toString());
  const [isUpdatingThreshold, setIsUpdatingThreshold] = useState(false);
  const [syncingChannel, setSyncingChannel] = useState<'all' | 'amazon' | 'ebay' | null>(null);
  
  // Edit mode states
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    weight: string;
    size: string;
    buyingPrice: string;
    sellingPrice: string;
    commission: string;
    shippingCost: string;
    vatType: 'VAT' | 'Non VAT';
    stock: string;
    mappedSku: string;
    expiryDate: string;
    categoryId: string;
  }>({
    name: '',
    description: '',
    weight: '',
    size: '',
    buyingPrice: '',
    sellingPrice: '',
    vatType: 'VAT',
    stock: '',
    mappedSku: '',
    expiryDate: '',
    categoryId: '',
  });

  // Adding product state
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    sku: '',
    name: '',
    description: '',
    weight: '12',
    size: '10x6x4',
    buyingPrice: '5.00',
    sellingPrice: '12.99',
    commission: '0.00',
    shippingCost: '0.00',
    vatType: 'VAT' as 'VAT' | 'Non VAT',
    stock: '15',
    mappedSku: '',
    image: '',
    images: [] as string[],
    expiryDate: '',
    categoryId: '',
  });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<{name: string, description: string, image: string, alertDays: string}>({
    name: '',
    description: '',
    image: '',
    alertDays: '30, 14'
  });

  const handleEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      alertDays: cat.alertDays.join(', ')
    });
  };

  const saveCategory = () => {
    if (!categoryForm.name.trim()) return;
    const alertDays = categoryForm.alertDays.split(',').map(d => parseInt(d.trim())).filter(n => !isNaN(n));
    if (alertDays.length === 0) alertDays.push(30);

    if (editingCategoryId) {
      if (onUpdateCategory) {
        onUpdateCategory({
          id: editingCategoryId,
          name: categoryForm.name.trim(),
          description: categoryForm.description,
          image: categoryForm.image,
          alertDays
        });
      }
    } else {
      if (onCreateCategory) {
        onCreateCategory({
          id: 'cat_' + Date.now(),
          name: categoryForm.name.trim(),
          description: categoryForm.description,
          image: categoryForm.image,
          alertDays
        });
      }
    }
    
    setEditingCategoryId(null);
    setCategoryForm({ name: '', description: '', image: '', alertDays: '30, 14' });
    setIsAddingCategory(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAddForm(prev => {
               if (prev.images.length >= 12) return prev;
               return { ...prev, images: [...prev.images, event.target!.result as string] };
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };
  const [csvPreview, setCsvPreview] = useState<any[] | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // AI assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [upgradingSku, setUpgradingSku] = useState<string | null>(null);
  const [aiCompareModalOpen, setAiCompareModalOpen] = useState(false);
  const [aiCompareData, setAiCompareData] = useState<{
    product: Product;
    suggested: {
      name: string;
      description: string;
      weight: number;
      size: string;
      buyingPrice: number;
      sellingPrice: number;
      explanation: string;
    };
  } | null>(null);

  const handleAiAutofill = async () => {
    if (!addForm.sku) {
      alert('Please fill in the SKU Code first. Gemini uses the SKU as context for product creation.');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/product-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: addForm.sku,
          prompt: aiPrompt
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAddForm(prev => ({
          ...prev,
          name: data.name,
          description: data.description,
          weight: data.weight.toString(),
          size: data.size,
          buyingPrice: data.buyingPrice.toFixed(2),
          sellingPrice: data.sellingPrice.toFixed(2),
        }));
        // Optional suggestion feedback
        if (data.explanation) {
          console.log('AI suggestion notes:', data.explanation);
        }
      } else {
        alert(data.error || 'Failed to auto-generate specs.');
      }
    } catch (e: any) {
      console.error('AI Draft Error:', e);
      alert('An error occurred during AI drafting: ' + (e.message || e));
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleUpgradeWithAi = async (p: Product) => {
    setUpgradingSku(p.sku);
    try {
      const res = await fetch('/api/ai/product-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: p.sku,
          currentProduct: p
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAiCompareData({
          product: p,
          suggested: data
        });
        setAiCompareModalOpen(true);
      } else {
        alert(data.error || 'Failed to generate AI upgrade suggestions.');
      }
    } catch (e: any) {
      console.error('AI Upgrade Error:', e);
      alert('An error occurred during AI upgrade: ' + (e.message || e));
    } finally {
      setUpgradingSku(null);
    }
  };

  const handleAcceptUpgrade = async () => {
    if (!aiCompareData) return;
    try {
      await onUpdateProduct({
        sku: aiCompareData.product.sku,
        name: aiCompareData.suggested.name,
        description: aiCompareData.suggested.description,
        weight: Number(aiCompareData.suggested.weight),
        size: aiCompareData.suggested.size,
        buyingPrice: Number(aiCompareData.suggested.buyingPrice),
        sellingPrice: Number(aiCompareData.suggested.sellingPrice),
        vatType: aiCompareData.product.vatType,
        stock: aiCompareData.product.stock,
        mappedSku: aiCompareData.product.mappedSku || aiCompareData.product.sku,
      });
      setAiCompareModalOpen(false);
      setAiCompareData(null);
    } catch (e) {
      console.error('Failed to save upgraded product:', e);
    }
  };

  const startEdit = (p: Product) => {
    setEditingSku(p.sku);
    setEditForm({
      name: p.name,
      description: p.description || '',
      weight: (p.weight || '').toString(),
      size: p.size || '10x6x4',
      buyingPrice: (p.buyingPrice || 0).toString(),
      sellingPrice: (p.sellingPrice || 0).toString(),
      commission: (p.commission || 0).toString(),
      shippingCost: (p.shippingCost || 0).toString(),
      vatType: p.vatType as 'VAT' | 'Non VAT',
      stock: (p.stock !== undefined ? p.stock : 10).toString(),
      mappedSku: p.mappedSku || p.sku,
      expiryDate: p.expiryDate || '',
      categoryId: p.categoryId || '',
      image: p.image || (p.images ? p.images[0] : ''),
      images: p.images || (p.image ? [p.image] : []),
    });
  };

  const cancelEdit = () => {
    setEditingSku(null);
  };

  const handleEditMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setEditForm(prev => {
               if (prev.images.length >= 12) return prev;
               return { ...prev, images: [...prev.images, event.target!.result as string] };
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const saveEdit = async (sku: string) => {
    await onUpdateProduct({
      sku,
      name: editForm.name,
      description: editForm.description,
      weight: Number(editForm.weight),
      size: editForm.size,
      buyingPrice: Number(editForm.buyingPrice),
      sellingPrice: Number(editForm.sellingPrice),
      commission: Number(editForm.commission),
      shippingCost: Number(editForm.shippingCost),
      vatType: editForm.vatType,
      stock: Number(editForm.stock),
      mappedSku: editForm.mappedSku,
      expiryDate: editForm.expiryDate,
      expiryAcknowledged: false,
      categoryId: editForm.categoryId,
      lastAcknowledgedDays: -2,
      image: editForm.image || editForm.images[0] || '',
      images: editForm.images,
    });
    setEditingSku(null);
  };

  const saveAdd = async () => {
    if (!addForm.sku) {
      alert('SKU is required');
      return;
    }
    // We can import as a single item list
    await onImportProducts([{
      sku: addForm.sku,
      name: addForm.name || 'New Product',
      description: addForm.description,
      weight: Number(addForm.weight),
      size: addForm.size,
      buyingPrice: Number(addForm.buyingPrice),
      sellingPrice: Number(addForm.sellingPrice),
      vatType: addForm.vatType,
      stock: Number(addForm.stock),
      mappedSku: addForm.mappedSku || addForm.sku,
      expiryDate: addForm.expiryDate,
      expiryAcknowledged: false,
      categoryId: addForm.categoryId,
      lastAcknowledgedDays: -2,
      image: addForm.image,
    }]);

    setIsAdding(false);
    setAddForm({
      sku: '',
      name: '',
      description: '',
      weight: '12',
      size: '10x6x4',
      buyingPrice: '5.00',
      sellingPrice: '12.99',
      vatType: 'VAT',
      stock: '15',
      mappedSku: '',
      image: '',
    });
  };

  const handleCreateMapping = async () => {
    if (!mappingForm.channelSku || !mappingForm.warehouseSku) {
      alert('Both Channel SKU and Warehouse SKU are required.');
      return;
    }
    
    // Check if warehouse SKU exists
    const exists = products.some(p => p.sku === mappingForm.warehouseSku);
    if (!exists) {
      alert(`Warehouse SKU [${mappingForm.warehouseSku}] does not exist in the product catalog. Please register it as a warehouse SKU first!`);
      return;
    }

    // Validation check: Warn user if target warehouse SKU is already mapped to another channel SKU to prevent duplicate routing
    const alreadyMapped = skuMappings.find(m => m.warehouseSku === mappingForm.warehouseSku && m.channelSku !== mappingForm.channelSku);
    let isForced = false;
    if (alreadyMapped) {
      const proceed = window.confirm(`Warning: The target SKU "${mappingForm.warehouseSku}" is already mapped to another channel SKU "${alreadyMapped.channelSku}" (${alreadyMapped.channel}).\n\nMapping a target SKU to multiple channel SKUs can lead to duplicate routing issues.\n\nAre you sure you want to proceed?`);
      if (!proceed) {
        return;
      }
      isForced = true;
    }

    try {
      const res = await fetch('/api/sku-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mappingForm, force: isForced })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchSkuMappings();
        setMappingForm({ channelSku: '', warehouseSku: '', channel: 'amazon' });
        setIsAddingMapping(false);
        setMappingSuccessMsg('SKU Mapping rule successfully created!');
        setTimeout(() => setMappingSuccessMsg(null), 3500);
      } else {
        alert(data.error || 'Failed to create SKU mapping.');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating SKU mapping.');
    }
  };

  const handleDeleteMapping = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mapping rule?')) return;
    try {
      const res = await fetch('/api/sku-mappings/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        await fetchSkuMappings();
        setMappingSuccessMsg('Mapping rule successfully removed.');
        setTimeout(() => setMappingSuccessMsg(null), 3500);
      } else {
        alert('Failed to delete mapping.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBundle = async () => {
    if (!bundleForm.sku || !bundleForm.name) {
      alert('Bundle SKU and Bundle Name are required.');
      return;
    }
    
    // Validate components
    const invalidComp = bundleForm.components.some(c => !c.sku || c.quantity <= 0);
    if (invalidComp) {
      alert('All component lines must have a valid SKU and a quantity greater than zero.');
      return;
    }

    // Verify component SKUs exist in product catalog and are not bundles themselves
    for (const comp of bundleForm.components) {
      const compProd = products.find(p => p.sku === comp.sku);
      if (!compProd) {
        alert(`Component SKU [${comp.sku}] does not exist in the product catalog.`);
        return;
      }
      if (compProd.isBundle) {
        alert(`Nesting bundle SKUs is not allowed. Component SKU [${comp.sku}] is already a bundle product.`);
        return;
      }
    }

    try {
      // Create a bundle product
      const newBundleProduct = {
        sku: bundleForm.sku,
        name: bundleForm.name,
        description: bundleForm.description || `Bundle SKU combination composed of: ${bundleForm.components.map(c => `${c.quantity}x ${c.sku}`).join(', ')}`,
        weight: bundleForm.components.reduce((sum, c) => {
          const compProd = products.find(p => p.sku === c.sku);
          return sum + ((compProd?.weight || 0) * c.quantity);
        }, 0),
        size: '12x10x6',
        buyingPrice: Number(bundleForm.buyingPrice) || 0,
        sellingPrice: Number(bundleForm.sellingPrice) || 0,
        vatType: 'VAT' as const,
        stock: 0, // Automatically calculated by backend!
        isBundle: true,
        bundleComponents: bundleForm.components,
        mappedSku: bundleForm.sku,
        source: 'all' as const
      };

      // Import as a single catalog product
      await onImportProducts([newBundleProduct]);
      setIsCreatingBundle(false);
      setBundleForm({
        sku: '',
        name: '',
        description: '',
        sellingPrice: '29.99',
        buyingPrice: '10.00',
        components: [{ sku: '', quantity: 1 }]
      });
      setMappingSuccessMsg(`Bundle SKU [${newBundleProduct.sku}] created successfully!`);
      setTimeout(() => setMappingSuccessMsg(null), 3500);
    } catch (e) {
      console.error(e);
      alert('Failed to create bundle product.');
    }
  };

  const handleMappingCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        alert('CSV file must have at least a header row and one data row.');
        return;
      }

      const headers = parseCSVLine(lines[0]);
      const parsedItems: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const columns = parseCSVLine(lines[i]);
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          const cleanHeader = header.trim().toLowerCase().replace(/[\s_-]+/g, '');
          rowData[cleanHeader] = columns[index] ? columns[index].trim() : '';
        });

        const channelSku = rowData.channelsku || rowData.marketplacesku || rowData.storesku || rowData.channelsku;
        const warehouseSku = rowData.warehousesku || rowData.internalsku || rowData.warehouse_sku || rowData.internal_sku || rowData.sku;
        const channel = rowData.channel || rowData.source || 'all';

        if (channelSku && warehouseSku) {
          parsedItems.push({ channelSku, warehouseSku, channel });
        }
      }

      if (parsedItems.length === 0) {
        alert('Could not find any valid mapping rows. Ensure your CSV has headers like "channelSku" and "warehouseSku".');
        return;
      }

      // Validation check: Warn user if target warehouse SKU is already mapped to another channel SKU to prevent duplicate routing
      const duplicateMappedItems = parsedItems.filter(item => 
        skuMappings.some(m => m.warehouseSku === item.warehouseSku && m.channelSku !== item.channelSku)
      );
      let isForced = false;
      if (duplicateMappedItems.length > 0) {
        const proceed = window.confirm(`Warning: ${duplicateMappedItems.length} mapping rules in your CSV target warehouse SKUs that are already mapped to other channel SKUs.\n\nMapping target SKUs to multiple channel SKUs can lead to duplicate routing issues.\n\nDo you want to proceed and import them anyway?`);
        if (!proceed) return;
        isForced = true;
      }

      try {
        const res = await fetch('/api/sku-mappings/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: parsedItems, force: isForced })
        });
        const data = await res.json();
        if (res.ok) {
          await fetchSkuMappings();
          setMappingSuccessMsg(`Successfully imported ${data.importedCount} SKU mapping rules! (Skipped ${data.skippedCount} invalid/unregistered SKUs)`);
          setTimeout(() => setMappingSuccessMsg(null), 4500);
        } else {
          alert(data.error || 'Failed to import CSV mappings.');
        }
      } catch (err) {
        console.error(err);
        alert('Error sending mappings to server.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveThreshold = async () => {
    setIsUpdatingThreshold(true);
    await onUpdateThreshold(Number(thresholdInput));
    setIsUpdatingThreshold(false);
  };

  const handleExtractInventory = async () => {
    setIsExtracting(true);
    try {
      const res = await fetch('/api/products/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: extractChannel })
      });
      const data = await res.json();
      if (data.success) {
        setExtractedItems(data.extracted);
        console.log(`Successfully extracted ${data.extracted.length} listings from ${extractChannel.toUpperCase()}`);
      } else {
        alert(data.error || 'Failed to extract inventory');
      }
    } catch (e) {
      console.error(e);
      alert('Network error during extraction');
    }
    setIsExtracting(false);
  };

  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForListing) return alert("Select a catalog product");
    if (!listingSku) return alert("Listing SKU required");
    setIsPublishingListing(true);
    
    try {
      const res = await fetch('/api/products/listing/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: selectedProductForListing,
          channel: listingChannel,
          channelSku: listingSku,
          price: listingPrice,
          templateId: listingTemplate,
          attributes: listingAttributes
        })
      });
      const data = await res.json();
      if (data.success) {
        setSkuMappings(data.skuMappings || skuMappings);
        console.log(`Published listing ${listingSku} to ${listingChannel.toUpperCase()}`);
        alert(`Successfully published to ${listingChannel.toUpperCase()}!`);
      } else {
        alert(data.error || 'Failed to publish listing');
      }
    } catch (e) {
      console.error(e);
      alert('Error publishing listing');
    }
    setIsPublishingListing(false);
  };

  const handleSync = async (channel: 'all' | 'amazon' | 'ebay') => {
    setSyncingChannel(channel);
    await onSyncProducts(channel);
    setSyncingChannel(null);
  };

  // Custom client-side CSV Parser
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processCSVFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCSVFile(e.dataTransfer.files[0]);
    }
  };

  const processCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      // Simple CSV line and comma separator parser that respects quotes
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) return;

      const headers = parseCSVLine(lines[0]);
      const parsedItems: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const columns = parseCSVLine(lines[i]);
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          const cleanHeader = header.trim().toLowerCase().replace(/[\s_-]+/g, '');
          rowData[cleanHeader] = columns[index] ? columns[index].trim() : '';
        });
        
        // Map columns gracefully
        const sku = rowData.sku || rowData.productsku || rowData.itemsku;
        const name = rowData.productname || rowData.name || rowData.title;
        const description = rowData.description || rowData.desc || rowData.productdescription;
        const weight = rowData.weight || rowData.productweight || rowData.weightoz;
        const size = rowData.size || rowData.dimensions || rowData.productsize;
        const buyingPrice = rowData.buyingprice || rowData.cost || rowData.purchaseprice || rowData.costprice;
        const sellingPrice = rowData.sellingprice || rowData.price || rowData.msrp;
        const vatType = rowData.vattype || rowData.tax || rowData.vatornonvat || rowData.vat;
        const stock = rowData.stock || rowData.quantity || rowData.qty || rowData.inventory;
        const mappedSku = rowData.mappedsku || rowData.channelsku || rowData.storesku || sku;

        if (sku) {
          parsedItems.push({
            sku,
            name: name || 'CSV Product',
            description: description || '',
            weight: weight ? Number(weight) : undefined,
            size: size || undefined,
            buyingPrice: buyingPrice ? Number(buyingPrice) : 0,
            sellingPrice: sellingPrice ? Number(sellingPrice) : 0,
            vatType: vatType || 'VAT',
            stock: stock !== undefined ? Number(stock) : 10,
            mappedSku: mappedSku || sku
          });
        }
      }

      setCsvPreview(parsedItems);
    };
    reader.readAsText(file);
  };

  // Parse a single CSV line respecting field quotes
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map(s => s.replace(/^"|"$/g, '').trim());
  };

  const confirmCSVImport = async () => {
    if (!csvPreview) return;
    await onImportProducts(csvPreview);
    setCsvPreview(null);
  };

  const downloadCSVTemplate = () => {
    const headers = "SKU,Product Name,Description,Weight,Size,Buying Price,Selling Price,VAT or Non VAT,Stock,Mapped SKU\n";
    const sample = "CABLE-USB-C,High-Speed USB-C Sync Cable,Heavy duty braided nylon 2m USB-C to USB-A cable,8,8x5x1,2.50,8.99,VAT,15,CABLE-USB-C\nCHAIR-ERG-BL,Premium Office Ergonomic Chair,High-back executive task chair with lumbar adjustment,350,26x24x15,45.00,129.99,VAT,3,CHAIR-ERG-BL\nADAPT-WRL-5,Wireless Charger Pad v5,Qi-certified 15W high output rapid induction desktop charger,4,5x5x1,3.20,14.50,Non VAT,22,ADAPT-WRL-5";
    
    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sellershub_products_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter products catalog
  const filteredProducts = products.filter(p => {
    const matchSearch = 
      (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.mappedSku && p.mappedSku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full overflow-hidden" id="products-manager-workspace">
      
      {/* Configuration Header Panel */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center shrink-0">
        <div>
          <h2 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Store Products Catalog & Channel Mappings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Map catalog item weights & sizes required for Amazon Shipping API. Track real-time inventory levels against shipping channels.
          </p>
        </div>

        {/* Global Inventory Threshold config */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/85">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Low Stock Threshold:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              className="w-16 text-center font-mono text-xs font-bold px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              id="threshold-setting-input"
            />
            <button title="Save changes"
              onClick={handleSaveThreshold}
              disabled={isUpdatingThreshold}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shrink-0"
              id="save-threshold-btn"
            >
              {isUpdatingThreshold ? 'Saving...' : 'Set'}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tabs menu */}
      <div className="px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
        <div className="flex gap-1.5 pt-3">
          <button title="Perform action" 
            onClick={() => setActiveSubTab('catalog')}
            className={`px-4 py-2 text-xs font-black border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'catalog'
                ? 'border-emerald-600 text-emerald-700 font-extrabold bg-white rounded-t-xl border-t border-x border-slate-200 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="subtab-catalog-btn"
          >
            <Package className="w-4 h-4" />
            Products Catalog
          </button>
          <button title="Categories" 
            onClick={() => setActiveSubTab('categories')}
            className={`px-4 py-2 text-xs font-black border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'categories'
                ? 'border-orange-600 text-orange-700 font-extrabold bg-white rounded-t-xl border-t border-x border-slate-200 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="subtab-categories-btn"
          >
            <FolderTree className="w-4 h-4" />
            Categories
          </button>
          <button title="Perform action" 
            onClick={() => setActiveSubTab('mapping')}
            className={`px-4 py-2 text-xs font-black border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'mapping'
                ? 'border-indigo-600 text-indigo-700 font-extrabold bg-white rounded-t-xl border-t border-x border-slate-200 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="subtab-mapping-btn"
          >
            <Link className="w-4 h-4" />
            Channel SKU Mappings & Bundles
          </button>
          <button title="Perform action" 
            onClick={() => setActiveSubTab('extraction')}
            className={`px-4 py-2 text-xs font-black border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'extraction'
                ? 'border-fuchsia-600 text-fuchsia-700 font-extrabold bg-white rounded-t-xl border-t border-x border-slate-200 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CloudLightning className="w-4 h-4" />
            Extract Inventory
          </button>
          <button title="Perform action" 
            onClick={() => setActiveSubTab('listing')}
            className={`px-4 py-2 text-xs font-black border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'listing'
                ? 'border-sky-600 text-sky-700 font-extrabold bg-white rounded-t-xl border-t border-x border-slate-200 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            Listing Configurator
          </button>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          {products.length} catalog items | {skuMappings.length} channel mappings
        </div>
      </div>

      {activeSubTab === 'catalog' && (
        <>
          {/* CSV Import / Channel Sync Controls Row */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Channel Sync buttons */}
          <button title="Perform action" 
            onClick={() => handleSync('all')}
            disabled={syncingChannel !== null}
            className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            id="channel-sync-catalog-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingChannel === 'all' ? 'animate-spin' : ''}`} />
            Sync Products from Amazon & eBay
          </button>

          <button title="Add new element" 
            onClick={() => setIsAdding(true)}
            className="text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            id="add-custom-product-btn"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Custom SKU
          </button>
        </div>

        {/* CSV Import */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadCSVTemplate}
            className="text-xs font-semibold hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Download CSV Template Columns"
            id="csv-template-download-btn"
          >
            <Download className="w-3.5 h-3.5" />
            Template.csv
          </button>
          
          <div 
            className={`border border-dashed p-1 px-3 rounded-lg flex items-center gap-2 text-xs transition-colors cursor-pointer ${
              dragActive ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white hover:bg-slate-50 border-slate-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            id="csv-dropzone-uploader"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">Import CSV Products</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCSVUpload}
              accept=".csv"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* CSV Import Preview Banner Modally Layered */}
      {csvPreview && (
        <div className="bg-indigo-50 border-b border-indigo-200 p-4 shrink-0 flex items-center justify-between" id="csv-import-preview-banner">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Ready to Import: {csvPreview.length} products parsed from your CSV file.
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Matches columns such as SKU, Weight, Dimensions, Prices, and stock. Existing SKUs will be overwritten.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button title="Cancel and close" 
              onClick={() => setCsvPreview(null)}
              className="text-xs font-semibold hover:bg-indigo-100 text-slate-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button title="Perform action"
              onClick={confirmCSVImport}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              id="confirm-csv-import-btn"
            >
              <Check className="w-3.5 h-3.5" />
              Apply CSV Catalog Upload
            </button>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto flex flex-col p-4 space-y-4 bg-slate-50/30">
        
        {/* Search */}
        <div className="relative w-full shrink-0">
          <input
            type="text"
            placeholder="Search catalog by SKU, Product Name, Mapping or Description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs px-3 py-2.5 pl-9 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 bg-white shadow-sm"
            id="product-search-bar"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Adding Form Block */}
        {isAdding && (
          <div className="bg-white rounded-xl border-2 border-emerald-500/75 p-4 space-y-4 shadow-md animate-fade-in" id="add-product-form">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add New SKU Entry
              </h3>
              <button title="Close"  onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Generation Assist */}
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 space-y-2" id="ai-product-creation-card">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                Draft Product with Gemini AI
              </div>
              <p className="text-[11px] text-emerald-700/80 leading-snug">
                Enter a SKU below first, then input a few keywords or features of the product. Gemini will analyze the product type and suggest the optimal title, detailed description, box dimensions, weight, and profit margins automatically.
              </p>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="e.g., lightweight running shoes, breathable mesh, shock absorbing sole, neon yellow"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white shadow-sm"
                  id="ai-autofill-prompt-input"
                />
                <button title="Execute AiAutofill"
                  type="button"
                  onClick={handleAiAutofill}
                  disabled={isGeneratingAi}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                  id="ai-autofill-btn"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Suggest Specs
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">SKU Code (Unique) *</label>
                <input
                  type="text"
                  placeholder="e.g. CABLE-USB-1M"
                  value={addForm.sku}
                  onChange={(e) => setAddForm({...addForm, sku: e.target.value.toUpperCase()})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. USB-C Charging Adapter"
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Mapped Channel SKU</label>
                <input
                  type="text"
                  placeholder="Channel listing SKU (blank = same)"
                  value={addForm.mappedSku}
                  onChange={(e) => setAddForm({...addForm, mappedSku: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Stock Level</label>
                <input
                  type="number"
                  placeholder="15"
                  value={addForm.stock}
                  onChange={(e) => setAddForm({...addForm, stock: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={addForm.expiryDate}
                  onChange={(e) => setAddForm({...addForm, expiryDate: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Media Upload Mock */}
              <div className="md:col-span-4 border-t border-slate-100 pt-3 mt-1">
                <label className="block text-slate-500 font-bold mb-2">Product Media (Images & Videos) - Max 12</label>
                <div className="flex flex-wrap gap-3">
                  {addForm.images.map((img, idx) => (
                    <div key={idx} className="w-20 h-20 border border-slate-200 rounded-xl relative overflow-hidden shrink-0 group">
                       <img src={img} className="w-full h-full object-cover" />
                       <button title="Close"  onClick={() => setAddForm({...addForm, images: addForm.images.filter((_, i) => i !== idx)})} className="absolute top-1 right-1 bg-white shadow rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-red-500"/></button>
                       {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center font-bold py-0.5">MAIN</span>}
                    </div>
                  ))}
                  {addForm.images.length < 12 && (
                    <div 
                      className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer bg-slate-50 relative overflow-hidden shrink-0"
                      onClick={() => mediaInputRef.current?.click()}
                    >
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[9px] font-bold text-center leading-tight">Upload<br/>Media</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={mediaInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaUpload}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Weight ({unitSystem === 'metric' ? 'g' : 'Oz'})</label>
                <input
                  type="number"
                  placeholder="12"
                  value={addForm.weight}
                  onChange={(e) => setAddForm({...addForm, weight: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Dimensions ({unitSystem === 'metric' ? 'cm' : 'inches'})</label>
                <input
                  type="text"
                  placeholder={unitSystem === 'metric' ? "e.g. 25x15x10" : "e.g. 10x6x4"}
                  value={addForm.size}
                  onChange={(e) => setAddForm({...addForm, size: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Buying Price (Cost)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="5.00"
                    value={addForm.buyingPrice}
                    onChange={(e) => setAddForm({...addForm, buyingPrice: e.target.value})}
                    className="w-full p-2 pl-8 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Selling Price (MSRP)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="12.99"
                    value={addForm.sellingPrice}
                    onChange={(e) => setAddForm({...addForm, sellingPrice: e.target.value})}
                    className="w-full p-2 pl-8 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Selling Comm.</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={addForm.commission}
                    onChange={(e) => setAddForm({...addForm, commission: e.target.value})}
                    className="w-full p-2 pl-8 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Ship Cost</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={addForm.shippingCost}
                    onChange={(e) => setAddForm({...addForm, shippingCost: e.target.value})}
                    className="w-full p-2 pl-8 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Profit Analytics */}
              <div className="md:col-span-4 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold">Live Profit Analytics</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Shipping Cost</span>
                    <span className="font-mono text-slate-700">{currencySymbol} {(Number(addForm.shippingCost) > 0 ? Number(addForm.shippingCost) : (Number(addForm.weight) * 0.25 || 2.50)).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Commission</span>
                    <span className="font-mono text-slate-700">{currencySymbol} {(Number(addForm.commission) > 0 ? Number(addForm.commission) : (Number(addForm.sellingPrice) * 0.15 || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Net Profit</span>
                    <span className="font-mono font-black text-emerald-600">
                      {currencySymbol} {(Number(addForm.sellingPrice) - Number(addForm.buyingPrice) - (Number(addForm.shippingCost) > 0 ? Number(addForm.shippingCost) : (Number(addForm.weight) * 0.25 || 2.50)) - (Number(addForm.commission) > 0 ? Number(addForm.commission) : (Number(addForm.sellingPrice) * 0.15 || 0))).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Margin</span>
                    <span className="font-mono font-black text-indigo-600">
                      {Number(addForm.sellingPrice) > 0 
                        ? Math.round(((Number(addForm.sellingPrice) - Number(addForm.buyingPrice) - (Number(addForm.shippingCost) > 0 ? Number(addForm.shippingCost) : (Number(addForm.weight) * 0.25 || 2.50)) - (Number(addForm.commission) > 0 ? Number(addForm.commission) : (Number(addForm.sellingPrice) * 0.15 || 0))) / Number(addForm.sellingPrice)) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 mt-1">
                <label className="block text-slate-500 font-bold mb-1">Product Description / A+ Content</label>
                <input
                  type="text"
                  placeholder="Provide product features details or HTML A+ content..."
                  value={addForm.description}
                  onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="mt-1">
                <label className="block text-slate-500 font-bold mb-1">VAT Type</label>
                <select
                  value={addForm.vatType}
                  onChange={(e) => setAddForm({...addForm, vatType: e.target.value as any})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 text-xs font-semibold"
                >
                  <option value="VAT">VAT Applicable</option>
                  <option value="Non VAT">Non VAT Exempt</option>
                </select>
              </div>
              <div className="mt-1">
                <label className="block text-slate-500 font-bold mb-1">Category</label>
                {!isAddingCategory ? (
                  <div className="flex gap-1">
                    <select
                      value={addForm.categoryId}
                      onChange={(e) => setAddForm({...addForm, categoryId: e.target.value})}
                      className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 text-xs font-semibold"
                    >
                      <option value="">No Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => setIsAddingCategory(true)}
                      className="px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-colors"
                      title="Create New Category"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-2 border border-emerald-200 bg-emerald-50 rounded-lg space-y-2">
                    <input 
                      type="text" 
                      placeholder="Category Name" 
                      value={categoryForm.name}
                      onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                      className="w-full p-1.5 border border-emerald-300 rounded focus:outline-none focus:border-emerald-500 text-xs"
                    />
                    <input 
                      type="text" 
                      placeholder="Alert Days (e.g., 90, 60, 30)" 
                      value={categoryForm.alertDays}
                      onChange={e => setCategoryForm({...categoryForm, alertDays: e.target.value})}
                      className="w-full p-1.5 border border-emerald-300 rounded focus:outline-none focus:border-emerald-500 text-xs"
                    />
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setIsAddingCategory(false)} className="px-2 py-1 text-slate-500 hover:bg-emerald-100 rounded text-xs font-bold">Cancel</button>
                      <button onClick={saveCategory} className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-bold">Save</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2 border-t border-slate-100">
              <button title="Save configuration" 
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button title="Save changes"
                onClick={saveAdd}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1"
                id="save-new-sku-btn"
              >
                <Check className="w-3.5 h-3.5" /> Save Catalog Product
              </button>
            </div>
          </div>
        )}

        {/* Listings Container */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto stroke-[1.5] mb-2.5 text-slate-300" />
            <p className="font-semibold text-sm text-slate-700">No products found in the catalog</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting search filter or click Sync Products to seed active listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((p) => {
              const isLowStock = p.stock !== undefined && p.stock <= inventoryThreshold;
              const marginAmt = (p.sellingPrice || 0) - (p.buyingPrice || 0) - (p.commission || 0) - (p.shippingCost || 0);
              const marginPct = p.sellingPrice ? Math.round((marginAmt / p.sellingPrice) * 100) : 0;
              const isEditing = editingSku === p.sku;

              return (
                <div 
                  key={p.sku} 
                  className={`bg-white rounded-xl border transition-all overflow-hidden ${
                    isLowStock 
                      ? 'border-rose-300 bg-rose-50/[0.01] shadow-rose-50/20' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  id={`product-card-${p.sku}`}
                >
                  
                  {/* Card Title Header */}
                  <div className="p-4 border-b border-slate-100 flex items-start gap-3">
                    <img 
                      src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60'} 
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 select-all shrink-0">
                          {p.sku}
                        </span>
                        {p.source && p.source !== 'none' && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            p.source === 'amazon' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {p.source}
                          </span>
                        )}
                        {isLowStock && (
                          <span className="bg-rose-100 border border-rose-200 text-rose-800 text-[9px] font-black px-1.5 py-0.2 rounded animate-pulse">
                            LOW STOCK ({p.stock})
                          </span>
                        )}
                        {p.expiryDate && (
                          <span className="bg-orange-100 border border-orange-200 text-orange-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                            EXP: {new Date(p.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                        {p.categoryId && categories.find(c => c.id === p.categoryId) && (
                          <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-black px-1.5 py-0.2 rounded">
                            {categories.find(c => c.id === p.categoryId)?.name}
                          </span>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full text-xs font-bold border border-slate-300 rounded px-1.5 py-0.5 mt-1 focus:outline-none focus:border-emerald-500"
                        />
                      ) : (
                        <h3 className="text-xs font-bold text-slate-800 mt-1 truncate" title={p.name}>
                          {p.name}
                        </h3>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => saveEdit(p.sku)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition-colors"
                            title="Save SKU parameters"
                            id={`save-sku-btn-${p.sku}`}
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-1.5 rounded-lg transition-colors"
                            title="Discard edits"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => {
                              setSelectedProductForListing(p.sku);
                              setActiveSubTab('listing');
                            }}
                            className="text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200/50 p-1.5 rounded-lg flex items-center justify-center transition-colors shrink-0"
                            title="Create dynamic channel listing for this product"
                          >
                            <Globe className="w-3.5 h-3.5 text-sky-600" />
                          </button>

                          <button 
                            onClick={() => handleUpgradeWithAi(p)}
                            disabled={upgradingSku !== null}
                            className="text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 p-1.5 rounded-lg flex items-center justify-center transition-colors shrink-0 disabled:opacity-60"
                            title="Optimize title, SEO, and descriptions with Gemini AI"
                            id={`ai-upgrade-btn-${p.sku}`}
                          >
                            {upgradingSku === p.sku ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                            )}
                          </button>

                          <button 
                            onClick={() => startEdit(p)}
                            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                            title="Edit product parameters"
                            id={`edit-sku-btn-${p.sku}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Specs */}
                  <div className="p-4 space-y-3 text-xs">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Product Description</label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            className="w-full text-[11px] p-1.5 border border-slate-300 rounded focus:outline-none focus:border-emerald-500 h-10 resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Weight (Oz)</label>
                            <input
                              type="number"
                              value={editForm.weight}
                              onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Size (LxWxH {unitSystem === "metric" ? "cm" : "inches"})</label>
                            <input
                              type="text"
                              value={editForm.size}
                              onChange={(e) => setEditForm({...editForm, size: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Cost ({currencySymbol})</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.buyingPrice}
                              onChange={(e) => setEditForm({...editForm, buyingPrice: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Selling ({currencySymbol})</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.sellingPrice}
                              onChange={(e) => setEditForm({...editForm, sellingPrice: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Comm. ({currencySymbol})</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.commission}
                              onChange={(e) => setEditForm({...editForm, commission: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Ship Cost ({currencySymbol})</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.shippingCost}
                              onChange={(e) => setEditForm({...editForm, shippingCost: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-200 mt-2 mb-2">
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Product Images (Max 12)</label>
                          <div className="flex flex-wrap gap-2">
                            {editForm.images.map((img, idx) => (
                              <div key={idx} className="w-10 h-10 border border-slate-200 rounded relative overflow-hidden shrink-0 group">
                                 <img src={img} className="w-full h-full object-cover" />
                                 <button title="Edit item"  onClick={() => setEditForm({...editForm, images: editForm.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 bg-white shadow rounded-bl p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5 text-red-500"/></button>
                              </div>
                            ))}
                            {editForm.images.length < 12 && (
                              <label className="w-10 h-10 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer bg-slate-50 shrink-0">
                                <Upload className="w-3.5 h-3.5" />
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*,video/*"
                                  multiple
                                  onChange={handleEditMediaUpload}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Stock Level</label>
                            <input
                              type="number"
                              value={editForm.stock}
                              onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Expiry Date</label>
                            <input
                              type="date"
                              value={editForm.expiryDate}
                              onChange={(e) => setEditForm({...editForm, expiryDate: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">VAT Type</label>
                            <select
                              value={editForm.vatType}
                              onChange={(e) => setEditForm({...editForm, vatType: e.target.value as any})}
                              className="w-full p-1 border border-slate-300 rounded text-[11px] font-semibold"
                            >
                              <option value="VAT">VAT Applicable</option>
                              <option value="Non VAT">Non VAT Exempt</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Mapped Channel SKU</label>
                            <input
                              type="text"
                              value={editForm.mappedSku}
                              onChange={(e) => setEditForm({...editForm, mappedSku: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Category</label>
                            <select
                              value={editForm.categoryId}
                              onChange={(e) => setEditForm({...editForm, categoryId: e.target.value})}
                              className="w-full p-1 border border-slate-300 rounded text-[11px] font-semibold"
                            >
                              <option value="">No Category</option>
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] text-slate-500 line-clamp-2 min-h-[32px] leading-normal italic">
                          {p.description || "No description provided for catalog SKU entry."}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                            <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">Weight</span>
                              <span className="font-semibold text-slate-800 font-mono block text-[11px]">
                                {p.weight ? `${p.weight} ${unitSystem === "metric" ? "g" : "oz"}` : 'Pending'}
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                            <Maximize2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">Box Dim</span>
                              <span className="font-semibold text-slate-800 font-mono block text-[11px]">
                                {p.size || 'Pending'}
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">Markup %</span>
                              <span className={`font-black font-mono block text-[11px] ${marginPct > 40 ? 'text-emerald-600' : 'text-slate-800'}`}>
                                {marginPct}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mapped details and margins */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1 text-slate-500">
                            <span>Cost: <strong className="font-mono text-slate-700">${(p.buyingPrice || 0).toFixed(2)}</strong></span>
                            <span className="mx-1 text-slate-300">|</span>
                            <span>MSRP: <strong className="font-mono text-slate-700">${(p.sellingPrice || 0).toFixed(2)}</strong></span>
                          </div>
                          
                          <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] ${
                            p.vatType === 'VAT' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {p.vatType}
                          </span>
                        </div>

                        {/* Inventory count details with Channel mapping label */}
                        <div className="pt-2 flex items-center justify-between text-[11px]">
                          <div className="text-slate-500 flex items-center gap-1 font-mono">
                            <span className="font-bold text-slate-400">Map SKU:</span> 
                            <span className="text-slate-800 font-semibold truncate max-w-[150px]" title={p.mappedSku || p.sku}>
                              {p.mappedSku || p.sku}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 font-semibold">
                            <span className="text-slate-400">Stock Available:</span>
                            <span className={`font-black font-mono px-2 py-0.5 rounded-full ${
                              isLowStock 
                                ? 'bg-rose-100 text-rose-700 font-extrabold text-[12px] animate-pulse' 
                                : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {p.stock !== undefined ? p.stock : 10} Units
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </>
      )}

      {/* --- Categories Management sub-tab view --- */}
      {activeSubTab === 'categories' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <FolderTree className="w-6 h-6 text-orange-600" />
                Product Categories
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Manage product taxonomy, configure category-specific expiration alert thresholds, and sync profiles.
              </p>
            </div>
            {!isAddingCategory && !editingCategoryId && (
              <button 
                onClick={() => setIsAddingCategory(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Category
              </button>
            )}
          </div>

          {(isAddingCategory || editingCategoryId) && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                {editingCategoryId ? 'Edit Category' : 'Create New Category'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category Name</label>
                    <input 
                      type="text" 
                      value={categoryForm.name}
                      onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                      placeholder="e.g. Beverages & Energy Drinks"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                    <textarea 
                      value={categoryForm.description}
                      onChange={e => setCategoryForm({...categoryForm, description: e.target.value})}
                      placeholder="Internal description or handling notes..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiry Alert Days</label>
                    <p className="text-[11px] text-slate-400 mb-2">Comma separated list of days remaining to trigger warnings. (e.g. 90, 60, 30)</p>
                    <input 
                      type="text" 
                      value={categoryForm.alertDays}
                      onChange={e => setCategoryForm({...categoryForm, alertDays: e.target.value})}
                      placeholder="30, 14, 7"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category Image / Profile</label>
                    <div className="flex gap-4 items-start">
                      {categoryForm.image ? (
                        <div className="relative group">
                          <img src={categoryForm.image} alt="Preview" className="w-32 h-32 object-cover rounded-xl border-2 border-slate-200" referrerPolicy="no-referrer" />
                          <button 
                            onClick={() => setCategoryForm({...categoryForm, image: ''})}
                            className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 flex-col gap-2">
                          <FolderTree className="w-8 h-8 opacity-50" />
                          <span className="text-[10px] font-bold">No Image</span>
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <input 
                          type="text" 
                          value={categoryForm.image}
                          onChange={e => setCategoryForm({...categoryForm, image: e.target.value})}
                          placeholder="Image URL (https://...)"
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setIsAddingCategory(false);
                    setEditingCategoryId(null);
                  }}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveCategory}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingCategoryId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <FolderTree className="w-6 h-6 text-orange-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditCategory(cat)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${cat.name}?`)) {
                          if (onDeleteCategory) onDeleteCategory(cat.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="text-lg font-black text-slate-800 mb-1">{cat.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-4">
                  {cat.description || 'No description provided.'}
                </p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Products</span>
                    <span className="text-sm font-black text-slate-700">
                      {products.filter(p => p.categoryId === cat.id).length}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Alert Thresholds</span>
                    <div className="flex gap-1 mt-0.5 justify-end">
                      {cat.alertDays.map((d, i) => (
                        <span key={i} className="bg-orange-100 text-orange-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                          {d}d
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Channel SKU Mappings & Bundles sub-tab view --- */}
      {activeSubTab === 'mapping' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40" id="sku-mappings-bundle-workspace">
          
          {/* Mapping Success Notification Banner */}
          {mappingSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in shrink-0">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{mappingSuccessMsg}</span>
            </div>
          )}

          {/* Intro Information card */}
          <div className="bg-indigo-950 text-white p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="bg-indigo-800 text-indigo-200 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                Advanced Inventory Routing Engine
              </span>
              <h3 className="text-sm font-black tracking-tight">Fulfillment SKU Mappings & Master Bundles</h3>
              <p className="text-xs text-indigo-200 leading-normal max-w-3xl font-sans">
                Define how external marketplace listings map to your internal physical warehouse inventory. 
                Bundle master SKUs let you sell mixed combinations of physical products, with real-time stock levels 
                automatically tracking down to primary component units.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button title="Add new element" 
                onClick={() => setIsCreatingBundle(true)}
                className="bg-white hover:bg-slate-100 text-indigo-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                id="open-bundle-builder-btn"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Build Master Bundle SKU
              </button>
            </div>
          </div>

          {/* Smart SKU Mapping Assistant Dashboard Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4" id="smart-auto-mapping-assistant-panel">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                  🤖 Smart AI & Heuristic SKU Mapping Assistant
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automate linking your sales channel store listings to internal physical warehouse catalog SKUs
                </p>
              </div>

              {unmappedListings.length > 0 && (
                <button title="Perform action" 
                  onClick={() => handleAutoApplyAllConfident(unmappedListings)}
                  disabled={isAutoMappingBulk}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-center"
                >
                  {isAutoMappingBulk ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  {isAutoMappingBulk ? 'Bulk Applying...' : 'Auto-Apply All Confident Matches (>=60%)'}
                </button>
              )}
            </div>

            {unmappedListings.length === 0 ? (
              <div className="py-6 text-center space-y-2 bg-emerald-50/40 border border-dashed border-emerald-200 rounded-xl" id="all-listings-linked-success-banner">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 font-extrabold text-sm">
                  ✓
                </div>
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">All Listings Linked Successfully</h4>
                <p className="text-[11px] text-emerald-700 max-w-lg mx-auto leading-relaxed">
                  Every active item detected on your Amazon and eBay sales channels has a valid mapping rule configured. Stock updates are synchronized.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unmappedListings.map(listing => {
                  const aiResult = aiOverrideSuggestions[listing.channelSku];
                  const heuristicResult = getOfflineMappingSuggestion(listing);
                  const isRunningAi = runningAiMatches[listing.channelSku];

                  const match = aiResult || heuristicResult;
                  const finalSku = customOverrideSkus[listing.channelSku] || match.suggestedWarehouseSku;

                  const confidenceColor = match.confidence >= 75 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : match.confidence >= 40 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200';

                  return (
                    <div key={listing.channelSku} className="border border-slate-200 hover:border-slate-300 rounded-xl p-4 bg-slate-50/30 flex flex-col justify-between gap-4 transition-all">
                      <div className="flex gap-3">
                        <div className="relative w-14 h-14 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0">
                          <img 
                            src={listing.image} 
                            alt={listing.title} 
                            referrerPolicy="no-referrer" 
                            className="w-full h-full object-cover" 
                          />
                          <span className={`absolute top-0.5 right-0.5 text-[9px] font-black uppercase px-1 py-0.5 rounded shadow-xs ${
                            listing.channel === 'amazon' 
                              ? 'bg-amber-400 text-amber-950' 
                              : 'bg-blue-600 text-white'
                          }`}>
                            {listing.channel}
                          </span>
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[9px] font-black text-slate-400 font-mono tracking-wider">
                            STORE LISTING SKU: {listing.channelSku}
                          </span>
                          <h4 className="text-xs font-black text-slate-800 truncate font-sans" title={listing.title}>
                            {listing.title}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                            ⚠ Unlinked Listing
                          </span>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            {aiResult ? '✨ AI Deep Match Recommend' : '📊 Algorithmic Suggestion'}
                          </span>
                          {match.suggestedWarehouseSku && (
                            <span className={`text-[9px] font-extrabold border px-2 py-0.5 rounded-full ${confidenceColor}`}>
                              {match.confidence}% Match Confidence
                            </span>
                          )}
                        </div>

                        {match.suggestedWarehouseSku ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-500">Warehouse Link:</span>
                              <span className="font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                                {finalSku}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-normal font-medium italic">
                              &ldquo;{match.matchReason}&rdquo;
                            </p>
                          </div>
                        ) : (
                          <div className="py-1 text-center">
                            <p className="text-[10.5px] font-bold text-slate-400">
                              No confident matching catalog product found.
                            </p>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              Please register this physical item or map it manually.
                            </p>
                          </div>
                        )}

                        <div className="pt-1 border-t border-slate-100 grid grid-cols-2 gap-2">
                          <button title="Perform action" 
                            onClick={() => handleVerifyWithAi(listing)}
                            disabled={isRunningAi}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <Sparkles className={`w-3 h-3 text-indigo-600 ${isRunningAi ? 'animate-spin' : ''}`} />
                            {isRunningAi ? 'Verifying AI...' : aiResult ? 'Re-Verify Match' : 'Gemini AI Deep Match'}
                          </button>

                          <button title="Perform action" 
                            onClick={() => handleApplySuggestion(listing.channelSku, finalSku, listing.channel)}
                            disabled={!finalSku}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-extrabold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                          >
                            <Link className="w-3 h-3" />
                            Apply Map Link
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Manual Override Warehouse SKU Select:
                        </label>
                        <select
                          value={customOverrideSkus[listing.channelSku] || ''}
                          onChange={(e) => setCustomOverrideSkus(prev => ({ ...prev, [listing.channelSku]: e.target.value }))}
                          className="bg-white border border-slate-200 text-[10.5px] p-1.5 rounded-lg w-full font-mono font-bold text-slate-700 focus:outline-none"
                        >
                          <option value="">-- Use Match Recommendation ({match.suggestedWarehouseSku || 'None'}) --</option>
                          {products.map(p => (
                            <option key={p.sku} value={p.sku}>
                              {p.sku} ({p.name.substring(0, 24)}...)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Column 1: Channel SKU Mappings list & CSV import */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Link className="w-4 h-4 text-indigo-600" />
                      Active Listing Mapping Rules
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Fulfillment matches store listings to physical stock using these matching codes
                    </p>
                  </div>

                  <button title="Cancel and close" 
                    onClick={() => setIsAddingMapping(prev => !prev)}
                    className="text-xs font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors"
                    id="toggle-add-mapping-btn"
                  >
                    {isAddingMapping ? 'Cancel' : 'Add Single Mapping'}
                  </button>
                </div>

                {/* Add Mapping rule form inline */}
                {isAddingMapping && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-fade-in" id="add-mapping-rule-form">
                    <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">
                      New Listing Rule
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Sales Channel</label>
                        <select
                          value={mappingForm.channel}
                          onChange={(e) => setMappingForm({ ...mappingForm, channel: e.target.value })}
                          className="bg-white border border-slate-200 rounded-lg p-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium font-sans"
                        >
                          <option value="amazon">Amazon (Merchant/FBA)</option>
                          <option value="ebay">eBay Shop</option>
                          <option value="all">Global / All Channels</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Marketplace / Channel SKU</label>
                        <input
                          type="text"
                          placeholder="e.g., AMZ-EARBUDS-BLK"
                          value={mappingForm.channelSku}
                          onChange={(e) => setMappingForm({ ...mappingForm, channelSku: e.target.value })}
                          className="bg-white border border-slate-200 rounded-lg p-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Warehouse Physical SKU</label>
                        <select
                          value={mappingForm.warehouseSku}
                          onChange={(e) => setMappingForm({ ...mappingForm, warehouseSku: e.target.value })}
                          className="bg-white border border-slate-200 rounded-lg p-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                        >
                          <option value="">-- Select Product SKU --</option>
                          {products.map(p => (
                            <option key={p.sku} value={p.sku}>
                              {p.sku} ({p.name.substring(0, 20)}...)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button title="Save changes"
                        onClick={handleCreateMapping}
                        className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs px-4 py-2 rounded-lg transition-colors shadow-xs"
                        id="save-new-mapping-btn"
                      >
                        Save Mapping Connection
                      </button>
                    </div>
                  </div>
                )}

                {/* Bulk mapping CSV upload row */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-800 block flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                      Bulk Import SKU Mapping Rules via CSV
                    </span>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      CSV structure requires: <strong className="font-mono text-slate-700">channelSku</strong>, <strong className="font-mono text-slate-700">warehouseSku</strong>, and optional <strong className="font-mono text-slate-700">channel</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`data:text/csv;charset=utf-8,channelSku,warehouseSku,channel\nAMZ-EARBUDS-BLK,AMZ-ELEC-402,amazon\nEBAY-CORD-BLK,AMZ-CABLE-USB,ebay`}
                      download="sellershub_sku_mappings_template.csv"
                      className="text-[10px] font-bold border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      Template
                    </a>
                    
                    <label className="text-[10px] font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0">
                      <Upload className="w-3 h-3" />
                      Upload CSV Mapping
                      <input
                        type="file"
                        onChange={handleMappingCSVUpload}
                        accept=".csv"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Searching mappings */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search active mapping rules by Channel SKU or Warehouse SKU..."
                    value={mappingSearch}
                    onChange={(e) => setMappingSearch(e.target.value)}
                    className="w-full text-xs px-3 py-2 pl-9 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50/30"
                    id="mapping-search-input"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                {/* SKU Mappings table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                        <th className="py-2.5 px-3">Sales Store Channel</th>
                        <th className="py-2.5 px-3">Store Listing SKU</th>
                        <th className="py-2.5 px-3">Warehouse Stock SKU</th>
                        <th className="py-2.5 px-3 text-right">Operation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {isFetchingMappings ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-1" />
                            Loading mapping database rules...
                          </td>
                        </tr>
                      ) : skuMappings.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                            No SKU mapping rules found. Map your store listings to warehouse SKUs using the builder above.
                          </td>
                        </tr>
                      ) : (
                        skuMappings
                          .filter(m => 
                            (m.channelSku || "").toLowerCase().includes(mappingSearch.toLowerCase()) ||
                            (m.warehouseSku || "").toLowerCase().includes(mappingSearch.toLowerCase())
                          )
                          .map((mapping) => {
                            const matchedProduct = products.find(p => p.sku === mapping.warehouseSku);
                            
                            return (
                              <tr key={mapping.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase ${
                                    mapping.channel === 'amazon'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                      : mapping.channel === 'ebay'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                                  }`}>
                                    {mapping.channel}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono font-black text-slate-800">
                                  {mapping.channelSku}
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="space-y-0.5">
                                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] border border-indigo-100/40">
                                      {mapping.warehouseSku}
                                    </span>
                                    {matchedProduct && (
                                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]" title={matchedProduct.name}>
                                        {matchedProduct.name}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button 
                                    onClick={() => handleDeleteMapping(mapping.id)}
                                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                                    title="Remove Rule Mapping"
                                    id={`delete-mapping-${mapping.id}-btn`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            {/* Column 2: Bundle SKU Manager */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Bundle list visual panel */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-indigo-600" />
                    Custom Master Bundle SKUs
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    These combo master SKUs reflect dynamic stock based on constituent components
                  </p>
                </div>

                {/* Render active Bundle creation wizard modal/panel */}
                {isCreatingBundle ? (
                  <div className="bg-indigo-50/45 p-4 rounded-xl border border-indigo-100 space-y-4 animate-fade-in" id="bundle-builder-wizard">
                    <div className="flex items-center justify-between border-b border-indigo-100/60 pb-1.5">
                      <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider">
                        Master Bundle Builder Wizard
                      </span>
                      <button title="Cancel and close" 
                        onClick={() => setIsCreatingBundle(false)}
                        className="text-indigo-400 hover:text-indigo-600 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-indigo-950 block mb-1">Bundle SKU Code (Unique)</label>
                        <input
                          type="text"
                          placeholder="e.g., BNDL-SUPER-PACK"
                          value={bundleForm.sku}
                          onChange={(e) => setBundleForm({ ...bundleForm, sku: e.target.value })}
                          className="bg-white border border-indigo-200 rounded-lg p-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-indigo-950 block mb-1">Bundle Customer Facing Name</label>
                        <input
                          type="text"
                          placeholder="e.g., [Bundle] Super Premium Gift Pack"
                          value={bundleForm.name}
                          onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })}
                          className="bg-white border border-indigo-200 rounded-lg p-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-indigo-950 block mb-1">Bundle Marketing Description</label>
                        <textarea
                          placeholder="Brief description explaining components..."
                          value={bundleForm.description}
                          onChange={(e) => setBundleForm({ ...bundleForm, description: e.target.value })}
                          rows={2}
                          className="bg-white border border-indigo-200 rounded-lg p-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-indigo-950 block mb-1">Retail Selling MSRP ({currencySymbol})</label>
                          <input
                            type="number"
                            step="0.01"
                            value={bundleForm.sellingPrice}
                            onChange={(e) => setBundleForm({ ...bundleForm, sellingPrice: e.target.value })}
                            className="bg-white border border-indigo-200 rounded-lg p-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-indigo-950 block mb-1">Wholesale Cost ({currencySymbol})</label>
                          <input
                            type="number"
                            step="0.01"
                            value={bundleForm.buyingPrice}
                            onChange={(e) => setBundleForm({ ...bundleForm, buyingPrice: e.target.value })}
                            className="bg-white border border-indigo-200 rounded-lg p-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                          />
                        </div>
                      </div>

                      {/* Component list lines */}
                      <div className="space-y-2 border-t border-indigo-100/60 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-600 block">Constituent Products & Quantities</span>
                          <button title="Perform action" 
                            onClick={() => setBundleForm({
                              ...bundleForm,
                              components: [...bundleForm.components, { sku: '', quantity: 1 }]
                            })}
                            className="text-[10px] font-extrabold text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded border border-indigo-200 bg-white"
                          >
                            + Add Component
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {bundleForm.components.map((comp, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <select
                                value={comp.sku}
                                onChange={(e) => {
                                  const list = [...bundleForm.components];
                                  list[idx].sku = e.target.value;
                                  setBundleForm({ ...bundleForm, components: list });
                                }}
                                className="bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] flex-1 focus:outline-none"
                              >
                                <option value="">Select Component...</option>
                                {products.filter(p => !p.isBundle).map(p => (
                                  <option key={p.sku} value={p.sku}>{p.sku} (${p.sellingPrice.toFixed(2)})</option>
                                ))}
                              </select>

                              <input
                                type="number"
                                min="1"
                                placeholder="Qty"
                                value={comp.quantity}
                                onChange={(e) => {
                                  const list = [...bundleForm.components];
                                  list[idx].quantity = parseInt(e.target.value, 10) || 1;
                                  setBundleForm({ ...bundleForm, components: list });
                                }}
                                className="bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] w-14 font-mono font-bold text-center"
                              />

                              <button title="Close dialog or panel" 
                                onClick={() => {
                                  const list = bundleForm.components.filter((_, cidx) => cidx !== idx);
                                  setBundleForm({ ...bundleForm, components: list.length > 0 ? list : [{ sku: '', quantity: 1 }] });
                                }}
                                className="text-slate-400 hover:text-rose-500 p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button title="Save changes"
                        onClick={handleCreateBundle}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs w-full p-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        id="save-new-bundle-btn"
                      >
                        <Check className="w-4 h-4" />
                        Compile and Register Bundle SKU
                      </button>
                    </div>
                  </div>
                ) : (
                  <button title="Add new item" 
                    onClick={() => setIsCreatingBundle(true)}
                    className="w-full text-xs font-bold border-2 border-dashed border-indigo-200 text-indigo-700 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-300 py-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Open Master Bundle Builder
                  </button>
                )}

                {/* Display existing bundles list */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Registered Bundles ({products.filter(p => p.isBundle).length})
                  </span>

                  <div className="space-y-3">
                    {products.filter(p => p.isBundle).map(bundle => {
                      return (
                        <div key={bundle.sku} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-mono text-[11px] font-black text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                                {bundle.sku}
                              </span>
                              <h4 className="text-xs font-black text-slate-800 mt-1 leading-snug">{bundle.name}</h4>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-slate-400 block font-semibold">Derived Stock</span>
                              <span className={`font-mono text-xs font-black px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                bundle.stock && bundle.stock > 0 
                                  ? 'bg-emerald-100 text-emerald-800 font-extrabold' 
                                  : 'bg-rose-100 text-rose-700 font-extrabold animate-pulse'
                              }`}>
                                {bundle.stock || 0} Units
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                            {bundle.description}
                          </p>

                          <div className="bg-white rounded-lg border border-slate-200/80 p-2.5 space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                              Bundle Components Breakdown:
                            </span>
                            <div className="space-y-1">
                              {bundle.bundleComponents?.map((comp, cidx) => {
                                const compProduct = products.find(p => p.sku === comp.sku);
                                return (
                                  <div key={cidx} className="flex justify-between items-center text-[10px] text-slate-600 font-mono">
                                    <span className="font-bold text-indigo-700">{comp.sku}</span>
                                    <span>
                                      Qty: <strong>{comp.quantity}</strong> 
                                      <span className="text-slate-300 mx-1">|</span> 
                                      Avail Stock: <strong className="text-slate-800">{compProduct ? compProduct.stock : 0}</strong>
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Extraction Sub Tab */}
      {activeSubTab === 'extraction' && (
        <div className="p-6 flex-1 overflow-y-auto bg-white/50 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CloudLightning className="w-5 h-5 text-fuchsia-600" />
              Live Inventory Extraction
            </h3>
            <p className="text-xs text-slate-500">Pull listings dynamically from your connected external channels to sync back into the WMS Master Catalog.</p>

            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500">Select Source Channel</label>
                <select
                  value={extractChannel}
                  onChange={(e) => setExtractChannel(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:outline-none"
                >
                  <option value="amazon">Amazon FBA/FBM</option>
                  <option value="ebay">eBay Store</option>
                  <option value="shopify">Shopify</option>
                  <option value="woocommerce">WooCommerce</option>
                  <option value="magento">Magento</option>
                </select>
              </div>
              <button title="Execute ExtractInventory"
                onClick={handleExtractInventory}
                disabled={isExtracting}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0"
              >
                {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudLightning className="w-4 h-4" />}
                {isExtracting ? 'Extracting...' : 'Initiate Extraction'}
              </button>
            </div>

            {extractedItems.length > 0 && (
              <div className="mt-6">
                <span className="text-[11px] font-bold uppercase text-slate-400 mb-2 block">Extracted Items ({extractedItems.length})</span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {extractedItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {item.image && <img src={item.image} alt={item.title} className="w-12 h-12 rounded object-cover border border-slate-200" />}
                        <div className="flex-1">
                          <span className="bg-slate-200 text-slate-700 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">{item.channel}</span>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mt-1">{item.title}</h4>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono border-t border-slate-200 pt-2">
                        <span className="text-slate-500">SKU: {item.channelSku}</span>
                        <span className="font-bold text-emerald-600">${item.price?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                         <span className="text-slate-500">Stock: {item.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Listing Configurator Sub Tab */}
      {activeSubTab === 'listing' && (
        <div className="p-6 flex-1 overflow-y-auto bg-white/50 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-600" />
              Dynamic Listing Configurator
            </h3>
            <p className="text-xs text-slate-500">Configure and publish master catalog products to multi-channel templates with all mandatory attributes dynamically configured based on the channel selected.</p>

            <form onSubmit={handlePublishListing} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Selection */}
              <div className="space-y-4 border-r border-slate-100 pr-0 lg:pr-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Source Catalog Product *</label>
                  <select
                    required
                    value={selectedProductForListing}
                    onChange={(e) => setSelectedProductForListing(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="">-- Select Master Product --</option>
                    {products.map(p => (
                      <option key={p.sku} value={p.sku}>{p.sku} - {p.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Target Channel *</label>
                    <select
                      required
                      value={listingChannel}
                      onChange={(e) => {
                        setListingChannel(e.target.value as any);
                        setListingAttributes({}); // Reset attributes on channel switch
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="amazon">Amazon (Seller Central)</option>
                      <option value="ebay">eBay (Global)</option>
                      <option value="shopify">Shopify Store</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Listing Template *</label>
                    <select
                      required
                      value={listingTemplate}
                      onChange={(e) => setListingTemplate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="default">Standard Generic Template</option>
                      <option value="premium">Premium A+ Content Template</option>
                      <option value="holiday">Holiday Promo Template</option>
                      <option value="clearance">Clearance Template</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Channel Listed SKU *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. AMZ-BNDL-001"
                      value={listingSku}
                      onChange={(e) => setListingSku(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Listing Price (Override) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 font-bold">{currencySymbol}</span>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={listingPrice}
                        onChange={(e) => setListingPrice(parseFloat(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 pl-7 font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Attributes Form */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Sliders className="w-3.5 h-3.5" /> Mandatory Channel Attributes ({listingChannel.toUpperCase()})
                </span>
                
                {listingChannel === 'amazon' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">ASIN Override (Optional)</label>
                      <input
                        type="text"
                        placeholder="Leave blank to auto-generate"
                        value={listingAttributes['asin'] || ''}
                        onChange={(e) => setListingAttributes({...listingAttributes, asin: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Fulfillment Center ID *</label>
                      <select
                        required
                        value={listingAttributes['fc_id'] || 'FBA-US'}
                        onChange={(e) => setListingAttributes({...listingAttributes, fc_id: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                         <option value="FBA-US">FBA-US (Amazon Fulfilled)</option>
                         <option value="FBM-MAIN">FBM (Merchant Fulfilled Main WH)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Bullet Point 1 (Feature) *</label>
                      <input
                        required
                        type="text"
                        value={listingAttributes['bullet_1'] || ''}
                        onChange={(e) => setListingAttributes({...listingAttributes, bullet_1: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {listingChannel === 'ebay' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Item Condition *</label>
                      <select
                        required
                        value={listingAttributes['condition'] || 'New'}
                        onChange={(e) => setListingAttributes({...listingAttributes, condition: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                         <option value="New">New</option>
                         <option value="Used-LikeNew">Used - Like New</option>
                         <option value="Used-Good">Used - Good</option>
                         <option value="Refurbished">Seller Refurbished</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Shipping Profile *</label>
                      <select
                        required
                        value={listingAttributes['shipping_profile'] || 'standard'}
                        onChange={(e) => setListingAttributes({...listingAttributes, shipping_profile: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                         <option value="standard">Standard Free Shipping</option>
                         <option value="expedited">Expedited Shipping ({currencySymbol}5.00)</option>
                         <option value="freight">LTL Freight (Oversized)</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {listingChannel === 'shopify' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Product Tags (Comma separated) *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. electronics, summer-sale, new"
                        value={listingAttributes['tags'] || ''}
                        onChange={(e) => setListingAttributes({...listingAttributes, tags: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Collection assignment *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Home Page, Best Sellers"
                        value={listingAttributes['collection'] || ''}
                        onChange={(e) => setListingAttributes({...listingAttributes, collection: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-6 text-right">
                  <button title="Submit form" 
                    type="submit"
                    disabled={isPublishingListing}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isPublishingListing ? 'Publishing...' : `Publish Listing to ${listingChannel.toUpperCase()}`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Upgrade Comparison Modal */}
      {aiCompareModalOpen && aiCompareData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="ai-compare-modal-overlay">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]" id="ai-compare-modal-container">
            {/* Header */}
            <div className="px-6 py-4 bg-indigo-950 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                    Gemini AI Catalog Listing Optimizer
                  </h3>
                  <p className="text-xs text-indigo-300">
                    Review SEO-optimized titles, marketing descriptions, and pricing margins for SKU: <span className="font-mono font-bold bg-indigo-900 px-1.5 py-0.5 rounded">{aiCompareData.product.sku}</span>
                  </p>
                </div>
              </div>
              <button title="Close"  
                onClick={() => { setAiCompareModalOpen(false); setAiCompareData(null); }}
                className="text-indigo-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Explanation / Reasoning Banner */}
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block mb-1">Gemini AI Copywriter Strategy:</span>
                  <p className="text-slate-600 leading-normal">{aiCompareData.suggested.explanation}</p>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CURRENT VERSION */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200 pb-2">
                    Current Catalog Entry
                  </span>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Product Title / Name</span>
                    <h4 className="text-xs font-bold text-slate-700 font-sans leading-relaxed">
                      {aiCompareData.product.name}
                    </h4>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Description</span>
                    <p className="text-xs text-slate-500 leading-normal whitespace-pre-wrap font-sans">
                      {aiCompareData.product.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Weight</span>
                      <span className="font-mono text-xs font-semibold text-slate-600">
                        {aiCompareData.product.weight ? `${aiCompareData.product.weight} ${weightUnit}` : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Box Dimensions</span>
                      <span className="font-mono text-xs font-semibold text-slate-600">
                        {aiCompareData.product.size || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Buying Cost</span>
                      <span className="font-mono text-xs font-bold text-slate-600">
                        {currencySymbol}{(aiCompareData.product.buyingPrice || 0).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Selling MSRP</span>
                      <span className="font-mono text-xs font-bold text-slate-600">
                        {currencySymbol}{(aiCompareData.product.sellingPrice || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI PROPOSAL VERSION */}
                <div className="border-2 border-indigo-500 rounded-xl p-4 bg-indigo-50/20 space-y-4 shadow-sm relative">
                  <span className="absolute top-4 right-4 bg-indigo-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    AI OPTIMIZED PROPOSAL
                  </span>
                  
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block border-b border-indigo-200 pb-2">
                    Suggested Improvements
                  </span>

                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 block mb-0.5">Product Title / Name</span>
                    <h4 className="text-xs font-black text-slate-900 font-sans leading-relaxed bg-white p-2.5 rounded-lg border border-indigo-100 shadow-sm">
                      {aiCompareData.suggested.name}
                    </h4>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 block mb-0.5">Description</span>
                    <div className="text-xs text-slate-700 leading-normal whitespace-pre-wrap font-sans bg-white p-2.5 rounded-lg border border-indigo-100 shadow-sm max-h-[160px] overflow-y-auto">
                      {aiCompareData.suggested.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-500 block">Weight</span>
                      <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded border border-indigo-100 block mt-0.5">
                        {aiCompareData.suggested.weight} {weightUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-500 block">Box Dimensions</span>
                      <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded border border-indigo-100 block mt-0.5">
                        {aiCompareData.suggested.size}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-indigo-100">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-500 block">Buying Cost</span>
                      <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded border border-indigo-100 block mt-0.5">
                        {currencySymbol}{aiCompareData.suggested.buyingPrice.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-500 block">Selling MSRP</span>
                      <span className="font-mono text-xs font-black text-emerald-700 bg-white px-2 py-1 rounded border border-indigo-100 block mt-0.5">
                        {currencySymbol}{aiCompareData.suggested.sellingPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button title="Perform action" 
                onClick={() => { setAiCompareModalOpen(false); setAiCompareData(null); }}
                className="text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition-colors"
              >
                Discard Proposal
              </button>
              <button title="Execute AcceptUpgrade"
                onClick={handleAcceptUpgrade}
                className="text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-colors"
                id="accept-ai-upgrade-btn"
              >
                <Check className="w-4 h-4" />
                Apply AI Upgraded Catalog Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
