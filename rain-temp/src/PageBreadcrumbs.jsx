import React from 'react';
import {pageInfo,pageHref} from './pageInfo';

const parents={
 'story-script':'develop','packaging-talent':'develop','budgeting-scheduling':'develop',
 'finance-structuring':'finance','co-production':'finance','international-co-productions':'finance',
 'line-production':'produce',casting:'produce','locations-logistics':'produce','crew-equipment':'produce','set-production-design':'produce','shooting-on-location':'produce',
 'post-production':'post','distribution-release':'release','festival-awards':'release',
 'feature-films':'what-we-make','series-ott':'what-we-make',documentaries:'what-we-make','short-films':'what-we-make',
 develop:'services',finance:'services',produce:'services',post:'services',release:'services',leadership:'about',
};
export default function PageBreadcrumbs({page,children}){
 const parent=parents[page];
 return <div className="page-breadcrumb-row">{children || <nav className="site-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span>{parent&&<><a href={pageHref(parent)}>{pageInfo[parent].label}</a><span aria-hidden="true">/</span></>}<span aria-current="page">{pageInfo[page]?.label || page}</span></nav>}</div>;
}
