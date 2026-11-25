<script lang="ts">
  import sysdiag from "../../lib/assets/daybreak_system.svg";
  import sun_normal from "../../lib/assets/sun_normal.png";
  import mon_late from "../../lib/assets/mon_late.png";
  import alarm_override from "../../lib/assets/alarm_override.png";
  const abstract = `Daybreak is a web-based demo of an adaptive alarm aimed at university students balancing a varied daily lecture schedule with occasional late nights. It is designed to improve sleep regularity while also allowing flexibility for sleep duration after late nights, as evidence suggests regularity and duration are both important for health (Sletten et al., 2023). Users configure a preferred and latest alarm per day, as well as limits for automatic and user-confirmed alarm adjustments. Small changes are typically made automatically, whereas larger changes require user approval, and the user can make a one-off change to the alarm using an override feature. This project develops the mixed-initiative proposal from the literature review into a deterministic interaction, with the level of automation chosen based on the size of the proposed adjustment.`;
  const sections = [
    {
      title: "Problem and scope",
      paragraphs: [
        `University students often have irregular sleep patterns, which is linked to poorer academic performance (Phillips et al., 2017). This project investigates how an adaptive alarm could improve sleep regularity while allowing some flexibility in sleep duration and maintaining user control.`,
        `Sletten et al. (2023) recommend consistent sleep and wakeup times, but also recognise the potential benefits of catch-up sleep on non-work days following insufficient sleep during the week. This suggests that some flexibility in wakeup times may be beneficial.`,
        `Lu et al. (2024) studied 223 undergraduates over approximately 30 days, finding that later activity start times were associated with later wakeup times and longer sleep duration, whereas later finishes were associated with later bedtimes and shorter sleep duration. An adaptive alarm should therefore consider both sleep duration and the student's daily commitments.`,
        `Previously, a system was proposed which uses contextual information to recommend alarm times, while allowing users to approve significant changes and correct assumptions. The developed prototype, Daybreak, uses a manually configured weekly schedule and simulated bedtime to investigate how this approach might work.`,
        `The system uses a deterministic policy rather than a learning system. This makes its behaviour predictable, explainable and independently testable, which would be particularly suitable for a future iteration that integrates sleep sensing or calendar data.`,
      ],
    },
    {
      title: "Levels of automation and control",
      paragraphs: [
        `Parasuraman et al. (2000) propose four classes of automated functions: acquisition, analysis, decision, and action. Horvitz (1999) additionally recognises the benefits of combining automation with direct user manipulation. Daybreak automatically calculates suitable alarm times and makes small adjustments, but requires confirmation for larger changes. Requiring confirmation for all changes would reduce the utility of automation, whereas complete automation could lead to undesirable changes.`,
        `Users specify a preferred and latest alarm time for each day of the week. The preferred time encourages a regular routine, whereas the latest time allows users to account for commitments. Users also specify how much the alarm can change automatically, and how much it can change with confirmation.`,
        `Users can also make one-off manual changes through the override feature, allowing them to account for exceptional circumstances without modifying their usual settings. This follows Amershi et al.'s (2019) guidelines on efficient correction and user control. The override currently remains active until manually cleared, but would automatically expire after the alarm sounds in a full implementation.`,
      ],
    },
    {
      title: "Alarm policy",
      paragraphs: [
        `The system estimates sleep duration as the time between the simulated bedtime and the following morning's preferred alarm. If the difference between this duration and the user's sleep target reaches a specified threshold, the alarm is delayed by a proportion of the deficit. This automatic adjustment is limited by the configured maximum adjustment and latest alarm time. By default, the threshold is 45 minutes, the deficit proportion is 1/3, and the maximum automatic adjustment is 20 minutes.`,
        `A 45-minute threshold avoids unnecessary adjustments for small sleep deficits, and scaling the deficit by 1/3 means regularity is prioritised but some duration can still be recovered after late nights. The user can control both of these settings in the Advanced section.`,
        `The system also calculates a recommended alarm time using the same proportion but a higher maximum, which defaults to 45 minutes. If this time is later than the automatic adjustment, the system displays the recommendation, and the user can choose whether to accept it. Rejecting or ignoring a proposed change retains the automatically adjusted time, preserving the user's previously authorised level of automation while ensuring that larger changes require explicit consent.`,
      ],
    },
    {
      title: "Trust and transparency",
      paragraphs: [
        `Parasuraman and Riley (1997) recognise the problems associated with both excessive and insufficient trust in automation, while Bansal et al. (2019) show the importance of users' mental models of system capabilities. Daybreak therefore displays the preferred and latest alarm times, adjustment limits and estimated sleep duration alongside the calculated alarm. This allows users to understand how their settings affect the system's decisions.`,
        `Lim et al. (2009) found that explaining system behaviour improved user understanding, and Yang and Newman (2013) found that users became frustrated when an automated system could not understand their intent. Explanations should therefore be accompanied by a way to correct undesirable behaviour. Daybreak explains why adjustments are made and allows users to modify the constraints used to calculate them, or override the alarm entirely. Unlike the system proposed by Kulesza et al. (2015), these corrections modify explicit settings rather than a learned model.`,
        `The prototype also includes a demonstration page, where users can adjust their simulated bedtime using a slider and immediately see the resulting alarm time. This uses the same calculation as the main alarm, allowing users to explore how the system behaves under different circumstances. Evaluation could investigate whether this improves understanding, particularly of the distinction between automatic adjustments and those requiring confirmation.`,
      ],
    },
    {
      title: "Interaction design and development reflection",
      paragraphs: [
        `The next alarm time is displayed prominently, and feedback is provided when a recommendation is accepted. Less frequently used settings, such as the adjustment threshold and proportion, are placed in an advanced settings section to reduce complexity, but are still possible to modify for maximum user control. Constraints on sliders and schedule inputs prevent users from selecting invalid combinations of settings. The interface also supports keyboard navigation, screen reader announcements and reduced motion, and has been designed for visual clarity with large, simple UI elements.`,
        `Development initially focused on demonstrating the alarm calculation, before introducing confirmation controls and configurable adjustment limits. The calculation is separate from the interface, allowing the same logic to be used throughout the prototype and tested independently. Automated tests cover adjustment thresholds, limits, manual overrides, confirmation and calculations across midnight. Settings are stored locally so that they persist between sessions.`,
        `An important consideration during development was determining how different forms of user control interact. In particular, it was important to clarify which morning an adjustment applies to, and to decide a suitable order of precedence for user settings. To clarify when the alarm will sound, the system displays "in X hours" when the alarm is scheduled for less than 10 hours from the current time, and a manually configured one-off alarm has maximum precedence. These decisions, among others, should be evaluated with users before introducing further automation, such as calendar integration or sleep detection.`,
        `An initial evaluation could compare a fixed alarm with the adaptive alarm across a series of scenarios - for example, participants could be asked to predict alarm times and correct undesirable recommendations. A longer-term study could investigate the alarm's impact on sleep regularity, duration, and quality.`,
      ],
    },
  ];
  const count = (text: string) => text.trim().split(/\s+/u).length;
  const abstractCount = count(abstract);
  const mainCount = count(
    sections.map((s) => [s.title, ...s.paragraphs].join(" ")).join(" "),
  );
  const repository = "https://github.com/ivanoconnor/iis-a2";
  const baseline = "8cfde53404c7bfa1bfaa53e4e45aa6d3b2b65bff";
  const references = [
    {
      author: "Amershi, S. et al. (2019)",
      title: "Guidelines for Human-AI Interaction.",
      venue: "CHI ’19.",
      doi: "10.1145/3290605.3300233",
    },
    {
      author: "Bansal, G. et al. (2019)",
      title:
        "Beyond accuracy: The role of mental models in Human-AI team performance.",
      venue: "HCOMP, 7, 2–11.",
      doi: "10.1609/hcomp.v7i1.5285",
    },
    {
      author: "Horvitz, E. (1999)",
      title: "Principles of mixed-initiative user interfaces.",
      venue: "CHI ’99, 159–166.",
      doi: "10.1145/302979.303030",
    },
    {
      author: "Kulesza, T., Burnett, M., Wong, W.-K. and Stumpf, S. (2015)",
      title:
        "Principles of explanatory debugging to personalize interactive machine learning.",
      venue: "IUI ’15, 126–137.",
      doi: "10.1145/2678025.2701399",
    },
    {
      author: "Lim, B.Y., Dey, A.K. and Avrahami, D. (2009)",
      title:
        "Why and why not explanations improve the intelligibility of context-aware intelligent systems.",
      venue: "CHI ’09.",
      doi: "10.1145/1518701.1519023",
    },
    {
      author: "Lu, S., Stone, J.E., Klerman, E.B. et al. (2024)",
      title:
        "The organization of sleep–wake patterns around daily schedules in college students.",
      venue: "Sleep, 47(9), zsad278. Published online 1 November 2023.",
      doi: "10.1093/sleep/zsad278",
    },
    {
      author: "Parasuraman, R. and Riley, V. (1997)",
      title: "Humans and automation: Use, misuse, disuse, abuse.",
      venue: "Human Factors, 39(2), 230–253.",
      doi: "10.1518/001872097778543886",
    },
    {
      author: "Parasuraman, R., Sheridan, T.B. and Wickens, C.D. (2000)",
      title:
        "A model for types and levels of human interaction with automation.",
      venue:
        "IEEE Transactions on Systems, Man, and Cybernetics — Part A, 30(3), 286–297.",
      doi: "10.1109/3468.844354",
    },
    {
      author: "Phillips, A.J.K. et al. (2017)",
      title:
        "Irregular sleep/wake patterns are associated with poorer academic performance and delayed circadian and sleep/wake timing.",
      venue: "Scientific Reports, 7, 3216.",
      doi: "10.1038/s41598-017-03171-4",
    },
    {
      author: "Sletten, T.L., Weaver, M.D., Foster, R.G. et al. (2023)",
      title:
        "The importance of sleep regularity: A consensus statement of the National Sleep Foundation sleep timing and variability panel.",
      venue: "Sleep Health, 9(6).",
      doi: "10.1016/j.sleh.2023.07.016",
    },
    {
      author: "Yang, R. and Newman, M.W. (2013)",
      title:
        "Learning from a learning thermostat: lessons for intelligent systems for the home.",
      venue: "UbiComp ’13, 93–102.",
      doi: "10.1145/2493432.2493489",
    },
  ];
