// src/utils/recommendation.js
import doctorsData from "../data/doctors_dataset_with_geo.json";

/**
 * Mock “black‑box” diagnosis generator.
 */
export function blackBoxDiagnosis() {
  const possible = [
    "Depression",
    "Anxiety",
    "Bipolar Disorder",
    "PTSD",
    "OCD",
    "Schizophrenia",
    "Eating Disorders",
    "ADHD",
    "Autism Spectrum Disorder",
    "Substance Abuse",
  ];
  return possible[Math.floor(Math.random() * possible.length)];
}

/**
 * Shuffle an array in‑place (Fisher–Yates).
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Recommend up to `count` doctors matching the given diagnosis.
 * Falls back to random picks if fewer qualified doctors exist.
 */
export function recommendDoctors(diagnosis, count = 5) {
  // split the comma‑separated specialties into arrays and match
  const matches = doctorsData.filter((doc) =>
    doc.Specialties.split(", ").includes(diagnosis)
  );

  // sort by rating desc
  matches.sort((a, b) => b.Rating - a.Rating);

  // take top matches
  const selected = matches.slice(0, count);

  // if not enough, fill with random others
  if (selected.length < count) {
    const remaining = doctorsData.filter((doc) => !selected.includes(doc));
    shuffle(remaining);
    selected.push(...remaining.slice(0, count - selected.length));
  }

  return selected;
}
