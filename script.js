// Listen for the form submission
document.getElementById('nmrForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form from submitting normally

  const form = event.target;

  // Retrieve form values
  const concentration = parseFloat(form.concentration.value);
  const buffer = form.buffer.value;
  const aggregation = form.aggregation.value; // "yes" or "no"
  const degradation = form.degradation.value;
  const conformational = form.conformational.value;
  const monomeric = form.monomeric.value;

  // Get checked features (checkboxes)
  const features = Array.from(form.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value);

  const micelles = form.micelles.value;
  const ligands = form.ligands.value;

  // Get desired outcomes (checkboxes)
  const outcomes = Array.from(form.querySelectorAll('input[name="outcomes"]:checked')).map(cb => cb.value);

  // Build an object with all answers
  const answers = {
    concentration,
    buffer,
    aggregation,
    degradation,
    conformational,
    monomeric,
    features,
    micelles,
    ligands,
    outcomes
  };

  // Get recommendations based on the answers
  const recommendations = getRecommendations(answers);

  // Display the recommendations
  displayResults(recommendations);
});

// Function that evaluates the answers and returns a list of recommendations
function getRecommendations(answers) {
  let recs = [];

  // Example: Use concentration to recommend experiments
  if (answers.concentration >= 10) {
    recs.push({
      name: "HSQC",
      justification: "A high sample concentration can provide a strong HSQC signal."
    });
  } else {
    recs.push({
      name: "Sensitivity-Enhanced HSQC",
      justification: "At lower concentrations, sensitivity-enhanced methods may yield better results."
    });
  }

  // Evaluate protein stability
  if (answers.aggregation === "yes" || answers.degradation === "yes" || answers.conformational === "yes") {
    recs.push({
      name: "Stability Optimization",
      justification: "Observed instability may require buffer optimization or additives before running standard experiments."
    });
  }

  // Check for monomeric state
  if (answers.monomeric === "no") {
    recs.push({
      name: "TROSY-Based Experiments",
      justification: "Non-monomeric samples often benefit from TROSY methods to reduce spectral overlap."
    });
  }

  // Evaluate structural features (disordered regions, long loops, flexible termini)
  if (answers.features.includes("intrinsically_disordered") || answers.features.includes("long_loops") || answers.features.includes("flexible_termini")) {
    recs.push({
      name: "Specialized Experiments for Disordered Proteins",
      justification: "Proteins with flexible or disordered regions may require experiments tailored to capture dynamic behavior."
    });
  }

  // Check if protein is embedded in micelles
  if (answers.micelles === "yes") {
    recs.push({
      name: "Membrane Protein NMR Methods",
      justification: "Proteins in micelles typically need specialized protocols to account for membrane mimetic environments."
    });
  }

  // Consider the presence of ligands or co-factors
  if (answers.ligands === "yes") {
    recs.push({
      name: "Complex Formation Analysis",
      justification: "The presence of ligands or co-factors suggests experiments that probe protein-ligand interactions."
    });
  }

  // Evaluate desired outcomes from the analysis
  if (answers.outcomes.includes("backbone")) {
    recs.push({
      name: "Backbone Assignment (HSQC)",
      justification: "For backbone chemical shift assignments, a standard HSQC is a common starting point."
    });
  }
  if (answers.outcomes.includes("side_chain")) {
    recs.push({
      name: "Side Chain Assignment (HCCH-TOCSY)",
      justification: "HCCH-TOCSY experiments can help in obtaining aliphatic side chain chemical shift assignments."
    });
  }
  if (answers.outcomes.includes("ensemble")) {
    recs.push({
      name: "NOESY for Structure Determination",
      justification: "NOESY experiments provide distance constraints necessary for calculating 3D protein structures."
    });
  }

  return recs;
}

// Function to display recommendations in the results div
function displayResults(recommendations) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ""; // Clear previous results

  if (recommendations.length > 0) {
    const heading = document.createElement("h2");
    heading.textContent = "Recommended NMR Experiments:";
    resultsDiv.appendChild(heading);

    const list = document.createElement("ul");
    recommendations.forEach(rec => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<strong>${rec.name}</strong>: ${rec.justification}`;
      list.appendChild(listItem);
    });
    resultsDiv.appendChild(list);
  } else {
    resultsDiv.textContent = "No recommendations available based on your responses.";
  }
}
