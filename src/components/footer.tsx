import React from "react";

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { MainRoutes } from "@/lib/helper";
import Container from "./container";

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  hoverColor: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, icon, hoverColor }) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`hover:${hoverColor}`}>
      {icon}
    </a>
  );
};

interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, children }) => {
  return (
    <li>
      <Link to={to} className="hover:underline text-neutral-400 hover:text-neutral-100">
        {children}
      </Link>
    </li>
  );
};

export const Footer = () => {
  return (
    <div className="w-full border-t bg-neutral-950 text-neutral-300 py-10">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* First Column: Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {MainRoutes.map((route) => (
                <FooterLink key={route.href} to={route.href}>
                  {route.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Second Column: About Us */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">About Us</h3>
            <p className="text-sm text-neutral-400">
              Our mission is to empower you through intelligent AI-driven solutions. From realistic mock interviews to instant feedback, we help you build confidence and succeed in every opportunity you pursue.
            </p>
          </div>

          {/* Third Column: Services */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Services</h3>
            <ul className="text-sm text-neutral-400 space-y-2">
              <FooterLink to="/services/interview-prep">Interview Preparation</FooterLink>
              <FooterLink to="/services/career-coaching">Career Coaching</FooterLink>
              <FooterLink to="/services/resume-building">Resume Building</FooterLink>
            </ul>
          </div>

          {/* Fourth Column: Address and Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact Us</h3>
            <p className="mb-4 text-sm text-neutral-400">41 Omaxe Street, Noida, 12345</p>
            <div className="flex gap-4 text-neutral-300">
              <SocialLink href="https://facebook.com" icon={<Facebook size={22} />} hoverColor="text-blue-500" />
              <SocialLink href="https://twitter.com" icon={<Twitter size={22} />} hoverColor="text-blue-400" />
              <SocialLink href="https://instagram.com" icon={<Instagram size={22} />} hoverColor="text-pink-500" />
              <SocialLink href="https://linkedin.com" icon={<Linkedin size={22} />} hoverColor="text-blue-700" />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-800 pt-6 text-xs text-neutral-500">
          © {new Date().getFullYear()} Interview Copilot. All rights reserved.
        </div>
      </Container>
    </div>
  );
};