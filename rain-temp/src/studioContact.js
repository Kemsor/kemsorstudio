import defaults from '../../shared/studio-contact.json' with {type:'json'};
export const studioEmail=defaults.email;
export const studioPhone=defaults.mobile;
export function internationalPhone(value){
 const digits=value.replace(/\D/g,'');
 if(value.trim().startsWith('+'))return '+'+digits;
 if(digits.length===10)return '+91'+digits;
 if(digits.length===11&&digits.startsWith('0'))return '+91'+digits.slice(1);
 return digits;
}
export const studioPhoneHref=`tel:${internationalPhone(studioPhone)}`;
const validPhone=value=>typeof value==='string'&&/\d/.test(value)&&/^[+\d\s().-]+$/.test(value);
export function getStudioContacts(settings={}){
 const email=typeof settings.contact_email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contact_email)&&!settings.contact_email.endsWith('.example')?settings.contact_email:studioEmail;
 const phone=validPhone(settings.contact_phone)?settings.contact_phone:studioPhone;
 const landline=settings.contact_landline===''?'':validPhone(settings.contact_landline)?settings.contact_landline:defaults.landline;
 const whatsapp=settings.contact_whatsapp===''?'':validPhone(settings.contact_whatsapp)?settings.contact_whatsapp:defaults.whatsapp;
 let website=defaults.website;
 if(settings.contact_website==='')website='';
 else if(typeof settings.contact_website==='string'){try{const parsed=new URL(settings.contact_website);if(parsed.protocol==='https:'&&!parsed.username&&!parsed.password)website=parsed.href;}catch{}}
 return {email,phone,phoneHref:`tel:${internationalPhone(phone)}`,landline,landlineHref:`tel:${internationalPhone(landline)}`,whatsapp,whatsappHref:whatsapp?`https://wa.me/${internationalPhone(whatsapp).replace(/^\+/,'')}`:'',website,websiteLabel:website.replace(/^https:\/\//,'').replace(/\/$/,'')};
}
