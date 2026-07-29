export function formatWhatsAppNumber(phone?: string): string {
  let envPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  if (envPhone === '1234567890') {
    envPhone = '9779822039083';
  }

  let clean = (phone || envPhone || '9779822039083').replace(/[^0-9]/g, '');

  if (clean === '1234567890' || !clean || clean.length < 7) {
    clean = '9779822039083';
  }

  if (clean.length === 10 && clean.startsWith('9')) {
    clean = '977' + clean;
  }

  return clean;
}

export async function shareImageToWhatsApp({
  phone,
  messageText,
}: {
  phone?: string;
  messageText: string;
  imageUrl?: string;
}) {
  const targetPhone = formatWhatsAppNumber(phone);
  const encodedMessage = encodeURIComponent(messageText);
  
  // Official WhatsApp API link opening directly to target number +9779822039083
  const directWhatsAppUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMessage}`;

  if (typeof window !== 'undefined') {
    window.open(directWhatsAppUrl, '_blank');
  }
}
