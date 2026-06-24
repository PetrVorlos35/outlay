// Content for the legal pages (Privacy, Terms, Security), localized en/cs.
// Kept here rather than in the global i18n catalog so the long-form text lives
// together and doesn't bloat messages/*.json.

export type LegalDoc = {
  title: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

export type LegalType = "privacy" | "terms" | "security";

// ISO date of the last revision; rendered per-locale on the page.
export const LEGAL_UPDATED = "2026-06-23";

const CONTACT = "vorlos.eu";

const EN: Record<LegalType, LegalDoc> = {
  privacy: {
    title: "Privacy Policy",
    intro:
      "outlay is a personal subscription tracker built by Petr Vorlíček. This policy explains what data outlay collects, why, and what control you have over it.",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "Account information: your email address and, optionally, your name. If you sign in with Google, we receive your email and basic profile details from Google.",
          "Subscription data you add: the names, prices, billing cycles, renewal dates and categories of the subscriptions you choose to track.",
          "Notification preferences: your reminder lead time and whether you've enabled price-hike alerts or the weekly summary.",
        ],
      },
      {
        heading: "How we use your data",
        body: [
          "To provide the service — storing and displaying your subscriptions and spend.",
          "To send the emails you ask for: account verification, password reset, renewal reminders, price-hike alerts and the optional weekly summary.",
          "To keep your account secure.",
          "We do not sell your data or use it for advertising.",
        ],
      },
      {
        heading: "Service providers",
        body: [
          "Convex — backend, database and hosting where your data is stored.",
          "Google — only if you choose to sign in with Google.",
          "Seznam.cz SMTP — delivery of the transactional emails listed above.",
          "These providers process data only to deliver the service.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "An authentication cookie keeps you signed in.",
          "A small preference cookie (NEXT_LOCALE) remembers your chosen language.",
          "No third-party advertising or tracking cookies are used.",
        ],
      },
      {
        heading: "Retention and your rights",
        body: [
          "Your data is kept while your account exists. You can view and edit your subscriptions at any time, and deleting your account removes your associated data.",
          "You can request access to, correction of, or deletion of your data.",
        ],
      },
      {
        heading: "Contact",
        body: [`Questions about privacy? Get in touch via ${CONTACT}.`],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    intro:
      "By creating an account or using outlay you agree to these terms. Please read them.",
    sections: [
      {
        heading: "The service",
        body: [
          "outlay helps you track recurring subscriptions, see upcoming renewals and understand your monthly spend. It is provided free of charge and may change or be discontinued over time.",
        ],
      },
      {
        heading: "Your account",
        body: [
          "You're responsible for providing accurate information, keeping your credentials secure and for activity under your account.",
          "You must use a valid email address you control.",
        ],
      },
      {
        heading: "Acceptable use",
        body: [
          "Don't misuse the service, attempt to disrupt it, access other users' data, or use it for anything unlawful.",
        ],
      },
      {
        heading: "Your data",
        body: [
          "The subscription information you enter is yours. outlay is a tracking aid to help you stay aware of charges — it does not make payments, cancel subscriptions, or provide financial advice. You're responsible for the accuracy of what you enter.",
        ],
      },
      {
        heading: "No warranty and limitation of liability",
        body: [
          'The service is provided "as is", without warranties of any kind. Reminders and alerts are a best-effort convenience and may be delayed or missed; you remain responsible for your own subscriptions and charges.',
          "To the extent permitted by law, outlay and its author are not liable for any damages arising from use of the service.",
        ],
      },
      {
        heading: "Termination and changes",
        body: [
          "You may stop using the service and delete your account at any time. We may update these terms; continued use after a change means you accept the updated terms.",
          "These terms are governed by the laws of the Czech Republic.",
        ],
      },
      {
        heading: "Contact",
        body: [`Questions about these terms? Reach out via ${CONTACT}.`],
      },
    ],
  },
  security: {
    title: "Security",
    intro:
      "Security is taken seriously. Here's how outlay protects your account and data.",
    sections: [
      {
        heading: "Encryption in transit",
        body: [
          "All traffic between your browser and outlay is encrypted over HTTPS/TLS.",
        ],
      },
      {
        heading: "Authentication",
        body: [
          "Passwords are hashed (never stored in plain text). You can also sign in with Google.",
          "New accounts verify ownership of their email with a one-time code, and password resets require a code sent to your email.",
          "Sessions use signed tokens (JWT).",
        ],
      },
      {
        heading: "Infrastructure and data isolation",
        body: [
          "Data is stored on Convex's managed backend. Every request is authorized on the server so that you can only ever read or change your own subscriptions.",
        ],
      },
      {
        heading: "Responsible disclosure",
        body: [
          `If you believe you've found a security issue, please report it privately via ${CONTACT} so it can be addressed before public disclosure.`,
        ],
      },
    ],
  },
};

