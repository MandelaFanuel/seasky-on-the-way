import React from 'react';
import Container from '../../components/layout/Container';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-linear-to-r from-[#0A345F] to-[#0B568C] text-white pt-20 pb-8"
      style={{ marginTop: '-100px' }}
    >
      {/* Section CTARegister intégrée */}
      <Container className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h3 className="text-3xl md:text-4xl font-serif mb-4">Rejoignez SeaSky On The Way</h3>
            <p className="text-white/90 mb-6 max-w-xl">
              Inscription simple, livraisons synchronisées, paiements rapides. Tout pour développer votre activité.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register?role=fournisseur"
                className="bg-white text-[#0B568C] px-6 py-3 rounded-xl font-semibold hover:bg-[#E4F5FB] transition"
              >
                Devenir fournisseur
              </Link>
              <Link
                to="/register?role=livreur"
                className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-[#0B568C] transition"
              >
                Devenir livreur
              </Link>
              <Link
                to="/register?role=point-de-vente"
                className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-[#0B568C] transition"
              >
                Point de vente
              </Link>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-3xl p-6 text-white">
            <h4 className="text-xl font-semibold mb-2">Applications</h4>
            <p className="text-white/90 mb-4">Web (React) & Mobile (Kotlin) — bientôt sur Android/iOS</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/20 p-4">
                <div className="text-sm">Dashboard Siège</div>
                <div className="text-xs opacity-80">Supervision & rapports</div>
              </div>
              <div className="rounded-xl bg-white/20 p-4">
                <div className="text-sm">Livreur</div>
                <div className="text-xs opacity-80">Missions & paiements</div>
              </div>
              <div className="rounded-xl bg-white/20 p-4">
                <div className="text-sm">Fournisseur</div>
                <div className="text-xs opacity-80">Livraisons & règlements</div>
              </div>
              <div className="rounded-xl bg-white/20 p-4">
                <div className="text-sm">Point de vente</div>
                <div className="text-xs opacity-80">Stock & ventes</div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Contenu original du footer */}
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-white/80">Lait Premium</p>
                <p className="font-serif text-2xl">SeaSky</p>
              </div>
            </div>

            <p className="text-white/80 mb-6 leading-relaxed">
              Transformant les traditions laitières du Burundi en excellence moderne, une goutte à la fois.
            </p>

            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href="#"
                className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>

              <a
                href="#"
                className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3z" />
                  <path d="M12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z" />
                  <path d="M17.5 6.5a1 1 0 110 2 1 1 0 010-2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Navigation</h4>
            <ul className="space-y-3">
              <li><a href="#milk" className="text-white/80 hover:text-white transition-colors">Notre Lait</a></li>
              <li><a href="#farm" className="text-white/80 hover:text-white transition-colors">Nos Fermes</a></li>
              <li><a href="#about" className="text-white/80 hover:text-white transition-colors">Notre Histoire</a></li>
              <li><a href="#signup" className="text-white/80 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Ressources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Carrières</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Presse</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0" />
                </svg>
                <span className="text-white/80">Bujumbura, Burundi</span>
              </div>

              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-white/80">+257 68 803 611</span>
              </div>

              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-white/80">contact@seasky.bi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/80 text-sm">© {currentYear} SeaSky. Tous droits réservés.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-white/80 hover:text-white text-sm transition-colors">Confidentialité</a>
              <a href="#" className="text-white/80 hover:text-white text-sm transition-colors">Conditions</a>
              <a href="#" className="text-white/80 hover:text-white text-sm transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
