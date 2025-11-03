import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ArrowUp,
  MapPin,
  Phone,
  Globe,
  Rocket,
  Shield,
  Users,
  Crown,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: "https://github.com/GNCIPL-PROJECT-2025", color: "hover:text-gray-700" },
    { icon: Twitter, href: "https://twitter.com", color: "hover:text-blue-400" },
    { icon: Linkedin, href: "https://linkedin.com/company/gncipl", color: "hover:text-blue-600" },
    { icon: Mail, href: "mailto:contact@gncipl.com", color: "hover:text-red-400" },
  ];

  const companyLinks = [
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Projects", href: "/projects" },
    { name: "Careers", href: "/careers" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "/help" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Contact", href: "/contact" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, duration: 0.6 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="relative bg-card border-t border-border"
    >
      {/* Floating background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 right-10 w-16 h-16 bg-primary/5 rounded-full blur-xl"
        />
      </div>

      {/* Footer content */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center sm:text-left">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-5">
            <motion.div whileHover={{ scale: 1.05 }} className="flex justify-center sm:justify-start items-center gap-3">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-primary rounded-xl blur-sm opacity-75"
                />
                <div className="relative w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">GNCIPL</h3>
                <p className="text-xs text-muted-foreground">Innovation & Excellence</p>
              </div>
            </motion.div>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto sm:mx-0">
              Building the future with cutting-edge technology and innovative solutions for tomorrow's challenges.
            </p>

            <div className="flex justify-center sm:justify-start gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  variants={itemVariants}
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 bg-background rounded-lg shadow-sm border border-border text-muted-foreground transition-colors ${social.color}`}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="font-semibold text-foreground flex justify-center sm:justify-start items-center gap-2">
              <Rocket className="w-4 h-4 text-primary" />
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <motion.li key={link.name} whileHover={{ x: 5 }}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex justify-center sm:justify-start items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100" />
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="font-semibold text-foreground flex justify-center sm:justify-start items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <motion.li key={link.name} whileHover={{ x: 5 }}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex justify-center sm:justify-start items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100" />
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="font-semibold text-foreground flex justify-center sm:justify-start items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Connect
            </h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <motion.div whileHover={{ scale: 1.02 }} className="flex justify-center sm:justify-start items-center gap-3 group cursor-pointer">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <MapPin className="w-3 h-3 text-primary" />
                </div>
                <span className="group-hover:text-primary transition-colors">Greater Noida, India</span>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="flex justify-center sm:justify-start items-center gap-3 group cursor-pointer">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Phone className="w-3 h-3 text-primary" />
                </div>
                <span className="group-hover:text-primary transition-colors">+91-7303831260</span>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="flex justify-center sm:justify-start items-center gap-3 group cursor-pointer">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Globe className="w-3 h-3 text-primary" />
                </div>
                <span className="group-hover:text-primary transition-colors">www.gncipl.com</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-center md:justify-between items-center gap-5 text-center"
        >
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            © {currentYear} GNCIPL • Crafted with{" "}
            <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Heart className="w-3 h-3 text-destructive inline mx-1" />
            </motion.span>
            for the future
          </p>

          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs text-muted-foreground bg-background rounded-lg border border-border shadow-sm hover:text-primary"
          >
            Back to Top
            <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ArrowUp className="w-3 h-3" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;