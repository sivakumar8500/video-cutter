export type QrContentType =
  | 'link'
  | 'text'
  | 'email'
  | 'call'
  | 'sms'
  | 'vcard'
  | 'whatsapp'
  | 'wifi'
  | 'pdf'
  | 'app'
  | 'images'
  | 'video'
  | 'social'
  | 'event'
  | 'barcode'
  | 'upi';

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type QrDesignTab = 'frame' | 'shape' | 'logo';

export type QrShapeStyle =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'lines'
  | 'disconnected'
  | 'diamond'
  | 'cross'
  | 'mosaic';

export type QrBorderStyle =
  | 'square'
  | 'rounded'
  | 'circle'
  | 'leaf-right'
  | 'leaf-left'
  | 'teardrop'
  | 'circle-in-square'
  | 'shield';

export type QrPresetLogo =
  | 'none'
  | 'link'
  | 'location'
  | 'email'
  | 'whatsapp'
  | 'wifi'
  | 'vcard'
  | 'paypal'
  | 'phonepe'
  | 'upi'
  | 'bitcoin'
  | 'scanme-1'
  | 'scanme-2'
  | 'qr-device'
  | 'qr-frame'
  | 'barcode';

export type QrFrameType =
  | 'none'
  | 'bottom-banner'
  | 'clipboard'
  | 'badge-pill'
  | 'black-banner'
  | 'clapper'
  | 'ribbon'
  | 'phone'
  | 'stamp'
  | 'tags';

export interface QrWifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface QrUpiData {
  vpa: string; // UPI ID e.g. merchant@upi
  name: string;
  amount?: string;
  currency: string;
  note?: string;
}

export interface QrVCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  title: string;
  website: string;
  address: string;
}

export type QrLogoAlign =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type QrLogoShape = 'circle' | 'rounded' | 'square' | 'none';

export interface QrConfig {
  type: QrContentType;
  content: string;

  // Structured Content Types
  wifi: QrWifiData;
  upi: QrUpiData;
  vcard: QrVCardData;
  phone: string;
  smsMessage: string;
  emailAddress: string;
  emailSubject: string;
  emailBody: string;
  whatsappPhone: string;
  whatsappMessage: string;

  // Step 2: Design Styles
  designTab: QrDesignTab;

  // Shapes & Colors
  shapeStyle: QrShapeStyle;
  fgColor: string; // Shape color (default #000000)
  bgColor: string; // Background color (default #FFFFFF)
  transparentBg: boolean;
  gradientEnabled: boolean;
  gradientColor: string;
  gradientType: 'linear' | 'radial';

  // Corner Eye Borders
  borderStyle: QrBorderStyle;
  borderColor: string; // default #000000

  // Frame
  frameType: QrFrameType;
  frameLabel: string; // e.g. "SCAN ME"
  frameSubText: string;

  // Logo
  presetLogo: QrPresetLogo;
  logoUrl?: string;
  logoElement?: HTMLImageElement;
  removeLogoBackground: boolean;
  logoSizePercent: number; // default 22%
  logoAlign?: QrLogoAlign; // default 'center'
  logoOffsetX?: number; // percentage -30 to 30
  logoOffsetY?: number; // percentage -30 to 30
  logoShape?: QrLogoShape; // 'circle' | 'rounded' | 'square' | 'none'
  logoBgColor?: string; // default matching bgColor

  // Error correction & output
  errorCorrectionLevel: QrErrorCorrectionLevel;
  size: number;
  margin: number;
}
