<script lang="ts">
  let { name, size = 24 }: { name: string; size?: number } = $props();
  const paths: Record<string, string> = {
    home: 'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
    alarm: 'M12 7v5l3 2M5 3 2 6m17-3 3 3M5 19l-2 3m16-3 2 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    schedule: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 10h2m4 0h2m-8 4h2',
    preferences: 'M4 7h16M4 17h16M8 4v6m8 4v6',
    demo: 'M9 3v6L3 19a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3L15 9V3M7 3h10M7 15h10',
    edit: 'm15 5 4 4M4 16 16 4a2.8 2.8 0 0 1 4 4L8 20l-5 1Z',
    arrow: 'M5 12h14m-5-5 5 5-5 5', moon: 'M20.8 13a9 9 0 0 1-9.8-9.8A9 9 0 1 0 20.8 13Z',
    sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
    close: 'm6 6 12 12M6 18 18 6', chevron: 'm9 5 7 7-7 7'
  };
</script>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={paths[name] || paths.alarm} /></svg>
