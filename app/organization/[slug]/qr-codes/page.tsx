"use client";

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitch from '@/app/components/languageSwitchButton';

interface QRCode {
  id: string;
  code: string;
  url: string;
  created_at: string;
}

export default function QRCodesPage() {
  const { t } = useTranslation();
  const params = useParams();
  const organizationSlug = params.slug as string;
  const printRef = useRef<HTMLDivElement>(null);
  
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [generating, setGenerating] = useState(false);
  const [quantity, setQuantity] = useState(50);
  const [format, setFormat] = useState<'standard' | 'mini' | 'labels'>('standard');
  const [includeInstructions, setIncludeInstructions] = useState(true);

  // Generate UUID for QR codes
  const generateUUID = () => {
    return 'QR-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateQRCodes = async () => {
    setGenerating(true);
    try {
      const newQRCodes: QRCode[] = [];
      const baseUrl = window.location.origin;
      
      for (let i = 0; i < quantity; i++) {
        const qrId = generateUUID();
        const qrUrl = `${baseUrl}/found?qr=${qrId}`;
        
        newQRCodes.push({
          id: qrId,
          code: qrId,
          url: qrUrl,
          created_at: new Date().toISOString(),
        });
      }
      
      setQrCodes(newQRCodes);
      
      // In a real implementation, you'd save these to the database
      // await qrCodeService.bulkCreate(organizationId, newQRCodes);
      
    } catch (error) {
      console.error('Failed to generate QR codes:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ${organizationSlug}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            
            .qr-grid-standard {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              page-break-inside: avoid;
            }
            
            .qr-grid-mini {
              display: grid;
              grid-template-columns: repeat(6, 1fr);
              gap: 10px;
              page-break-inside: avoid;
            }
            
            .qr-grid-labels {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              page-break-inside: avoid;
            }
            
            .qr-item {
              text-align: center;
              padding: 15px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              background: white;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            
            .qr-item-mini {
              padding: 8px;
              border: 1px solid #e5e7eb;
            }
            
            .qr-item-label {
              padding: 20px;
              border: 2px dashed #6b7280;
              border-radius: 12px;
              background: #f9fafb;
            }
            
            .qr-placeholder {
              width: 120px;
              height: 120px;
              margin: 0 auto 15px;
              border: 2px solid #d1d5db;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: #6b7280;
              background: #f3f4f6;
            }
            
            .qr-placeholder-mini {
              width: 60px;
              height: 60px;
              font-size: 8px;
            }
            
            .qr-code {
              font-family: monospace;
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 10px;
              word-break: break-all;
            }
            
            .qr-instructions {
              font-size: 9px;
              color: #6b7280;
              line-height: 1.3;
              margin-top: 10px;
            }
            
            .page-break {
              page-break-before: always;
            }
            
            @media print {
              body { margin: 0; }
              .page-break { page-break-before: always; }
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .batch-info {
              margin-bottom: 30px;
              padding: 15px;
              background: #eff6ff;
              border: 1px solid #dbeafe;
              border-radius: 8px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${organizationSlug} - QR Codes</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="batch-info">
            <strong>Batch Information:</strong><br>
            Quantity: ${quantity} QR codes<br>
            Format: ${format.charAt(0).toUpperCase() + format.slice(1)}<br>
            Organization: ${organizationSlug}<br>
            Generated: ${new Date().toLocaleString()}
          </div>
          
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const downloadCSV = () => {
    const csvContent = [
      ['QR Code', 'URL', 'Generated At'],
      ...qrCodes.map(qr => [qr.code, qr.url, qr.created_at])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-codes-${organizationSlug}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/organization/${organizationSlug}/dashboard`} className="text-gray-500 hover:text-gray-700">
                ← Back to Dashboard
              </Link>
              <div className="text-2xl">📱</div>
              <h1 className="text-xl font-bold text-gray-900">QR Code Generator</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitch />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Generation Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={25}>25 QR codes</option>
                    <option value={50}>50 QR codes</option>
                    <option value={100}>100 QR codes</option>
                    <option value={200}>200 QR codes</option>
                    <option value={500}>500 QR codes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Print Format
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="standard"
                        checked={format === 'standard'}
                        onChange={(e) => setFormat(e.target.value as any)}
                        className="mr-2"
                      />
                      Standard (3x3 per page)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="mini"
                        checked={format === 'mini'}
                        onChange={(e) => setFormat(e.target.value as any)}
                        className="mr-2"
                      />
                      Mini (6x6 per page)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="labels"
                        checked={format === 'labels'}
                        onChange={(e) => setFormat(e.target.value as any)}
                        className="mr-2"
                      />
                      Labels (2x5 per page)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeInstructions}
                      onChange={(e) => setIncludeInstructions(e.target.checked)}
                      className="mr-2"
                    />
                    Include instructions on each QR code
                  </label>
                </div>

                <button
                  onClick={generateQRCodes}
                  disabled={generating}
                  className="w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-all flex items-center justify-center"
                >
                  {generating && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {generating ? 'Generating...' : 'Generate QR Codes'}
                </button>

                {qrCodes.length > 0 && (
                  <div className="pt-4 border-t space-y-3">
                    <button
                      onClick={handlePrint}
                      className="w-full py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-all"
                    >
                      🖨️ Print QR Codes
                    </button>
                    
                    <button
                      onClick={downloadCSV}
                      className="w-full py-2 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                    >
                      📄 Download CSV
                    </button>
                  </div>
                )}
              </div>

              {qrCodes.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-green-800">
                    <strong>✅ Generated Successfully!</strong>
                    <p className="text-sm mt-1">
                      {qrCodes.length} QR codes ready for printing
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Preview</h2>
                {qrCodes.length > 0 && (
                  <span className="text-sm text-gray-600">
                    Showing {Math.min(12, qrCodes.length)} of {qrCodes.length} codes
                  </span>
                )}
              </div>

              {qrCodes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Generate</h3>
                  <p className="text-gray-600">
                    Configure your settings and click "Generate QR Codes" to create printable codes
                  </p>
                </div>
              ) : (
                <div>
                  {/* Print-ready content (hidden on screen) */}
                  <div ref={printRef} className="hidden">
                    <div className={`qr-grid-${format}`}>
                      {qrCodes.map((qr, index) => (
                        <div key={qr.id} className={`qr-item${format === 'mini' ? '-mini' : format === 'labels' ? '-label' : ''}`}>
                          <div className={`qr-placeholder${format === 'mini' ? '-mini' : ''}`}>
                            QR CODE
                          </div>
                          <div className="qr-code">{qr.code}</div>
                          {includeInstructions && (
                            <div className="qr-instructions">
                              <strong>Lost something?</strong><br />
                              Scan this QR code with your phone camera or visit:<br />
                              {qr.url.replace('http://', '').replace('https://', '')}
                            </div>
                          )}
                          {format === 'labels' && (
                            <div className="qr-instructions">
                              <strong>Instructions:</strong><br />
                              1. Attach this label to your item<br />
                              2. Register the item online<br />
                              3. Get notified when found
                            </div>
                          )}
                          {(index + 1) % (format === 'standard' ? 9 : format === 'mini' ? 36 : 10) === 0 && index < qrCodes.length - 1 && (
                            <div className="page-break"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Screen preview */}
                  <div className={`grid gap-4 ${
                    format === 'standard' ? 'grid-cols-3' : 
                    format === 'mini' ? 'grid-cols-6' : 
                    'grid-cols-2'
                  }`}>
                    {qrCodes.slice(0, 12).map((qr) => (
                      <div key={qr.id} className={`border rounded-lg p-3 text-center ${
                        format === 'labels' ? 'border-dashed bg-gray-50' : 'border-gray-300'
                      }`}>
                        <div className={`bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-xs mb-2 ${
                          format === 'mini' ? 'h-12 w-12 mx-auto' : 'h-20 w-20 mx-auto'
                        }`}>
                          QR
                        </div>
                        <div className={`font-mono font-bold text-gray-800 ${
                          format === 'mini' ? 'text-xs' : 'text-sm'
                        }`}>
                          {qr.code}
                        </div>
                        {includeInstructions && format !== 'mini' && (
                          <div className="text-xs text-gray-600 mt-2">
                            Scan to report found
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {qrCodes.length > 12 && (
                    <div className="mt-6 text-center">
                      <p className="text-gray-600">
                        ... and {qrCodes.length - 12} more codes ready for printing
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}