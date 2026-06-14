'use client';

import { useState, useEffect, useCallback } from 'react';

/* ─── Types ─────────────────────────────────────────── */
interface ContentAngle {
  title: string;
  why: string;
  format: string;
}
interface SubstackArticle {
  title: string;
  subtitle: string;
  intro: string;
  body: string;
  closing: string;
}
interface InstagramPost {
  hook: string;
  caption: string;
  hashtags: string;
  cta: string;
}
interface VisualPrompt {
  lighting: string;
  style: string;
  palette: string;
  angle: string;
  props: string;
  mood: string;
  aiPrompt: string;
}
interface CalendarEntry {
  id: string;
  topic: string;
  type: 'instagram' | 'substack' | 'both';
  day: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TYPE_COLORS: Record<string, string> = {
  instagram: 'var(--apricot)',
  substack: 'var(--brown)',
  both: '#7a5c3e',
};

/* ─── Mock fallbacks ─────────────────────────────────── */
const MOCK_ANGLES: ContentAngle[] = [
  { title: 'The Quiet Room: Why Less Furniture Feels More Luxurious', why: 'Minimalism resonates with burned-out audiences craving calm. High saves on Pinterest & Reels.', format: 'Carousel or long-form essay' },
  { title: 'Japandi Living: How East Meets Scandinavian Simplicity', why: 'Japandi is the #1 searched interior style this year. Bridges two massive audiences.', format: 'Substack deep-dive + visual series' },
  { title: 'The Case for Warm Neutrals Over Greige in 2025', why: 'Designers are pushing back on cool greys. Warm linen + terracotta is trending hard.', format: 'Opinion piece + before/after Instagram' },
  { title: 'Lighting as Architecture: 5 Ways Light Shapes a Room', why: 'Underrated topic with massive educational appeal. Positions you as a thought leader.', format: 'Newsletter with photos + Reels walkthrough' },
  { title: 'Sourcing Vintage: How to Mix Old Pieces Into Modern Interiors', why: 'Sustainability + style = double algorithm win. Very high engagement for tutorials.', format: 'Step-by-step guide, great for saves' },
];

const MOCK_SUBSTACK = (topic: string): SubstackArticle => ({
  title: `The Art of ${topic}: A Designer's Honest Guide`,
  subtitle: 'What no one tells you about creating spaces that actually feel like home.',
  intro: `There's a moment in every project when the room stops being a floor plan and starts becoming a feeling. For me, that shift almost always happens quietly — not when the last piece of furniture arrives, but when a client walks in and exhales.

That exhale is the whole point of ${topic.toLowerCase()}. And it's harder to design than it looks.`,
  body: `I've been obsessed with ${topic.toLowerCase()} for years, partly because it's one of those concepts that sounds simple until you try to execute it. Clients come to me with Pinterest boards full of images that have almost nothing in common — and yet they all "feel right." That's the invisible thread I'm always chasing.

**What actually makes a space work**

The honest answer is restraint. Not emptiness — restraint. There's a difference between a room that's been carefully edited and one that's just bare. The first feels intentional. The second feels unfinished.

When I approach a ${topic.toLowerCase()} project, I start with what I call the "pressure points" of a room: the first surface your eye lands on when you enter, the place where natural light pools in the afternoon, the corner where nothing quite wants to go. These are the moments that make or break the whole composition.

**Materials that do the work quietly**

I'm drawn to materials that age beautifully because they build the story of a room over time. Linen that softens with washing. Oak that deepens to honey. Stone that holds the warmth of afternoon sun. These aren't just aesthetic choices — they're arguments for permanence in a disposable world.

For ${topic.toLowerCase()}, I've found that layering two or three textures is almost always better than five or six. The eye needs somewhere to rest.

**The colour conversation**

Colour is where I lose most clients at first. They want certainty — "just give me the right white." But there is no right white. There's only the right white for your light, at this time of year, with these floors.

What I can say is that warm neutrals — linens, sandy beiges, the palest terracottas — almost always read better in lived spaces than cool greys. Cool greys work beautifully in photography. They feel clinical in real life.`,
  closing: `If you take one thing from this: design for the exhale, not the photograph. The spaces that stay with us are never the most dramatic ones. They're the ones that asked nothing of us — that just let us be still.

Until next time,
Tetiana`,
});

const MOCK_INSTAGRAM = (topic: string): InstagramPost => ({
  hook: `The room that changed how I think about ${topic.toLowerCase()} 🤍`,
  caption: `Sometimes a project teaches you something you didn't know you needed to learn.

This space started as a brief for "${topic}" — and became a study in what it really means to feel at ease in a room. Not polished. Not perfect. Just... right.

The palette came from the light. The furniture came from restraint. The feeling came from editing out everything that didn't belong.

That's the work nobody shows you on mood boards.`,
  hashtags: `#interiordesign #${topic.toLowerCase().replace(/\s+/g, '')} #minimalinteriors #interiordesigner #designstudio #homedecor #neutralinteriors #livingroomdesign #interiorinspiration #designdetails #homeinspo #interiorarchitecture #warminteriors #modernliving #torontodesigner`,
  cta: `Save this if you're thinking about redesigning a space → what's the one room you'd start with? Tell me below 👇`,
});

const MOCK_VISUAL = (topic: string): VisualPrompt => ({
  lighting: 'Warm afternoon, diffused through linen curtains — avoid harsh midday sun',
  style: `${topic} — Japandi-adjacent, quiet luxury with natural texture`,
  palette: 'Linen white, warm sand, aged oak, hints of terracotta or stone',
  angle: 'Wide shot from doorway showing full room context, OR tight detail on texture/material',
  props: 'A single stem in a ceramic vase, an open book, a linen throw — nothing forced',
  mood: 'Still, editorial, lived-in — like the occupant just stepped out',
  aiPrompt: `Interior design photography, ${topic.toLowerCase()}, warm natural light through sheer curtains, linen and oak palette, minimalist Japandi styling, wide aperture shallow depth of field, editorial magazine aesthetic, architectural digest quality, no people, morning light, f/2.8 —ar 4:5 —style raw`,
});

/* ─── API helper ─────────────────────────────────────── */
async function callClaude(apiKey: string, prompt: string, maxTokens = 1200): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

/* ─── Icon SVGs ──────────────────────────────────────── */
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
);
const IconPen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const IconCamera = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
);
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
);
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

