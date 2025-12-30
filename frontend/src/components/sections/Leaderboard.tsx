import React from "react";
import Container from "../../components/layout/Container";
import SectionTitle from "../../components/layout/SectionTitle";

export const Leaderboard: React.FC = () => {
  const drivers = [
    { name: "Niyongabo Eric", province: "Ngozi", score: 98, deliveries: 124 },
    { name: "Hakizimana Paul", province: "Gitega", score: 94, deliveries: 117 },
    { name: "Ndayizeye Alice", province: "Bujumbura", score: 91, deliveries: 110 },
    { name: "Ndikumana Max", province: "Kayanza", score: 88, deliveries: 103 },
  ];
  return (
    <section className="py-20 bg-white">
      <Container>
        <SectionTitle
          kicker="Classement public"
          title="Top Livreurs"
          subtitle="Performance journalier / hebdomadaire / mensuel"
          centered
        />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-[#E4F5FB] rounded-2xl overflow-hidden">
            <thead className="bg-[#E4F5FB]">
              <tr>
                <th className="px-4 py-3 text-left text-[#0B568C] text-sm font-semibold">Livreur</th>
                <th className="px-4 py-3 text-left text-[#0B568C] text-sm font-semibold">Province</th>
                <th className="px-4 py-3 text-left text-[#0B568C] text-sm font-semibold">Livraisons</th>
                <th className="px-4 py-3 text-left text-[#0B568C] text-sm font-semibold">Score</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d, i) => (
                <tr key={d.name} className="border-t border-[#E4F5FB]">
                  <td className="px-4 py-3 text-[#1A4F75] font-medium">{i + 1}. {d.name}</td>
                  <td className="px-4 py-3 text-[#335F7A]">{d.province}</td>
                  <td className="px-4 py-3 text-[#335F7A]">{d.deliveries}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-[#E4F5FB]">
                        <div className="h-2 rounded-full bg-linear-to-r from-[#0B568C] to-[#27B1E4]" style={{ width: `${d.score}%` }} />
                      </div>
                      <span className="text-[#0B568C] font-semibold">{d.score}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
};

export const StockTracker: React.FC = () => {
  // Données de démonstration pour les stocks en temps réel
  const stockData = [
    {
      province: "Bujumbura Mairie",
      totalPoints: 12,
      stockLevel: 68,
      trend: "up",
      points: [
        { name: "Point Central", stockLevel: 85, status: "bon", trend: "stable" },
        { name: "Marché Nord", stockLevel: 45, status: "moyen", trend: "up" },
        { name: "Quartier Sud", stockLevel: 20, status: "critique", trend: "down" },
        { name: "Zone Industrielle", stockLevel: 92, status: "bon", trend: "up" }
      ]
    },
    {
      province: "Gitega",
      totalPoints: 8,
      stockLevel: 72,
      trend: "stable",
      points: [
        { name: "Centre Ville", stockLevel: 78, status: "bon", trend: "stable" },
        { name: "Marché Principal", stockLevel: 35, status: "moyen", trend: "up" },
        { name: "Zone Est", stockLevel: 90, status: "bon", trend: "stable" }
      ]
    },
    {
      province: "Ngozi",
      totalPoints: 6,
      stockLevel: 42,
      trend: "down",
      points: [
        { name: "Point Central", stockLevel: 25, status: "critique", trend: "down" },
        { name: "Marché Ngozi", stockLevel: 60, status: "moyen", trend: "up" },
        { name: "Zone Nord", stockLevel: 40, status: "moyen", trend: "stable" }
      ]
    },
    {
      province: "Kayanza",
      totalPoints: 5,
      stockLevel: 88,
      trend: "up",
      points: [
        { name: "Point Principal", stockLevel: 95, status: "bon", trend: "up" },
        { name: "Marché Kayanza", stockLevel: 80, status: "bon", trend: "stable" }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "bon": return "bg-green-500";
      case "moyen": return "bg-yellow-500";
      case "critique": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": 
        return <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>;
      case "down":
        return <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7m7 7V3" />
        </svg>;
      default:
        return <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>;
    }
  };

  return (
    <section className="py-20 bg-linear-to-b from-[#E4F5FB] to-white">
      <Container>
        <SectionTitle
          kicker="Surveillance en temps réel"
          title="État des Stocks par Province"
          subtitle="Suivi live des niveaux de stock dans tous nos points de vente"
          centered
        />
  
        {/* Main Dashboard - Graphiques verticaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {stockData.map((province, index) => (
            <div key={index} className="bg-white rounded-2xl border border-[#E4F5FB] overflow-hidden transition-all duration-300">
              {/* Province Header */}
              <div className="bg-linear-to-r p-6 text-[#1A4F75] relative">
                <div className="absolute top-4 right-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/30">
                    <span className="text-xs font-medium text-white">LIVE</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white/20 p-3 rounded-2xl mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{province.province}</h3>
                      <p className="text-white/90 text-sm mt-1">{province.totalPoints} points de vente</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20">
                      <span className="text-2xl font-bold mr-2">{province.stockLevel}%</span>
                      {getTrendIcon(province.trend)}
                    </div>
                    <p className="text-white/90 text-sm mt-2">Moyenne province</p>
                  </div>
                </div>
              </div>
  
              {/* Graphiques verticaux */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {province.points.map((point, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-[#1A4F75] text-sm">
                          {point.name}
                        </h4>
                        <div className="flex items-center">
                          <span className="text-xs font-semibold text-[#0B568C] bg-white px-2 py-1 rounded-full border border-[#E4F5FB]">
                            {point.stockLevel}%
                          </span>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(point.status)} ml-2`}></div>
                        </div>
                      </div>
                      
                      {/* Graphique vertical */}
                      <div className="flex items-end justify-center h-32 gap-2 mb-3">
                        {/* Barre principale */}
                        <div className="flex flex-col items-center">
                          <div 
                            className={`w-8 rounded-t-lg transition-all duration-700 ${
                              point.status === "bon" ? "bg-linear-to-t from-green-500 to-green-600" :
                              point.status === "moyen" ? "bg-linear-to-t from-yellow-500 to-yellow-600" :
                              "bg-linear-to-t from-red-500 to-red-600"
                            }`}
                            style={{ height: `${point.stockLevel}%` }}
                          >
                            {/* Indicateur de valeur à l'intérieur de la barre */}
                            {point.stockLevel > 20 && (
                              <div className="text-white text-xs font-bold flex items-center justify-center h-full">
                                {point.stockLevel}%
                              </div>
                            )}
                          </div>
                          {/* Ligne de base */}
                          <div className="w-10 h-0.5 bg-gray-300 mt-1"></div>
                        </div>
  
                        {/* Indicateur de tendance */}
                        <div className="flex flex-col items-center justify-center h-full ml-2">
                          <div className={`p-1 rounded-lg ${
                            point.trend === "up" ? "bg-green-100 text-green-600" :
                            point.trend === "down" ? "bg-red-100 text-red-600" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {point.trend === "up" ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                            ) : point.trend === "down" ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
  
                      {/* Légende du graphique */}
                      <div className="flex justify-between items-center text-xs text-[#5C7C95] px-1">
                        <span>0%</span>
                        <span className={`font-medium ${
                          point.trend === "up" ? "text-green-600" :
                          point.trend === "down" ? "text-red-600" :
                          "text-gray-500"
                        }`}>
                          {point.trend === "up" ? "↑ Hausse" : 
                           point.trend === "down" ? "↓ Baisse" : 
                           "→ Stable"}
                        </span>
                        <span>100%</span>
                      </div>
  
                      {/* Statut textuel */}
                      <div className={`text-xs font-medium text-center mt-2 px-2 py-1 rounded-full ${
                        point.status === "bon" ? "bg-green-100 text-green-700" :
                        point.status === "moyen" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {point.status === "bon" ? "Optimal" : 
                         point.status === "moyen" ? "Attention" : 
                         "Critique"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
  
        {/* Legend and Summary */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Legend */}
          <div className="bg-white rounded-2xl  border border-[#E4F5FB] p-6">
            <h3 className="text-lg font-semibold text-[#1A4F75] mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Légende des Statuts
            </h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-4"></div>
                <div>
                  <span className="font-semibold text-green-800">Stock Optimal</span>
                  <p className="text-sm text-green-600 mt-1">+70% - Niveau excellent</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-4"></div>
                <div>
                  <span className="font-semibold text-yellow-800">Stock Moyen</span>
                  <p className="text-sm text-yellow-600 mt-1">30-70% - Surveillance requise</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-4"></div>
                <div>
                  <span className="font-semibold text-red-800">Stock Critique</span>
                  <p className="text-sm text-red-600 mt-1">-30% - Intervention urgente</p>
                </div>
              </div>
            </div>
          </div>
  
          {/* Overall Summary */}
          <div className="bg-white rounded-2xl  border border-[#E4F5FB] p-6">
            <h3 className="text-lg font-semibold text-[#1A4F75] mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#0B568C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Résumé National
            </h3>
            
            {/* Graphique de résumé national */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-[#5C7C95] mb-2">
                <span>Performance nationale</span>
                <span className="font-semibold text-[#0B568C]">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-3 rounded-full bg-linear-to-r from-[#0B568C] to-[#27B1E4] transition-all duration-1000"
                  style={{ width: '67%' }}
                ></div>
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-[#E4F5FB] rounded-lg">
                <div className="text-2xl font-bold text-[#0B568C]">31</div>
                <div className="text-xs text-[#335F7A] mt-1">Points de vente</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">18</div>
                <div className="text-xs text-green-700 mt-1">Stocks optimaux</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-xl font-bold text-yellow-600">9</div>
                <div className="text-xs text-yellow-700 mt-1">Stocks moyens</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">4</div>
                <div className="text-xs text-red-700 mt-1">Stocks critiques</div>
              </div>
            </div>
  
            <div className="bg-linear-to-r from-[#0B568C] to-[#1A4F75] rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Actualisation en temps réel</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs font-medium">Connecté</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

const HomeAddons: React.FC = () => {
  return (
    <>
      <Leaderboard />
      <StockTracker />
    </>
  );
};

export default HomeAddons;