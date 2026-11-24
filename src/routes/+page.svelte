<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '#lib/Icon.svelte';
  import { computeAlarm, demoContext, days, defaultSchedule, duration, minutes, timeString, type DaySchedule } from '#lib/alarm.ts';
  import { alarmPolicy as defaultAlarmPolicy } from '#lib/alarm.ts';

  type Screen = 'home' | 'schedule' | 'preferences' | 'demo';
  const navigation: { id: Screen; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' }, { id: 'schedule', label: 'Schedule', icon: 'schedule' },
    { id: 'preferences', label: 'Preferences', icon: 'preferences' }, { id: 'demo', label: 'Demo', icon: 'demo' }
  ];
  let screen = $state<Screen>('home');
  let schedule = $state<DaySchedule[]>(defaultSchedule());
  let target = $state(8 * 60);
  let alarmPolicy = $state({ ...defaultAlarmPolicy });
  let maximumAdjustment = $derived(Math.min(Math.floor((90 * alarmPolicy.deficitScale)/5) * 5, 45));
  let maximum = $state(20);
  let maximumConfirmed = $state(45);
  let confirmation = $state<{ key: string; accepted: boolean } | null>(null);
  let override = $state<string | null>(null);
  let ready = $state(false);
  let night = $state(0);
  let bedtime = $state(23 * 60);
  let editDialog: HTMLDialogElement;
  let draftTime = $state('07:00');
  let context = $derived(demoContext(night, bedtime));
  let morning = $derived(context.morning);
  let confirmationKey = $derived(JSON.stringify([night, bedtime, target, maximum, maximumConfirmed, schedule[morning], override, alarmPolicy]));
  let decision = $derived(confirmation?.key === confirmationKey ? confirmation.accepted : null);
  let result = $derived(computeAlarm(bedtime, target, maximum, schedule[morning], override, alarmPolicy, { maximumConfirmed, accepted: decision === true }));
  let hourAngle = $derived(minutes(result.time) / 60 * 30);
  let minuteAngle = $derived(minutes(result.time) % 60 * 6);

  onMount(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('daybreak-settings') || 'null');
      if (saved) {
        if (Number.isInteger(saved.alarmPolicy?.adjustmentThresholdMinutes) && saved.alarmPolicy.adjustmentThresholdMinutes >= 0 && saved.alarmPolicy.adjustmentThresholdMinutes <= 180) alarmPolicy.adjustmentThresholdMinutes = saved.alarmPolicy.adjustmentThresholdMinutes;
        if (Number.isFinite(saved.alarmPolicy?.deficitScale) && saved.alarmPolicy.deficitScale >= 0 && saved.alarmPolicy.deficitScale <= 1) alarmPolicy.deficitScale = saved.alarmPolicy.deficitScale;
        if (Array.isArray(saved.schedule) && saved.schedule.length === 7 && saved.schedule.every((d: DaySchedule) => /^([01]\d|2[0-3]):[0-5]\d$/.test(d.preferred) && /^([01]\d|2[0-3]):[0-5]\d$/.test(d.latest) && d.latest >= d.preferred)) schedule = saved.schedule;
        if (Number.isInteger(saved.target) && saved.target >= 4 * 60 && saved.target <= 12 * 60) target = saved.target;
        if (Number.isInteger(saved.maximum) && saved.maximum >= 0 && saved.maximum <= 60 && saved.maximum % 5 === 0) maximum = saved.maximum <= maximumAdjustment ? saved.maximum : 0;
        if (Number.isInteger(saved.maximumConfirmed) && saved.maximumConfirmed >= 0 && saved.maximumConfirmed <= 60 && saved.maximumConfirmed % 5 === 0) maximumConfirmed = saved.maximumConfirmed;
        if (typeof saved.confirmation?.key === 'string' && typeof saved.confirmation.accepted === 'boolean') confirmation = saved.confirmation;
        const savedOverride = typeof saved.override === 'string' ? saved.override : saved.override?.time;
        if (typeof savedOverride === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(savedOverride)) override = savedOverride;
        if (Number.isInteger(saved.night) && saved.night >= 0 && saved.night <= 6) night = saved.night;
        if (Number.isInteger(saved.bedtime) && saved.bedtime >= 21 * 60 && saved.bedtime <= 27 * 60 && saved.bedtime % 5 === 0) bedtime = saved.bedtime;
      }
    } catch { /* Keep defaults if local settings are unavailable. */ }
    ready = true;
  });
  $effect(() => {
    if (ready) try { localStorage.setItem('daybreak-settings', JSON.stringify({ schedule, target, maximum, maximumConfirmed, confirmation, override, night, bedtime, alarmPolicy })); } catch { /* Settings remain usable in memory. */ }
  });
  $effect(() => {
    if (maximum > maximumAdjustment) maximum = maximumAdjustment;
  });
  // A decision applies only to the current night and settings, even if a slider is later moved back.
  $effect(() => {
    if (confirmation && confirmation.key !== confirmationKey) confirmation = null;
  });
  function updateDay(index: number, field: 'preferred' | 'latest', value: string) {
    if (!value) return;
    const day = { ...schedule[index], [field]: value };
    if (day.latest < day.preferred) {
      if (field === 'preferred') day.latest = value; else day.preferred = value;
    }
    schedule[index] = day;
  }
  function openEdit() { draftTime = result.time; editDialog.showModal(); }
  function saveOverride(event: SubmitEvent) {
    event.preventDefault();
    override = draftTime;
    editDialog.close();
  }