</script>

<svelte:head>
  <title>Daybreak — Project report</title>
  <meta
    name="description"
    content="Assignment 2 report: design rationale, system architecture and interaction evidence for Daybreak."
  />
</svelte:head>

<div class="report-view">
  <div class="report-tools" aria-label="Report actions">
    <a href="../">Open alarm demo</a>
    <span>A4 · system print dialogue · save as PDF</span>
    <button onclick={() => window.print()}>Print report</button>
  </div>
  <aside class="draft-notes" aria-label="Draft preparation notes">
    <strong>Before submission</strong>
    <p>
      Add your name/ID and storyboards; replace the baseline commit with the
      submitted commit. Verify the concepts against Weeks 1–4 lecture materials
      (not supplied here), check references, and complete the README’s
      project-status, AI-assistance and prose word-count requirements. This
      checklist is hidden when printing.
    </p>
  </aside>

  <main class="report-document">
    <header class="report-heading">
      <h1>Daybreak</h1>
      <p class="report-subtitle">
        Balancing a regular waking routine with bounded adaptation
      </p>
      <p class="word-count pt-2">
        {abstractCount + mainCount} words - abstract: {abstractCount}, main: {mainCount}
      </p>
    </header>

    <section class="abstract" aria-labelledby="abstract-heading">
      <h2 id="abstract-heading">Abstract</h2>
      <p>{abstract}</p>
    </section>
    {#each sections as section}
      <section class="rationale">
        <h2>{section.title}</h2>
        {#each section.paragraphs as paragraph}<p>{paragraph}</p>{/each}
      </section>
    {/each}

    <section class="architecture" aria-labelledby="architecture-heading">
      <h2 id="architecture-heading">System diagram</h2>
      <figure>
        <img src={sysdiag} />
      </figure>
    </section>

    <section class="storyboards" aria-labelledby="storyboard-heading">
      <h2 id="storyboard-heading">Storyboards and illustrated interaction</h2>
      {#each [["Routine night", "Sunday 23:45 · Monday preferred 08:00 · target 8h", "Predicted sleep is greater than 8h, so no adjustment is made", sun_normal], ["Late night and confirmation", "Tuesday 01:00 · preferred 07:00 · latest 07:45", "Adjusts by 20m automatically. Asks for permission to adjust by 40m", mon_late], ["Exceptional early start", "Edit next alarm · choose 05:30 · Save", "Manually set 05:30 alarm overrides regular schedule and adjustments", alarm_override]] as [title, setup, sequence, imgvar]}
        <figure class="storyboard-slot">
          <h3>{title}</h3>
          <p>{setup}</p>
          <!-- <div class="drawing-space">[ Add illustrated sequence here ]</div> -->
          <img src={imgvar} />
          <figcaption>{sequence}</figcaption>
        </figure>
      {/each}
    </section>

    <section class="evidence" aria-labelledby="evidence-heading">
      <h2 id="evidence-heading">Repository and development evidence</h2>
      <dl>
        <dt>Repository</dt>
        <dd><a href={repository}>{repository}</a></dd>
        <dt>README / development record</dt>
        <dd>
          <a href={`${repository}/blob/main/README.md#development-record`}
            >README.md — Development record</a
          >
        </dd>
        <dt>Implementation baseline reviewed</dt>
        <dd><a href={`${repository}/tree/${baseline}`}>{baseline}</a></dd>
      </dl>
    </section>

    <section class="references" aria-labelledby="references-heading">
      <h2 id="references-heading">References</h2>
      <ol>
        {#each references as reference}<li>
            {reference.author}. <em>{reference.title}</em>
            {reference.venue}
            <a href={`https://doi.org/${reference.doi}`}>doi:{reference.doi}</a>
          </li>{/each}
      </ol>
    </section>
  </main>
</div>

<style>
  .report-view {
    background: #e9edf2;
    min-height: 100vh;
    padding: 1.5rem;
    color: #17202c;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 1rem;
    line-height: 1.65;
  }
  .report-tools,
  .draft-notes {
    max-width: 850px;
    margin: 0 auto 1rem;
    font-family: "Segoe UI", Arial, sans-serif;
  }
  .report-tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.9rem;
  }
  .report-tools span {
    color: #475569;
  }
  .report-tools button {
    border: 0;
    background: #17344f;
    color: white;
    border-radius: 5px;
    padding: 0.65rem 1rem;
  }
  a {
    color: #174e78;
    text-decoration: underline;
    text-underline-offset: 3px;
    overflow-wrap: anywhere;
  }
  .draft-notes {
    background: #fff;
    border-left: 4px solid #54718c;
    padding: 1rem 1.25rem;
    font-size: 0.9rem;
  }
  .draft-notes p {
    margin-top: 0.3rem;
  }
  .report-document {
    display: block;
    grid-column: auto;
    max-width: 850px;
    width: 100%;
    padding: 65px 75px;
    margin: 0 auto;
    background: white;
    box-shadow: 0 3px 24px #17202c12;
  }
  .report-heading {
    border-bottom: 2px solid #17344f;
    padding-bottom: 1.5rem;
    margin-bottom: 1.7rem;
  }
  .report-kicker,
  .word-count,
  .count-note,
  .author {
    font-family: "Segoe UI", Arial, sans-serif;
  }
  .report-kicker {
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  h1 {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 3.3rem;
    line-height: 1.2;
    letter-spacing: -0.04em;
    font-weight: 600;
    margin: 0.6rem 0;
  }
  .report-subtitle {
    font-size: 1.3rem;
    line-height: 1.4;
  }
  .author {
    margin: 1rem 0;
  }
  .word-count {
    font-size: 0.9rem;
    font-weight: 600;
  }
  .count-note {
    font-size: 0.8rem;
    color: #475569;
    margin-top: 0.4rem;
  }
  h2 {
    font-family: "Segoe UI", Arial, sans-serif;
    color: #17344f;
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: 0;
    margin: 1.7rem 0 0.7rem;
    break-after: avoid;
  }
  h3 {
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 1rem;
    font-weight: 650;
    margin: 0;
  }
  .rationale p + p {
    margin-top: 0.75rem;
  }
  p {
    orphans: 3;
    widows: 3;
  }
  .abstract {
    padding-bottom: 0.7rem;
  }
  figure {
    margin: 0;
  }
  .architecture,
  .storyboards {
    margin-top: 2.5rem;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
    margin: 1rem 0;
  }
  .diagram-node rect {
    fill: #f1f5f9;
    stroke: #334155;
    stroke-width: 1.5;
    rx: 8px;
  }
  .diagram-node .simulated {
    fill: #fff;
    stroke-dasharray: 6 4;
  }
  svg text {
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 17px;
    text-anchor: middle;
    fill: #17202c;
  }
  svg .node-tag {
    font-size: 13px;
    font-weight: 700;
    fill: #334155;
    letter-spacing: 0.5px;
  }
  svg .node-detail,
  svg .flow-label {
    font-size: 14px;
  }
  .architecture-notes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    font:
      0.85rem/1.5 "Segoe UI",
      Arial,
      sans-serif;
  }
  .architecture-notes div {
    border: 1px solid #334155;
    padding: 0.7rem;
  }
  .architecture-notes .planned {
    border-style: dashed;
  }
  .architecture-notes strong,
  .architecture-notes span {
    display: block;
  }
  figcaption,
  .short-caption {
    font:
      0.85rem/1.5 "Segoe UI",
      Arial,
      sans-serif;
    color: #334155;
    margin-top: 0.7rem;
  }
  .storyboard-slot {
    border: 1px dashed #64748b;
    padding: 1rem;
    margin: 1rem 0;
    break-inside: avoid;
  }
  .storyboard-slot p {
    font:
      0.85rem/1.5 "Segoe UI",
      Arial,
      sans-serif;
    margin-top: 0.25rem;
  }
  .drawing-space {
    height: 100px;
    display: grid;
    place-items: center;
    color: #64748b;
    font:
      0.85rem "Segoe UI",
      Arial,
      sans-serif;
  }
  dl,
  .commit-links,
  .references ol {
    font-size: 0.9rem;
  }
  dt {
    font-weight: bold;
    margin-top: 0.7rem;
  }
  dd {
    margin-left: 0;
  }
  ul,
  ol {
    padding-left: 1.3rem;
    margin: 1rem 0;
  }
  li {
    margin-bottom: 0.65rem;
  }
  .references li {
    break-inside: avoid;
  }
  @media (max-width: 650px) {
    .report-view {
      padding: 0.75rem;
    }
    .report-document {
      padding: 2rem 1.25rem;
    }
    .report-tools {
      flex-wrap: wrap;
    }
    .report-tools span {
      order: 3;
      flex-basis: 100%;
    }
    .architecture-notes {
      grid-template-columns: 1fr;
    }
  }
  @media print {
    @page {
      size: A4;
      margin: 18mm 19mm;
    }
    .report-view {
      padding: 0;
      background: white;
      color: black;
      font-size: 10.5pt;
      line-height: 1.5;
    }
    .report-tools,
    .draft-notes {
      display: none;
    }
    .report-document {
      max-width: none;
      width: auto;
      padding: 0;
      margin: 0;
      box-shadow: none;
    }
    h1 {
      font-size: 32pt;
    }
    h2 {
      font-size: 12pt;
      margin-top: 15pt;
    }
    .report-heading {
      margin-bottom: 14pt;
      padding-bottom: 12pt;
    }
    .report-subtitle {
      font-size: 14pt;
    }
    .report-kicker,
    .word-count,
    .count-note,
    .author {
      font-size: 9pt;
    }
    .architecture,
    .storyboards,
    .evidence {
      break-before: page;
      margin-top: 0;
    }
    .architecture h2,
    .storyboards h2,
    .evidence h2 {
      margin-top: 0;
    }
    .architecture figure {
      break-inside: avoid;
    }
    svg {
      max-height: 175mm;
    }
    .architecture-notes {
      grid-template-columns: 1fr 1fr;
      font-size: 9pt;
    }
    .drawing-space {
      height: 29mm;
    }
    .storyboard-slot {
      padding: 10pt;
      margin: 12pt 0;
    }
    figcaption,
    .short-caption,
    .storyboard-slot p {
      font-size: 9pt;
    }
    a {
      color: black;
    }
    dl,
    .commit-links,
    .references ol {
      font-size: 9pt;
    }
    .references h2 {
      break-after: avoid;
    }
  }
</style>
