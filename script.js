// Listen for form submission
document.getElementById('nmrForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form from reloading the page

  const form = event.target;

  // Retrieve form values
  const concentration = parseFloat(form.concentration.value);
  const buffer = form.buffer.value;
  const stability = form.stability.value; // "yes" or "no"

  // Retrieve features (checkboxes)
  const features = Array.from(form.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value);

  const micelles = form.micelles.value;
  const ligands = form.ligands.value;

  // For mutually exclusive outcomes (radio button: single value)
  const outcomes = form.outcomes.value;

  // Build an object with all the answers
  const answers = {
    concentration,
    buffer,
    stability,
    features,
    micelles,
    ligands,
    outcomes
  };

  // Get experiment recommendations based on the answers
  const recommendations = getRecommendations(answers);

  // Display the recommendations
  displayResults(recommendations);
});

// Function to evaluate answers and return a list of recommendations
function getRecommendations(answers) {
  let recs = [];

  // Append common information required in every scenario:
  const commonMessage = `
    <p><strong>Important:</strong> 4D-GRAPHS requires processed peak lists as input. It does not support automated peak picking or unfolding/unaliasing of peaks. If you seek an automatic solution for that, then use the application “ARTINA: peak picking” from <a href="https://nmrtist.org/">NMRtist</a>. The peak lists that it will create will be the input to 4D-GRAPHS.</p>
    <p>The following experiments and the specified pulse programs should be measured in all scenarios as they are essential for chemical shift assignment by 4D-GRAPHS. That's why we recommend measuring both 15N and 13C HSQC spectra using full spectral widths in order to be able to identify and unfold/unalias manually all peaks in the 4D or 3D spectra.</p>
    <ul>
      <li><strong>13C HSQC (hsqcedetgp):</strong> This pulse program yields CH and CH₃ in-phase and CH₂ anti-phase.</li>
      <li><strong>15N HSQC (hsqcedetf3gpsi2):</strong> In this spectrum, N–H signals (all backbone amides, sidechain NE–HE of ARG, sidechain ND1–HD1 of HIS, sidechain NE–HE1 of TRP, and side chain amides of LYS) will be positive, while N–H₂ signals (side chain amides of ASN, GLN, and NH₁–HH₁[12] and NH₂–HH₂[12] of ARG) will be negative. This helps 4D-GRAPHS correctly identify side chain spin systems.</li>
    </ul>
  `;
  recs.push({ name: "Common Experiments", justification: commonMessage });

  // Example decision logic based on concentration:
  if (answers.concentration >= 10) {
    recs.push({
      name: "Standard HSQC",
      justification: "At high protein concentration, a standard HSQC is generally effective."
    });
  } else {
    recs.push({
      name: "Sensitivity-Enhanced HSQC",
      justification: "At lower concentrations, sensitivity-enhanced methods may yield better results."
    });
  }

  // Evaluate protein stability
  if (answers.stability === "no") {
    recs.push({
      name: "Stability Optimization",
      justification: "The protein shows instability (aggregation, degradation, or conformational changes). Consider buffer optimization or additives prior to further experiments."
    });
  }

  // Evaluate structural features
  if (answers.features.includes("intrinsically_disordered") || answers.features.includes("long_loops") || answers.features.includes("flexible_termini")) {
    recs.push({
      name: "Specialized Experiments for Dynamic Proteins",
      justification: "The presence of disordered regions, long loops, or flexible termini suggests the need for experiments that capture dynamic behavior."
    });
  }

  // Evaluate whether protein is embedded in micelles
  if (answers.micelles === "yes") {
    recs.push({
      name: "Membrane Protein NMR Methods",
      justification: "For proteins embedded in micelles, specialized NMR protocols are recommended."
    });
  }

  // Evaluate ligand/co-factor/nucleotide presence
  if (answers.ligands === "yes") {
    recs.push({
      name: "Protein-Ligand Interaction Experiments",
      justification: "The presence of ligands, co-factors, or nucleotides indicates that experiments to probe these interactions should be performed."
    });
  }

  // Evaluate desired outcomes
  if (answers.outcomes === "backbone") {
    recs.push({
      name: "Backbone Assignment (HSQC)",
      justification: "For backbone chemical shift assignments, standard HSQC experiments are recommended."
    });
  } else if (answers.outcomes === "side_chain") {
    recs.push({
      name: "Side Chain Assignment (HCCH-TOCSY)",
      justification: "For backbone and side chain atom chemical shift assignments (currently only for aliphatic atoms), HCCH-TOCSY experiments are recommended."
    });
  } else if (answers.outcomes === "ensemble") {
    recs.push({
      name: "NOESY for Structure Determination",
      justification: "To obtain an ensemble of 3D protein structures, NOESY experiments provide the necessary distance constraints."
    });
  }

  return recs;
}

// Function to display recommendations in the "results" div
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
