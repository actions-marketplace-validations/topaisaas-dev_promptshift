'use client';

import { jsPDF } from 'jspdf';
import { VaultInvoice } from '@/lib/storage/clientVault';

export class InvoiceGenerator {
  /**
   * Generates and triggers instant download of a corporate-grade, compliant PDF invoice
   */
  public static generatePdf(invoice: VaultInvoice): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Background header accent
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, pageWidth, 42, 'F');

    // Brand Name & Tagline
    doc.setTextColor(34, 211, 238); // Cyan-400
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('PromptShift', margin, 18);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.setFont('helvetica', 'normal');
    doc.text('1-Click Universal AI Project Bridge • promptshift.dev', margin, 24);
    doc.text('Zero-Retention In-RAM Architecture • ISO-Ready AST Parity', margin, 29);

    // Invoice Status Stamp
    doc.setFillColor(16, 185, 129); // Emerald-500
    doc.roundedRect(pageWidth - margin - 35, 12, 35, 10, 2, 2, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PAID IN FULL', pageWidth - margin - 31, 18.5);

    // Invoice Meta Information Box
    const metaY = 52;
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`INVOICE: ${invoice.invoiceNumber}`, margin, metaY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Issue Date: ${new Date(invoice.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, metaY + 6);
    doc.text(`Payment Reference: ${invoice.orderId}`, margin, metaY + 11);
    doc.text(`Payment Method: ${invoice.paymentMethod}`, margin, metaY + 16);

    // Seller Information (Right side)
    const sellerX = pageWidth - margin - 60;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('PromptShift Inc.', sellerX, metaY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('8 Boulevard Haussmann', sellerX, metaY + 5);
    doc.text('75009 Paris, France', sellerX, metaY + 10);
    doc.text('VAT ID: EU847291048', sellerX, metaY + 15);
    doc.text('billing@promptshift.dev', sellerX, metaY + 20);

    // Bill To Customer Box
    const billToY = 82;
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.roundedRect(margin, billToY, pageWidth - margin * 2, 26, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, billToY, pageWidth - margin * 2, 26, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.text('BILLED TO (CUSTOMER DETAILS & TAX IDENTIFICATION):', margin + 5, billToY + 6);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.customerName || 'Lead Autonomous Software Engineer', margin + 5, billToY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const companyInfo = invoice.customerCompany ? `${invoice.customerCompany} • ` : '';
    const vatInfo = invoice.customerVatId ? `VAT: ${invoice.customerVatId} • ` : '';
    doc.text(`${companyInfo}${vatInfo}${invoice.customerEmail || 'dev@company.com'}`, margin + 5, billToY + 17);

    if (invoice.poNumber) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Purchase Order (PO): ${invoice.poNumber}`, margin + 5, billToY + 22);
    }

    // Itemized Table Header
    const tableY = 120;
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.rect(margin, tableY, pageWidth - margin * 2, 9, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text('ITEM / DESCRIPTION', margin + 4, tableY + 6);
    doc.text('QTY', margin + 95, tableY + 6);
    doc.text('UNIT PRICE', margin + 115, tableY + 6);
    doc.text(invoice.isReverseCharge ? 'TAX (0% RC)' : 'TAX (20%)', margin + 140, tableY + 6);
    doc.text('TOTAL', pageWidth - margin - 15, tableY + 6, { align: 'right' });

    // Table Content Line
    const rowY = tableY + 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.planName, margin + 4, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const subDesc = invoice.planName === 'Pro Developer Subscription'
      ? 'Unlimited Cross-Platform Conversions (Claude, Cursor, OpenAI, Gemini) + CLI Token'
      : invoice.planName === 'Team & Agency Pass'
      ? '5 Team Seats + GitHub/GitLab CI/CD Sync + SOC-2 & GDPR DPA + Priority Support'
      : 'Single Full-Repository In-RAM AST Transpilation & Secret Sanitizer Pass';
    doc.text(subDesc, margin + 4, rowY + 5);

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('1', margin + 98, rowY);

    const totalNum = parseFloat(invoice.amount);
    const subtotalNum = invoice.isReverseCharge ? totalNum : +(totalNum / 1.2).toFixed(2);
    const taxNum = invoice.isReverseCharge ? 0.0 : +(totalNum - subtotalNum).toFixed(2);

    const currency = invoice.currency || 'USD';
    const symMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'CA$',
      AUD: 'A$',
      JPY: '¥',
    };
    const sym = symMap[currency] || '$';
    const decimals = currency === 'JPY' ? 0 : 2;
    const fmt = (n: number) => `${sym}${n.toFixed(decimals)}`;

    doc.text(fmt(subtotalNum), margin + 115, rowY);
    doc.text(invoice.isReverseCharge ? fmt(0) : fmt(taxNum), margin + 140, rowY);
    doc.setFont('helvetica', 'bold');
    doc.text(fmt(totalNum), pageWidth - margin - 15, rowY, { align: 'right' });

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, rowY + 12, pageWidth - margin, rowY + 12);

    // Summary Box (Subtotal, Tax, Grand Total)
    const sumY = rowY + 22;
    const sumX = pageWidth - margin - 75;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Subtotal (Excl. Tax):', sumX, sumY);
    doc.text(fmt(subtotalNum), pageWidth - margin - 15, sumY, { align: 'right' });

    if (invoice.isReverseCharge) {
      doc.text('VAT (B2B Reverse Charge):', sumX, sumY + 6);
      doc.text(fmt(0), pageWidth - margin - 15, sumY + 6, { align: 'right' });
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Tax exempt: Art. 196 EU VAT Directive', sumX, sumY + 10);
    } else {
      doc.text('Value Added Tax (VAT 20%):', sumX, sumY + 6);
      doc.text(fmt(taxNum), pageWidth - margin - 15, sumY + 6, { align: 'right' });
    }

    doc.setFillColor(241, 245, 249);
    doc.rect(sumX - 2, sumY + 13, 77, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL PAID:', sumX, sumY + 20);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(`${fmt(totalNum)} ${currency}`, pageWidth - margin - 15, sumY + 20, { align: 'right' });

    // Sovereign Guarantee Box
    const securityY = sumY + 45;
    doc.setFillColor(240, 253, 250); // Teal-50
    doc.setDrawColor(204, 251, 241);
    doc.roundedRect(margin, securityY, pageWidth - margin * 2, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(13, 148, 136); // Teal-600
    doc.text('VERIFIED ZERO DATA RETENTION CERTIFICATION', margin + 5, securityY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'All AST transformations, token sanitizations, and downloads execute exclusively in ephemeral RAM.',
      margin + 5,
      securityY + 12
    );
    doc.text(
      'PromptShift maintains 0 bytes of customer code on persistent disks or third-party training databases.',
      margin + 5,
      securityY + 16
    );

    // Footer
    const footerY = 280;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'PromptShift Inc. • Reg No: 894 102 918 R.C.S. Paris • For questions: billing@promptshift.dev',
      pageWidth / 2,
      footerY + 5,
      { align: 'center' }
    );

    // Save PDF
    doc.save(`PromptShift_${invoice.invoiceNumber}.pdf`);
  }
}
