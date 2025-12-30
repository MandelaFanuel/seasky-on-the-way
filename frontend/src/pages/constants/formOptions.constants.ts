// ========================= src/pages/constants/formOptions.constants.ts =========================
/**
 * Constantes alignées avec le backend Django
 * - Les tableaux {value,label} sont pour l'UI (Select)
 * - Les tableaux *_VALUES sont pour les validations / types (source unique)
 */

// ==================== 1. TYPES DE COMPTE (BACKEND) ====================
export const ACCOUNT_TYPES = [
  { value: 'client', label: 'Client' },
  { value: 'fournisseur', label: 'Fournisseur' },
  { value: 'livreur', label: 'Livreur' },
  { value: 'commercant', label: 'Commerçant' },
  { value: 'partenaire', label: 'Partenaire' },
  { value: 'entreprise', label: 'Entreprise' },
] as const;

export const ACCOUNT_TYPE_VALUES = ACCOUNT_TYPES.map((x) => x.value);

// ==================== 2. SOUS-TYPES BACKEND ====================
export const CLIENT_TYPES = [
  { value: 'individuel', label: 'Individuel' },
  { value: 'famille', label: 'Famille' },
] as const;
export const CLIENT_TYPE_VALUES = CLIENT_TYPES.map((x) => x.value);

export const SUPPLIER_TYPES = [
  { value: 'individuel', label: 'Individuel' },
  { value: 'entreprise', label: 'Entreprise' },
] as const;
export const SUPPLIER_TYPE_VALUES = SUPPLIER_TYPES.map((x) => x.value);

export const DELIVERY_TYPES = [
  { value: 'individuel', label: 'Individuel' },
  { value: 'entreprise', label: 'Entreprise' },
  { value: 'boutique', label: 'Boutique' },
] as const;
export const DELIVERY_TYPE_VALUES = DELIVERY_TYPES.map((x) => x.value);

export const MERCHANT_TYPES = [
  { value: 'boutique', label: 'Boutique' },
] as const;
export const MERCHANT_TYPE_VALUES = MERCHANT_TYPES.map((x) => x.value);

// ==================== 3. TYPES DE BOUTIQUE (BACKEND) ====================
export const BOUTIQUE_TYPES = [
  { value: 'boutique', label: 'Boutique' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'supermarche', label: 'Supermarché' },
] as const;
export const BOUTIQUE_TYPE_VALUES = BOUTIQUE_TYPES.map((x) => x.value);

// ==================== 4. VÉHICULES DE LIVRAISON (BACKEND) ====================
export const DELIVERY_VEHICLES = [
  { value: 'motorcycle', label: 'Moto' },
  { value: 'bicycle', label: 'Vélo' },
  { value: 'car', label: 'Voiture' },
  { value: 'truck', label: 'Camion' },
  { value: 'walking', label: 'À pied' },
] as const;
export const DELIVERY_VEHICLE_VALUES = DELIVERY_VEHICLES.map((x) => x.value);

// ==================== 5. TYPES D'ENTITÉ COMMERCIALE (BACKEND) ====================
export const BUSINESS_ENTITY_TYPES = [
  { value: 'individual', label: 'Individuel' },
  { value: 'company', label: 'Société' },
  { value: 'cooperative', label: 'Coopérative' },
  { value: 'association', label: 'Association' },
  { value: 'other', label: 'Autre' },
] as const;
export const BUSINESS_ENTITY_TYPE_VALUES = BUSINESS_ENTITY_TYPES.map((x) => x.value);

// ==================== 6. SERVICES DE BOUTIQUE (BACKEND - JSONField) ====================
export const BOUTIQUE_SERVICES = [
  { value: 'VENTE_AU_DETAIL', label: 'Vente au détail' },
  { value: 'VENTE_EN_GROS', label: 'Vente en gros' },
  { value: 'LIVRAISON_A_DOMICILE', label: 'Livraison à domicile' },
  { value: 'SERVICE_CAFE', label: 'Service café' },
  { value: 'RESTAURATION', label: 'Restauration' },
  { value: 'VENTE_TAKE_AWAY', label: 'Vente à emporter' },
  { value: 'CATERING', label: 'Traiteur' },
  { value: 'AUTRE', label: 'Autre service' },
] as const;

// ==================== 7. GENRES (BACKEND) ====================
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Masculin' },
  { value: 'female', label: 'Féminin' },
  { value: 'other', label: 'Autre' },
] as const;
export const GENDER_VALUES = GENDER_OPTIONS.map((x) => x.value);

// ==================== 8. TYPES DE PIÈCE D'IDENTITÉ (BACKEND) ====================
export const IDENTIFICATION_TYPES = [
  { value: 'cni', label: "Carte Nationale d'Identité" },
  { value: 'passport', label: 'Passeport' },
  { value: 'driving_license', label: 'Permis de conduire' },
  { value: 'residence_card', label: 'Carte de résidence' },
  { value: 'other', label: 'Autre' },
] as const;
export const IDENTIFICATION_TYPE_VALUES = IDENTIFICATION_TYPES.map((x) => x.value);

// ==================== 9. NATIONALITÉS ====================
export const NATIONALITIES = [
  { value: 'burundian', label: 'Burundaise' },
  { value: 'rwandan', label: 'Rwandaise' },
  { value: 'congolese', label: 'Congolaise (RDC)' },
  { value: 'tanzanian', label: 'Tanzanienne' },
  { value: 'kenyan', label: 'Kenyane' },
  { value: 'ugandan', label: 'Ougandaise' },
  { value: 'french', label: 'Française' },
  { value: 'belgian', label: 'Belge' },
  { value: 'american', label: 'Américaine' },
  { value: 'other_african', label: 'Autre Africaine' },
  { value: 'other', label: 'Autre nationalité' },
] as const;

// ==================== 10. PROVINCES ====================
export const PROVINCES = [
  { value: 'bujumbura_mairie', label: 'Bujumbura Mairie' },
  { value: 'bujumbura_rural', label: 'Bujumbura Rural' },
  { value: 'bubanza', label: 'Bubanza' },
  { value: 'cibitoke', label: 'Cibitoke' },
  { value: 'gitega', label: 'Gitega' },
  { value: 'karuzi', label: 'Karuzi' },
  { value: 'kayanza', label: 'Kayanza' },
  { value: 'kirundo', label: 'Kirundo' },
  { value: 'makamba', label: 'Makamba' },
  { value: 'muramvya', label: 'Muramvya' },
  { value: 'muyinga', label: 'Muyinga' },
  { value: 'mwaro', label: 'Mwaro' },
  { value: 'ngozi', label: 'Ngozi' },
  { value: 'rutana', label: 'Rutana' },
  { value: 'ruyigi', label: 'Ruyigi' },
  { value: 'bururi', label: 'Bururi' },
  { value: 'rumonge', label: 'Rumonge' },
] as const;

// ==================== 11. ALIAS POUR COMPATIBILITÉ ====================
export const ID_TYPES = IDENTIFICATION_TYPES;
export const VEHICLE_TYPES = DELIVERY_VEHICLES;

// (Gardés si tu as du code legacy)
export const FRONTEND_DELIVERY_TYPES = DELIVERY_TYPES;
export const FRONTEND_SUPPLIER_TYPES = SUPPLIER_TYPES;
export const FRONTEND_MERCHANT_TYPES = BOUTIQUE_TYPES;
