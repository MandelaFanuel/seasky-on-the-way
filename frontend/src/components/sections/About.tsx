// ========================= src/components/sections/About.tsx =========================
import React, { useEffect, useState } from "react";
import Container from "../../components/layout/Container";
import SectionTitle from "../../components/layout/SectionTitle";
import { Link } from "react-router-dom";
import PartnersSection from "./PartnersSection";

const About: React.FC = () => {
  const [pageReady, setPageReady] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setPageReady(true), 170);
    return () => window.clearTimeout(t);
  }, []);

  const values = [
    {
      icon: (
        <svg className="h-6 w-6 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0"
          />
        </svg>
      ),
      title: "Passion",
      description: "Amour du travail bien fait et respect des traditions laitières",
    },
    {
      icon: (
        <svg className="h-6 w-6 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Excellence",
      description: "Recherche constante de la meilleure qualité possible",
    },
    {
      icon: (
        <svg className="h-6 w-6 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Communauté",
      description: "Soutien aux éleveurs locaux et développement durable",
    },
    {
      icon: (
        <svg className="h-6 w-6 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Paiement",
      description: "Paiements mobiles, bancaires et crypto avec traçabilité blockchain",
    },
  ];

  const historyMilestones = [
    {
      year: "2010",
      title: "Fondation de SeaSky Lait",
      description: "Création de la laiterie familiale à Bujumbura avec une production artisanale de lait frais.",
      highlight: "Début avec 5 éleveurs partenaires",
    },
    {
      year: "2013",
      title: "Première Certification de Qualité",
      description: "Obtention de la certification ISO 22000 pour les normes de sécurité alimentaire.",
      highlight: "Investissement en équipement moderne",
    },
    {
      year: "2015",
      title: "Expansion Régionale",
      description: "Ouverture de 3 nouveaux centres de distribution à Gitega, Ngozi et Muyinga.",
      highlight: "+200% de croissance des ventes",
    },
    {
      year: "2018",
      title: "Innovation Technologique",
      description: "Lancement de la plateforme numérique et intégration des paiements mobiles.",
      highlight: "Première transaction blockchain",
    },
    {
      year: "2021",
      title: "Développement Durable",
      description: "Mise en place du programme d'économie circulaire avec les éleveurs locaux.",
      highlight: "Réduction de 40% de l'empreinte carbone",
    },
    {
      year: "2023",
      title: "Excellence Internationale",
      description: "Reconnaissance par le Prix Africain de l'Innovation Agricole.",
      highlight: "Exportation vers 3 pays voisins",
    },
  ];

  return (
    <section id="about" className="relative py-20 bg-gradient-to-b from-white to-[#E4F5FB]">
      {!pageReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-lg">
            <div className="animate-spin h-6 w-6 border-b-2 border-[#0B568C] rounded-full" />
            <span className="text-sm font-semibold text-[#0B568C]">Chargement…</span>
          </div>
        </div>
      )}

      <Container>
        <div className={`transition-all duration-700 ${pageReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          {/* SECTION HISTORIQUE AVEC IMAGE ULTRA-PROFESSIONNELLE */}
          <div className="mb-20 animate-fade-in-up">
            <div className="block lg:hidden mb-8">
              <SectionTitle
                kicker="Notre Histoire"
                title="SeaSky Lait : Excellence Depuis 2010"
                subtitle="Découvrez l'histoire passionnante de notre entreprise familiale et notre engagement pour la qualité"
                centered={false}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
                  <div className="relative h-[520px] sm:h-[550px] w-full overflow-hidden">
                    <img
                      src="/images/House.jpg"
                      alt="Siège Social SeaSky Lait - Bujumbura, Burundi"
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
                  </div>

                  <div className="absolute left-0 right-0 bottom-0">
                    <div className="mx-0">
                      <div className="bg-white/95 backdrop-blur-sm shadow-xl px-5 py-4 sm:px-6 sm:py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#0B568C] to-[#1A4F75] rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-[#1A4F75] text-lg leading-tight">Siège Principal</h4>
                            <p className="text-[#5C7C95] text-sm leading-tight">Bujumbura, Burundi</p>
                            <p className="text-[#335F7A] text-xs mt-1">Fondé en 2010 • 14 ans d&apos;excellence</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: "14+", label: "Années d'expérience", color: "from-[#0B568C] to-[#1A4F75]" },
                    { value: "500+", label: "Éleveurs partenaires", color: "from-emerald-600 to-emerald-400" },
                    { value: "50K+", label: "Clients satisfaits", color: "from-amber-600 to-amber-400" },
                    { value: "15+", label: "Produits innovants", color: "from-violet-600 to-violet-400" },
                  ].map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                      <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                      <div className="text-sm text-[#5C7C95] mt-1 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="hidden lg:block">
                  <SectionTitle
                    kicker="Notre Histoire"
                    title="SeaSky Lait : Excellence Depuis 2010"
                    subtitle="Découvrez l'histoire passionnante de notre entreprise familiale et notre engagement pour la qualité"
                    centered={false}
                  />
                </div>

                <div className="mt-8 space-y-6 text-[#335F7A]">
                  <p className="text-lg leading-relaxed">
                    Fondée en 2010 par la famille Ndayishimiye, <span className="font-semibold text-[#1A4F75]">SeaSky Lait</span> est née d&apos;une vision simple mais ambitieuse :
                    démocratiser l&apos;accès à des produits laitiers de qualité exceptionnelle tout en valorisant le savoir-faire des éleveurs burundais.
                  </p>

                  <p className="leading-relaxed">
                    De notre modeste atelier artisanal au cœur de Bujumbura, nous avons construit une entreprise qui allie <span className="font-semibold">traditions ancestrales</span> et
                    <span className="font-semibold"> innovations modernes</span>. Chaque bouteille de lait, chaque pot de yaourt porte l&apos;ADN de notre engagement : qualité, authenticité et responsabilité sociale.
                  </p>

                  <div className="bg-[#E4F5FB] p-6 rounded-2xl border-l-4 border-[#0B568C]">
                    <h4 className="font-bold text-[#1A4F75] mb-2">Notre Mission</h4>
                    <p className="text-[#335F7A]">
                      Transformer le secteur laitier burundais par l&apos;excellence opérationnelle, l&apos;innovation technologique et un impact social positif, en créant une chaîne de valeur durable qui bénéficie à tous : des éleveurs aux consommateurs.
                    </p>
                  </div>
                </div>

                <div className="mt-12">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Notre Parcours
                  </h3>

                  <div className="flex overflow-x-auto pb-2 mb-4 gap-2 mobile-optimized-scroll">
                    {historyMilestones.map((milestone, index) => (
                      <button
                        key={milestone.year}
                        onClick={() => setActiveTimeline(index)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                          activeTimeline === index ? "bg-[#0B568C] text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {milestone.year}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 animate-fadeIn">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0B568C] to-[#1A4F75] rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{historyMilestones[activeTimeline].year}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{historyMilestones[activeTimeline].title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{historyMilestones[activeTimeline].description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-green-600 font-medium">{historyMilestones[activeTimeline].highlight}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VALEURS */}
          <div className="my-20">
            <SectionTitle kicker="Nos Valeurs" title="Ce Qui Nous Rend Unique" centered />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((v, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-lg text-center transition hover:shadow-xl">
                  <div className="w-16 h-16 mx-auto mb-6 bg-[#E4F5FB] rounded-full flex items-center justify-center">{v.icon}</div>
                  <h3 className="text-xl font-semibold text-[#1A4F75] mb-3">{v.title}</h3>
                  <p className="text-[#335F7A]">{v.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PARTENAIRES (séparé en composant, même rendu/comportement) */}
          <PartnersSection pageReady={pageReady} />

          {/* CTA FINAL */}
          <div className="bg-gradient-to-r from-[#0B568C] to-[#1A4F75] rounded-3xl p-12 text-center text-white animate-fade-in-up">
            <h3 className="text-2xl font-bold mb-4">Prêt à découvrir notre gamme complète ?</h3>
            <p className="mb-8 text-white/90 max-w-2xl mx-auto">
              Des produits laitiers frais, de qualité supérieure, directement de nos éleveurs partenaires à votre table.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-white text-[#0B568C] px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Voir nos produits
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default About;
