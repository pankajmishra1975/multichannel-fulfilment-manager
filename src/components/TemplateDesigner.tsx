import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Move, Upload, 
  Type, 
  Image as ImageIcon, 
  QrCode, 
  Minus, 
  Table, 
  Sliders, 
  Download, 
  Printer, 
  RefreshCw, 
  Layout, 
  Save, 
  Check, 
  Maximize2, 
  Sparkles,
  Info
} from 'lucide-react';

interface Element {
  id: string;
  type: 'text' | 'image' | 'barcode' | 'line' | 'table';
  x: number; // percentage or absolute pixel coordinate
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'black' | string;
  fontStyle?: 'normal' | 'italic' | string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  placeholder?: string;
}

interface Template {
  id: string;
  name: string;
  type: 'label' | 'slip' | 'invoice' | 'po' | 'quotation';
  width: number; // in pixels for visual representation (e.g. 400x600 for label, 595x842 for A4)
  height: number;
  elements: Element[];
  backgroundImage?: string;
}

const PRESET_TEMPLATES: Template[] = [
  {
    id: 'shipping_label_4x6',
    name: 'Standard Shipping Label (4"x6")',
    type: 'label',
    width: 400,
    height: 600,
    elements: [
      { id: '1', type: 'text', x: 20, y: 20, width: 360, height: 40, content: 'Sellershub Express Delivery', fontSize: 16, fontWeight: 'black', align: 'center' },
      { id: '2', type: 'line', x: 20, y: 70, width: 360, height: 2, content: '' },
      { id: '3', type: 'text', x: 20, y: 85, width: 180, height: 20, content: 'SHIP TO:', fontSize: 10, fontWeight: 'bold' },
      { id: '4', type: 'text', x: 20, y: 110, width: 360, height: 60, content: '{{BUYER_NAME}}\n{{SHIPPING_ADDRESS}}\n{{SHIPPING_CITY}}, {{POSTCODE}}', fontSize: 12, fontWeight: 'bold', placeholder: 'buyer_details' },
      { id: '5', type: 'line', x: 20, y: 180, width: 360, height: 2, content: '' },
      { id: '6', type: 'barcode', x: 50, y: 200, width: 300, height: 80, content: '{{ORDER_ID}}' },
      { id: '7', type: 'text', x: 20, y: 290, width: 360, height: 20, content: '*{{ORDER_ID}}*', fontSize: 11, align: 'center', fontWeight: 'normal' },
      { id: '8', type: 'line', x: 20, y: 320, width: 360, height: 2, content: '' },
      { id: '9', type: 'text', x: 20, y: 335, width: 170, height: 40, content: 'WEIGHT:\n{{TOTAL_WEIGHT}} kg', fontSize: 11, fontWeight: 'bold' },
      { id: '10', type: 'text', x: 210, y: 335, width: 170, height: 40, content: 'ROUTE:\nGB-STD-RM48', fontSize: 11, fontWeight: 'black', align: 'right' },
      { id: '11', type: 'image', x: 140, y: 400, width: 120, height: 120, content: 'https://ais-dev-g4tqmemrqwpf3n6lcv2stb-348050727922.europe-west2.run.app/src/assets/images/amazon_auth_flow_1783082164631.jpg' },
      { id: '12', type: 'text', x: 20, y: 550, width: 360, height: 30, content: 'Sellershub Logistics. Powered by Antigravity OS.', fontSize: 8, align: 'center', color: '#64748b' }
    ]
  },
  {
    id: 'packing_slip_a4',
    name: 'Warehouse Packing Slip (A4)',
    type: 'slip',
    width: 595,
    height: 842,
    elements: [
      { id: '1', type: 'text', x: 40, y: 40, width: 300, height: 30, content: 'Sellershub Warehouse Systems', fontSize: 18, fontWeight: 'black' },
      { id: '2', type: 'text', x: 440, y: 40, width: 120, height: 30, content: 'PACKING SLIP', fontSize: 14, fontWeight: 'bold', align: 'right' },
      { id: '3', type: 'line', x: 40, y: 80, width: 515, height: 2, content: '' },
      { id: '4', type: 'text', x: 40, y: 100, width: 250, height: 80, content: 'FROM:\nSellershub distribution center\nUnit 5, Enterprise Trade Estate\nLondon, UK', fontSize: 10 },
      { id: '5', type: 'text', x: 305, y: 100, width: 250, height: 80, content: 'SHIP TO:\n{{BUYER_NAME}}\n{{SHIPPING_ADDRESS}}\n{{SHIPPING_CITY}}, {{POSTCODE}}', fontSize: 10, fontWeight: 'bold' },
      { id: '6', type: 'text', x: 40, y: 200, width: 250, height: 50, content: 'ORDER DATE: {{DATE}}\nSALES CHANNEL: {{CHANNEL}}', fontSize: 10 },
      { id: '7', type: 'barcode', x: 380, y: 195, width: 180, height: 40, content: '{{ORDER_ID}}' },
      { id: '8', type: 'table', x: 40, y: 270, width: 515, height: 300, content: 'SKU | Description | Bin Location | Qty\n{{ITEM_LIST}}' },
      { id: '9', type: 'line', x: 40, y: 600, width: 515, height: 1, content: '' },
      { id: '10', type: 'text', x: 40, y: 620, width: 515, height: 40, content: 'Thank you for choosing Sellershub Logistics. Please verify items against the bin location mapping listed above.', fontSize: 10, align: 'center' }
    ]
  },
  {
    id: 'invoice_a4',
    name: 'Enterprise Commercial Invoice',
    type: 'invoice',
    width: 595,
    height: 842,
    elements: [
      { id: '1', type: 'text', x: 40, y: 40, width: 300, height: 35, content: 'Sellershub Ltd.', fontSize: 20, fontWeight: 'black' },
      { id: '2', type: 'text', x: 395, y: 40, width: 160, height: 35, content: 'TAX INVOICE', fontSize: 16, fontWeight: 'bold', align: 'right' },
      { id: '3', type: 'line', x: 40, y: 85, width: 515, height: 2, content: '' },
      { id: '4', type: 'text', x: 40, y: 110, width: 250, height: 70, content: 'BILL TO:\n{{BUYER_NAME}}\nVAT Registration: GB123456789', fontSize: 10, fontWeight: 'bold' },
      { id: '5', type: 'text', x: 305, y: 110, width: 250, height: 70, content: 'INVOICE NO: {{INVOICE_NUM}}\nDATE: {{DATE}}\nTERMS: Due on Receipt', fontSize: 10, align: 'right' },
      { id: '6', type: 'table', x: 40, y: 200, width: 515, height: 400, content: 'Product | Price | VAT Rate | Total\n{{PRODUCT_BILL_LIST}}' },
      { id: '7', type: 'line', x: 40, y: 630, width: 515, height: 1, content: '' },
      { id: '8', type: 'text', x: 300, y: 650, width: 255, height: 80, content: 'Subtotal: {{SUBTOTAL}}\nTotal VAT Due: {{TOTAL_VAT}}\nGrand Total: {{GRAND_TOTAL}}', fontSize: 12, fontWeight: 'bold', align: 'right' },
      { id: '9', type: 'text', x: 40, y: 760, width: 515, height: 30, content: 'Sellershub Registered Office: London, UK. Company No: 98319LAK. VAT No: GB889-122', fontSize: 8, align: 'center', color: '#64748b' }
    ]
  },
  {
    id: 'purchase_order_a4',
    name: 'Standard Purchase Order (A4)',
    type: 'po',
    width: 595,
    height: 842,
    elements: [
      { id: '1', type: 'text', x: 40, y: 40, width: 300, height: 35, content: 'Sellershub Ltd.', fontSize: 20, fontWeight: 'black' },
      { id: '2', type: 'text', x: 395, y: 40, width: 160, height: 35, content: 'PURCHASE ORDER', fontSize: 16, fontWeight: 'bold', align: 'right' },
      { id: '3', type: 'line', x: 40, y: 85, width: 515, height: 2, content: '' },
      { id: '4', type: 'text', x: 40, y: 110, width: 250, height: 70, content: 'VENDOR:\n{{SUPPLIER_NAME}}\n{{SUPPLIER_ADDRESS}}\n{{SUPPLIER_CITY}}, {{SUPPLIER_COUNTRY}}', fontSize: 10, fontWeight: 'bold' },
      { id: '5', type: 'text', x: 305, y: 110, width: 250, height: 70, content: 'PO NO: {{PO_NUMBER}}\nDATE: {{DATE}}\nDELIVERY EXPECTED: {{EXPECTED_DATE}}', fontSize: 10, align: 'right' },
      { id: '6', type: 'table', x: 40, y: 200, width: 515, height: 400, content: 'SKU | Description | Qty | Unit Price | Total\n{{PO_ITEM_LIST}}' },
      { id: '7', type: 'line', x: 40, y: 630, width: 515, height: 1, content: '' },
      { id: '8', type: 'text', x: 300, y: 650, width: 255, height: 80, content: 'Subtotal: {{SUBTOTAL}}\nTax: {{TAX}}\nTotal Amount: {{GRAND_TOTAL}}', fontSize: 12, fontWeight: 'bold', align: 'right' },
      { id: '9', type: 'text', x: 40, y: 720, width: 515, height: 30, content: 'Notes: {{NOTES}}\nAuthorized By: _______________', fontSize: 10, color: '#334155' },
      { id: '10', type: 'text', x: 40, y: 780, width: 515, height: 20, content: 'Please deliver all goods to Sellershub Warehouse, Unit 5, Enterprise Trade Estate, London, UK.', fontSize: 9, align: 'center', color: '#64748b' }
    ]
  },
  {
    id: 'quotation_a4',
    name: 'Client Quotation (A4)',
    type: 'quotation',
    width: 595,
    height: 842,
    elements: [
      { id: '1', type: 'text', x: 40, y: 40, width: 300, height: 35, content: 'Sellershub Ltd.', fontSize: 20, fontWeight: 'black' },
      { id: '2', type: 'text', x: 395, y: 40, width: 160, height: 35, content: 'QUOTATION', fontSize: 16, fontWeight: 'bold', align: 'right', color: '#0284c7' },
      { id: '3', type: 'line', x: 40, y: 85, width: 515, height: 2, content: '' },
      { id: '4', type: 'text', x: 40, y: 110, width: 250, height: 70, content: 'PREPARED FOR:\n{{CLIENT_NAME}}\n{{CLIENT_ADDRESS}}', fontSize: 10, fontWeight: 'bold' },
      { id: '5', type: 'text', x: 305, y: 110, width: 250, height: 70, content: 'QUOTE NO: {{QUOTE_NUM}}\nDATE: {{DATE}}\nVALID UNTIL: {{EXPIRY_DATE}}', fontSize: 10, align: 'right' },
      { id: '6', type: 'table', x: 40, y: 200, width: 515, height: 400, content: 'Item | Description | Qty | Unit Price | Total\n{{QUOTE_ITEM_LIST}}' },
      { id: '7', type: 'line', x: 40, y: 630, width: 515, height: 1, content: '' },
      { id: '8', type: 'text', x: 300, y: 650, width: 255, height: 80, content: 'Subtotal: {{SUBTOTAL}}\nEstimated Tax: {{TAX}}\nEstimated Total: {{GRAND_TOTAL}}', fontSize: 12, fontWeight: 'bold', align: 'right' },
      { id: '9', type: 'text', x: 40, y: 720, width: 515, height: 40, content: 'Terms & Conditions:\nThis quotation is valid for 30 days from the date of issue. Prices are subject to change after the expiry date.', fontSize: 9, color: '#475569' },
      { id: '10', type: 'text', x: 40, y: 780, width: 515, height: 20, content: 'Thank you for your business!', fontSize: 10, align: 'center', fontWeight: 'bold' }
    ]
  }
];

