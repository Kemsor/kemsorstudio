// Shared public enquiry address for all website pages.
export const studioEmail = 'info@kemsorstudio.com';
export const studioPhone = '+91 8679997761';
export const studioPhoneHref = 'tel:+918679997761';

export function getStudioContacts(settings={}){
 const email=typeof settings.contact_email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contact_email)?settings.contact_email:studioEmail;
 const phone=typeof settings.contact_phone==='string'&&/[0-9]/.test(settings.contact_phone)&&/^[+\d\s().-]+$/.test(settings.contact_phone)?settings.contact_phone:studioPhone;
 return {email,phone,phoneHref:`tel:${phone.replace(/[^+0-9]/g,'')}`};
}
