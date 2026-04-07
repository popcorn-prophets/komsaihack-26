'use client';

import {
  ArrowUp,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
} from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

function WordmarkLogo({ size = 148, className = '', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3526.56 501.8"
      width={size}
      className={`h-auto ${className}`}
      fill="currentColor"
      {...props}
    >
      <g>
        <polygon points="360.36 274 238.28 397.36 440.47 501.8 492.01 448.37 462.05 441.23 438.51 463.74 357.4 400.73 424.94 303.57 470.92 326.03 549.12 309.28 556.22 366.48 527.07 364.01 517.8 383.43 570.19 396.06 585.45 387.13 569.71 274 360.36 274" />
        <polygon points="448.71 409.43 503.96 428.01 518.94 403.51 450.79 396.57 448.71 409.43" />
        <path d="M569.71,167.72c-22.39-96.42-100.39-136.91-223.1-133.04l18.75,133.04h-22.11C329.41,50.41,296.35,1.61,242.27,1.8H0l43.1,43.56,165.44,6.29v21.46l-145.45.88,42.54,44.62,134.54,6.29v21.66h-112.71l39.97,42.61,111.43,6.29v22.63h-89.97l-45.54,179.26h46.28l151.83-154.11h283.25c3.54-23.31-26.55-65.95-55.01-75.53Z" />
      </g>
      <g>
        <polygon points="678.05 492.82 782.66 492.82 782.66 285.57 782.66 203 782.66 6.53 678.05 6.53 678.05 492.82" />
        <polygon points="1005.27 203 822.66 203 832.66 285.57 1005.27 285.57 1005.27 492.82 1110.23 492.82 1110.23 6.53 1005.27 6.53 1005.27 203" />
        <polygon points="1232.85 89.1 1440.21 89.1 1440.21 206.59 1250.68 206.59 1280.68 287.86 1440.21 287.86 1440.21 410.25 1292.16 410.25 1322.16 492.82 1544.83 492.82 1544.83 6.53 1202.85 6.53 1232.85 89.1" />
        <path d="M1926.76,300.75c27.55-12.29,48.59-30.03,63.11-53.2,14.52-23.17,21.78-50.75,21.78-82.74s-7.15-59.83-21.44-83.55c-14.29-23.71-35.05-42.1-62.26-55.16-27.22-13.06-155.34-19.58-194.21-19.58v.33h-104.62v486.29h104.62V88.77h75.53c21.49,0,39.16,2.94,52.99,8.81,13.83,5.87,24.18,14.42,31.04,25.62,6.86,11.21,10.29,25.08,10.29,41.61s-3.43,29.65-10.29,40.63c-6.86,10.99-17.15,19.26-30.87,24.8-13.72,5.55-41.33,8.32-62.82,8.32l134.27,254.24h95.94l-108.78-189.66c1.93-.78,3.83-1.58,5.7-2.41Z" />
        <path d="M2410.23,229.77c-3.43,10.44-7.38,24.04-11.83,40.8-4.46,16.76-8.98,34.71-13.55,53.85-4.43,18.52-8.58,36.47-12.46,53.87-3.92-17.66-8.11-35.83-12.58-54.52-4.58-19.14-9.09-36.99-13.55-53.52-4.46-16.53-8.4-30.03-11.84-40.47l-83.01-223.24h-160.53v486.29h103.93v-229.11c0-11.1-.17-24.64-.51-40.63-.34-15.99-.8-33.29-1.37-51.89-.57-18.6-1.09-37.15-1.54-55.65-.17-6.71-.32-13.23-.46-19.58,2.26,8.25,4.58,16.56,6.97,24.96,5.49,19.26,10.92,37.92,16.29,55.97,5.37,18.06,10.46,34.54,15.26,49.45,4.8,14.91,8.92,27.36,12.35,37.37l86.09,229.11h88.15l84.72-229.11c3.43-10.01,7.55-22.57,12.35-37.7,4.8-15.12,9.89-31.71,15.26-49.77,5.37-18.06,10.69-36.72,15.95-55.97,2.58-9.45,5.05-18.75,7.41-27.91-.16,8.01-.34,16.22-.55,24.65-.46,18.6-.98,37.1-1.54,55.48-.57,18.39-1.03,35.52-1.37,51.4-.34,15.88-.51,29.16-.51,39.82v229.11h105.3V6.53h-161.21l-81.64,223.24Z" />
        <polygon points="2745.35 492.82 2978.01 492.82 3008.01 410.25 2849.97 410.25 2849.97 287.86 3019.49 287.86 3049.49 206.59 2849.97 206.59 2849.97 89.1 3057.33 89.1 3087.33 6.53 2745.35 6.53 2745.35 492.82" />
        <path d="M3515.07,300.26c-7.66-15.67-18.47-29.21-32.41-40.63-13.95-11.42-30.18-21.05-48.71-28.88-18.52-7.83-38.53-14.03-60.03-18.6l-46.31-10.77c-14.18-3.26-27.56-7.34-40.13-12.24-12.58-4.9-22.64-11.31-30.19-19.26-7.55-7.94-11.32-17.89-11.32-29.86,0-10.88,3.26-20.56,9.78-29.05,6.52-8.49,16.06-15.12,28.64-19.91,12.57-4.78,27.67-7.18,45.28-7.18,26.07,0,46.93,5.33,62.6,15.99,15.66,10.66,24.41,25.78,26.24,45.37h101.19c-.46-28.5-8.58-53.69-24.35-75.55-15.78-21.87-37.73-38.95-65.86-51.24-28.13-12.29-61.06-18.44-98.79-18.44s-70.03,6.09-98.96,18.28c-28.93,12.19-51.68,29.27-68.26,51.24-16.58,21.98-24.87,47.65-24.87,77.02,0,35.25,12.23,63.59,36.7,85.02,24.47,21.43,58.31,37.15,101.53,47.16l56.25,13.38c18.75,4.14,34.64,8.92,47.68,14.36,13.03,5.44,23.03,11.91,30.01,19.42,6.97,7.51,10.46,16.81,10.46,27.9,0,12.4-3.89,23.28-11.66,32.64-7.78,9.36-18.58,16.59-32.41,21.7-13.84,5.11-30.13,7.67-48.88,7.67s-35.56-2.72-50.42-8.16c-14.87-5.44-26.75-13.65-35.67-24.64-8.92-10.98-14.06-24.64-15.44-40.96h-101.87c.91,34.38,9.83,63.32,26.75,86.82,16.92,23.5,40.53,41.23,70.83,53.2,30.3,11.96,65.91,17.95,106.85,17.95s76.83-5.99,106.33-17.95c29.5-11.96,52.02-28.88,67.57-50.75,15.55-21.87,23.32-47.49,23.32-76.86,0-20.45-3.83-38.51-11.49-54.18Z" />
      </g>
    </svg>
  );
}

