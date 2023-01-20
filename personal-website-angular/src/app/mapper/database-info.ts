export interface DatabaseInfo {

  nome: string;
  cognome: string;
  telefono: string;
  email: string;
  fullName: string;
  yearVersion: string;
  whatsapp: string;
  locazione: Locazione;
  github_profile: string;
  github_link: string;
  curriculum_link: string;
  intro: string;
  descrizione: string;
  intro2: string;
  mission: string;
  soft_skill: Softskill;
  competenze_informatiche: Competenzeinformatiche;

  hideRepositorys: string[];
}

export interface Competenzeinformatiche {
  java: Linguaggio;
  python: Linguaggio;
  javascript: Linguaggio;
  typescript: Linguaggio;
  C: Linguaggio;
}

export interface Linguaggio {
  percentuale: string;
  altro: string;
}

export interface Softskill {
  s1: string;
  s2: string;
  s3: string;
  s4: string;
  s5: string;
  s6: string;
  s7: string;
  s8: string;
  s9: string;
  s10: string;
}

export interface Locazione {
  country: string;
  provincia: string;
  provincia_id: string;
  cap: string;
  citta: string;
}
