import React from 'react';
import SiteIcon from './SiteIcon';
import './produce-zigzag-process.css';

export default function ProduceZigzagProcess({ steps, icons = [] }) {
  const count = steps.length;
  const centres = steps.map((_, index) => ((index + .5) * 1000) / count);
  return <div className="shooting-growth-map produce-zigzag" style={{ '--process-count': count }}>
    <svg className="produce-zigzag-graph" viewBox="0 0 1000 330" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <defs><marker id="produce-route-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0 0L6 3L0 6Z" /></marker></defs>
      {centres.slice(0, -1).map((x, index) => {
        const next = centres[index + 1];
        const startY = index % 2 === 0 ? 66 : 264;
        const endY = index % 2 === 0 ? 264 : 66;
        const direction = next - x;
        return <path key={x} d={`M${x + 42} ${startY}C${x + direction * .48} ${startY} ${next - direction * .48} ${endY} ${next - 42} ${endY}`} markerEnd="url(#produce-route-arrow)"/>;
      })}
    </svg>
    <ol className="produce-steps line-production-steps">
      {steps.map(([title, description], index) => <li key={title}>
        <span className="shooting-stage-icon" aria-hidden="true"><SiteIcon name={icons[index] || 'check'} size={22}/></span>
        <div className="produce-zigzag-copy"><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{description}</p></div>
      </li>)}
    </ol>
  </div>;
}
