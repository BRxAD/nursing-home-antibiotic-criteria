var AntibioticCriteria = (function () {
  function item(id, label, hint) {
    return hint ? { id: id, label: label, hint: hint } : { id: id, label: label };
  }

  function leaf(id, heading, need, items, unmet) {
    return { id: id, heading: heading, need: need, items: items, unmet: unmet };
  }

  var conditions = [
    {
      id: "uti",
      name: "UTI",
      scope: "Uncomplicated, complicated, or catheter-associated",
      pathways: ["uti-uncomplicated", "uti-complicated", "uti-cauti"]
    },
    {
      id: "urti",
      name: "Upper respiratory",
      scope: "Bacterial sinusitis or bacterial pharyngitis",
      pathways: ["urti-sinusitis", "urti-pharyngitis"]
    },
    {
      id: "lrti",
      name: "Lower respiratory",
      scope: "Including COPD and other structural lung disease",
      pathways: ["lrti-general", "lrti-structural"]
    },
    {
      id: "ssti",
      name: "Skin and soft tissue",
      scope: "Wound, skin, or soft tissue infection",
      pathways: ["ssti"]
    },
    {
      id: "cdi",
      name: "C. difficile",
      scope: "When the test result is not expected within 24 hours",
      pathways: ["cdi"]
    }
  ];

  var utiInterpretation = {
    title: "Urine test results",
    steps: [
      "Do not start antibiotics from a positive urinalysis or urine culture alone when the resident does not have signs or symptoms of uncomplicated or complicated UTI.",
      "Avoid a urine culture when there are no clinical findings that warrant evaluation for UTI.",
      "When clinical criteria for UTI are met, do not delay empiric antibiotic therapy while waiting for the urine culture.",
      "If a urinalysis is negative for both leukocyte esterase and nitrites, look for another cause of the symptoms. A urinalysis that is positive for leukocyte esterase, nitrites, or both is not specific for UTI and should not, by itself, prompt empiric antibiotic therapy."
    ]
  };

  var utiSupport = {
    lead: "In a clinically stable resident, when it is uncertain whether minimum criteria are met, use supportive care and active monitoring instead of starting antibiotics immediately.",
    steps: [
      "Ensure adequate hydration.",
      "Review medications that may contribute to symptoms, including anticholinergics and opioids.",
      "Look for other causes of urinary symptoms, including dehydration, constipation, reduced mobility, and renal stones.",
      "Watch for new or worsening localizing or systemic signs and symptoms."
    ],
    close: "Reassess at intervals that match the resident’s condition. Start empiric antibiotic therapy if minimum criteria for UTI develop."
  };

  var urtiInterpretation = {
    title: "Respiratory virus and strep testing",
    steps: [
      "When clinically indicated and available, test residents with new upper respiratory symptoms — cough, rhinorrhea, congestion, or sore throat — for influenza, SARS-CoV-2, and RSV with a rapid test.",
      "A positive viral test, without clinical evidence of bacterial infection, supports withholding empiric antibiotics while watching for complications, including secondary bacterial infection.",
      "Test for Group A Streptococcus when there is a sore throat and more than 2 Centor criteria: tonsillar or pharyngeal exudate, tender cervical lymphadenitis, fever, and absence of cough."
    ]
  };

  var urtiSupport = {
    lead: "In a clinically stable resident, when it is uncertain whether minimum criteria are met, use supportive care and active monitoring instead of starting antibiotics immediately. Reassess on a schedule for new, worsening, or persistent signs and symptoms.",
    steps: [
      "Rest.",
      "Oral hydration.",
      "Analgesics or antipyretics.",
      "Saline nasal wash or spray for congestion.",
      "Humidified air for respiratory comfort.",
      "Saline gargles or lozenges for sore throat."
    ],
    close: "Avoid supportive measures and over-the-counter medications that may worsen an underlying condition or interact with the resident’s medications."
  };

  var lrtiInterpretation = {
    title: "Respiratory tests and imaging",
    steps: [
      "When clinically indicated and available, test new or worsening respiratory symptoms for influenza, SARS-CoV-2, and RSV with a rapid test. A broader respiratory viral panel may be considered when the result would change management or an outbreak investigation.",
      "A positive viral test, without clinical evidence of bacterial infection, should discourage empiric antibiotics and supports watching for complications, including secondary bacterial infection.",
      "If a resident with lower respiratory infection and a positive viral test worsens or does not improve, reassess. Consider empiric antibiotic therapy when secondary bacterial lower respiratory infection is suspected.",
      "Do not use point-of-care C-reactive protein or procalcitonin alone to decide whether to start antibiotics for suspected lower respiratory infection. Diagnostic accuracy is limited in the nursing home population.",
      "A chest radiograph is not required before empiric antibiotic therapy when minimum clinical criteria for lower respiratory infection are met. Imaging can still help when it is available and clinically indicated."
    ]
  };

  var lrtiSupport = {
    lead: "In a clinically stable resident, when it is uncertain whether minimum criteria are met, use supportive care and active monitoring instead of starting antibiotics immediately.",
    steps: [
      "Rest, hydration, supplemental oxygen, airway clearance, humidified air, and bronchodilators when clinically indicated."
    ],
    close: "Reassess for worsening oxygenation, respiratory distress, signs of sepsis, or other deterioration. Findings that may suggest progression from viral pneumonia or aspiration pneumonitis to bacterial pneumonia include increased sputum purulence, rising leukocytosis, and double sickening (worsening after a period of improvement)."
  };

  var sstiInterpretation = {
    title: "Wound tests and imaging",
    steps: [
      "For suspected wound infection, superficial wound cultures generally have limited usefulness and should not be obtained routinely. Consider a culture when identifying MRSA would change empiric antibiotic therapy.",
      "Laboratory tests and imaging, such as a white blood cell count or ultrasound for deep vein thrombosis or abscess, may be considered. Turnaround time and access may limit their use for the decision to start empiric antibiotics.",
      "Broad-range or multiplex molecular wound testing is not recommended for routine evaluation of suspected skin and soft tissue infection because of limited evidence."
    ]
  };

  var sstiSupport = {
    lead: "In a clinically stable resident, when it is uncertain whether minimum criteria are met, use supportive care and active monitoring instead of starting antibiotics immediately.",
    steps: [
      "Wound care.",
      "Management of lymphedema.",
      "Pain control.",
      "Nutritional support.",
      "Vascular evaluation when indicated.",
      "Assessment for concomitant fungal infection."
    ]
  };

  var cdiInterpretation = {
    title: "C. difficile test results",
    steps: [
      "In a clinically stable resident with suspected C. difficile infection, when the test result is expected within 24 hours, await the result before starting therapy. Empiric treatment may be considered when the result is not expected within 24 hours, using the minimum criteria on this screen.",
      "Read a positive test together with clinical suspicion and compatible symptoms, so colonization is not treated. A positive test alone should not prompt treatment when compatible clinical findings are absent."
    ]
  };

  var cdiSupport = {
    lead: "Supportive care for a resident with diarrhea:",
    steps: [
      "Hydrate with fluids and electrolytes.",
      "Stop laxatives, stool softeners, peristaltic agents, and other medications that may contribute to diarrhea, when clinically appropriate.",
      "If the resident is receiving antibiotics, reassess whether they are still needed and stop them when they are not.",
      "Avoid antimotility agents, especially when moderate or severe disease is suspected or confirmed, until C. difficile infection has been excluded.",
      "Monitor stool frequency, abdominal symptoms, vital signs, and signs of worsening illness, including increasing diarrhea, abdominal distention, dehydration, leukocytosis, and overall deterioration."
    ],
    close: "Manage a resident with suspected C. difficile infection and a pending test according to current infection prevention and control guidance for suspected C. difficile infection."
  };

  var pathways = {
    "uti-uncomplicated": {
      id: "uti-uncomplicated",
      conditionId: "uti",
      name: "Uncomplicated",
      summaryName: "UTI, uncomplicated",
      rule: "Minimum criteria are acute dysuria, or at least two localizing symptoms.",
      interpretation: utiInterpretation,
      support: utiSupport,
      logic: {
        op: "or",
        groups: [
          leaf("dysuria", "This finding alone meets criteria", 1, [
            item("uu-dysuria", "Acute dysuria")
          ], function () {
            return "Acute dysuria is not selected.";
          }),
          leaf("local", "Or at least two localizing symptoms", 2, [
            item("uu-urgency", "New or worsening urgency and/or frequency"),
            item("uu-incontinence", "New or worsening urinary incontinence"),
            item("uu-suprapubic", "New suprapubic pain"),
            item("uu-hematuria", "Gross hematuria")
          ], function (count) {
            var more = 2 - count;
            return "Localizing symptoms: " + count + " of 2 selected. Select " + more + " more, or select acute dysuria.";
          })
        ]
      },
      summaryUnmet: function (result) {
        var n = result.parts[1].count;
        if (n === 0) return "Still needed: acute dysuria, or at least 2 localizing symptoms.";
        var more = 2 - n;
        return "Still needed: acute dysuria, or " + more + " more localizing symptom" + (more === 1 ? "" : "s") + ".";
      }
    },
    "uti-complicated": {
      id: "uti-complicated",
      conditionId: "uti",
      name: "Complicated, no catheter",
      summaryName: "UTI, complicated, no catheter",
      rule: "Minimum criteria are at least one systemic finding and at least one localizing finding. This pathway is for a resident without an indwelling urinary catheter.",
      interpretation: utiInterpretation,
      support: utiSupport,
      logic: {
        op: "and",
        groups: [
          leaf("systemic", "At least one systemic or non-localizing finding", 1, [
            item("uc-fever", "Fever, without an alternative explanation"),
            item("uc-rigors", "Rigors, without an alternative explanation"),
            item("uc-unstable", "Hemodynamic instability, without an alternative explanation"),
            item("uc-delirium", "Delirium")
          ], function () {
            return "No systemic or non-localizing finding is selected. Select at least one.";
          }),
          leaf("local", "And at least one localizing sign or symptom", 1, [
            item("uc-dysuria", "Dysuria"),
            item("uc-urgency", "New or worsening urgency or frequency"),
            item("uc-incontinence", "New or worsening urinary incontinence"),
            item("uc-suprapubic", "New suprapubic pain"),
            item("uc-cva", "New costovertebral angle tenderness"),
            item("uc-hematuria", "Gross hematuria")
          ], function () {
            return "No localizing sign or symptom is selected. Select at least one.";
          })
        ]
      },
      summaryUnmet: function (result) {
        var bits = [];
        if (!result.parts[0].met) bits.push("a systemic finding");
        if (!result.parts[1].met) bits.push("a localizing symptom");
        return "Still needed: " + bits.join(" and ") + ".";
      }
    },
    "uti-cauti": {
      id: "uti-cauti",
      conditionId: "uti",
      name: "Catheter-associated",
      summaryName: "Catheter-associated UTI",
      rule: "Minimum criteria are a chronic indwelling urethral or suprapubic catheter and at least one associated finding.",
      interpretation: utiInterpretation,
      support: utiSupport,
      logic: {
        op: "and",
        groups: [
          leaf("catheter", "Required", 1, [
            item("ca-catheter", "Chronic indwelling urethral or suprapubic urinary catheter")
          ], function () {
            return "A chronic indwelling urethral or suprapubic catheter is not selected.";
          }),
          leaf("finding", "And at least one of the following", 1, [
            item("ca-fever", "Fever, without an alternative explanation"),
            item("ca-delirium", "New-onset delirium"),
            item("ca-rigors", "Rigors or hemodynamic instability, without an alternative explanation"),
            item("ca-cva", "New costovertebral angle tenderness")
          ], function () {
            return "No catheter-associated finding is selected. Select at least one.";
          })
        ]
      },
      summaryUnmet: function (result) {
        var bits = [];
        if (!result.parts[0].met) bits.push("the indwelling catheter");
        if (!result.parts[1].met) bits.push("an associated finding");
        return "Still needed: " + bits.join(" and ") + ".";
      }
    },
    "urti-sinusitis": {
      id: "urti-sinusitis",
      conditionId: "urti",
      name: "Acute bacterial sinusitis",
      summaryName: "Upper respiratory, acute bacterial sinusitis",
      rule: "Minimum criteria are purulent rhinorrhea and at least one of the courses below.",
      interpretation: urtiInterpretation,
      support: urtiSupport,
      logic: {
        op: "and",
        groups: [
          leaf("rhinorrhea", "Required", 1, [
            item("sin-rhinorrhea", "Purulent rhinorrhea")
          ], function () {
            return "Purulent rhinorrhea is not selected.";
          }),
          leaf("course", "And at least one course", 1, [
            item("sin-severe", "Severe symptoms at onset"),
            item("sin-persistent", "Persistent symptoms for more than 10 days without improvement"),
            item("sin-double", "Worsening symptoms after initial improvement (double sickening)")
          ], function () {
            return "No sinusitis course is selected. Select severe symptoms at onset, symptoms for more than 10 days without improvement, or double sickening.";
          })
        ]
      },
      summaryUnmet: function (result) {
        var bits = [];
        if (!result.parts[0].met) bits.push("purulent rhinorrhea");
        if (!result.parts[1].met) bits.push("a qualifying course");
        return "Still needed: " + bits.join(" and ") + ".";
      }
    },
    "urti-pharyngitis": {
      id: "urti-pharyngitis",
      conditionId: "urti",
      name: "Acute bacterial pharyngitis",
      summaryName: "Upper respiratory, acute bacterial pharyngitis",
      rule: "Minimum criteria are sore throat and at least 3 of the 4 findings below.",
      interpretation: urtiInterpretation,
      support: urtiSupport,
      logic: {
        op: "and",
        groups: [
          leaf("throat", "Required", 1, [
            item("ph-throat", "Sore throat")
          ], function () {
            return "Sore throat is not selected.";
          }),
          leaf("centor", "And at least 3 of these findings", 3, [
            item("ph-exudate", "Tonsillar or pharyngeal exudate"),
            item("ph-nodes", "Tender cervical lymphadenitis"),
            item("ph-fever", "Fever"),
            item("ph-nocough", "Absence of cough", "Select this when cough is absent. It counts toward the 3 findings.")
          ], function (count) {
            return "Centor findings: " + count + " of 3 selected.";
          })
        ]
      },
      summaryUnmet: function (result) {
        var bits = [];
        if (!result.parts[0].met) bits.push("sore throat");
        if (!result.parts[1].met) bits.push((3 - result.parts[1].count) + " more Centor finding" + (3 - result.parts[1].count === 1 ? "" : "s"));
        return "Still needed: " + bits.join(" and ") + ".";
      }
    },
    "lrti-general": {
      id: "lrti-general",
      conditionId: "lrti",
      name: "No structural lung disease",
      summaryName: "Lower respiratory, no structural lung disease",
      rule: "Minimum criteria are fever or delirium, plus cough, plus at least one additional finding.",
      interpretation: lrtiInterpretation,
      support: lrtiSupport,
      logic: {
        op: "and",
        groups: [
          leaf("systemic", "Fever or delirium", 1, [
            item("lg-fever", "Fever"),
            item("lg-delirium", "Delirium")
          ], function () {
            return "Neither fever nor delirium is selected.";
          }),
          leaf("cough", "And cough", 1, [
            item("lg-cough", "Cough")
          ], function () {
            return "Cough is not selected.";
          }),
          leaf("extra", "And at least one additional finding", 1, [
            item("lg-hr", "Tachycardia (heart rate greater than 100 beats/minute)"),
            item("lg-rr", "Tachypnea (respiratory rate greater than 25 breaths/minute)"),
            item("lg-o2", "New hypoxia or increased oxygen requirements"),
            item("lg-rigors", "Rigors (shaking chills)"),
            item("lg-sputum", "New or increased purulent sputum production"),
            item("lg-exam", "New abnormal lung findings, such as consolidation or crackles")
          ], function () {
            return "No additional lower respiratory finding is selected. Select at least one.";
          })
        ]
      },
      summaryUnmet: function (result) {
        var bits = [];
        if (!result.parts[0].met) bits.push("fever or delirium");
        if (!result.parts[1].met) bits.push("cough");
        if (!result.parts[2].met) bits.push("an additional finding");
        return "Still needed: " + joinList(bits) + ".";
      }
    },
    "lrti-structural": {
      id: "lrti-structural",
      conditionId: "lrti",
      name: "COPD or structural lung disease",
      summaryName: "Lower respiratory, COPD or structural lung disease",
      rule: "For underlying structural lung disease, including COPD, minimum criteria are new or increased sputum purulence and at least one additional finding.",
      interpretation: lrtiInterpretation,
      support: lrtiSupport,
      logic: {
        op: "and",
        groups: [
          leaf("purulence", "Required", 1, [
            item("ls-purulence", "New or increased sputum purulence")
          ], function () {
            return "New or increased sputum purulence is not selected.";
          }),
          leaf("extra", "And at least one of the following", 1, [
            item("ls-delirium", "Delirium"),
            item("ls-dyspnea", "Worsening dyspnea"),
            item("ls-rr", "Tachypnea (respiratory rate greater than 25 breaths/minute)"),
            item("ls-volume", "Increased volume of sputum production")
          ], function () {
            return "No additional finding is selected. Select at least one.";
          })
        ]
      },
      summaryUnmet: function (result) {
        var bits = [];
        if (!result.parts[0].met) bits.push("new or increased sputum purulence");
        if (!result.parts[1].met) bits.push("an additional finding");
        return "Still needed: " + bits.join(" and ") + ".";
      }
    },
    ssti: {
      id: "ssti",
      conditionId: "ssti",
      name: "Skin and soft tissue",
      summaryName: "Skin and soft tissue infection",
      rule: "Minimum criteria are new or increasing purulent drainage, or at least two inflammatory findings.",
      notice: "Also look for noninfectious mimics, and decide whether incision and drainage or debridement is indicated.",
      interpretation: sstiInterpretation,
      support: sstiSupport,
      logic: {
        op: "or",
        groups: [
          leaf("drainage", "This finding alone meets criteria", 1, [
            item("st-drainage", "New or increasing purulent drainage from a wound, skin, or soft tissue site")
          ], function () {
            return "Purulent drainage is not selected.";
          }),
          leaf("inflam", "Or at least two inflammatory findings", 2, [
            item("st-fever", "Fever"),
            item("st-erythema", "New or increasing erythema"),
            item("st-tender", "Tenderness to palpation"),
            item("st-warm", "Increased warmth at the affected site"),
            item("st-swell", "New or increasing swelling at the affected site")
          ], function (count) {
            return "Inflammatory findings: " + count + " of 2 selected.";
          })
        ]
      },
      summaryUnmet: function (result) {
        var n = result.parts[1].count;
        if (n === 0) return "Still needed: purulent drainage, or at least 2 inflammatory findings.";
        var more = 2 - n;
        return "Still needed: purulent drainage, or " + more + " more inflammatory finding" + (more === 1 ? "" : "s") + ".";
      }
    },
    cdi: {
      id: "cdi",
      conditionId: "cdi",
      name: "C. difficile",
      summaryName: "C. difficile infection",
      rule: "Use these criteria only when the C. difficile test result is not expected within 24 hours. Minimum criteria are all of the sections below. The last section can be met either way.",
      interpretation: cdiInterpretation,
      support: cdiSupport,
      gate: {
        id: "cdi-gate",
        label: "The C. difficile test result is not expected within 24 hours",
        short: "Confirm that the test result is not expected within 24 hours.",
        unmet: "These criteria apply only when the test result is not expected within 24 hours. In a clinically stable resident, await the result before starting therapy."
      },
      logic: {
        op: "and",
        groups: [
          leaf("stools", "Required", 1, [
            item("cdi-stools", "Within 24 hours, 3 or more new unformed stools (Bristol Stool Scale 5–7)")
          ], function () {
            return "Three or more new unformed stools within 24 hours is not selected.";
          }),
          leaf("noalt", "Required", 1, [
            item("cdi-noalt", "No alternative explanation for the diarrhea")
          ], function () {
            return "No alternative explanation for the diarrhea is not confirmed.";
          }),
          {
            op: "or",
            id: "either",
            heading: "And either a supporting sign or high clinical suspicion",
            unmet: "Neither a supporting sign nor a high-suspicion finding is selected.",
            groups: [
              leaf("support-signs", "At least one supporting sign", 1, [
                item("cdi-fever", "Fever"),
                item("cdi-pain", "Abdominal pain"),
                item("cdi-wbc", "Unexplained leukocytosis")
              ], function () {
                return "No supporting sign is selected.";
              }),
              leaf("suspicion", "Or at least one high-suspicion finding", 1, [
                item("cdi-abx", "Antibiotic exposure within the previous 12 weeks"),
                item("cdi-prior", "C. difficile infection within the previous 8 weeks")
              ], function () {
                return "No high-suspicion finding is selected.";
              })
            ]
          }
        ]
      },
      summaryUnmet: function (result) {
        var bits = [];
        if (!result.parts[0].met) bits.push("3 or more new unformed stools");
        if (!result.parts[1].met) bits.push("no alternative explanation");
        if (!result.parts[2].met) bits.push("a supporting sign or high-suspicion finding");
        return "Still needed: " + joinList(bits) + ".";
      }
    }
  };

  function joinList(bits) {
    if (bits.length === 1) return bits[0];
    if (bits.length === 2) return bits[0] + " and " + bits[1];
    return bits.slice(0, -1).join(", ") + ", and " + bits[bits.length - 1];
  }

  function evalNode(node, selected) {
    if (node.op) {
      var parts = node.groups.map(function (group) {
        return evalNode(group, selected);
      });
      var met = node.op === "and"
        ? parts.every(function (part) { return part.met; })
        : parts.some(function (part) { return part.met; });
      return { met: met, parts: parts };
    }
    var count = node.items.reduce(function (n, entry) {
      return n + (selected[entry.id] ? 1 : 0);
    }, 0);
    return { met: count >= node.need, count: count };
  }

  function gapsOf(node, result) {
    if (result.met) return [];
    if (node.op) {
      if (node.unmet && node.op === "or") return [node.unmet];
      var lines = [];
      node.groups.forEach(function (group, index) {
        gapsOf(group, result.parts[index]).forEach(function (line) {
          lines.push(line);
        });
      });
      return lines;
    }
    return [node.unmet(result.count)];
  }

  function eachItem(node, fn) {
    if (node.op) {
      node.groups.forEach(function (group) {
        eachItem(group, fn);
      });
      return;
    }
    node.items.forEach(fn);
  }

  function evaluate(pathway, selected, gateOn) {
    var selectedLabels = [];
    eachItem(pathway.logic, function (entry) {
      if (selected[entry.id]) selectedLabels.push(entry.label);
    });
    if (pathway.gate && !gateOn) {
      return {
        met: false,
        blockedByGate: true,
        gaps: [pathway.gate.unmet],
        summary: pathway.gate.short,
        selectedLabels: selectedLabels
      };
    }
    var result = evalNode(pathway.logic, selected);
    return {
      met: result.met,
      blockedByGate: false,
      gaps: gapsOf(pathway.logic, result),
      summary: result.met
        ? "Selected findings meet the minimum criteria for empiric antibiotics."
        : pathway.summaryUnmet(result),
      selectedLabels: selectedLabels
    };
  }

  return {
    conditions: conditions,
    pathways: pathways,
    evaluate: evaluate
  };
})();
