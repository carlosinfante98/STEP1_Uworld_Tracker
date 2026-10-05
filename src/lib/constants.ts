// Editable defaults. UWorld's own category names may differ slightly from these;
// check them against your QBank's Create Test screen and adjust this list if needed.
export const SYSTEMS = [
  'Mixed / Random',
  'Behavioral Health',
  'Biostatistics & Epidemiology',
  'Blood & Lymphoreticular',
  'Cardiovascular',
  'Endocrine',
  'Gastrointestinal',
  'Immune',
  'Multisystem',
  'Musculoskeletal & Skin',
  'Nervous & Special Senses',
  'Renal & Urinary',
  'Reproductive',
  'Respiratory',
  'Social Sciences & Ethics',
] as const

export const SUBJECTS = [
  'Mixed',
  'Anatomy & Embryology',
  'Behavioral Science',
  'Biochemistry & Nutrition',
  'Biostatistics',
  'Genetics',
  'Histology & Cell Biology',
  'Immunology',
  'Microbiology',
  'Pathology',
  'Pharmacology',
  'Physiology',
] as const

// UWorld caps a standard block at 40 questions.
export const DEFAULT_BLOCK_SIZE = 40
export const SECONDS_PER_QUESTION = 90
