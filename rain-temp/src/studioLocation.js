import defaults from '../../shared/studio-contact.json' with {type:'json'};
export const studioAddress=defaults.address;
export const studioMapEmbed=`https://maps.google.com/maps?q=${encodeURIComponent(studioAddress)}&z=15&output=embed`;
