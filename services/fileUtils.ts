import { Contact } from "../types";

// Compress image using Canvas
export const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024; // Limit resolution for API speed/cost
        const scaleSize = MAX_WIDTH / img.width;
        
        // If image is smaller than max, don't upscale
        const newWidth = scaleSize < 1 ? MAX_WIDTH : img.width;
        const newHeight = scaleSize < 1 ? img.height * scaleSize : img.height;

        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Compress to JPEG with 0.7 quality
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        // Remove prefix to get raw base64
        const rawBase64 = base64.split(',')[1];
        resolve(rawBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Generate CSV string
export const generateCSV = (contacts: Contact[]): string => {
  const headers = ['Name', 'Title', 'Company', 'Email', 'Phone', 'Mobile', 'Website', 'Address'];
  const rows = contacts.map(c => [
    `"${c.fullName.replace(/"/g, '""')}"`,
    `"${c.title.replace(/"/g, '""')}"`,
    `"${c.company.replace(/"/g, '""')}"`,
    `"${c.email.replace(/"/g, '""')}"`,
    `"${c.phone.replace(/"/g, '""')}"`,
    `"${c.mobile.replace(/"/g, '""')}"`,
    `"${c.website.replace(/"/g, '""')}"`,
    `"${c.address.replace(/"/g, '""')}"`,
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

// Generate VCF string
export const generateVCF = (contacts: Contact[]): string => {
  return contacts.map(contact => {
    const n = contact.fullName.split(' ');
    const lastName = n.length > 1 ? n.pop() : '';
    const firstName = n.join(' ');

    return `BEGIN:VCARD
VERSION:3.0
FN:${contact.fullName}
N:${lastName};${firstName};;;
ORG:${contact.company}
TITLE:${contact.title}
TEL;TYPE=WORK,VOICE:${contact.phone}
TEL;TYPE=CELL,VOICE:${contact.mobile}
EMAIL;TYPE=WORK,INTERNET:${contact.email}
URL:${contact.website}
ADR;TYPE=WORK:;;${contact.address};;;;
END:VCARD`;
  }).join('\n');
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};