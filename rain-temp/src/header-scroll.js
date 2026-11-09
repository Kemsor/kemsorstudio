// Distance hysteresis and a transition pause absorb trackpad inertia and touch bounce.
export function createHeaderScroll(initial=0) {
 let previous=initial,anchor=initial,direction=0,hidden=false,lockedUntil=0;
 return (position,time,blocked=false)=>{
  const delta=position-previous;
  previous=position;
  if(blocked||position<=96){
   hidden=false;anchor=position;direction=0;lockedUntil=time+460;
   return hidden;
  }
  if(time<lockedUntil){anchor=position;direction=0;return hidden;}
  if(Math.abs(delta)<.5)return hidden;
  const nextDirection=Math.sign(delta);
  if(nextDirection!==direction){anchor=position-delta;direction=nextDirection;}
  const travel=Math.abs(position-anchor);
  const next=direction>0&&position>280&&travel>=80?true:direction<0&&travel>=56?false:hidden;
  if(next!==hidden){hidden=next;lockedUntil=time+460;anchor=position;direction=0;}
  return hidden;
 };
}