const CS: Record<LegalType, LegalDoc> = {
  privacy: {
    title: "Zásady ochrany soukromí",
    intro:
      "outlay je osobní přehled předplatných, který vytvořil Petr Vorlíček. Tyto zásady vysvětlují, jaká data outlay sbírá, proč, a jakou nad nimi máte kontrolu.",
    sections: [
      {
        heading: "Jaké údaje shromažďujeme",
        body: [
          "Údaje o účtu: vaši e-mailovou adresu a volitelně jméno. Při přihlášení přes Google získáme váš e-mail a základní údaje profilu od Googlu.",
          "Údaje o předplatných, která zadáte: názvy, ceny, fakturační cykly, data obnovení a kategorie předplatných, která sledujete.",
          "Předvolby oznámení: s jakým předstihem chcete připomínat a zda máte zapnutá upozornění na zdražení nebo týdenní souhrn.",
        ],
      },
      {
        heading: "K čemu údaje používáme",
        body: [
          "K poskytování služby — ukládání a zobrazování vašich předplatných a výdajů.",
          "K odesílání e-mailů, o které požádáte: ověření účtu, obnovení hesla, připomínky obnovení, upozornění na zdražení a volitelný týdenní souhrn.",
          "K zabezpečení vašeho účtu.",
          "Vaše údaje neprodáváme ani nepoužíváme k reklamě.",
        ],
      },
      {
        heading: "Poskytovatelé služeb",
        body: [
          "Convex — backend, databáze a hosting, kde jsou vaše data uložena.",
          "Google — pouze pokud se rozhodnete přihlásit přes Google.",
          "SMTP Seznam.cz — doručování výše uvedených transakčních e-mailů.",
          "Tito poskytovatelé zpracovávají data jen za účelem provozu služby.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "Ověřovací cookie vás udržuje přihlášené.",
          "Malá předvolbová cookie (NEXT_LOCALE) si pamatuje zvolený jazyk.",
          "Nepoužíváme žádné reklamní ani sledovací cookies třetích stran.",
        ],
      },
      {
        heading: "Uchovávání a vaše práva",
        body: [
          "Data uchováváme po dobu existence vašeho účtu. Svá předplatná můžete kdykoli zobrazit a upravit a smazáním účtu se odstraní i s ním spojená data.",
          "Můžete požádat o přístup ke svým údajům, jejich opravu nebo smazání.",
        ],
      },
      {
        heading: "Kontakt",
        body: [`Máte dotaz k soukromí? Ozvěte se přes ${CONTACT}.`],
      },
    ],
  },
  terms: {
    title: "Podmínky používání",
    intro:
      "Vytvořením účtu nebo používáním outlay souhlasíte s těmito podmínkami. Přečtěte si je prosím.",
    sections: [
      {
        heading: "Služba",
        body: [
          "outlay vám pomáhá sledovat pravidelná předplatná, vidět nadcházející obnovení a chápat své měsíční výdaje. Je poskytována zdarma a může se v čase měnit nebo být ukončena.",
        ],
      },
      {
        heading: "Váš účet",
        body: [
          "Odpovídáte za uvedení správných údajů, za zabezpečení svých přihlašovacích údajů a za aktivitu na svém účtu.",
          "Musíte použít platnou e-mailovou adresu, kterou ovládáte.",
        ],
      },
      {
        heading: "Přijatelné používání",
        body: [
          "Službu nezneužívejte, nenarušujte její provoz, nepřistupujte k datům jiných uživatelů a nepoužívejte ji k nezákonným účelům.",
        ],
      },
      {
        heading: "Vaše data",
        body: [
          "Informace o předplatných, které zadáte, jsou vaše. outlay je pomůcka pro přehled o platbách — neprovádí platby, neruší předplatná a neposkytuje finanční poradenství. Za správnost zadaných údajů odpovídáte vy.",
        ],
      },
      {
        heading: "Bez záruky a omezení odpovědnosti",
        body: [
          'Služba je poskytována „tak jak je", bez jakýchkoli záruk. Připomínky a upozornění jsou pohodlím poskytovaným podle nejlepší snahy a mohou se opozdit nebo nedorazit; za svá předplatná a platby odpovídáte vy.',
          "V rozsahu povoleném zákonem outlay ani jeho autor neodpovídají za škody vzniklé používáním služby.",
        ],
      },
      {
        heading: "Ukončení a změny",
        body: [
          "Službu můžete kdykoli přestat používat a účet smazat. Tyto podmínky můžeme aktualizovat; pokračováním v používání po změně vyjadřujete souhlas s novou verzí.",
          "Tyto podmínky se řídí právem České republiky.",
        ],
      },
      {
        heading: "Kontakt",
        body: [`Máte dotaz k podmínkám? Napište přes ${CONTACT}.`],
      },
    ],
  },
  security: {
    title: "Zabezpečení",
    intro:
      "Zabezpečení bereme vážně. Tady je, jak outlay chrání váš účet a data.",
    sections: [
      {
        heading: "Šifrování při přenosu",
        body: [
          "Veškerá komunikace mezi vaším prohlížečem a outlay je šifrovaná přes HTTPS/TLS.",
        ],
      },
      {
        heading: "Ověřování",
        body: [
          "Hesla jsou hashovaná (nikdy se neukládají v čitelné podobě). Přihlásit se můžete i přes Google.",
          "Nové účty ověřují vlastnictví e-mailu jednorázovým kódem a obnovení hesla vyžaduje kód zaslaný na e-mail.",
          "Relace používají podepsané tokeny (JWT).",
        ],
      },
      {
        heading: "Infrastruktura a izolace dat",
        body: [
          "Data jsou uložena na spravovaném backendu Convex. Každý požadavek se ověřuje na serveru, takže můžete číst a měnit pouze svá vlastní předplatná.",
        ],
      },
      {
        heading: "Zodpovědné nahlášení",
        body: [
          `Pokud se domníváte, že jste našli bezpečnostní problém, nahlaste ho prosím soukromě přes ${CONTACT}, aby mohl být vyřešen před zveřejněním.`,
        ],
      },
    ],
  },
};

export function getLegalDoc(type: LegalType, locale: string): LegalDoc {
  const set = locale === "cs" ? CS : EN;
  return set[type];
}
