import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { 
  Download, 
  Printer, 
  Share2, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles,
  Layers,
  Palette
} from 'lucide-react';

interface QRCodePageProps {
  navigate: (path: string) => void;
}

export const QRCodePage: React.FC<QRCodePageProps> = ({ navigate }) => {
  const { activeRestaurant, tables, showToast } = useApp();
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [qrSize, setQrSize] = useState<number>(260);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  if (!activeRestaurant) {
    return <div className="p-8 text-center text-stone-500">Sélectionnez un restaurant</div>;
  }

  // Determine origin URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const tableQuery = selectedTable !== 'all'
    ? `?table=${encodeURIComponent(selectedTable.replace(/^Table\\s+/i, ''))}`
    : '';
  const menuPath = `/r/${activeRestaurant.slug}${tableQuery}`;
  const fullMenuUrl = `${origin}${menuPath}`;

  const copyMenuUrl = () => {
    navigator.clipboard.writeText(fullMenuUrl);
    setCopied(true);
    showToast('Lien copié dans le presse-papier');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadPNG = () => {
    const canvas = document.getElementById('resto-qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `QRCode-${activeRestaurant.slug}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast('QR Code téléchargé en haute résolution !');
  };

  const handlePrint = () => {
    window.print();
  };

  const restoTables = tables.filter(t => t.restaurant_id === activeRestaurant.id);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              QR Code du Restaurant
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Imprimez et posez votre QR code sur vos tables pour que vos clients scannent et commandent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 shadow-xs transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer chevalet / sticker</span>
            </button>
            <button
              onClick={handleDownloadPNG}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger PNG HD</span>
            </button>
          </div>
        </div>

        {/* 2-Column: Printable card + Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Printable Stand / Table Sticker Preview */}
          <div className="bg-white rounded-3xl border-2 border-stone-200 p-8 shadow-md text-center space-y-5 print:border-none print:shadow-none print:m-0">
            
            {/* Top Restaurant identity */}
            <div className="flex items-center justify-center gap-3">
              <img
                src={activeRestaurant.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80'}
                alt={activeRestaurant.name}
                className="w-12 h-12 rounded-xl object-cover border border-stone-200 shadow-xs"
              />
              <div className="text-left">
                <h3 className="text-lg font-black text-stone-900 leading-tight">
                  {activeRestaurant.name}
                </h3>
                <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wide">
                  Menu Digital Sans Contact
                </span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="inline-block p-4 rounded-2xl bg-white border-2 border-stone-900 shadow-sm">
              <div id="resto-qr-canvas-wrapper">
                <QRCodeCanvas
                  id="resto-qr-canvas"
                  value={fullMenuUrl}
                  size={qrSize}
                  level="H"
                  includeMargin={false}
                  fgColor="#0c0a09"
                  bgColor="#ffffff"
                />
              </div>
            </div>

            {/* Instructions below QR */}
            <div className="space-y-1">
              <div className="text-base font-extrabold text-stone-900 tracking-tight">
                Scannez avec votre appareil photo
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Consultez le menu complet et commandez directement depuis votre table
              </p>
              {selectedTable !== 'all' && (
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-stone-900 text-white font-bold text-xs">
                  {selectedTable}
                </div>
              )}
            </div>

            {/* Footer URL link */}
            <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-400 font-mono break-all">
              {fullMenuUrl}
            </div>

          </div>

          {/* Configuration & Sharing Panel */}
          <div className="space-y-4">
            
            {/* Direct Link Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Lien direct du menu
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullMenuUrl}
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700 select-all"
                />
                <button
                  onClick={copyMenuUrl}
                  className="px-3 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate(menuPath)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir la page du menu public</span>
                </button>
              </div>
            </div>

            {/* Print tips */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 space-y-2 text-amber-900 text-xs">
              <div className="font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Conseils d'installation en salle :</span>
              </div>
              <ul className="space-y-1 text-amber-800 list-disc list-inside">
                <li>Imprimez sur support plastifié ou chevalet de table en bois/acrylique.</li>
                <li>Placez un exemplaire au centre de chaque table.</li>
                <li>Le client n'a besoin d'installer aucune application : l'appareil photo du smartphone ouvre directement le menu.</li>
              </ul>
            </div>

            {/* Specific Table Filter */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Format sticker par table</span>
              </h4>
              <p className="text-xs text-stone-500">
                Vous pouvez imprimer un sticker général ou assigner un numéro de table sur le sticker.
              </p>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold"
              >
                <option value="all">QR Code Général (Toutes tables)</option>
                {restoTables.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
