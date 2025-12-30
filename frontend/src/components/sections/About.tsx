// ========================= src/components/sections/About.tsx =========================
import React, { useEffect, useRef, useState } from "react";
import Container from "../../components/layout/Container";
import SectionTitle from "../../components/layout/SectionTitle";
import { Link } from "react-router-dom";

const About: React.FC = () => {
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setPageReady(true), 170);
    return () => window.clearTimeout(t);
  }, []);

  const values = [
    {
      icon: (
        <svg className="h-6 w-6 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0" />
        </svg>
      ),
      title: "Passion",
      description: "Amour du travail bien fait et respect des traditions laitières",
    },
    {
      icon: (
        <svg className="h-6 w-6 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Excellence",
      description: "Recherche constante de la meilleure qualité possible",
    },
    {
      icon: (
        <svg className="h-6 w-6 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Communauté",
      description: "Soutien aux éleveurs locaux et développement durable",
    },
    {
      icon: (
        <svg className="h-6 w-6 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Paiement",
      description: "Paiements mobiles, bancaires et crypto avec traçabilité blockchain",
    },
  ];

  const partners = [
    { name: "Fanuel", image: "/src/assets/images/partenaires/Fanuel2.jpg", category: "Distribution", since: "2015", verified: true },
    { name: "Maison Médicale", image: "/src/assets/images/partenaires/MaisonMedicale.jpg", category: "Santé & Nutrition", since: "2018", verified: true },
    { name: "Polyclinique Muyinga", image: "/src/assets/images/partenaires/PollyclinicMuyinga.jpg", category: "Santé & Bien-être", since: "2019", verified: false },
    { name: "Roi Khaled", image: "/src/assets/images/partenaires/RoisKhaled.jpg", category: "Commerce", since: "2016", verified: true },
    { name: "Shem", image: "/src/assets/images/partenaires/shem4.jpg", category: "Distribution", since: "2020", verified: false },
    { name: "Pharmacie Umuco", image: "/src/assets/images/partenaires/shem4.jpg", category: "Santé", since: "2021", verified: true },
    { name: "Supermarké Tujenge", image: "/src/assets/images/partenaires/shem4.jpg", category: "Commerce", since: "2017", verified: true },
  ];

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="about" className="py-20 bg-linear-to-b from-white to-[#E4F5FB] relative">
      {/* overlay loading */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-all duration-500 ${
          pageReady ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0B568C]" />
            <span className="text-sm text-[#0B568C] font-semibold">Chargement...</span>
          </div>
        </div>
      </div>

      <Container>
        <div className={`transition-all duration-700 ${pageReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <SectionTitle
            kicker="Notre Histoire"
            title="SeaSky Lait : Excellence Depuis 2010"
            subtitle="Découvrez l'histoire passionnante de notre entreprise familiale et notre engagement pour la qualité"
            centered
          />

          {/* ✅ ... (ton contenu principal conservé) */}
          {/* ✅ Valeurs */}
          <div className="mb-20">
            <SectionTitle
              kicker="Nos Valeurs"
              title="Ce Qui Nous Rend Unique"
              subtitle="Les principes fondamentaux qui guident chacune de nos actions"
              centered
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#E4F5FB] hover:border-[#27B1E4]"
                >
                  <div className="w-16 h-16 bg-[#E4F5FB] rounded-full flex items-center justify-center mx-auto mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#1A4F75] mb-4">{value.title}</h3>
                  <p className="text-[#335F7A]">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ✅ Partenaires */}
          <div className="mb-20">
            <SectionTitle
              kicker="Nos Partenaires"
              title="Ils Nous Font Confiance"
              subtitle="Des collaborations solides avec des acteurs clés du marché"
              centered
            />

            <div className="relative mt-12">
              <div className="flex justify-between items-center absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-10 pointer-events-none">
                <button
                  onClick={() => scroll("left")}
                  className="h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-[#0B568C] hover:bg-[#0B568C] hover:text-white transition-all duration-300 ml-2 pointer-events-auto transform hover:scale-110"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-[#0B568C] hover:bg-[#0B568C] hover:text-white transition-all duration-300 mr-2 pointer-events-auto transform hover:scale-110"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide space-x-4 px-4"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {partners.map((partner, index) => (
                  <div key={index} className="snap-start shrink-0 w-56">
                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col transform hover:-translate-y-1">
                      <div className="h-32 bg-linear-to-br from-[#0B568C] to-[#1A4F75] flex items-center justify-center p-4 relative overflow-hidden">
                        {partner.verified && (
                          <div className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md">
                            <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          </div>
                        )}
                        <div className="relative z-10 p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                          <img src={partner.image} alt={partner.name} className="h-14 w-auto object-contain" />
                        </div>
                      </div>

                      <div className="p-4 grow flex flex-col">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <h3 className="font-semibold text-[#1A4F75] text-sm mr-1">{partner.name}</h3>
                              {partner.verified && (
                                <div className="text-green-500">
                                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-[#5C7C95] bg-[#E4F5FB] px-2 py-1 rounded-md inline-block">
                            {partner.category}
                          </p>
                        </div>

                        <div className="mt-auto pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-[#5C7C95]">
                              <svg className="h-3 w-3 text-[#0B568C] mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Partenaire depuis {partner.since}</span>
                            </div>

                            <div className="text-[#0B568C] hover:text-[#1A4F75] transition-colors duration-300">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m-6-6L10 14" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ Bouton partenaire -> /register */}
              <div className="text-center mt-12">
                <p className="text-[#5C7C95] text-sm mb-6 font-light">Rejoignez notre réseau de partenaires privilégiés</p>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-linear-to-r from-[#0B568C] to-[#1A4F75] hover:from-[#1A4F75] hover:to-[#0B568C] text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl group max-w-xs mx-auto"
                >
                  Devenir Partenaire
                  <svg className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default About;
