export function heroSwipeDirection(dx,dy,width){
 const threshold=Math.max(48,Math.min(96,width*.15));
 if(Math.abs(dx)<threshold||Math.abs(dx)<Math.abs(dy)*1.3)return 0;
 return dx<0?1:-1;
}
