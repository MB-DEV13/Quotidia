const BRIDGE_BASE_URL = "https://api.bridgeapi.io/v3/aggregation";
const CLIENT_ID = process.env.BRIDGE_CLIENT_ID!;
const CLIENT_SECRET = process.env.BRIDGE_CLIENT_SECRET!;

const BRIDGE_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Bridge-Version": "2025-01-15",
  "Client-Id": CLIENT_ID,
  "Client-Secret": CLIENT_SECRET,
};

// ── Types ──────────────────────────────────────────────────────────────

export interface BridgeUser {
  uuid: string;
  external_user_id?: string;
}

export interface BridgeAuthToken {
  access_token: string;
  expires_at: string;
  user: { uuid: string; external_user_id?: string };
}

export interface BridgeAccount {
  id: number;
  name: string;
  balance: number;
  status: number;
  type: string;
  currency_code: string;
  item: { id: number; bank_id: number };
}

export interface BridgeTransaction {
  id: number;
  clean_description: string;
  bank_description: string;
  amount: number; // négatif = dépense, positif = revenu
  date: string; // "2026-04-01"
  category_id: number;
  account_id: number;
  is_deleted: boolean;
  currency_code: string;
}

export interface BridgeItem {
  id: number;
  status: number;
  bank_id: number;
  name: string;
}

export interface BridgeBank {
  id: number;
  name: string;
  logo_url: string;
}

// ── Helpers ────────────────────────────────────────────────────────────

