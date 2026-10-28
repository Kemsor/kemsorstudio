import React from 'react';
import { House, Clapperboard, Compass, Mail, ArrowRight, Users, Eye, EyeOff, Maximize, Minimize, Volume2, VolumeX, Play, Pause, X, Check, Bookmark, ArrowUpRight, ArrowUp, ArrowDown, ArrowLeft, Plus, Minus, ChevronDown, Menu, LockKeyhole, BriefcaseBusiness, Scan, Video, Crosshair, FilePenLine, Handshake, MapPin } from 'lucide-react';

const icons = { home: House, film: Clapperboard, guide: Compass, contact: Mail, arrow: ArrowRight, people: Users, eye: Eye, 'eye-off': EyeOff, expand: Maximize, collapse: Minimize, volume: Volume2, muted: VolumeX, play: Play, pause: Pause, close: X, check: Check, bookmark: Bookmark, 'arrow-up-right': ArrowUpRight, 'arrow-up': ArrowUp, 'arrow-down': ArrowDown, 'arrow-left': ArrowLeft, plus: Plus, minus: Minus, chevron: ChevronDown, menu: Menu, lock: LockKeyhole, briefcase: BriefcaseBusiness, scan: Scan, video: Video, target: Crosshair, script: FilePenLine, partnership: Handshake, location: MapPin };
export default function SiteIcon({ name, size = 20, className = '', ...props }) {
  const Icon = icons[name] || ArrowRight;
  return <Icon size={size} strokeWidth={1.6} className={`site-icon ${className}`.trim()} aria-hidden="true" focusable="false" {...props} />;
}
