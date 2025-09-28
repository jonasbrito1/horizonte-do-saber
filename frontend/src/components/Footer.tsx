import React from 'react';
import { Link } from 'react-router-dom';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useSiteContent } from '../context/SiteContentContext';
import Mascotes from './Mascotes';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { content } = useSiteContent();

  return (
    <footer className="bg-gray-900 text-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              {content.configuracoes.logo_principal ? (
                <img
                  src={content.configuracoes.logo_principal}
                  alt={content.footer.titulo || content.configuracoes.nome_escola}
                  className="h-8 w-auto"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(content.footer.titulo || content.configuracoes.nome_escola).charAt(0)}
                  </span>
                </div>
              )}
              <span className="font-bold text-xl">
                {content.footer.titulo || content.configuracoes.nome_escola}
              </span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              {content.footer.descricao}
            </p>
            <div className="space-y-2">
              {content.footer.email && (
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-5 w-5 text-primary-400" />
                  <span className="text-gray-300">{content.footer.email}</span>
                </div>
              )}
              {content.footer.telefone && (
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-5 w-5 text-primary-400" />
                  <span className="text-gray-300">{content.footer.telefone}</span>
                </div>
              )}
              {content.footer.endereco && (
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5 text-primary-400" />
                  <span className="text-gray-300">{content.footer.endereco}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              {content.footer.links_rapidos?.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.nome}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Acadêmico</h3>
            <ul className="space-y-2">
              {content.footer.links_academicos?.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.nome}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.nome}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} {content.footer.titulo || content.configuracoes.nome_escola}. {content.footer.copyright}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {content.footer.politica_privacidade && (
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 text-sm">
                  {content.footer.politica_privacidade}
                </a>
              )}
              {content.footer.termos_uso && (
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 text-sm">
                  {content.footer.termos_uso}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mascotes */}
      <Mascotes position="footer" />
    </footer>
  );
};

export default Footer;