</script>

{#snippet alarmConfirmation()}
  {#if result.proposal}
    <section class="surface confirmation-card" aria-label="Alarm adjustment confirmation" aria-live="polite">
      {#if decision === null}
        <h2>Sleep a little longer?</h2>
        <p>Move your alarm to <strong>{result.proposal.time}</strong> (+{result.proposal.adjustment} min from your preferred time)?</p>
        <p>If you reject or ignore this suggestion, your alarm stays at {result.time} (+{result.adjustment} min).</p>
        <div class="confirmation-actions"><button class="primary-button" onclick={() => confirmation = { key: confirmationKey, accepted: true }}>Accept adjustment</button><button class="text-button" onclick={() => confirmation = { key: confirmationKey, accepted: false }}>Reject adjustment</button></div>
      {:else}
        <h2>{decision ? 'Adjustment accepted' : 'Automatic adjustment kept'}</h2>
        <p>{decision ? `Your alarm is set to ${result.time} (+${result.adjustment} min) with your permission.` : `Your alarm stays at ${result.time} (+${result.adjustment} min).`}</p>
      {/if}
    </section>
  {/if}
{/snippet}

<svelte:head><title>Daybreak — Adaptive alarm</title><meta name="description" content="A simple adaptive alarm clock with a weekly schedule and an interactive sleep demo." /><meta name="theme-color" content="#f8f7f3" /></svelte:head>

<div class="app-shell">
  <aside class="sidebar">
    <a class="brand" href="#home" onclick={() => screen = 'home'} aria-label="Daybreak home"><span class="brand-mark"><Icon name="sun" size={26} /></span>daybreak<span class="brand-dot">.</span></a>
    <nav aria-label="Main navigation">
      {#each navigation as item}
        <button class:active={screen === item.id} onclick={() => screen = item.id} aria-current={screen === item.id ? 'page' : undefined}><span class="nav-icon"><Icon name={item.icon} size={22} /></span><span>{item.label}</span></button>
      {/each}
    </nav>
  </aside>

  <main class="min-w-0">
    <header class="page-header"><h1>{screen === 'home' ? 'Your next morning' : navigation.find(n => n.id === screen)?.label}</h1><span class="header-date">{days[context.currentDay]}, {timeString(bedtime)}</span></header>

    {#if screen === 'home'}
      <section class="alarm-card" aria-label="Next alarm">
        <div class="alarm-details">
          <div class="eyebrow"><Icon name="alarm" size={20} /><span>Next alarm</span></div>
          <div class="alarm-time">{result.time}</div>
          <div class="alarm-date">{context.alarmDayLabel}{#if result.sleep <= 10 * 60}<span class="time-until">in {duration(result.sleep)}</span>{/if}</div>
          <div class="alarm-actions"><button class="primary-button" onclick={openEdit}><Icon name="edit" size={18} />Edit alarm</button>{#if override}<button class="text-button" onclick={() => override = null}>Clear override</button>{/if}</div>
        </div>
        <div class="clock" aria-label={`Analog clock showing ${result.time}`} role="img">
          {#each Array.from({ length: 12 }, (_, i) => i) as tick}<span class="clock-tick" style={`--angle:${tick * 30}deg`}></span>{/each}
          <span class="clock-number twelve">12</span><span class="clock-number three">3</span><span class="clock-number six">6</span><span class="clock-number nine">9</span>
          <span class="clock-hand hour" style={`transform:translateX(-50%) rotate(${hourAngle}deg)`}></span><span class="clock-hand minute" style={`transform:translateX(-50%) rotate(${minuteAngle}deg)`}></span><span class="clock-pin"></span>
        </div>
      </section>

      {@render alarmConfirmation()}

      <section class="week-section">
        <div class="section-heading"><h2>Your week</h2><button class="text-button" onclick={() => screen = 'schedule'}>Edit schedule<Icon name="arrow" size={18} /></button></div>
        <div class="week-grid">
          {#each schedule as day, i}<button class="day-card" class:next-day={i === morning} onclick={() => screen = 'schedule'} aria-label={`${days[i]}, preferred alarm ${day.preferred}, edit schedule`}><span class="day-label">{days[i].slice(0, 3)}</span><Icon name={i < 5 ? 'alarm' : 'sun'} size={21} /><span class="day-time">{day.preferred}</span></button>{/each}
        </div>
      </section>

      <div class="home-settings-grid">
        <button class="summary-card" onclick={() => screen = 'preferences'}><span class="summary-icon"><Icon name="moon" size={25} /></span><span class="summary-content"><span class="summary-label">Sleep target</span><strong>{duration(target)}<span>per night</span></strong></span><Icon name="chevron" size={20} /></button>
        <button class="summary-card" onclick={() => screen = 'preferences'}><span class="summary-icon"><Icon name="preferences" size={25} /></span><span class="summary-content"><span class="summary-label">Auto adjustment</span><strong>{maximum} min<span>maximum</span></strong></span><Icon name="chevron" size={20} /></button>
      </div>
    {:else if screen === 'schedule'}
      <section class="surface schedule-surface">
        <div class="schedule-row schedule-labels"><span>Day</span><span>Preferred alarm</span><span>Latest alarm</span></div>
        {#each schedule as day, i}<div class="schedule-row"><span class="schedule-day">{days[i]}</span><input type="time" aria-label={`${days[i]} preferred alarm`} value={day.preferred} onchange={e => updateDay(i, 'preferred', e.currentTarget.value)} /><input type="time" aria-label={`${days[i]} latest alarm`} value={day.latest} onchange={e => updateDay(i, 'latest', e.currentTarget.value)} /></div>{/each}
        <p class="setting-note">Automatic and confirmed adjustments never go beyond your latest alarm.</p>
      </section>
    {:else if screen === 'preferences'}
      <div class="preferences-stack">
        <section class="surface preference-card"><div class="section-heading"><h2><Icon name="moon" size={23} />Target sleep duration</h2><span class="value-pill">{duration(target)}</span></div><label class="sr-only" for="sleep-target">Target sleep duration</label><input id="sleep-target" type="range" min={4 * 60} max={12 * 60} step="15" bind:value={target} /><div class="range-labels"><span>4 hours</span><span>12 hours</span></div><p class="setting-note">7–9 hours is recommended for most adults.</p></section>
        <section class="surface preference-card"><div class="section-heading"><h2><Icon name="preferences" size={23} />Maximum auto adjustment</h2><span class="value-pill">{maximum} min</span></div><label class="sr-only" for="max-adjustment">Maximum auto adjustment</label><input id="max-adjustment" type="range" min="0" max={maximumAdjustment} step="5" bind:value={maximum} aria-valuetext="{maximum} min" /><div class="range-labels"><span>0 min</span><span>{maximumAdjustment} min</span></div><div class="preference-explanation"><p>Your alarm will never move earlier than your preferred time.</p><p>To keep your wake-up time consistent, most bedtime variations won't change your alarm. Adjustments start only when your estimated sleep falls at least {alarmPolicy.adjustmentThresholdMinutes} minutes short of your target.</p></div></section>
        <section class="surface preference-card">
          <div class="section-heading"><h2><Icon name="preferences" size={23} />Maximum adjustment with confirmation</h2><span class="value-pill">{maximumConfirmed} min</span></div>
          <label class="sr-only" for="max-confirmed-adjustment">Maximum adjustment with confirmation</label>
          <input id="max-confirmed-adjustment" type="range" min="0" max="60" step="5" bind:value={maximumConfirmed} aria-valuetext={`${maximumConfirmed} minutes`} />
          <div class="range-labels"><span>0 min</span><span>60 min</span></div>
          <p class="setting-note">For larger bedtime changes, we'll ask before moving your alarm beyond the automatic limit. This is the total adjustment from your preferred time, capped by your latest alarm. Without your acceptance, the automatic adjustment stays in place.</p>
        </section>
        <details class="surface preference-card advanced-preferences">
          <summary>Advanced</summary>
          <div class="advanced-setting">
            <div class="section-heading"><label for="adjustment-threshold">Adjustment threshold</label><span class="value-pill">{alarmPolicy.adjustmentThresholdMinutes} min</span></div>
            <input id="adjustment-threshold" type="range" min="0" max="180" step="1" bind:value={alarmPolicy.adjustmentThresholdMinutes} aria-describedby="threshold-description" aria-valuetext={`${alarmPolicy.adjustmentThresholdMinutes} minutes`} />
            <div class="range-labels"><span>0 min</span><span>180 min</span></div>
            <p id="threshold-description" class="setting-note">Start adjusting only when estimated sleep is this many minutes below your target.</p>
          </div>
          <div class="advanced-setting">
            <div class="section-heading"><label for="deficit-scale">Deficit scale</label><span class="value-pill">{Number((alarmPolicy.deficitScale * 100).toFixed(2))}%</span></div>
            <input id="deficit-scale" type="range" min="0" max="1" step="0.001" bind:value={alarmPolicy.deficitScale} aria-describedby="scale-description" aria-valuetext={`${Number((alarmPolicy.deficitScale * 100).toFixed(2))} percent`} />
            <div class="range-labels"><span>0%</span><span>100%</span></div>
            <p id="scale-description" class="setting-note">The share of missing sleep added to your alarm, rounded down to five minutes and capped by your adjustment limits and latest alarm. Lowering this also reduces the available automatic adjustment limit.</p>
          </div>
        </details>
      </div>
    {:else}
      <div class="demo-grid">
        <section class="surface demo-controls"><h2>Plan a night</h2><label class="field-label" for="night">Night of the week</label><select id="night" bind:value={night}>{#each days as day, i}<option value={i}>{day} night</option>{/each}</select><div class="section-heading bedtime-heading"><label class="field-label" for="bedtime">Bedtime</label><span class="bedtime-value">{timeString(bedtime)}</span></div><input id="bedtime" type="range" min={21 * 60} max={27 * 60} step="5" bind:value={bedtime} /><div class="range-labels"><span>21:00</span><span>03:00</span></div><div class="demo-config"><div><span>Target sleep</span><strong>{duration(target)}</strong></div><div><span>{days[morning]} preferred</span><strong>{schedule[morning].preferred}</strong></div><div><span>{days[morning]} latest</span><strong>{schedule[morning].latest}</strong></div><div><span>Maximum auto adjustment</span><strong>{maximum} min</strong></div><div><span>Maximum with confirmation</span><strong>{maximumConfirmed} min</strong></div>{#if override}<div><span>Manual override</span><strong>{override}</strong></div>{/if}</div></section>
        <section class="demo-result" aria-live="polite"><div class="eyebrow"><Icon name="alarm" size={21} />Scheduled alarm</div><div class="result-time">{result.time}</div><span class="result-day">{days[morning]} morning</span><div class="result-metrics"><div><span>Adjustment</span><strong>{override ? 'Manual override' : result.adjustment ? `+${result.adjustment} min` : 'None'}</strong></div><div><span>Predicted sleep</span><strong>{duration(result.sleep)}</strong></div></div></section>
      </div>
      {@render alarmConfirmation()}
    {/if}
  </main>
</div>

<dialog bind:this={editDialog} class="edit-dialog" aria-labelledby="edit-title" onclick={e => { if (e.target === editDialog) editDialog.close(); }} onkeydown={e => { if (e.key === 'Escape') editDialog.close(); }}>
  <form onsubmit={saveOverride}><div class="section-heading"><h2 id="edit-title">Edit next alarm</h2><button type="button" class="icon-button" aria-label="Close" onclick={() => editDialog.close()}><Icon name="close" /></button></div><label for="override-time">Alarm time</label><input id="override-time" type="time" required bind:value={draftTime} /><p class="setting-note">This time overrides your schedule and automatic adjustments for the next alarm.</p><div class="dialog-actions"><button type="button" class="text-button" onclick={() => editDialog.close()}>Cancel</button><button class="primary-button" type="submit">Save alarm</button></div></form>
</dialog>