const footerLinks = [
  { title: 'Product', links: ['About', 'Features'] },
  { title: 'Company', links: ['Our Team', 'Careers'] },
  { title: 'Resources', links: ['Help', 'Contact'] },
  { title: 'Legal', links: ['Privacy', 'Terms'] },
];

const socialLinks = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
];

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      aria-labelledby="footer-heading"
      className="relative w-full -mt-20 overflow-hidden border-t border-border bg-card/90 backdrop-blur-xl"
    >
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand & Newsletter — spans 2 cols on large screens */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center gap-3 transition-transform duration-200 hover:scale-105">
              <WordmarkLogo size={148} className="text-foreground" />
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                Popcorn Prophets
              </Badge>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
              Innovation is most meaningful when it serves the people.
            </p>

            {/* Newsletter */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Get latest updates sent to your inbox weekly
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-10 min-w-0 flex-1 rounded-xl border-border/60 bg-background/60 backdrop-blur placeholder:text-muted-foreground"
                />
                <Button
                  size="sm"
                  className="h-10 shrink-0 rounded-xl border border-border/60 bg-primary/90 px-4 text-primary-foreground shadow-[0_12px_35px_-20px_rgba(15,23,42,0.7)] hover:bg-primary"
                  aria-label="Subscribe"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Link Columns */}
          {footerLinks.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h4 className="mb-4 text-sm font-semibold text-foreground/90">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="inline-block text-sm text-muted-foreground transition-all duration-200 hover:translate-x-1 hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-border/70" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Social Links */}
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((social) => (
              <Button
                key={social.label}
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full border border-border/60 bg-white/5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" aria-hidden />
              </Button>
            ))}
          </div>

          {/* Copyright */}
          <span className="text-center text-sm text-muted-foreground">
            © 2026 Popcorn Prophets. All rights reserved.
          </span>

          {/* Scroll to Top */}
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 shrink-0 rounded-full border-border/60"
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