export default function TemplateDesigner() {
  const [templates, setTemplates] = useState<Template[]>(PRESET_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('shipping_label_4x6');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  useEffect(() => {
    const localTemplates = localStorage.getItem('appTemplates');
    if (localTemplates) {
      try {
        const parsed = JSON.parse(localTemplates);
        if (parsed && parsed.length > 0) {
          const merged = [...parsed];
          let updated = false;
          PRESET_TEMPLATES.forEach(pt => {
            if (!merged.find((m: any) => m.id === pt.id)) {
              merged.push(pt);
              updated = true;
            }
          });
          if (updated) {
            localStorage.setItem('appTemplates', JSON.stringify(merged));
          }
          setTemplates(merged);
          setActiveTemplateId(merged[0].id);
          return;
        }
      } catch (e) {}
    }
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if(data && data.length > 0) {
          setTemplates(data);
          setActiveTemplateId(data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const saveTemplatesToBackend = async (updatedTemplates: Template[]) => {
    try {
      localStorage.setItem('appTemplates', JSON.stringify(updatedTemplates));
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTemplates)
      });
    } catch(err) {
      console.error('Failed to save templates', err);
    }
  };
  
  // Custom presets
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateType, setNewTemplateType] = useState<'label' | 'slip' | 'invoice' | 'po' | 'quotation'>('label');

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

    const PLATFORM_PRESETS = [
    { label: '-- Select Data Variable --', value: '' },
    { label: 'Customer: First Name', value: '{{CUSTOMER_FIRST_NAME}}' },
    { label: 'Customer: Last Name', value: '{{CUSTOMER_LAST_NAME}}' },
    { label: 'Customer: Full Name', value: '{{CUSTOMER_FULL_NAME}}' },
    { label: 'Customer: Email Address', value: '{{CUSTOMER_EMAIL}}' },
    { label: 'Customer: Phone Number', value: '{{CUSTOMER_PHONE}}' },
    { label: 'Customer: Mobile Number', value: '{{CUSTOMER_MOBILE}}' },
    { label: 'Customer: Company Name', value: '{{CUSTOMER_COMPANY}}' },
    { label: 'Customer: Tax ID / VAT', value: '{{CUSTOMER_TAX_ID}}' },
    { label: 'Shipping: Full Name', value: '{{SHIPPING_FULL_NAME}}' },
    { label: 'Shipping: Address Line 1', value: '{{SHIPPING_ADDRESS_1}}' },
    { label: 'Shipping: Address Line 2', value: '{{SHIPPING_ADDRESS_2}}' },
    { label: 'Shipping: Address Line 3', value: '{{SHIPPING_ADDRESS_3}}' },
    { label: 'Shipping: City', value: '{{SHIPPING_CITY}}' },
    { label: 'Shipping: State/Region', value: '{{SHIPPING_STATE}}' },
    { label: 'Shipping: Postcode/Zip', value: '{{SHIPPING_POSTCODE}}' },
    { label: 'Shipping: Country', value: '{{SHIPPING_COUNTRY}}' },
    { label: 'Shipping: Country Code', value: '{{SHIPPING_COUNTRY_CODE}}' },
    { label: 'Billing: Full Name', value: '{{BILLING_FULL_NAME}}' },
    { label: 'Billing: Address Line 1', value: '{{BILLING_ADDRESS_1}}' },
    { label: 'Billing: Address Line 2', value: '{{BILLING_ADDRESS_2}}' },
    { label: 'Billing: City', value: '{{BILLING_CITY}}' },
    { label: 'Billing: State/Region', value: '{{BILLING_STATE}}' },
    { label: 'Billing: Postcode/Zip', value: '{{BILLING_POSTCODE}}' },
    { label: 'Billing: Country', value: '{{BILLING_COUNTRY}}' },
    { label: 'Product: Title', value: '{{PRODUCT_TITLE}}' },
    { label: 'Product: SKU', value: '{{PRODUCT_SKU}}' },
    { label: 'Product: ASIN / UPC', value: '{{PRODUCT_IDENTIFIER}}' },
    { label: 'Product: Barcode String', value: '{{PRODUCT_BARCODE}}' },
    { label: 'Product: Quantity Ordered', value: '{{PRODUCT_QUANTITY}}' },
    { label: 'Product: Unit Price', value: '{{PRODUCT_UNIT_PRICE}}' },
    { label: 'Product: Total Price', value: '{{PRODUCT_TOTAL_PRICE}}' },
    { label: 'Product: Weight (Unit)', value: '{{PRODUCT_WEIGHT}}' },
    { label: 'Product: Dimensions', value: '{{PRODUCT_DIMENSIONS}}' },
    { label: 'Product: Bin Location', value: '{{PRODUCT_BIN_LOCATION}}' },
    { label: 'Product: Warehouse Zone', value: '{{PRODUCT_WAREHOUSE_ZONE}}' },
    { label: 'Product: Image URL (Main)', value: '{{PRODUCT_IMAGE_URL}}' },
    { label: 'Product: Thumbnail URL', value: '{{PRODUCT_THUMBNAIL_URL}}' },
    { label: 'Product: Variation / Options', value: '{{PRODUCT_VARIATION}}' },
    { label: 'Order: Internal ID', value: '{{ORDER_ID}}' },
    { label: 'Order: Channel/Source ID', value: '{{ORDER_CHANNEL_ID}}' },
    { label: 'Order: Purchase Date', value: '{{ORDER_DATE}}' },
    { label: 'Order: Purchase Time', value: '{{ORDER_TIME}}' },
    { label: 'Order: Currency', value: '{{ORDER_CURRENCY}}' },
    { label: 'Order: Subtotal', value: '{{ORDER_SUBTOTAL}}' },
    { label: 'Order: Tax / VAT', value: '{{ORDER_TAX}}' },
    { label: 'Order: Shipping Cost', value: '{{ORDER_SHIPPING_COST}}' },
    { label: 'Order: Total', value: '{{ORDER_TOTAL}}' },
    { label: 'Order: Payment Method', value: '{{ORDER_PAYMENT_METHOD}}' },
    { label: 'Order: Source Channel', value: '{{ORDER_SOURCE_CHANNEL}}' },
    { label: 'Carrier: Name', value: '{{SHIPPING_CARRIER}}' },
    { label: 'Carrier: Service Level', value: '{{SHIPPING_SERVICE}}' },
    { label: 'Carrier: Tracking Number', value: '{{TRACKING_NUMBER}}' },
    { label: 'Carrier: Label Barcode', value: '{{SHIPPING_LABEL_BARCODE}}' },
    { label: 'Misc: Delivery Instructions', value: '{{DELIVERY_INSTRUCTIONS}}' },
    { label: 'Misc: Gift Message', value: '{{GIFT_MESSAGE}}' },
    { label: 'Store: Logo URL', value: '{{STORE_LOGO_URL}}' },
    { label: 'Store: Name', value: '{{STORE_NAME}}' },
    { label: 'Store: Contact Email', value: '{{STORE_CONTACT_EMAIL}}' },
    { label: 'Store: Return Address', value: '{{STORE_RETURN_ADDRESS}}' },
    { label: 'System: Current Date', value: '{{CURRENT_DATE}}' }
  ];

  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      if (selectedElementId) {
        const selectedElem = activeTemplate.elements.find(el => el.id === selectedElementId);
        if (selectedElem && selectedElem.type === 'text') {
           updateElementProperty('content', (selectedElem.content || '') + (selectedElem.content ? ' ' : '') + val);
           e.target.value = '';
           return;
        }
      }
      addElement('text', val);
      e.target.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (activeTemplate) {
          setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? { ...t, backgroundImage: base64String } : t));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [elemStartPos, setElemStartPos] = useState({ x: 0, y: 0 });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const activeTemplate = templates.find(t => t.id === activeTemplateId) || templates[0];
  const selectedElement = activeTemplate.elements.find(e => e.id === selectedElementId);

  // Auto-clear success message
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Handle template selection
  const handleTemplateChange = (id: string) => {
    setActiveTemplateId(id);
    setSelectedElementId(null);
  };

  // Add a new element to current template
  const addElement = (type: 'text' | 'image' | 'barcode' | 'line' | 'table', initialContent?: string) => {
    const newElem: Element = {
      id: `elem_${Date.now()}`,
      type,
      x: 40,
      y: 150,
      width: type === 'line' ? 300 : type === 'barcode' ? 200 : 180,
      height: type === 'line' ? 4 : type === 'barcode' ? 60 : 40,
      content: initialContent || (type === 'text' ? 'Double click to edit text' 
        : type === 'image' 
          ? 'https://ais-dev-g4tqmemrqwpf3n6lcv2stb-348050727922.europe-west2.run.app/src/assets/images/amazon_auth_flow_1783082164631.jpg'
          : type === 'barcode'
            ? '{{ORDER_ID}}'
            : type === 'table'
              ? 'SKU | Description | Bin | Qty\nItem-1 | Sample Item | Rack-A1 | 2'
              : ''),
      fontSize: type === 'text' ? 12 : undefined,
      fontWeight: type === 'text' ? 'normal' : undefined,
      align: type === 'text' ? 'left' : undefined,
    };

    const updated = templates.map(t => {
      if (t.id === activeTemplate.id) {
        return { ...t, elements: [...t.elements, newElem] };
      }
      return t;
    });
    setTemplates(updated);
    saveTemplatesToBackend(updated);
    setSelectedElementId(newElem.id);
  };

  // Delete an element
  const deleteElement = () => {
    if (!selectedElementId) return;
    const updated = templates.map(t => {
      if (t.id === activeTemplate.id) {
        return {
          ...t,
          elements: t.elements.filter(e => e.id !== selectedElementId)
        };
      }
      return t;
    });
    setTemplates(updated);
    saveTemplatesToBackend(updated);
    setSelectedElementId(null);
  };

  // Update multiple properties at once
  const updateElementProperties = (updates: Partial<Element>) => {
    if (!selectedElementId) return;
    setTemplates(prev => prev.map(t => {
      if (t.id === activeTemplate.id) {
        return {
          ...t,
          elements: t.elements.map(e => {
            if (e.id === selectedElementId) {
              return { ...e, ...updates };
            }
            return e;
          })
        };
      }
      return t;
    }));
  };

  // Update selected element property
  const updateElementProperty = (key: keyof Element, value: any) => {
    if (!selectedElementId) return;
    const newTemplates = templates.map(t => {
      if (t.id === activeTemplateId) {
        return {
          ...t,
          elements: t.elements.map(el => el.id === selectedElementId ? { ...el, [key]: value } : el)
        };
      }
      return t;
    });
    setTemplates(newTemplates);
    saveTemplatesToBackend(newTemplates);
  };

  // Create a brand new template
  const createTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    const dimensions = newTemplateType === 'label' 
      ? { width: 400, height: 600 } 
      : { width: 595, height: 842 }; // A4 portrait size

    const newTemp: Template = {
      id: `custom_${Date.now()}`,
      name: newTemplateName,
      type: newTemplateType,
      width: dimensions.width,
      height: dimensions.height,
      elements: [
        { id: 'initial_txt', type: 'text', x: 20, y: 40, width: dimensions.width - 40, height: 45, content: newTemplateName, fontSize: 18, fontWeight: 'bold', align: 'center' }
      ]
    };

    const newTemplates = [...templates, newTemp];
    setTemplates(newTemplates);
    saveTemplatesToBackend(newTemplates);
    setActiveTemplateId(newTemp.id);
    setSelectedElementId('initial_txt');
    setNewTemplateName('');
  };

  
  // Handle resize down
  const handleResizeDown = (e: React.PointerEvent, elem: Element, dir: string) => {
    e.stopPropagation();
    setSelectedElementId(elem.id);
    setIsResizing(true);
    setResizeDir(dir);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setElemStartPos({ x: elem.x, y: elem.y });
    setResizeStartSize({ width: elem.width, height: elem.height });
  };

  // Pointer down event to begin element drag repositioning
  const handlePointerDown = (e: React.PointerEvent, elem: Element) => {
    e.stopPropagation();
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      return;
    }
    setSelectedElementId(elem.id);
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setElemStartPos({ x: elem.x, y: elem.y });
  };


  

  // Global pointer events for drag and resize
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!isDragging && !isResizing) return;
      if (!selectedElementId) return;

      if (isDragging) {
        const dx = e.clientX - dragStartPos.x;
        const dy = e.clientY - dragStartPos.y;
        const newX = Math.max(0, Math.min(activeTemplate.width - 20, elemStartPos.x + dx));
        const newY = Math.max(0, Math.min(activeTemplate.height - 10, elemStartPos.y + dy));

        updateElementProperties({
          x: Math.round(newX),
          y: Math.round(newY)
        });
      } else if (isResizing && resizeDir) {
        const dx = e.clientX - dragStartPos.x;
        const dy = e.clientY - dragStartPos.y;

        let newWidth = resizeStartSize.width;
        let newHeight = resizeStartSize.height;
        let newX = elemStartPos.x;
        let newY = elemStartPos.y;

        if (resizeDir.includes('e')) {
          newWidth = Math.max(10, resizeStartSize.width + dx);
        }
        if (resizeDir.includes('w')) {
          newWidth = Math.max(10, resizeStartSize.width - dx);
          if (newWidth > 10) {
            newX = elemStartPos.x + dx;
          } else {
            newX = elemStartPos.x + resizeStartSize.width - 10;
          }
        }
        if (resizeDir.includes('s')) {
          newHeight = Math.max(10, resizeStartSize.height + dy);
        }
        if (resizeDir.includes('n')) {
          newHeight = Math.max(10, resizeStartSize.height - dy);
          if (newHeight > 10) {
            newY = elemStartPos.y + dy;
          } else {
            newY = elemStartPos.y + resizeStartSize.height - 10;
          }
        }

        updateElementProperties({
          width: Math.round(newWidth),
          height: Math.round(newHeight),
          x: Math.round(newX),
          y: Math.round(newY)
        });
      }
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        setResizeDir(null);
      }
    };

    if (isDragging || isResizing) {
      window.addEventListener('pointermove', handleGlobalPointerMove);
      window.addEventListener('pointerup', handleGlobalPointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isDragging, isResizing, dragStartPos, elemStartPos, resizeStartSize, resizeDir, selectedElementId, activeTemplate.width, activeTemplate.height]);

  // Export & Print action mockup
  const triggerExport = () => {
    saveTemplatesToBackend(templates);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row overflow-hidden min-h-[700px]" id="template-designer-container">
      
      {/* Sidebar Controls - Document Selector, Tool Box & Editor */}
      <div className="w-full xl:w-96 bg-slate-50 border-r border-slate-200 p-5 flex flex-col gap-5 shrink-0" id="designer-sidebar">
        
        {/* Module Header */}
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
          <div className="bg-amber-500 text-slate-950 p-2.5 rounded-xl">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Template Designer</h3>
            <p className="text-[10px] text-slate-600">Drag & drop labels, slips, POs & invoice forms</p>
          </div>
        </div>

        {/* Preset Selection Selector */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-bold text-slate-700">Selected Template Layout</label>
          <select
            value={activeTemplateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.type.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        
        {/* Toolbox / Add Elements */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <h4 className="text-[10px] uppercase font-black text-slate-700 tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-500" /> Tool Elements Box
          </h4>
          <p className="text-[10px] text-slate-600 leading-normal">
            Click to insert custom modules. Drag and place them anywhere on the right stage.
          </p>

          <div className="space-y-2">
            <select
              onChange={handlePresetSelect}
              className="w-full text-xs px-2.5 py-1.5 border border-indigo-200 bg-indigo-50/50 text-indigo-900 font-bold rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {PLATFORM_PRESETS.map((preset, idx) => (
                <option key={idx} value={preset.value}>{preset.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button title="Perform action" 
              onClick={() => addElement('text')}
              className="py-2 px-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 font-bold text-xs rounded-lg border border-slate-200 inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <Type className="w-3.5 h-3.5" /> Text Block
            </button>
            <button title="Perform action" 
              onClick={() => addElement('barcode')}
              className="py-2 px-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 font-bold text-xs rounded-lg border border-slate-200 inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <QrCode className="w-3.5 h-3.5" /> Barcode/QR
            </button>
            <button title="Perform action" 
              onClick={() => addElement('image')}
              className="py-2 px-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 font-bold text-xs rounded-lg border border-slate-200 inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Image Logo
            </button>
            <button title="Perform action" 
              onClick={() => addElement('line')}
              className="py-2 px-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 font-bold text-xs rounded-lg border border-slate-200 inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <Minus className="w-3.5 h-3.5" /> Divider Line
            </button>
            <button title="Perform action" 
              onClick={() => addElement('table')}
              className="py-2 px-2.5 col-span-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 font-bold text-xs rounded-lg border border-slate-200 inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <Table className="w-3.5 h-3.5" /> Dynamic Item Table Grid
            </button>
          </div>
        </div>

        {/* Selected Element Properties Inspector */}
        {selectedElement ? (
          <div className="bg-white rounded-xl border border-indigo-100 p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-[10px] uppercase font-black text-indigo-950 tracking-wider flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Properties Inspect
              </span>
              <button
                onClick={deleteElement}
                className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-md transition-all"
                title="Remove Element"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content Text Box */}
            {selectedElement.type !== 'line' && (
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-700 uppercase">
                  {selectedElement.type === 'image' ? 'Image URL' : 'Content Value'}
                </label>
                {selectedElement.type === 'text' || selectedElement.type === 'table' ? (
                  <textarea
                    rows={selectedElement.type === 'table' ? 4 : 2}
                    value={selectedElement.content}
                    onChange={(e) => updateElementProperty('content', e.target.value)}
                    className="w-full text-slate-900 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="Enter raw text or variables {{ID}}"
                  />
                ) : selectedElement.type === 'image' ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedElement.content}
                      onChange={(e) => updateElementProperty('content', e.target.value)}
                      className="flex-1 w-full text-slate-900 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                      placeholder="URL or Upload"
                    />
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg px-2 flex items-center justify-center text-slate-600 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              updateElementProperty('content', event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={selectedElement.content}
                    onChange={(e) => updateElementProperty('content', e.target.value)}
                    className="w-full text-slate-900 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                  />
                )}
                <span className="text-[9px] text-slate-600 block leading-normal italic mt-1">
                  Use presets like `{"{{ORDER_ID}}"}` or `{"{{BUYER_NAME}}"}` for dynamic values.
                </span>
                {(selectedElement.type === 'text' || selectedElement.type === 'table' || selectedElement.type === 'barcode') && (
                  <select
                    onChange={(e) => {
                       const val = e.target.value;
                       if(val) {
                         updateElementProperty('content', (selectedElement.content || '') + (selectedElement.content ? ' ' : '') + val);
                         e.target.value = '';
                       }
                    }}
                    className="w-full mt-1 text-[10px] px-2 py-1 border border-slate-200 bg-slate-50 text-slate-900 rounded focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">+ Quick Insert Variable...</option>
                    {PLATFORM_PRESETS.filter(p => p.value).map((preset, idx) => (
                      <option key={idx} value={preset.value}>{preset.label}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Position and Dimensions Inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-700">X Position (px)</label>
                <input
                  type="number"
                  value={selectedElement.x}
                  onChange={(e) => updateElementProperty('x', parseInt(e.target.value) || 0)}
                  className="w-full text-slate-900 px-2 py-1 border border-slate-200 rounded-md font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-700">Y Position (px)</label>
                <input
                  type="number"
                  value={selectedElement.y}
                  onChange={(e) => updateElementProperty('y', parseInt(e.target.value) || 0)}
                  className="w-full text-slate-900 px-2 py-1 border border-slate-200 rounded-md font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-700">Width (px)</label>
                <input
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) => updateElementProperty('width', parseInt(e.target.value) || 0)}
                  className="w-full text-slate-900 px-2 py-1 border border-slate-200 rounded-md font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-700">Height (px)</label>
                <input
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) => updateElementProperty('height', parseInt(e.target.value) || 0)}
                  className="w-full text-slate-900 px-2 py-1 border border-slate-200 rounded-md font-mono"
                />
              </div>
            </div>

            {/* Typography Controls */}
            {selectedElement.type === 'text' && (
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700">Font Size (px)</label>
                  <input
                    type="number"
                    value={selectedElement.fontSize || 12}
                    onChange={(e) => updateElementProperty('fontSize', parseInt(e.target.value) || 12)}
                    className="w-full text-slate-900 px-2 py-1 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700">Alignment</label>
                  <select
                    value={selectedElement.align || 'left'}
                    onChange={(e) => updateElementProperty('align', e.target.value)}
                    className="w-full text-slate-900 px-2 py-1 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700">Weight</label>
                  <select
                    value={selectedElement.fontWeight || 'normal'}
                    onChange={(e) => updateElementProperty('fontWeight', e.target.value)}
                    className="w-full text-slate-900 px-2 py-1 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="black">Black</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700">Style</label>
                  <select
                    value={selectedElement.fontStyle || 'normal'}
                    onChange={(e) => updateElementProperty('fontStyle', e.target.value)}
                    className="w-full text-slate-900 px-2 py-1 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-slate-600 text-[10.5px] bg-white border border-dashed rounded-xl leading-relaxed">
            No element selected. Click on any block in the canvas editor to customize details, styles & coordinates.
          </div>
        )}

        {/* Create Custom Template Presets */}
        <form onSubmit={createTemplate} className="bg-slate-100/50 rounded-xl border border-slate-200 p-4 space-y-3">
          <h4 className="text-[10px] uppercase font-black text-slate-700 tracking-wider">
            Create Custom Layout Preset
          </h4>
          <div className="space-y-1.5">
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="e.g. Quotation Form Standard"
              className="w-full text-slate-900 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none bg-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={newTemplateType}
              onChange={(e) => setNewTemplateType(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none bg-white flex-1 text-slate-900"
            >
              <option value="label">Label (4"x6")</option>
              <option value="slip">Packing Slip</option>
              <option value="invoice">Invoice Form</option>
              <option value="po">Purchase Order</option>
              <option value="quotation">Quotation Form</option>
            </select>
            <button title="Submit form" 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-3.5 py-1.5 rounded-lg transition-all shrink-0 inline-flex items-center gap-1"
            >
              Create
            </button>
          </div>
        </form>

      </div>

      {/* Main Designer Canvas Stage */}
      <div className="flex-1 bg-slate-100 p-6 flex flex-col items-center gap-5 min-w-0" id="designer-canvas-stage">
        
        
        {/* Top Control Bar */}
        <div className="w-full bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Active Stage: {activeTemplate.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button title="Perform action" 
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" /> Background Ref
            </button>
            {activeTemplate.backgroundImage && (
              <button title="Delete item" 
                onClick={() => setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? { ...t, backgroundImage: undefined } : t))}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear BG
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Template Rules Saved!
              </span>
            )}
            <button title="Print document"
              onClick={triggerExport}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
            <button title="Print" 
              onClick={() => alert("Simulating document thermal print command! Sent calibration code to Spool Queue.")}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Test Print ZPL
            </button>
          </div>
        </div>

        {/* Visual Canvas Sandbox */}
        <div className="w-full flex-1 flex justify-center items-start overflow-auto p-4 max-h-[640px]">
          <div 
            ref={canvasRef}
            
            style={{ 
              width: `${activeTemplate.width}px`, 
              height: `${activeTemplate.height}px`,
              backgroundImage: activeTemplate.backgroundImage ? `url(${activeTemplate.backgroundImage})` : undefined,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}

            className="bg-white rounded-md border border-slate-300 shadow-lg relative select-none shrink-0"
            id="designer-canvas-workspace"
          >
            {/* Visual Canvas Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60"></div>

            {/* Elements map */}
            {activeTemplate.elements.map((elem) => {
              const isSelected = selectedElementId === elem.id;
              
              // Base custom styles
              const elemStyles: React.CSSProperties = {
                position: 'absolute',
                left: `${elem.x}px`,
                top: `${elem.y}px`,
                width: `${elem.width}px`,
                height: `${elem.height}px`,
                cursor: 'move',
                touchAction: 'none'
              };

              return (
                <div
                  key={elem.id}
                  style={elemStyles}
                  onPointerDown={(e) => handlePointerDown(e, elem)}
                  className={`group transition-shadow p-1 text-xs select-none ${
                    isSelected 
                      ? 'ring-2 ring-indigo-500 ring-offset-1 bg-indigo-50/10 z-20' 
                      : 'hover:ring-1 hover:ring-slate-300'
                  }`}
                >
                  
                  {/* Small label tags */}
                  {isSelected && (
                    <span className="absolute -top-4.5 left-0 bg-indigo-600 text-white font-mono text-[8.5px] px-1 py-0.2 rounded font-black uppercase tracking-wider shadow-sm flex items-center gap-0.5 z-30 pointer-events-none">
                      <Move className="w-2.5 h-2.5" /> {elem.type}
                    </span>
                  )}
                  
                  {/* Resize Handles */}
                  {isSelected && (
                    <>
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'nw')}
                        className="resize-handle absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-nw-resize z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'n')}
                        className="resize-handle absolute -top-1.5 left-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-n-resize transform -translate-x-1/2 z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'ne')}
                        className="resize-handle absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-ne-resize z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'w')}
                        className="resize-handle absolute top-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-w-resize transform -translate-y-1/2 z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'e')}
                        className="resize-handle absolute top-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-e-resize transform -translate-y-1/2 z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'sw')}
                        className="resize-handle absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-sw-resize z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 's')}
                        className="resize-handle absolute -bottom-1.5 left-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-s-resize transform -translate-x-1/2 z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'se')}
                        className="resize-handle absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize z-40" 
                      />
                    </>
                  )}


                  {/* Render based on item type */}
                  {elem.type === 'text' && (
                    <div 
                      style={{ 
                        fontSize: `${elem.fontSize || 12}px`, 
                        fontWeight: elem.fontWeight === 'bold' ? 700 : elem.fontWeight === 'black' ? 900 : 400,
                        fontStyle: elem.fontStyle === 'italic' ? 'italic' : 'normal',
                        textAlign: elem.align || 'left',
                        whiteSpace: 'pre-wrap'
                      }}
                      className="text-slate-900 leading-tight w-full h-full overflow-hidden"
                    >
                      {elem.content}
                    </div>
                  )}

                  {elem.type === 'image' && (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-200 rounded-md overflow-hidden bg-slate-50">
                      <img 
                        src={elem.content} 
                        alt="Logo Preview" 
                        className="max-w-full max-h-full object-contain"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Fallback
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-[9px] text-slate-600 absolute text-center font-bold font-mono group-hover:block hidden">
                        [Company Logo]
                      </span>
                    </div>
                  )}

                  {elem.type === 'line' && (
                    <div className="w-full bg-slate-900" style={{ height: `${elem.height}px` }}></div>
                  )}

                  {elem.type === 'barcode' && (
                    <div className="w-full h-full flex flex-col justify-between items-center bg-white p-1 border border-slate-200">
                      {/* Fake barcode bars */}
                      <div className="w-full flex-1 flex gap-0.5 items-stretch py-0.5 opacity-90">
                        {Array.from({ length: 42 }).map((_, idx) => (
                          <div 
                            key={idx} 
                            className="bg-slate-950 shrink-0" 
                            style={{ 
                              width: idx % 3 === 0 ? '3px' : idx % 5 === 0 ? '1px' : '2px',
                              opacity: idx % 7 === 0 ? 0 : 1
                            }}
                          ></div>
                        ))}
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-widest font-black text-slate-700 bg-white px-1">
                        {elem.content}
                      </span>
                    </div>
                  )}

                  {elem.type === 'table' && (
                    <div className="w-full h-full border border-slate-200 text-[9px] bg-slate-50 rounded overflow-hidden">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-200">
                            {elem.content.split('\n')[0].split('|').map((col, cIdx) => (
                              <th key={cIdx} className="p-1 border-r last:border-0 border-slate-200 text-left">
                                {col.trim()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-200 bg-white">
                            <td className="p-1 border-r border-slate-200 font-mono">SKU-XYZ-99</td>
                            <td className="p-1 border-r border-slate-200">Industrial Widget v4</td>
                            <td className="p-1 border-r border-slate-200 font-mono text-emerald-600">Bin-A12</td>
                            <td className="p-1 font-bold text-center">3</td>
                          </tr>
                          <tr className="bg-slate-50/50">
                            <td className="p-1 border-r border-slate-200 font-mono">SKU-ABC-12</td>
                            <td className="p-1 border-r border-slate-200">Premium Packaging Kit</td>
                            <td className="p-1 border-r border-slate-200 font-mono text-emerald-600">Bin-F2</td>
                            <td className="p-1 font-bold text-center">1</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Pro Tips Panel footer */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs leading-normal">
          <Info className="w-4.5 h-4.5 text-indigo-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider block">
              Drag-to-Reposition & Multi-Format Canvas Guide
            </span>
            <p className="text-slate-700 text-[11px]">
              Simply **click** on any element to open its configuration settings in the left inspector. **Hold your pointer/mouse down and drag** to float blocks around the canvas grid smoothly. Use placeholders like `{"{{BUYER_NAME}}"}` to inject dynamic database fields on the fly.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
