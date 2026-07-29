export function formatWhatsAppNumber(phone?: string): string {
  let clean = (phone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '9709141876').replace(/[^0-9]/g, '');
  if (clean.length === 10 && clean.startsWith('9')) {
    clean = '977' + clean;
  }
  if (!clean || clean.length < 7) {
    clean = '9779709141876';
  }
  return clean;
}

export async function shareImageToWhatsApp({
  phone,
  messageText,
  imageUrl,
}: {
  phone?: string;
  messageText: string;
  imageUrl?: string;
}) {
  const targetPhone = formatWhatsAppNumber(phone);
  const formattedMessage = imageUrl ? `${imageUrl}\n\n${messageText}` : messageText;
  const encodedMessage = encodeURIComponent(formattedMessage);
  
  // Official WhatsApp API link that opens directly to the store owner's number
  const directWhatsAppUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMessage}`;

  // Direct 100% reliable redirect to store's WhatsApp number
  if (typeof window !== 'undefined') {
    window.open(directWhatsAppUrl, '_blank');
  }
}
