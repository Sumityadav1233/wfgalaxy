export async function shareImageToWhatsApp({
  phone,
  messageText,
  imageUrl,
}: {
  phone: string;
  messageText: string;
  imageUrl?: string;
}) {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

  // 1. Try native Web Share API to attach actual image file directly in WhatsApp (Mobile Safari / Chrome)
  if (typeof window !== 'undefined' && imageUrl && navigator.share) {
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        const mimeType = blob.type || 'image/jpeg';
        const ext = mimeType.split('/')[1] || 'jpg';
        const file = new File([blob], `wfgalaxy_product.${ext}`, { type: mimeType });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'WF GALAXY Order',
            text: messageText,
            files: [file],
          });
          return;
        }
      }
    } catch (err) {
      console.warn('Native image file share failed, falling back to WhatsApp link:', err);
    }
  }

  // 2. Fallback: Format with direct image URL on line 1 for WhatsApp link preview box
  const formattedMessage = imageUrl 
    ? `${imageUrl}\n\n${messageText}` 
    : messageText;

  const encodedMessage = encodeURIComponent(formattedMessage);
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodedMessage}` 
    : `https://wa.me/?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
}