async function bridgeRequest<T>(
  path: string,
  options: RequestInit = {},
  userToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    ...BRIDGE_HEADERS,
    ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BRIDGE_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Bridge API ${res.status} ${path}: ${err}`);
  }

  return res.json();
}

// ── Utilisateurs Bridge ────────────────────────────────────────────────

/** Crée un utilisateur Bridge (sandbox : body vide obligatoire) */
export async function createBridgeUser(): Promise<BridgeUser> {
  return bridgeRequest<BridgeUser>("/users", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/** Authentifie un utilisateur Bridge et retourne un token d'accès */
export async function authenticateBridgeUser(bridgeUserId: string): Promise<BridgeAuthToken> {
  return bridgeRequest<BridgeAuthToken>("/authorization/token", {
    method: "POST",
    body: JSON.stringify({ user_uuid: bridgeUserId }),
  });
}

// ── Connexion bancaire ─────────────────────────────────────────────────

/** Crée une session Bridge Connect et retourne l'URL de redirection */
export async function getBridgeConnectUrl(
  userToken: string,
  callbackUrl: string,
  userEmail: string
): Promise<string> {
  const body: Record<string, string> = { callback_url: callbackUrl, user_email: userEmail };

  const data = await bridgeRequest<{ id: string; url: string }>(
    "/connect-sessions",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    userToken
  );

  return data.url;
}

// ── Comptes & Transactions ─────────────────────────────────────────────

/** Liste les comptes bancaires de l'utilisateur */
export async function getBridgeAccounts(userToken: string): Promise<BridgeAccount[]> {
  const data = await bridgeRequest<{ resources: BridgeAccount[] }>("/accounts", {}, userToken);
  return data.resources ?? [];
}

/** Récupère les transactions depuis une date donnée */
export async function getBridgeTransactions(
  userToken: string,
  since?: string // format "YYYY-MM-DD"
): Promise<BridgeTransaction[]> {
  const params = since ? `?after=${since}&limit=500` : "?limit=500";
  const data = await bridgeRequest<{ resources: BridgeTransaction[] }>(
    `/transactions${params}`,
    {},
    userToken
  );
  return (data.resources ?? []).filter((t) => !t.is_deleted);
}

/** Récupère les items (banques connectées) */
export async function getBridgeItems(userToken: string): Promise<BridgeItem[]> {
  const data = await bridgeRequest<{ resources: BridgeItem[] }>("/items", {}, userToken);
  return data.resources ?? [];
}

/** Récupère les infos d'une banque (nom, logo) */
export async function getBridgeBank(bankId: number): Promise<BridgeBank> {
  return bridgeRequest<BridgeBank>(`/banks/${bankId}`);
}

// ── Catégorisation ─────────────────────────────────────────────────────
// Basé sur les vrais IDs Bridge v3 (GET /v3/aggregation/categories)

/** Catégorisation par mot-clé sur le label quand Bridge renvoie "Uncategorized" (id=1) */
export function guessCategoryFromLabel(label: string): string {
  const l = label.toLowerCase();

  // Alimentation
  if (/franprix|monoprix|carrefour|leclerc|lidl|aldi|picard|bio c bon|naturalia|supermarche|epicerie|boulangerie|patisserie|starbucks|mcdonald|burger|kfc|subway|sushi|pizza|kebab|brasserie|bistrot|cafe |resto|restaurant|cantine|traiteur/.test(l)) return "Alimentation";

  // Transport
  if (/velib|ratp|sncf|transilien|navigo|parking|autolib|uber|bolt|taxi|peage|station.?service|total.energies|esso|bp fuel|shell/.test(l)) return "Transport";

  // Carburant
  if (/essence|carburant|gazole|diesel|sp95|sp98|e10|e85|total|esso|bp |shell|leclerc.carbu/.test(l)) return "Carburant";

  // Logement
  if (/loyer|edf|engie|gaz|electricite|eau |suez|veolia|orange.box|sfr.box|bouygues.box|free.box|charges|syndic/.test(l)) return "Logement";

  // Abonnements
  if (/netflix|spotify|apple|google|amazon.prime|disney|deezer|canal|orange|sfr|bouygues|free |abonnement|subscription/.test(l)) return "Abonnements";

  // Santé
  if (/pharmacie|medecin|docteur|dentiste|ophtalmo|hopital|clinique|mutuelle|health|sante/.test(l)) return "Santé";

  // Shopping
  if (/amazon|fnac|darty|boulanger|decathlon|zara|h&m|primark|asos|zalando|cdiscount|ebay|vinted/.test(l)) return "Shopping";

  // Banque
  if (/releve differe|frais bancaire|agios|commission|cotisation carte|assurance.pret|credit/.test(l)) return "Banque";

  // Loisirs
  if (/cinema|theatre|musee|concert|sport|gym|fitness|piscine|tennis|jeux|gaming|steam/.test(l)) return "Loisirs";

  // Voyage
  if (/hotel|airbnb|booking|expedia|sncf.*tgv|eurostar|easyjet|ryanair|air france|transavia/.test(l)) return "Voyage";

  // Retrait
  if (/retrait|dab |distributeur/.test(l)) return "Autres";

  return "Autres";
}

export function mapBridgeCategoryToExpense(categoryId: number): string {
  const map: Record<number, string> = {
    // Food & Dining (168)
    83: "Alimentation",   // Restaurants
    188: "Alimentation",  // Food - Others
    260: "Alimentation",  // Fast foods
    273: "Alimentation",  // Supermarkets / Groceries
    313: "Alimentation",  // Coffee shop

    // Auto & Transport (165)
    87: "Carburant",      // Gas & Fuel
    84: "Transport",      // Auto & Transport - Others
    196: "Transport",     // Public transportation
    197: "Transport",     // Train ticket
    247: "Transport",     // Auto insurance
    251: "Transport",     // Parking
    264: "Transport",     // Car rental
    288: "Transport",     // Car maintenance
    309: "Transport",     // Tolls
    198: "Voyage",        // Plane ticket

    // Home (161)
    216: "Logement",      // Rent
    217: "Logement",      // Electricity
    218: "Logement",      // Gas
    220: "Logement",      // Home - Others
    221: "Logement",      // Home improvement
    222: "Logement",      // Maintenance
    246: "Logement",      // Home insurance
    293: "Logement",      // Water
    323: "Logement",      // Lawn & Garden
    328: "Logement",      // Misc. utilities

    // Health (163) + Personal care (315)
    236: "Santé",         // Pharmacy
    245: "Santé",         // Health insurance
    261: "Santé",         // Doctor
    268: "Santé",         // Health - Others
    322: "Santé",         // Optician
    325: "Santé",         // Dentist
    235: "Santé",         // Hairdresser
    248: "Santé",         // Cosmetics
    316: "Santé",         // Spa & Massage
    317: "Santé",         // Personal care - Others
    321: "Santé",         // Beauty care

    // Bills & Utilities (171)
    180: "Abonnements",   // Internet
    219: "Abonnements",   // Cable TV
    258: "Abonnements",   // Home phone
    277: "Abonnements",   // Mobile phone
    280: "Abonnements",   // Subscription - Others

    // Shopping (162)
    183: "Shopping",      // Gifts
    184: "Shopping",      // High Tech
    186: "Shopping",      // Shopping - Others
    243: "Shopping",      // Books
    262: "Shopping",      // Sporting goods
    272: "Shopping",      // Clothing & Shoes
    318: "Shopping",      // Music
    319: "Shopping",      // Movies
    441888: "Shopping",   // Licences

    // Entertainment (170)
    223: "Loisirs",       // Entertainment - Others
    224: "Loisirs",       // Pets
    226: "Loisirs",       // Hobbies
    227: "Loisirs",       // Bars & Clubs
    242: "Loisirs",       // Sports
    244: "Loisirs",       // Arts & Amusement
    269: "Loisirs",       // Amusements
    310: "Loisirs",       // Winter sports
    320: "Loisirs",       // Eating out
    249: "Voyage",        // Travels / Vacation
    263: "Voyage",        // Hotels

    // Education & Children (167)
    237: "Éducation",     // Education & Children - Others
    238: "Éducation",     // School supplies
    239: "Éducation",     // Tuition
    240: "Éducation",     // Pension (enfants)
    241: "Éducation",     // Student housing
    259: "Éducation",     // Student loan
    266: "Éducation",     // Toys
    267: "Éducation",     // Baby-sitter & Daycare

    // Bank (164)
    79: "Banque",         // Banking fees and charges
    89: "Banque",         // Mortgage refund
    192: "Banque",        // Savings
    194: "Banque",        // Mortgage
    195: "Banque",        // Bank - Others
    306: "Banque",        // Banking services
    756587: "Banque",     // Payment incidents

    // Taxes (159)
    206: "Impôts",        // Taxes - Others
    207: "Impôts",        // Fine
    208: "Impôts",        // Incomes taxes
    209: "Impôts",        // Property taxes
    302: "Impôts",        // Taxes
    441988: "Impôts",     // VAT

    // Withdrawals / Misc
    78: "Autres",         // Transfer
    85: "Autres",         // Withdrawals
    88: "Autres",         // Checks
    326: "Autres",        // Internal transfer
    1: "Autres",          // Uncategorized
    276: "Autres",        // Others spending
    278: "Assurance",     // Insurance
    294: "Autres",        // Charity
    308: "Autres",        // Tobacco
    324: "Autres",        // Laundry
  };
  return map[categoryId] ?? "Autres";
}

export function mapBridgeCategoryToIncome(categoryId: number): string {
  const map: Record<number, string> = {
    // Incomes (id: 2)
    230: "Salaire",       // Salaries
    231: "Vente",         // Sales
    232: "Vente",         // Services
    233: "Autre",         // Extra incomes
    3: "Autre",           // Other incomes
    80: "Autre",          // Interest incomes
    271: "Autre",         // Deposit
    279: "Autre",         // Retirement
    282: "Autre",         // Internal transfer
    283: "Remboursement", // Refunds
    289: "Épargne",       // Savings
    314: "Loyer perçu",   // Rent received
    327: "Retraite",      // Pension
    441893: "Autre",      // Grants
    441894: "Autre",      // Loans
  };
  return map[categoryId] ?? "Autre";
}
