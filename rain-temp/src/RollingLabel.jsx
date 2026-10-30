import React from 'react';

export default function RollingLabel({children}) {
 return <span className="rolling-label"><span className="sr-only">{children}</span><span className="rolling-label-track" aria-hidden="true">{[0,1,2,3].map(copy=><span className="rolling-label-copy" key={copy}>{children}</span>)}</span></span>;
}
