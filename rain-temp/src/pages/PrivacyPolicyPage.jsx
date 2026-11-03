import React from 'react';
import policy from './privacy-policy-content.json';
import {useCms} from '../CmsContent';
import LegalDocument from '../LegalDocument';

const preserved={...policy,title:'Privacy Policy',effectiveDate:'2026-11-01',revisedDate:'2026-11-01',website:'https://www.kemsorstudio.com',email:'info@kemsorstudio.com'};
export default function PrivacyPolicyPage() {
 const {legalDocuments}=useCms();
 const document=Array.isArray(legalDocuments)?legalDocuments.find(item=>item.slug==='privacy-policy'):preserved;
 return document?<LegalDocument document={document}/>:<section className="page-section page-copy"><h1>Privacy Policy</h1><p>This document is currently unavailable.</p><a href="/legal/">Visit the Legal Centre</a></section>;
}
