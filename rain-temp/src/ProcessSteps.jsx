import React, { useEffect, useRef, useState } from 'react';
import SiteIcon from './SiteIcon';
import './process-steps.css';

const icons = ['script', 'briefcase', 'film', 'video'];

export default function ProcessSteps({ steps, label }) {
  const root = useRef(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setEntered(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  return <ol ref={root} className="process-steps" data-entered={entered} aria-label={label}>
    {steps.map(([title, description], index) => <li key={title}>
      <span className="process-steps-node" aria-hidden="true"><SiteIcon name={icons[index]} size={25} /></span>
      <div className="process-steps-card"><h3>{title}</h3><p>{description}</p></div>
    </li>)}
  </ol>;
}
