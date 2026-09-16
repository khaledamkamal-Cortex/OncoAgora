// Seed content for the OncoAgora demo store.
// OncoAgora — the gathering place for oncology learning.
// These two courses ship as starter content; manage everything from /admin.

export const seedCourses = [
  {
    id: 'c-appraisal',
    title: 'Foundations of Critical Appraisal in Oncology',
    level: 'Beginner',
    banner: 'linear-gradient(135deg,#2c3e8c,#0ea5a6)',
    summary: 'Learn to read, appraise and apply oncology randomized controlled trials. Covers study design, bias, endpoints, statistics and applicability.',
    hours: 6,
    modules: [
      {
        id: 'mod1', title: 'Module 1 — Study Design & Hierarchy of Evidence',
        lessons: [
          { id: 'l1', title: 'Why critical appraisal matters', kind: 'video', url: '', duration: '08:20' },
          { id: 'l2', title: 'The hierarchy of evidence', kind: 'article', body: 'Not all evidence is equal. At the base sit case reports and expert opinion; above them cohort and case-control studies; then randomized controlled trials (RCTs); and at the apex, systematic reviews and meta-analyses of RCTs.\n\nIn oncology, the RCT remains the reference standard for demonstrating that a treatment causally improves outcomes. But hierarchy is a starting point, not a verdict — a poorly conducted RCT can be less reliable than a well-designed observational study. Always appraise the individual study, not just its label.' },
          { id: 'l3', title: 'Randomization & allocation concealment', kind: 'pdf', url: '', pages: 4 }
        ]
      },
      {
        id: 'mod2', title: 'Module 2 — Bias, Blinding & Confounding',
        lessons: [
          { id: 'l4', title: 'Sources of bias in clinical trials', kind: 'video', url: '', duration: '11:05' },
          { id: 'l5', title: 'Intention-to-treat vs per-protocol', kind: 'article', body: 'Intention-to-treat (ITT) analysis keeps every randomized patient in their originally assigned group, regardless of what happened afterward. This preserves the benefit of randomization and gives a pragmatic, real-world estimate of effect.\n\nPer-protocol analysis includes only patients who adhered to the protocol. It can exaggerate efficacy and break randomization. For superiority trials, ITT is conservative and preferred; for non-inferiority trials, both analyses should agree.' },
          { id: 'l6', title: 'Knowledge check: Bias', kind: 'quiz', questions: [
            { q: 'Which analysis preserves the benefit of randomization?', options: ['Per-protocol', 'Intention-to-treat', 'As-treated', 'Subgroup analysis'], answer: 1 },
            { q: 'Blinding primarily reduces which type of bias?', options: ['Selection bias', 'Performance & detection bias', 'Attrition bias', 'Publication bias'], answer: 1 }
          ] }
        ]
      },
      {
        id: 'mod3', title: 'Module 3 — Endpoints & Statistics',
        lessons: [
          { id: 'l7', title: 'OS, PFS and surrogate endpoints', kind: 'video', url: '', duration: '13:40' },
          { id: 'l8', title: 'Hazard ratios & confidence intervals', kind: 'article', body: 'A hazard ratio (HR) of 0.70 means a 30% relative reduction in the rate of the event at any given moment. But relative measures can mislead: always ask about the absolute difference and the baseline risk.\n\nThe 95% confidence interval (CI) tells you the precision. If the CI for an HR crosses 1.0, the result is not statistically significant. A wide CI signals an underpowered or small trial. Never read the point estimate without its interval.' },
          { id: 'l9', title: 'Final assessment', kind: 'quiz', questions: [
            { q: 'A hazard ratio of 0.65 (95% CI 0.52–0.81) indicates:', options: ['A non-significant result', 'A significant 35% relative risk reduction', 'A 65% increase in risk', 'An underpowered study'], answer: 1 },
            { q: 'Overall survival is generally considered:', options: ['A surrogate endpoint', 'The most robust efficacy endpoint', 'Less reliable than PFS', 'Only relevant in phase I'], answer: 1 },
            { q: 'A confidence interval crossing 1.0 for a hazard ratio means:', options: ['Strong benefit', 'Not statistically significant', 'Definite harm', 'Perfect precision'], answer: 1 }
          ] }
        ]
      }
    ]
  },
  {
    id: 'c-stats',
    title: 'Biostatistics for the Practising Oncologist',
    level: 'Intermediate',
    banner: 'linear-gradient(135deg,#0ea5a6,#7cb518)',
    summary: 'Demystifying the statistics behind oncology trials — p-values, power, survival analysis and how to spot statistical spin.',
    hours: 4,
    modules: [
      {
        id: 'smod1', title: 'Module 1 — Foundations',
        lessons: [
          { id: 'sl1', title: 'p-values and what they really mean', kind: 'video', url: '', duration: '09:15' },
          { id: 'sl2', title: 'Type I & Type II error, power', kind: 'article', body: 'A Type I error (α) is a false positive — concluding a treatment works when it does not. A Type II error (β) is a false negative — missing a real effect. Statistical power (1 − β) is the probability of detecting a true effect, conventionally set at 80–90%.\n\nUnderpowered trials are common in oncology and frequently produce "negative" results that are really inconclusive. When a trial reports no significant difference, always ask: was it powered to find one?' }
        ]
      },
      {
        id: 'smod2', title: 'Module 2 — Survival Analysis',
        lessons: [
          { id: 'sl3', title: 'Reading Kaplan–Meier curves', kind: 'video', url: '', duration: '10:30' },
          { id: 'sl4', title: 'Quiz: Survival analysis', kind: 'quiz', questions: [
            { q: 'The number at risk on a KM curve helps you judge:', options: ['Statistical spin', 'Reliability of the tail of the curve', 'The p-value', 'The hazard ratio directly'], answer: 1 }
          ] }
        ]
      }
    ]
  }
]
