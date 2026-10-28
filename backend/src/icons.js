import { PanelsTopLeft, LayoutDashboard, Newspaper, SquarePen, BriefcaseBusiness, Users,
  House, FileText, ShieldCheck, Image, Mail, Settings, ClipboardList, LockKeyhole,
  Bell, ExternalLink, ClipboardCheck, Clock, Search, LogOut, Eye, EyeOff, Sun, Moon, Menu, X, CalendarDays, Plus, Check } from 'lucide-static';

// Only trusted, bundled SVG markup reaches EJS; callers choose from this fixed map.
const icons = { media_partner: PanelsTopLeft, overview: LayoutDashboard, news: Newspaper,
  blog: SquarePen, career: BriefcaseBusiness, team: Users, home: House, page: FileText,
  legal: ShieldCheck, media: Image, enquiries: Mail, settings: Settings, audit: ClipboardList,
  password: LockKeyhole, bell: Bell, external: ExternalLink, review: ClipboardCheck,
  followup: Clock, search: Search, logout: LogOut, eye: Eye, 'eye-off': EyeOff, sun: Sun, moon: Moon, menu: Menu, close: X, calendar: CalendarDays, plus: Plus, check: Check };
const markup = Object.fromEntries(Object.entries(icons).map(([name, svg]) => [name,
  svg.replace('class="lucide ', 'aria-hidden="true" focusable="false" class="ui-icon lucide ')
    .replace('stroke-width="2"', 'stroke-width="1.6"')]));
export const adminIcon = name => markup[name] || markup.page;