/* ─── Main Component ─────────────────────────────────── */
export default function Dashboard() {
  /* State */
  const [activeSection, setActiveSection] = useState<'research' | 'content' | 'visual' | 'calendar'>('research');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  /* Research */
  const [topic, setTopic] = useState('');
  const [angles, setAngles] = useState<ContentAngle[]>([]);
  const [loadingAngles, setLoadingAngles] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState<ContentAngle | null>(null);

  /* Content */
  const [contentTab, setContentTab] = useState<'substack' | 'instagram'>('substack');
  const [substack, setSubstack] = useState<SubstackArticle | null>(null);
  const [instagram, setInstagram] = useState<InstagramPost | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  /* Visual */
  const [visual, setVisual] = useState<VisualPrompt | null>(null);
  const [loadingVisual, setLoadingVisual] = useState(false);

  /* Calendar */
  const [calendar, setCalendar] = useState<CalendarEntry[]>([]);
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [newTopic, setNewTopic] = useState('');
  const [newType, setNewType] = useState<'instagram' | 'substack' | 'both'>('instagram');

  /* Load from localStorage */
  useEffect(() => {
    const savedKey = localStorage.getItem('tete_api_key') || '';
    const savedMock = localStorage.getItem('tete_mock_mode') === 'true';
    const savedCal = localStorage.getItem('tete_calendar');
    setApiKey(savedKey);
    setMockMode(savedMock || !savedKey);
    if (savedCal) setCalendar(JSON.parse(savedCal));
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('tete_api_key', key);
    if (key) { setMockMode(false); localStorage.setItem('tete_mock_mode', 'false'); }
    setShowSettings(false);
  };

  const saveCalendar = (entries: CalendarEntry[]) => {
    setCalendar(entries);
    localStorage.setItem('tete_calendar', JSON.stringify(entries));
  };

  const copy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  }, []);

  /* ── Research ── */
  const findAngles = async () => {
    if (!topic.trim()) return;
    setLoadingAngles(true);
    setAngles([]);
    try {
      if (mockMode || !apiKey) {
        await new Promise(r => setTimeout(r, 900));
        setAngles(MOCK_ANGLES);
      } else {
        const raw = await callClaude(apiKey, `You are a content strategist for TETÉ, a Toronto-based interior design studio. 
The designer wants to create content about: "${topic}"

Generate exactly 5 content angles that would perform well on Substack and Instagram for an interior design audience. 
Return ONLY a JSON array, no other text. Each object: { "title": string, "why": string, "format": string }
- title: compelling headline (max 12 words)
- why: 1 sentence on why it resonates with design audiences
- format: best content format for this angle`);
        const clean = raw.replace(/```json|```/g, '').trim();
        setAngles(JSON.parse(clean));
      }
    } catch {
      setAngles(MOCK_ANGLES);
    }
    setLoadingAngles(false);
  };

  /* ── Content generation ── */
  const generateContent = async () => {
    const t = selectedAngle?.title || topic;
    if (!t) return;
    setLoadingContent(true);
    setSubstack(null);
    setInstagram(null);
    try {
      if (mockMode || !apiKey) {
        await new Promise(r => setTimeout(r, 1200));
        setSubstack(MOCK_SUBSTACK(t));
        setInstagram(MOCK_INSTAGRAM(t));
      } else {
        const [sub, insta] = await Promise.all([
          callClaude(apiKey, `You are writing for TETÉ, a refined Toronto interior design studio. Tetiana's voice is warm, editorial, and quietly confident — like a letter from a designer friend.
Write a Substack newsletter article about: "${t}"
Return ONLY JSON: { "title": string, "subtitle": string, "intro": string (2 paragraphs), "body": string (4-5 paragraphs with **bold subheadings**), "closing": string (1 paragraph sign-off signed "Tetiana") }`, 1400),
          callClaude(apiKey, `You are a social media strategist for TETÉ, a Toronto interior design studio. Tetiana's Instagram voice is warm, personal, and design-educated.
Write an Instagram post about: "${t}"
Return ONLY JSON: { "hook": string (first line, scroll-stopping, max 10 words), "caption": string (3-4 short paragraphs, no bullet points), "hashtags": string (15 hashtags as single string), "cta": string (call to action, 1 sentence) }`, 700),
        ]);
        const cleanSub = sub.replace(/```json|```/g, '').trim();
        const cleanInsta = insta.replace(/```json|```/g, '').trim();
        setSubstack(JSON.parse(cleanSub));
        setInstagram(JSON.parse(cleanInsta));
      }
    } catch {
      setSubstack(MOCK_SUBSTACK(t));
      setInstagram(MOCK_INSTAGRAM(t));
    }
    setLoadingContent(false);
  };

  /* ── Visual prompt ── */
  const generateVisual = async () => {
    const t = selectedAngle?.title || topic;
    if (!t) return;
    setLoadingVisual(true);
    setVisual(null);
    try {
      if (mockMode || !apiKey) {
        await new Promise(r => setTimeout(r, 800));
        setVisual(MOCK_VISUAL(t));
      } else {
        const raw = await callClaude(apiKey, `You are a creative director for TETÉ interior design studio. Generate a detailed visual/photo brief for content about: "${t}"
Return ONLY JSON: { "lighting": string, "style": string, "palette": string, "angle": string, "props": string, "mood": string, "aiPrompt": string (Midjourney/DALL-E prompt, 30-50 words + parameters) }`);
        const clean = raw.replace(/```json|```/g, '').trim();
        setVisual(JSON.parse(clean));
      }
    } catch {
      setVisual(MOCK_VISUAL(t));
    }
    setLoadingVisual(false);
  };

  /* ── Calendar ── */
  const addToCalendar = (day: number) => {
    if (!newTopic.trim()) return;
    const entry: CalendarEntry = { id: Date.now().toString(), topic: newTopic, type: newType, day };
    const updated = [...calendar, entry];
    saveCalendar(updated);
    setNewTopic('');
    setAddingDay(null);
  };

  const removeFromCalendar = (id: string) => {
    saveCalendar(calendar.filter(e => e.id !== id));
  };

  /* ── Substack copy text ── */
  const substackText = substack ? `${substack.title}\n${substack.subtitle}\n\n${substack.intro}\n\n${substack.body}\n\n${substack.closing}` : '';
  const instagramText = instagram ? `${instagram.hook}\n\n${instagram.caption}\n\n${instagram.cta}\n\n${instagram.hashtags}` : '';

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <>
      {/* Settings Modal */}
      {showSettings && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(61,35,21,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => e.target === e.currentTarget && setShowSettings(false)}
        >
          <div style={{ background: 'var(--linen)', width: '100%', maxWidth: '440px', padding: '36px', position: 'relative' }}>
            <button onClick={() => setShowSettings(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brown-s)', padding: '4px' }}><IconX /></button>
            <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--brown-s)', marginBottom: '8px' }}>Settings</p>
            <h2 style={{ fontSize: '22px', fontWeight: 300, color: 'var(--brown)', marginBottom: '24px', letterSpacing: '-0.02em' }}>API Configuration</h2>
            <p style={{ fontSize: '13px', color: 'var(--brown-s)', lineHeight: 1.6, marginBottom: '20px' }}>Your API key is saved only in your browser — never sent to any server except Anthropic directly.</p>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-s)', marginBottom: '8px' }}>Anthropic API Key</label>
            <input
              type="password"
              defaultValue={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--brown-xs)', background: '#fff', color: 'var(--brown)', fontSize: '13px', fontFamily: 'inherit', outline: 'none', marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <input type="checkbox" id="mock-mode" checked={mockMode} onChange={e => { setMockMode(e.target.checked); localStorage.setItem('tete_mock_mode', String(e.target.checked)); }} />
              <label htmlFor="mock-mode" style={{ fontSize: '13px', color: 'var(--brown-s)', cursor: 'pointer' }}>Use Mock Mode (demo content, no API key needed)</label>
            </div>
            <button onClick={() => saveApiKey(apiKey)} style={{ width: '100%', padding: '12px', background: 'var(--apricot)', color: '#fff', border: 'none', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>Save Settings</button>
            {mockMode && <p style={{ marginTop: '12px', fontSize: '11px', color: 'var(--apricot)', textAlign: 'center' }}>Mock mode active — all outputs use example content</p>}
          </div>
        </div>
      )}

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <a href="/" className="brand">
              <span className="brand-small">the</span>
              <span className="brand-large">TETE</span>
            </a>
            <span className="admin-badge">Studio</span>
          </div>

          <nav className="admin-sidebar-nav">
            {([
              { id: 'research', label: 'Topic Research', icon: <IconSearch /> },
              { id: 'content', label: 'Content Creator', icon: <IconPen /> },
              { id: 'visual', label: 'Visual Prompts', icon: <IconCamera /> },
              { id: 'calendar', label: 'Content Calendar', icon: <IconCalendar /> },
            ] as const).map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`admin-nav-item${activeSection === item.id ? ' active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <div style={{ marginTop: '24px', padding: '0 0 4px', borderTop: '1px solid rgba(240,234,226,0.08)' }} />
            <a href="/edit" className="admin-nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Projects CMS
            </a>
            <a href="/" className="admin-nav-item" target="_blank" rel="noopener noreferrer">
              <IconEye />
              View Site
            </a>
          </nav>

          <div className="admin-sidebar-footer">
            <button
              onClick={() => setShowSettings(true)}
              className="admin-logout-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', background: 'transparent', border: '1px solid rgba(240,234,226,0.12)', color: 'rgba(240,234,226,0.6)', fontSize: '12px', letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '6px' }}
            >
              <IconSettings />
              {mockMode ? 'Mock Mode — Settings' : apiKey ? 'API Connected' : 'Add API Key'}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="admin-main">
          {/* ── TOPIC RESEARCH ── */}
          {activeSection === 'research' && (
            <>
              <header className="admin-topbar">
                <h1>Topic Researcher</h1>
                <p>Type an interior design concept to discover 5 high-impact content angles</p>
              </header>
              <div className="admin-content">
                {/* Input */}
                <div style={{ background: '#fff', border: '1px solid var(--brown-xs)', padding: '28px', marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brown-s)', marginBottom: '12px' }}>Interior Design Topic</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && findAngles()}
                      placeholder="e.g. Minimalist Living Rooms, Japandi Interiors, Warm Neutrals..."
                      style={{ flex: 1, padding: '13px 16px', border: '1px solid var(--brown-xs)', background: 'var(--linen)', color: 'var(--brown)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
                    />
                    <button
                      onClick={findAngles}
                      disabled={loadingAngles || !topic.trim()}
                      style={{ padding: '0 28px', background: 'var(--brown)', color: 'var(--linen)', border: 'none', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: loadingAngles ? 'not-allowed' : 'pointer', opacity: (!topic.trim() || loadingAngles) ? 0.5 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                    >
                      {loadingAngles ? 'Finding...' : 'Find Angles'}
                    </button>
                  </div>
                  {mockMode && <p style={{ marginTop: '10px', fontSize: '11px', color: 'var(--apricot)' }}>Mock mode — using example content. Add an API key in Settings for live results.</p>}
                </div>

                {/* Loading skeletons */}
                {loadingAngles && (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ background: '#fff', border: '1px solid var(--brown-xs)', padding: '20px', opacity: 1 - i * 0.12 }}>
                        <div style={{ height: '14px', width: '60%', background: 'var(--linen-2)', marginBottom: '10px', borderRadius: '2px' }} />
                        <div style={{ height: '12px', width: '85%', background: 'var(--linen)', borderRadius: '2px' }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Angle cards */}
                {!loadingAngles && angles.length > 0 && (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {angles.map((angle, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedAngle(selectedAngle?.title === angle.title ? null : angle)}
                        style={{ background: selectedAngle?.title === angle.title ? 'var(--brown)' : '#fff', border: `1px solid ${selectedAngle?.title === angle.title ? 'var(--brown)' : 'var(--brown-xs)'}`, padding: '20px 24px', cursor: 'pointer', transition: 'all 0.2s ease', color: selectedAngle?.title === angle.title ? 'var(--linen)' : 'var(--brown)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '10px', letterSpacing: '0.12em', color: selectedAngle?.title === angle.title ? 'rgba(240,234,226,0.5)' : 'var(--apricot)' }}>0{i + 1}</span>
                              <h3 style={{ fontSize: '15px', fontWeight: 400, letterSpacing: '-0.01em', margin: 0 }}>{angle.title}</h3>
                            </div>
                            <p style={{ fontSize: '12px', color: selectedAngle?.title === angle.title ? 'rgba(240,234,226,0.72)' : 'var(--brown-s)', margin: '0 0 8px', lineHeight: 1.55 }}>{angle.why}</p>
                            <span style={{ display: 'inline-block', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', border: `1px solid ${selectedAngle?.title === angle.title ? 'rgba(240,234,226,0.25)' : 'var(--brown-xs)'}`, color: selectedAngle?.title === angle.title ? 'rgba(240,234,226,0.6)' : 'var(--brown-s)' }}>{angle.format}</span>
                          </div>
                          {selectedAngle?.title === angle.title && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(240,234,226,0.7)" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA to next section */}
                {selectedAngle && (
                  <div style={{ marginTop: '20px', padding: '20px 24px', background: 'rgba(183,105,74,0.08)', border: '1px solid rgba(183,105,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--apricot)', margin: '0 0 2px', letterSpacing: '0.08em' }}>Angle selected</p>
                      <p style={{ fontSize: '13px', color: 'var(--brown)', margin: 0 }}>{selectedAngle.title}</p>
                    </div>
                    <button
                      onClick={() => { setActiveSection('content'); generateContent(); }}
                      style={{ padding: '10px 22px', background: 'var(--apricot)', color: '#fff', border: 'none', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                    >
                      Create Content →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── CONTENT CREATOR ── */}
          {activeSection === 'content' && (
            <>
              <header className="admin-topbar">
                <h1>Content Creator</h1>
                <p>Generate newsletter articles for Substack or captions for Instagram</p>
              </header>
              <div className="admin-content">
                {/* Controls */}
                <div style={{ background: '#fff', border: '1px solid var(--brown-xs)', padding: '24px 28px', marginBottom: '24px', display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brown-s)', marginBottom: '8px' }}>Topic / Angle</label>
                    <input
                      value={selectedAngle?.title || topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="Enter topic or select from Research..."
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--brown-xs)', background: 'var(--linen)', color: 'var(--brown)', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                    />
                  </div>
                  <button
                    onClick={generateContent}
                    disabled={loadingContent}
                    style={{ padding: '12px 28px', background: 'var(--brown)', color: 'var(--linen)', border: 'none', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: loadingContent ? 'not-allowed' : 'pointer', opacity: loadingContent ? 0.6 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                  >
                    {loadingContent ? 'Generating...' : 'Generate Both'}
                  </button>
                </div>

                {/* Tabs */}
                {(loadingContent || substack || instagram) && (
                  <>
                    <div style={{ display: 'flex', gap: '0', marginBottom: '0', borderBottom: '1px solid var(--brown-xs)' }}>
                      {(['substack', 'instagram'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setContentTab(tab)}
                          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${contentTab === tab ? 'var(--apricot)' : 'transparent'}`, color: contentTab === tab ? 'var(--brown)' : 'var(--brown-s)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                        >
                          {tab === 'substack' ? '✦ Substack Newsletter' : '◈ Instagram Caption'}
                        </button>
                      ))}
                    </div>

                    {/* Loading state */}
                    {loadingContent && (
                      <div style={{ background: '#fff', border: '1px solid var(--brown-xs)', borderTop: 'none', padding: '36px', textAlign: 'center' }}>
                        <div style={{ fontSize: '13px', color: 'var(--brown-s)', letterSpacing: '0.08em' }}>Crafting your content...</div>
                      </div>
                    )}

                    {/* Substack */}
                    {!loadingContent && contentTab === 'substack' && substack && (
                      <div style={{ background: '#fff', border: '1px solid var(--brown-xs)', borderTop: 'none', padding: '36px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', gap: '16px' }}>
                          <div>
                            <h2 style={{ fontSize: '22px', fontWeight: 400, color: 'var(--brown)', margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.25 }}>{substack.title}</h2>
                            <p style={{ fontSize: '14px', color: 'var(--brown-s)', margin: 0, fontStyle: 'italic' }}>{substack.subtitle}</p>
                          </div>
                          <button
                            onClick={() => copy(substackText, 'substack')}
                            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: copiedId === 'substack' ? 'var(--apricot)' : 'transparent', border: `1px solid ${copiedId === 'substack' ? 'var(--apricot)' : 'var(--brown-xs)'}`, color: copiedId === 'substack' ? '#fff' : 'var(--brown)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            <IconCopy />
                            {copiedId === 'substack' ? 'Copied!' : 'Copy Article'}
                          </button>
                        </div>
                        <div style={{ borderTop: '1px solid var(--brown-xs)', paddingTop: '24px' }}>
                          {substack.intro.split('\n\n').map((p, i) => (
                            <p key={i} style={{ fontSize: '14px', color: 'var(--brown)', lineHeight: 1.75, marginBottom: '16px' }}>{p}</p>
                          ))}
                          <div style={{ borderTop: '1px solid var(--brown-xs)', margin: '24px 0' }} />
                          {substack.body.split('\n\n').map((p, i) => {
                            if (p.startsWith('**') && p.endsWith('**')) return <h4 key={i} style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--brown)', margin: '20px 0 10px' }}>{p.replace(/\*\*/g, '')}</h4>;
                            return <p key={i} style={{ fontSize: '14px', color: 'var(--brown)', lineHeight: 1.75, marginBottom: '14px' }}
                              dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                            />;
                          })}
                          <div style={{ borderTop: '1px solid var(--brown-xs)', margin: '24px 0' }} />
                          <p style={{ fontSize: '14px', color: 'var(--brown)', lineHeight: 1.75, fontStyle: 'italic' }}>{substack.closing}</p>
                        </div>
                      </div>
                    )}

                    {/* Instagram */}
                    {!loadingContent && contentTab === 'instagram' && instagram && (
                      <div style={{ background: '#fff', border: '1px solid var(--brown-xs)', borderTop: 'none', padding: '36px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px' }}>
                          <div>
                            <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--apricot)', margin: '0 0 4px' }}>Hook (first line)</p>
                            <p style={{ fontSize: '16px', color: 'var(--brown)', margin: 0, fontWeight: 400 }}>{instagram.hook}</p>
                          </div>
                          <button
                            onClick={() => copy(instagramText, 'instagram')}
                            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: copiedId === 'instagram' ? 'var(--apricot)' : 'transparent', border: `1px solid ${copiedId === 'instagram' ? 'var(--apricot)' : 'var(--brown-xs)'}`, color: copiedId === 'instagram' ? '#fff' : 'var(--brown)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            <IconCopy />
                            {copiedId === 'instagram' ? 'Copied!' : 'Copy Caption'}
                          </button>
                        </div>
                        <div style={{ background: 'var(--linen)', padding: '24px', marginBottom: '20px', borderLeft: '3px solid var(--apricot)' }}>
                          {instagram.caption.split('\n\n').map((p, i) => (
                            <p key={i} style={{ fontSize: '14px', color: 'var(--brown)', lineHeight: 1.7, margin: i < instagram.caption.split('\n\n').length - 1 ? '0 0 14px' : 0 }}>{p}</p>
                          ))}
                          <p style={{ fontSize: '13px', color: 'var(--apricot)', marginTop: '14px', marginBottom: 0 }}>{instagram.cta}</p>
                        </div>
                        <div style={{ padding: '16px 20px', background: 'rgba(61,35,21,0.04)', border: '1px dashed var(--brown-xs)' }}>
                          <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-s)', marginBottom: '8px' }}>Hashtags</p>
                          <p style={{ fontSize: '12px', color: 'var(--apricot)', lineHeight: 1.8, margin: 0 }}>{instagram.hashtags}</p>
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => copy(instagram.hashtags, 'hashtags')}
                            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', background: 'transparent', border: '1px solid var(--brown-xs)', color: 'var(--brown-s)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            <IconCopy />
                            {copiedId === 'hashtags' ? 'Copied!' : 'Copy Hashtags Only'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Empty state */}
                {!loadingContent && !substack && !instagram && (
                  <div style={{ background: '#fff', border: '1px solid var(--brown-xs)', padding: '60px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--brown-s)', margin: 0 }}>Enter a topic above and click Generate Both to create your content</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── VISUAL PROMPTS ── */}
          {activeSection === 'visual' && (
            <>
              <header className="admin-topbar">
                <h1>Visual Prompt Generator</h1>
                <p>Get exact photo direction and AI image prompts for your content topic</p>
              </header>
              <div className="admin-content">
                <div style={{ background: '#fff', border: '1px solid var(--brown-xs)', padding: '24px 28px', marginBottom: '24px', display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brown-s)', marginBottom: '8px' }}>Topic</label>
                    <input
                      value={selectedAngle?.title || topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="What is your content about?"
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--brown-xs)', background: 'var(--linen)', color: 'var(--brown)', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                    />
                  </div>
                  <button
                    onClick={generateVisual}
                    disabled={loadingVisual}
                    style={{ padding: '12px 28px', background: 'var(--brown)', color: 'var(--linen)', border: 'none', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: loadingVisual ? 'not-allowed' : 'pointer', opacity: loadingVisual ? 0.6 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                  >
                    {loadingVisual ? 'Generating...' : 'Generate Brief'}
                  </button>
                </div>

                {loadingVisual && (
                  <div style={{ background: '#fff', border: '1px solid var(--brown-xs)', padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--brown-s)', margin: 0, letterSpacing: '0.08em' }}>Crafting your visual brief...</p>
                  </div>
                )}

                {!loadingVisual && visual && (
                  <div style={{ display: 'grid', gap: '1px', background: 'var(--brown-xs)' }}>
                    {([
                      { key: 'lighting', label: 'Lighting', value: visual.lighting },
                      { key: 'style', label: 'Style Direction', value: visual.style },
                      { key: 'palette', label: 'Colour Palette', value: visual.palette },
                      { key: 'angle', label: 'Camera Angle', value: visual.angle },
                      { key: 'props', label: 'Props & Styling', value: visual.props },
                      { key: 'mood', label: 'Mood', value: visual.mood },
                    ]).map(row => (
                      <div key={row.key} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', background: '#fff' }}>
                        <div style={{ padding: '18px 20px', background: 'var(--linen)', borderRight: '1px solid var(--brown-xs)' }}>
                          <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--brown-s)', margin: 0 }}>{row.label}</p>
                        </div>
                        <div style={{ padding: '18px 24px' }}>
                          <p style={{ fontSize: '13px', color: 'var(--brown)', lineHeight: 1.6, margin: 0 }}>{row.value}</p>
                        </div>
                      </div>
                    ))}

                    {/* AI Prompt box */}
                    <div style={{ background: 'var(--brown)', padding: '24px 28px', gridColumn: '1 / -1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--apricot)', margin: '0 0 10px' }}>AI Image Prompt (Midjourney / DALL-E)</p>
                          <p style={{ fontSize: '13px', color: 'var(--linen)', lineHeight: 1.65, margin: 0, opacity: 0.9 }}>{visual.aiPrompt}</p>
                        </div>
                        <button
                          onClick={() => copy(visual.aiPrompt, 'aiprompt')}
                          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: copiedId === 'aiprompt' ? 'var(--apricot)' : 'transparent', border: '1px solid rgba(240,234,226,0.2)', color: copiedId === 'aiprompt' ? '#fff' : 'rgba(240,234,226,0.7)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                          <IconCopy />
                          {copiedId === 'aiprompt' ? 'Copied!' : 'Copy Prompt'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!loadingVisual && !visual && (
                  <div style={{ background: '#fff', border: '1px solid var(--brown-xs)', padding: '60px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--brown-s)', margin: 0 }}>Enter a topic to get your photo brief and AI image prompt</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── CONTENT CALENDAR ── */}
          {activeSection === 'calendar' && (
            <>
              <header className="admin-topbar">
                <h1>Content Calendar</h1>
                <p>Plan your weekly posting schedule — drag topics onto the days that work for you</p>
              </header>
              <div className="admin-content">
                {/* Quick-add from current topic */}
                {(topic || selectedAngle) && (
                  <div style={{ background: 'rgba(183,105,74,0.08)', border: '1px solid rgba(183,105,74,0.18)', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--apricot)', margin: 0, flex: 1 }}>Current topic ready to schedule: <strong style={{ color: 'var(--brown)' }}>{selectedAngle?.title || topic}</strong></p>
                    <p style={{ fontSize: '11px', color: 'var(--brown-s)', margin: 0 }}>Click any + button below to add it</p>
                  </div>
                )}

                {/* Weekly grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {DAYS.map((day, dayIndex) => {
                    const entries = calendar.filter(e => e.day === dayIndex);
                    return (
                      <div key={day} style={{ background: '#fff', border: '1px solid var(--brown-xs)', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                        {/* Day header */}
                        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--brown-xs)', background: 'var(--linen)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brown-s)', fontWeight: 600 }}>{day}</span>
                          <button
                            onClick={() => setAddingDay(addingDay === dayIndex ? null : dayIndex)}
                            style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: addingDay === dayIndex ? 'var(--apricot)' : 'transparent', border: `1px solid ${addingDay === dayIndex ? 'var(--apricot)' : 'var(--brown-xs)'}`, color: addingDay === dayIndex ? '#fff' : 'var(--brown-s)', cursor: 'pointer', borderRadius: '2px' }}
                          >
                            <IconPlus />
                          </button>
                        </div>

                        {/* Add form */}
                        {addingDay === dayIndex && (
                          <div style={{ padding: '10px', borderBottom: '1px solid var(--brown-xs)', background: 'var(--linen)' }}>
                            <input
                              value={newTopic}
                              onChange={e => setNewTopic(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && addToCalendar(dayIndex)}
                              placeholder={selectedAngle?.title || topic || 'Topic name...'}
                              autoFocus
                              style={{ width: '100%', padding: '7px 9px', border: '1px solid var(--brown-xs)', background: '#fff', color: 'var(--brown)', fontSize: '11px', fontFamily: 'inherit', outline: 'none', marginBottom: '6px' }}
                            />
                            <select
                              value={newType}
                              onChange={e => setNewType(e.target.value as typeof newType)}
                              style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--brown-xs)', background: '#fff', color: 'var(--brown)', fontSize: '11px', fontFamily: 'inherit', outline: 'none', marginBottom: '6px' }}
                            >
                              <option value="instagram">Instagram</option>
                              <option value="substack">Substack</option>
                              <option value="both">Both</option>
                            </select>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => { setNewTopic(selectedAngle?.title || topic || newTopic); addToCalendar(dayIndex); }}
                                style={{ flex: 1, padding: '6px', background: 'var(--brown)', color: 'var(--linen)', border: 'none', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit' }}
                              >Add</button>
                              <button
                                onClick={() => setAddingDay(null)}
                                style={{ padding: '6px 8px', background: 'transparent', border: '1px solid var(--brown-xs)', color: 'var(--brown-s)', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit' }}
                              >✕</button>
                            </div>
                          </div>
                        )}

                        {/* Entries */}
                        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                          {entries.map(entry => (
                            <div
                              key={entry.id}
                              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', padding: '8px 10px', background: 'var(--linen)', borderLeft: `3px solid ${TYPE_COLORS[entry.type]}` }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '11px', color: 'var(--brown)', margin: '0 0 3px', lineHeight: 1.35, wordBreak: 'break-word' }}>{entry.topic}</p>
                                <span style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: TYPE_COLORS[entry.type] }}>{entry.type}</span>
                              </div>
                              <button
                                onClick={() => removeFromCalendar(entry.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brown-s)', padding: '2px', flexShrink: 0, opacity: 0.5, lineHeight: 1 }}
                              ><IconX /></button>
                            </div>
                          ))}
                          {entries.length === 0 && addingDay !== dayIndex && (
                            <p style={{ fontSize: '11px', color: 'var(--brown-xs)', textAlign: 'center', marginTop: '24px', letterSpacing: '0.06em' }}>—</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '16px', padding: '12px 16px', background: '#fff', border: '1px solid var(--brown-xs)' }}>
                  {Object.entries(TYPE_COLORS).map(([type, color]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: '12px', height: '3px', background: color, borderRadius: '1px' }} />
                      <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brown-s)' }}>{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
