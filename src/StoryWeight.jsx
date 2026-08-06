import { useState, useMemo } from "react";

const PRIMARY_DIMS = ["STR", "CHR"];

// ─── BAND MODEL ────────────────────────────────────────────────────────────
// Each dimension has a floor and ceiling defining three zones:
//   below floor  → dead / under-developed (the existing failure mode)
//   floor–ceiling → alive / in band (where good work lives)
//   above ceiling → high-wire (risk of over-tuning — the virtue can become a vice,
//                   but the best work navigates it)
//
// Scores remain 0–10. Bands are an interpretive overlay.

const DIMS = [
  { code:"STR", name:"Structural integrity",
    floor:5, ceiling:9,
    failureMode:"Scenes that exist for plot convenience rather than structural necessity — the story moves but nothing accumulates.",
    overTuning:"Architecture so visible it becomes the experience — the audience admires the engineering instead of living inside the story. Every beat so precisely placed that nothing feels discovered, nothing breathes, nothing arrives by accident. The structure becomes a display of control rather than a vessel for life.",
    tierAnchors:{ high:"The Wire, Chernobyl, The Bad Kids", mid:"Breaking Bad, Broadchurch, Fargo", low:"House of Cards, Manifest, Emily in Paris" },
    anchors:{ 10:"Structure is invisible because it's perfect. Every scene does multiple jobs simultaneously. The ending is inevitable in retrospect but unpredictable in advance.", 8:"Strong architecture with clear intentionality. The build is controlled, payoffs earned. Minor inefficiencies that don't compromise the whole.", 6:"Functional. Gets the story from A to B. Some scenes doing only one job. Payoffs arrive but aren't fully prepared.", 4:"Structural problems noticeable and damaging. Scenes exist for plot convenience. Architecture working against the material.", 2:"Structure is a container, not a craft decision. Scenes follow each other without building. No sense of inevitability anywhere.", 0:"No structural logic present. The writing has no architecture. Events accumulate without direction or consequence." }},
  { code:"CHR", name:"Character logic",
    floor:5, ceiling:9,
    failureMode:"Behavior that serves plot over truth — the moment a character does something because the story needs it rather than because they would.",
    overTuning:"Characters so internally consistent they become closed systems — no contradiction can enter, no surprise can occur, no growth is possible without violating the established logic. The character becomes a thesis statement about a person rather than a person. Every action so psychologically legible that the mystery of being human is replaced by a diagram of it.",
    tierAnchors:{ high:"The Sopranos, My Mister, Mad Men", mid:"Better Call Saul, Succession, Normal People", low:"Stranger Things, Wednesday, Bridgerton" },
    anchors:{ 10:"Characters behave with complete internal logic even when surprising. Their contradictions are load-bearing — remove them and the character collapses.", 8:"Characters consistent and complex. Occasional moments where behavior serves plot over truth but recoverable. Strong roles that attract committed performances.", 6:"Characters functional and distinguishable. Consistency present but contradiction and complexity thin. Roles castable but not compelling.", 4:"Characters behave as the plot requires rather than as themselves. Consistency breaks under pressure. Roles flat.", 2:"Characters indistinct or purely instrumental. No internal logic. Behavior entirely situation-driven.", 0:"No character logic present. Figures exist as placeholders. No serious actor would find anything to play." }},
  { code:"DIA", name:"Dialogue craft",
    floor:4, ceiling:9,
    failureMode:"On-the-nose exposition — characters explaining what they mean rather than circling it, making subtext explicit and killing the scene's second life.",
    overTuning:"Every line working so hard it exhausts the audience — no one speaks plainly, no exchange is functional, every sentence is a performance of craft. The dialogue becomes a demonstration of the writer's facility rather than something a person would say. Quotable replaces true. The scene has no oxygen left for the actors to inhabit.",
    tierAnchors:{ high:"Deadwood, The Wire, The West Wing", mid:"Rectify, Succession, Peep Show", low:"The Newsroom, House of Cards, Manifest" },
    anchors:{ 10:"Every line doing at least two jobs. Voice so distinct you could identify the speaker without attribution. Quotable not because it's clever but because it's precise.", 8:"Strong voice differentiation. Most lines working hard. Occasional moments where dialogue carries information it should be hiding.", 6:"Functional and clear. Characters distinguishable but voices not truly distinct. Dialogue conveys what it needs to but rarely surprises.", 4:"On-the-nose. Characters say what they mean and mean what they say. Voice differentiation thin. Exposition visible.", 2:"Purely instrumental. No voice, no subtext, no surprise. Characters interchangeable on the page.", 0:"Dialogue has no function beyond information transfer. No voice, no distinction, no craft present at any level." }},
  { code:"THM", name:"Thematic coherence",
    floor:4, ceiling:9,
    failureMode:"Theme that repeats rather than develops — the writing knows what it's about but returns to the same statement rather than deepening or complicating it.",
    overTuning:"Theme so totalizing that every scene, image, and line of dialogue is pressed into thematic service — nothing is allowed to exist for its own sake. The work becomes an argument rather than an experience. Characters become vehicles for the thesis. The audience is being lectured by a story that has forgotten it is also supposed to be about people living.",
    tierAnchors:{ high:"The Wire, Mad Men, Watchmen", mid:"The Leftovers, Pantheon, I May Destroy You", low:"Downton Abbey, Fate: The Winx Saga, Emily in Paris" },
    anchors:{ 10:"The theme is structural — load-bearing in every scene without being stated. It develops across the season in a way that reframes earlier material retrospectively.", 8:"Clear thematic intention that develops genuinely. The writing has a point of view and pursues it.", 6:"Theme present and consistent but doesn't develop — it repeats. The writing knows what it's about but doesn't deepen it.", 4:"Thematic gestures without development. The writing reaches for meaning without earning it.", 2:"No discernible thematic intention. Events occur without accumulating meaning.", 0:"Completely thematically inert. Nothing the writing does points toward anything beyond itself." }},
  { code:"ECO", name:"Economy",
    floor:4, ceiling:8,
    failureMode:"Redundant beats — scenes that repeat emotional information the audience already holds, mistaking comfort for craft.",
    overTuning:"Compression so severe the work cannot breathe — no scene is allowed connective tissue, no moment exists without load-bearing purpose, no beat is permitted to simply be. The audience has no rest, no variation in density, no room to process what they've received. Economy becomes anorexia. The cuts that made the work tight become the cuts that made the work thin.",
    tierAnchors:{ high:"The Bureau, Mr Inbetween, Chernobyl", mid:"Rectify, Slow Horses, Broadchurch", low:"Lost, Grey's Anatomy, Desperate Housewives" },
    anchors:{ 10:"Nothing is wasted. Every scene doing the maximum possible work. Lines that seem throwaway are load-bearing. The writing has been compressed to its essential form.", 8:"Tight with occasional slack. Most scenes necessary. A few moments that could be cut without loss but don't actively damage.", 6:"Functional economy. Some redundancy noticeable but not damaging. Scenes occasionally repeat emotional or plot beats.", 4:"Baggy. Scenes exist for comfort or habit rather than necessity. Redundant characters, repeated beats.", 2:"No editorial discipline. Scenes, characters, and lines exist because they were written, not because they're needed.", 0:"Actively bloated. The writing undermines itself through accumulation. More is always less." }},
  { code:"ORI", name:"Originality",
    floor:4, ceiling:9,
    failureMode:"Influences worn without transformation — the writing executes a familiar form competently but introduces nothing that the form didn't already contain.",
    overTuning:"Novelty so insistent it becomes its own convention — every choice exists to be surprising, every structure to be subverted, every expectation to be defeated. The work has no foundation the audience can stand on. Originality pursued as an end rather than emerging from a genuine problem the writer needed to solve. The result is eccentric rather than necessary, and eccentricity is its own kind of formula.",
    tierAnchors:{ high:"Atlanta, Twin Peaks, Patriot", mid:"Severance, Reservation Dogs, Dark", low:"Downton Abbey, Fate: The Winx Saga, Bridgerton" },
    anchors:{ 10:"The writing couldn't have existed before and couldn't be mistaken for anything else. It has introduced something that expands what the medium can do.", 8:"Genuinely distinctive. Not just executing a familiar form well — doing something with it that hasn't been done before.", 6:"Competent execution of familiar forms with some distinguishing features. You can name the influences directly.", 4:"Derivative. Influences worn openly and without transformation. The writing is doing what other writing has already done, less well.", 2:"Pure formula. No distinguishing features. Could have been written by anyone at any time.", 0:"Below formula. The writing fails to execute even the conventions it's imitating." }},
  { code:"TON", name:"Tonal control",
    floor:4, ceiling:9,
    failureMode:"Register slippage — a scene that belongs to a different show, breaking immersion not through ambition but through loss of control.",
    overTuning:"Tonal coherence so absolute the work becomes monotone — no register shift is permitted, no scene breaks the established temperature, no moment risks the dissonance that might produce a genuinely new feeling. The control that was supposed to serve the material has become the material. The show is so tonally managed it has no weather.",
    tierAnchors:{ high:"Atlanta, Mad Men, The Bureau", mid:"Barry, Mr Inbetween, Succession", low:"The Newsroom, Ginny & Georgia, Fate: The Winx Saga" },
    anchors:{ 10:"The tone is a craft decision that's load-bearing. The writing can move across registers without ever losing coherence. The modulations are intentional.", 8:"Strong tonal identity with controlled modulation. Occasional moments where the register slips but recoverable.", 6:"Consistent tone but limited range. The writing holds its register without adventuring into modulation. Safe rather than precise.", 4:"Tonal inconsistency that's damaging. Moments that belong to a different show. Register slips that break immersion.", 2:"No tonal identity. The writing doesn't know what register it's in. Inconsistency is the only consistent thing.", 0:"Tonal chaos. The writing actively contradicts itself at the level of register. No coherent voice present." }},
  { code:"SUB", name:"Subtext density",
    floor:3, ceiling:8,
    failureMode:"Writing that explains what it has already shown — making explicit the emotional content the scene has just dramatized, closing off the audience's interpretive space.",
    overTuning:"Subtext so saturated the surface scene ceases to function — nothing is accessible on first contact, every exchange requires decoding, and the audience is locked out of the emotional experience by the interpretive labor required to enter it. The gap between surface and underneath, which should create resonance, becomes a wall. The writing trusts the audience so much it forgets to let them in.",
    tierAnchors:{ high:"The Bureau, My Mister, The Sopranos", mid:"Rectify, Normal People, Justified", low:"The Newsroom, Friends, Big Bang Theory" },
    anchors:{ 10:"The real scene is always underneath the surface scene. Characters never say what they mean, and the gap is where the writing lives. Complete trust in the audience.", 8:"Strong subtext consistent and intentional. Most scenes have a surface and an underneath. Occasional moments where the writing makes explicit what it should leave implicit.", 6:"Subtext present but intermittent. Some scenes working beneath the surface, others taking it at face value.", 4:"Mostly surface. The writing explains itself. Emotional and thematic content stated rather than implied.", 2:"No subtext. Everything is what it appears to be. The writing and the story are the same thing.", 0:"Anti-subtext. The writing over-explains what it has already over-explained. Negative trust in the audience." }},
  { code:"EMR", name:"Emotional resonance",
    floor:4, ceiling:9,
    failureMode:"Signposting rather than construction — the writing reaches for feeling through situation rather than building access points from within the craft.",
    overTuning:"Every scene reaching for maximum emotional impact — no moment is allowed to land lightly, no beat is functional, every exchange is engineered to move the audience. The cumulative effect is exhaustion rather than feeling. The work mistakes emotional intensity for emotional truth, and the relentless construction of access points closes off the involuntary response that genuine resonance requires. Sentimentality is the failure mode of over-constructed feeling.",
    tierAnchors:{ high:"My Mister, Normal People, The OA", mid:"I May Destroy You, The Leftovers, Fleabag", low:"House of Cards, Jupiter's Legacy, Emily in Paris" },
    anchors:{ 10:"Specific moments are inevitable. A reader cannot get through it without being stopped. The images, contradictions, or silences are irreplaceable.", 8:"Multiple specific, constructed emotional access points. Not accidental. A reader feels them land and could point to exactly why.", 6:"Emotional moments exist but situational rather than constructed. The situation is moving you, not the craft.", 4:"Emotional gestures that reach for feeling without earning it. Signposting rather than construction.", 2:"No emotional access points. Functional scene work with no affective dimension.", 0:"Actively alienating. The writing closes off emotional access rather than opening it." }},
  { code:"CTX", name:"Contextual resonance",
    floor:3, ceiling:8,
    failureMode:"Timelessness in the wrong direction — not transcendent but unanchored, speaking to no live tension in the present moment.",
    overTuning:"Cultural specificity so foregrounded the work becomes a commentary track on its own moment — every scene legible as a position on a current debate, every character a stand-in for a cultural posture, every plot point a response to discourse. The work dates itself by the hour. It speaks so directly to the present that it has nothing to say to anyone who wasn't there for the conversation it joined.",
    tierAnchors:{ high:"Atlanta, Watchmen, I May Destroy You", mid:"Succession, Andor, The Handmaid's Tale", low:"Downton Abbey, Heartland, Reacher" },
    anchors:{ 10:"The writing feels like it could only have been made now and couldn't wait. Not just reflecting a cultural conversation — advancing or reframing it.", 8:"Clearly in conversation with live cultural tensions. The writing has a point of view on what it's reflecting, not just a mirror.", 6:"Thematically connected to the cultural moment but the connection feels incidental rather than deliberate.", 4:"Timeless in the wrong way — not transcendent but unanchored. No live wire to the present.", 2:"Actively dated or culturally inert. Speaking to nothing alive.", 0:"Culturally negative. The writing misreads or contradicts the moment it's attempting to inhabit." }},
];

// ─── COUPLINGS ──────────────────────────────────────────────────────────────
// Pairs of dimensions that are in tension or reinforce each other.
// antagonistic: high scores on both are rare and unstable — the dimensions pull against each other.
// reinforcing:  high scores on both tend to come together — the same underlying skill feeds both.
const COUPLINGS = [
  // ── Antagonistic ──────────────────────────────────────────────────────────
  { dims:["STR","CHR"], type:"antagonistic",
    note:"Tight architecture tends to subordinate character to structural necessity. The more elaborate the design, the more characters must hit marks the structure demands. Shows that resolve this — The Wire, Breaking Bad — make character logic generate the structure rather than serve it. That resolution is what separates elite from merely excellent." },
  { dims:["ECO","DIA"], type:"antagonistic",
    note:"Distinctive voice needs room. Economy compresses. Sorkin needs long scenes; Milch needs monologues. Highly economical shows tend toward functional dialogue because compression squeezes out the texture where voice lives. A show can be spare or distinctive — doing both simultaneously is one of the harder craft problems in the form." },
  { dims:["ECO","ORI"], type:"antagonistic",
    note:"New forms require apparent waste — the show teaching you how to watch it. Economy wants to cut anything that doesn't serve the immediate. Twin Peaks needs its digressions; Atlanta needs its detours. Compression trims exactly the material that makes an unfamiliar form legible to an audience encountering it for the first time." },
  { dims:["THM","EMR"], type:"antagonistic",
    note:"When theme becomes argument, feeling becomes instrumental. The audience gets argued at rather than moved. The trap is writing that knows what it's about at every moment — the clarity forecloses the ambiguity where genuine emotional response lives. The best work routes theme through emotion rather than over it, so you feel the argument before you understand it." },

  // ── Reinforcing ───────────────────────────────────────────────────────────
  { dims:["STR","THM"], type:"reinforcing",
    note:"Structural precision and thematic coherence build each other. Themes need architecture to develop through a season; structure gains meaning when it serves a thematic design rather than just moving the plot. The Wire's structure is its argument — the institutional logic of the series isn't a backdrop, it's the thesis, and the structural choices make it legible." },
  { dims:["CHR","EMR"], type:"reinforcing",
    note:"Character depth is the primary engine of emotional resonance. You feel because you understand — because the character's logic has been built precisely enough that their specific pain lands as specific, not generic. Almost no show scores high on emotional resonance without scoring high on character logic. The correlation is the closest thing the framework has to a law." },
  { dims:["DIA","TON"], type:"reinforcing",
    note:"Distinctive dialogue and tonal control are usually the same gift. Dialogue sets the register; tone shapes how lines read. Milch's profanity is Deadwood's tone — the two can't be separated. A writer who finds the voice of a world tends to find its temperature simultaneously. Weakness in one is usually weakness in the other." },
  { dims:["CHR","SUB"], type:"reinforcing",
    note:"Complex characters create layers of meaning. Subtext requires people rich enough to have an interior life that differs from their surface. Shallow characters can't carry subtext because there's nothing underneath — the gap between what someone says and what they mean only exists if what they mean has been constructed with enough depth to be worth hiding." },
  { dims:["ORI","TON"], type:"reinforcing",
    note:"Original forms need strong tonal identity to cohere. When the structure is unfamiliar, tone is the anchor that tells the audience they're in safe hands. Atlanta works because its tonal control is absolute even when the form is unrecognizable — the consistent temperature gives permission for the structural instability. Formal originality without tonal control reads as chaos." },
];

// ─── COUPLING HELPERS ───────────────────────────────────────────────────────
const DIM_IDX = Object.fromEntries(DIMS.map((d,i) => [d.code, i]));

function couplingsFor(dimCode) {
  return COUPLINGS.filter(c => c.dims.includes(dimCode)).map(c => {
    const otherCode = c.dims.find(d => d !== dimCode);
    return { ...c, otherCode, otherDim: DIMS[DIM_IDX[otherCode]] };
  });
}

// Returns couplings that are "active" for a given show — where the scores
// make the coupling worth surfacing (both above floor for reinforcing;
// both above ceiling for antagonistic — the show is navigating the tension).
function activeCouplings(show) {
  return COUPLINGS.map(c => {
    const [codeA, codeB] = c.dims;
    const scoreA = show.s[DIM_IDX[codeA]];
    const scoreB = show.s[DIM_IDX[codeB]];
    const dimA   = DIMS[DIM_IDX[codeA]];
    const dimB   = DIMS[DIM_IDX[codeB]];
    const posA   = bandPosition(scoreA, dimA);
    const posB   = bandPosition(scoreB, dimB);

    if (c.type === "antagonistic") {
      // Surface when both scores are above ceiling — the show is operating in
      // the tension zone on both dimensions simultaneously.
      if (posA === "above" && posB === "above")
        return { ...c, scoreA, scoreB, level:"tension" };
      // Also surface when one is high and one is low — the tension may explain the drop.
      if ((posA === "above" && posB === "below") || (posA === "below" && posB === "above"))
        return { ...c, scoreA, scoreB, level:"tradeoff" };
    }
    if (c.type === "reinforcing") {
      // Surface when both are above floor — a genuine shared strength.
      if (posA !== "below" && posB !== "below" && scoreA >= 8 && scoreB >= 8)
        return { ...c, scoreA, scoreB, level:"strength" };
    }
    return null;
  }).filter(Boolean);
}

// ─── BAND HELPERS ──────────────────────────────────────────────────────────
// Three zones, three colors:
//   below floor   → red    (under-developed — craft failure)
//   floor–ceiling → green  (in band — where good work lives)
//   above ceiling → amber  (high-wire — risk of over-tuning, not failure)
function bandPosition(score, dim) {
  if (score < dim.floor) return "below";
  if (score > dim.ceiling) return "above";
  return "inBand";
}

function bandColor(position) {
  if (position === "below") return "#A32D2D";
  if (position === "above") return "#C48B18";
  return "#1D9E75";
}

function bandLabel(position) {
  if (position === "below") return "below floor";
  if (position === "above") return "above ceiling";
  return "in band";
}

// ─── SHOW DATA ─────────────────────────────────────────────────────────────
const SHOWS = [
  {n:"The Wire",                    pl:"HBO",            t:"Elite",              f:"Drama",         ep:13, y:2002, s:[10,10,10,10,9,10,9,10,9,9], a:"Simon builds a system so airtight that every character's failure is structurally inevitable — the dialogue is the institution speaking, and no one inside it can hear themselves."},
  {n:"The Sopranos",                pl:"HBO",            t:"Elite",              f:"Drama",         ep:13, y:1999, s:[9,10,10,10,8,10,10,10,9,8], a:"Chase discovered that a man can be completely legible and completely unknowable at the same time — the therapy scenes are the show's structural spine because Tony explains himself endlessly and it explains nothing."},
  {n:"Mad Men",                     pl:"AMC",            t:"Elite",              f:"Drama",         ep:13, y:2007, s:[9,10,9,10,9,9,9,10,9,9],   a:"Every scene Draper is in has two time periods running simultaneously — the man performing the present and the boy he buried, and Weiner never lets you forget which one is actually driving."},
  {n:"Deadwood",                    pl:"HBO",            t:"Elite",              f:"Drama",         ep:12, y:2004, s:[8,9,10,9,8,10,9,9,8,7],   a:"Milch writes the filthiest Shakespeare on television — the profanity is load-bearing, it's how men without institutions negotiate power, and Al Swearengen is the most articulate monster in the form."},
  {n:"My Mister",                   pl:"tvN",            t:"Elite",              f:"Drama",         ep:16, y:2018, s:[9,10,9,10,9,9,9,10,10,8], a:"Park Hae-young builds a connection between two people who never say what they mean across sixteen episodes of total subtext discipline — the character logic is so precise that a single shared look carries the weight a lesser show would need a monologue for."},
  {n:"The Americans",               pl:"FX",             t:"Excellent",          f:"Drama",         ep:13, y:2013, s:[9,9,8,9,8,8,9,9,9,9],   a:"The Cold War is the marriage's weather, not its subject — Weisberg and Fields build a show about two people lying to everyone including each other, and the tragedy is that the lies are the most intimate thing they share."},
  {n:"Slow Horses",                 pl:"Apple TV+",      t:"Excellent",          f:"Thriller",      ep:6,  y:2022, s:[9,8,9,8,10,7,9,8,8,8],   a:"The pacing is the menace — Herron's structure withholds resolution so precisely that bureaucratic tedium becomes indistinguishable from dread."},
  {n:"True Detective",              pl:"HBO",            t:"Excellent",          f:"Anthology",     ep:8,  y:2014, s:[9,8,9,9,8,9,8,9,8,8],   a:"Pizzolatto structures the investigation across two timelines so the real mystery isn't the case — it's which version of Rust Cohle is true, and the answer reframes every scene you've already watched."},
  {n:"Succession",                  pl:"HBO",            t:"Excellent",          f:"Drama",         ep:10, y:2018, s:[8,9,9,8,8,8,9,8,9,8],   a:"Armstrong writes a family where cruelty is the love language — the jokes are the wounds, and the audience laughs before it realizes what it's laughing at."},
  {n:"Severance",                   pl:"Apple TV+",      t:"Excellent",          f:"Sci-Fi",        ep:9,  y:2022, s:[9,8,7,9,9,10,8,9,8,9],   a:"Erickson uses the severed floor as a structural literalization of dissociation — the premise is the theme, and the horror is that Lumon's logic is indistinguishable from any other workplace's."},
  {n:"Pluribus",                    pl:"Netflix",        t:"Excellent",          f:"Sci-Fi",        ep:9,  y:2025, s:[8,8,8,9,6,9,8,8,7,8],   a:"The show's originality is in its restraint — it refuses the thriller mechanics its premise invites and stays in the philosophical discomfort instead."},
  {n:"Andor",                       pl:"Disney+",        t:"Excellent",          f:"Sci-Fi",        ep:12, y:2022, s:[9,8,9,9,8,8,8,9,8,9],   a:"Gilroy builds the Rebellion as a bureaucracy with its own institutional failures — the structural achievement is making the Empire's logic comprehensible from the inside, which makes resistance feel genuinely costly."},
  {n:"Better Call Saul",            pl:"AMC",            t:"Excellent",          f:"Drama",         ep:10, y:2015, s:[9,8,9,8,7,8,9,7,8,7],   a:"Gilligan and Gould build Jimmy's corruption in increments so small that each individual step is defensible — the tonal control is what makes it tragic rather than inevitable."},
  {n:"Game of Thrones",             pl:"HBO",            t:"Excellent",          f:"Fantasy",       ep:10, y:2011, s:[9,9,8,8,8,8,8,7,8,7],   a:"Martin's structural gambit — killing the character the audience assumed was the protagonist — resets every assumption about how this kind of story works, and the show earns it because Ned's death is internally logical."},
  {n:"Normal People",               pl:"Hulu/BBC",       t:"Excellent",          f:"Drama",         ep:12, y:2020, s:[8,9,8,9,8,7,8,10,9,7],  a:"Rooney trusts the body to carry what the characters can't say — a flinch, a doorway pause, a hand not quite reaching — and the audience feels the entire relationship in the gap."},
  {n:"The Bear",                    pl:"Hulu",           t:"Excellent",          f:"Drama",         ep:8,  y:2022, s:[8,8,8,8,9,8,9,8,8,7],   a:"The kitchen is the nervous system — Calo's tonal control turns a workplace show into a grief show without ever announcing the transition, and the economy means every plate matters."},
  {n:"Breaking Bad",                pl:"AMC",            t:"Excellent",          f:"Drama",         ep:7,  y:2008, s:[9,8,7,7,7,8,7,6,7,6],   a:"The structural precision is Gilligan's signature — Walt's transformation is mapped in scene-level cause and effect so airtight that the audience is implicated in every step it watched him justify."},
  {n:"I May Destroy You",           pl:"BBC/HBO",        t:"Excellent",          f:"Drama",         ep:12, y:2020, s:[8,9,9,10,8,10,9,8,9,9], a:"Coel refuses the trauma narrative's expected shape — the thematic originality is that recovery and self-destruction are shown as the same impulse, and the audience never gets the catharsis it keeps being offered."},
  {n:"Watchmen",                    pl:"HBO",            t:"Excellent",          f:"Limited",       ep:9,  y:2019, s:[9,9,8,10,9,9,8,9,8,9],  a:"Lindelof takes Moore's text seriously enough to argue with it — the thematic coherence is that every structural choice forces the question of who gets to wear the mask, and the Tulsa massacre grounds the superhero mythology in actual history."},
  {n:"Atlanta",                     pl:"FX",             t:"Excellent",          f:"Comedy-Drama",  ep:10, y:2016, s:[8,9,9,9,9,10,10,9,8,9], a:"Glover invents a tonal register that has no name — each episode can shift from comedy to surrealism to horror without warning because the show's originality is that Black experience in America already contains all those registers simultaneously."},
  {n:"The Last of Us",              pl:"HBO",            t:"Excellent",          f:"Drama",         ep:9,  y:2023, s:[9,9,8,9,8,7,9,8,8,7],   a:"Mazin and Druckmann understand that the apocalypse is structural backdrop — the character logic of Joel's final choice is built across nine episodes so precisely that the audience knows it's coming and can't stop it."},
  {n:"Shogun",                      pl:"FX/Hulu",        t:"Excellent",          f:"Drama",         ep:10, y:2024, s:[9,9,9,9,9,8,8,9,8,8],   a:"Coto and Lucero treat cultural untranslatability as the show's central structural device — the Japanese dialogue the audience can't follow is doing exactly what Blackthorne can't follow, and Mariko's position between languages is where all the dramatic charge lives."},
  {n:"The Night Of",                pl:"HBO",            t:"Excellent",          f:"Limited",       ep:8,  y:2016, s:[9,9,8,10,9,8,9,9,8,8],  a:"Price builds the legal system as a machine that processes people rather than guilt — the thematic coherence is total because every institution Naz touches, including the ones trying to help him, makes him less himself."},
  {n:"Twin Peaks",                  pl:"ABC",            t:"Excellent",          f:"Drama",         ep:8,  y:1990, s:[7,8,9,8,6,10,8,9,8,7],  a:"Lynch discovers that American small-town warmth and genuine evil can occupy the same tonal space without one cancelling the other — the originality is that the horror is more disturbing because the pie is also sincerely good."},
  {n:"The Shield",                  pl:"FX",             t:"Excellent",          f:"Drama",         ep:13, y:2002, s:[9,9,8,8,8,9,8,7,7,7],   a:"Shawn Ryan builds a protagonist whose structural function is to make the audience complicit — Vic Mackey's corruption is presented with enough competence that you keep rooting for him to escape consequences you know he deserves."},
  {n:"Broadchurch",                 pl:"ITV",            t:"Excellent",          f:"Limited",       ep:8,  y:2013, s:[9,9,8,8,9,7,9,8,8,7],   a:"Chibnall builds the investigation around community fracture — the structural tightness is that every reveal damages someone the audience has come to trust, and the tonal control means the grief never tips into melodrama."},
  {n:"Mr. Robot",                   pl:"USA Network",    t:"Excellent",          f:"Thriller",      ep:10, y:2015, s:[9,9,8,9,8,9,8,9,7,8],   a:"Esmail structures the unreliable narrator so precisely that the audience's complicity in Elliot's worldview is the show's actual subject — the subtext is that we needed his conspiracy to be true as much as he did."},
  {n:"Blue Eye Samurai",            pl:"Netflix",        t:"Excellent",          f:"Animation",     ep:8,  y:2023, s:[9,9,8,9,9,9,8,8,8,7],   a:"Ransom and Kwan use the animation form to do things live action can't — the structural and character logic of Mizu's vengeance is built with enough contradiction that the show is genuinely uncertain whether it endorses her, which is exactly the right question."},
  {n:"Mindhunter",                  pl:"Netflix",        t:"Excellent",          f:"Thriller",      ep:10, y:2017, s:[9,8,9,9,9,8,9,8,7,8],   a:"Fincher and Penhall make the methodology the subject — the structural and tonal control is in how Holden's clinical precision slowly compromises him, and the most disturbing scenes are the interviews where everyone is perfectly reasonable."},
  {n:"Barry",                       pl:"HBO",            t:"Excellent",          f:"Comedy-Drama",  ep:8,  y:2018, s:[8,9,8,9,8,9,9,8,8,8],   a:"Hader builds a show where the tonal violence is the point — every time Barry almost becomes a different person, the character logic snaps him back, and the comedy makes the tragedy land harder."},
  {n:"Arrested Development",        pl:"Fox",            t:"Excellent",          f:"Comedy",        ep:22, y:2003, s:[9,8,9,8,7,10,9,8,7,6],  a:"Hurwitz invents a structural density that rewards obsessive attention — jokes planted in season one pay off in season three, and the originality is that the show trusts the audience to do the work of assembly."},
  {n:"Hannibal",                    pl:"NBC",            t:"Excellent",          f:"Thriller",      ep:13, y:2013, s:[8,9,8,9,7,9,9,9,8,7],   a:"Fuller makes aesthetic coherence do moral work — Hannibal's world is so beautiful that the audience shares Will's susceptibility, and the subtext of every scene is the question of whether appreciation is already complicity."},
  {n:"Reservation Dogs",            pl:"FX on Hulu",     t:"Excellent",          f:"Comedy-Drama",  ep:8,  y:2021, s:[7,8,9,9,8,10,9,8,8,9],  a:"Sterlin Harjo finds a tonal register that is genuinely new — the humor is never at the community's expense, the grief is never aestheticized, and the originality is that the show treats its characters' interiority as the subject rather than their circumstance."},
  {n:"The Leftovers",               pl:"HBO",            t:"Excellent",          f:"Drama",         ep:10, y:2014, s:[8,9,8,9,7,9,8,8,8,8],   a:"Lindelof and Perrotta refuse to explain the departure and use that refusal structurally — the originality is that the show is about grief's irrationality, and explaining the cause would make the grief rational, which would be a lie."},
  {n:"Dark",                        pl:"Netflix",        t:"Excellent",          f:"Sci-Fi",        ep:10, y:2017, s:[9,7,7,9,8,10,8,8,7,8],   a:"Bo Odar and Friese build a time loop with enough structural integrity that the paradoxes are features rather than failures — the originality is that the show treats causality as a tragic condition rather than a puzzle to be solved."},
  {n:"Yellowjackets",               pl:"Showtime",       t:"Excellent",          f:"Drama",         ep:10, y:2021, s:[9,8,8,8,8,8,8,8,7,8],   a:"Lyle and Nickerson build the dual timeline so the present-day women's damage is structurally explained by what the forest did to the teenage girls — the architecture means you're always watching two shows simultaneously and neither fully answers the other."},
  {n:"Invincible",                  pl:"Amazon",         t:"Excellent",          f:"Animation",     ep:8,  y:2021, s:[9,9,8,9,8,9,8,8,7,7],   a:"Walker uses the superhero genre's structural expectations as a trap — the character logic of Omni-Man's reveal is built across seven episodes of apparent sincerity, and the violence lands so hard because the show earned the innocence it destroys."},
  {n:"Pantheon",                    pl:"AMC+",           t:"Excellent",          f:"Animation",     ep:8,  y:2022, s:[9,8,8,10,9,10,8,9,7,9], a:"Chung and the writing room use digital consciousness to ask the oldest philosophical questions with genuine urgency — the thematic originality is that the show treats the uploaded mind as a civil rights subject before anyone else thought to."},
  {n:"The Bureau",                  pl:"Canal+",         t:"Excellent",          f:"Thriller",      ep:10, y:2015, s:[9,9,9,9,9,9,9,10,9,8],  a:"Schlesser builds a spy drama where the tradecraft is the emotional architecture — Guillaume's inability to leave his cover identity behind is not a plot complication but the show's precise subject, and the subtext never surfaces because it doesn't need to."},
  {n:"Gomorrah",                    pl:"Sky Atlantic",   t:"Excellent",          f:"Drama",         ep:12, y:2014, s:[9,9,8,9,8,9,8,8,8,9],   a:"Stefano Sollima builds the Camorra as an ecosystem with its own internal logic — the structural achievement is that the institution's rules are comprehensible even as they destroy everyone inside them, which is closer to The Wire's method than anything else made outside America."},
  {n:"Signal",                      pl:"tvN",            t:"Excellent",          f:"Thriller",      ep:16, y:2016, s:[9,9,8,9,8,9,8,8,8,8],   a:"Kim Eun-hui uses the time-crossing radio as a structural device that is also the show's moral engine — every cold case the characters reopen costs something in the present, and the thematic coherence is that justice always arrives too late or at too high a price."},
  {n:"Sacred Games",                pl:"Netflix",        t:"Excellent",          f:"Thriller",      ep:8,  y:2018, s:[9,9,8,9,8,9,8,8,8,9],   a:"Kashyap and Motwane build the dual timeline so Ganesh Gaitonde's mythology and Sartaj Singh's procedural reality comment on each other without ever merging — the structural ambition is that the show treats Mumbai's criminal history as inseparable from its political one."},
  {n:"The Killing",                 pl:"DR1",            t:"Excellent",          f:"Thriller",      ep:10, y:2007, s:[9,9,8,8,9,8,9,8,8,7],   a:"Sveistrup slows the procedural down until the investigation becomes a study of grief — the structural economy is in running the police case, the family's collapse, and the political fallout at exactly the same pace so none of them resolves before the others."},
  {n:"Borgen",                      pl:"DR1",            t:"Excellent",          f:"Drama",         ep:10, y:2010, s:[9,9,9,9,8,8,9,8,8,9],   a:"Adam Price builds political compromise as a structural principle — Birgitte's every victory costs her something personal, and the thematic coherence is that the show never pretends the trade-off is worth it or isn't."},
  {n:"Rectify",                     pl:"Sundance TV",    t:"Excellent",          f:"Drama",         ep:6,  y:2013, s:[8,9,9,9,9,9,9,9,8,7],   a:"Ray McKinnon builds the slowest thriller on television — the subtext in every scene is Daniel's inability to inhabit time normally after nineteen years of wrongful imprisonment, and the dialogue finds the exact register of a man relearning how to be present."},
  {n:"Patriot",                     pl:"Amazon",         t:"Excellent",          f:"Drama",         ep:10, y:2015, s:[8,9,9,9,9,10,9,9,8,7],  a:"Melamed writes grief as deadpan inconvenience — the originality is total, the jokes are load-bearing, and the comedy only works because the sadness underneath it is completely serious."},
  {n:"The Larry Sanders Show",      pl:"HBO",            t:"Excellent",          f:"Comedy",        ep:13, y:1992, s:[8,9,9,8,9,10,9,9,8,8],  a:"Shandling invents the template that The Office, Curb, and Extras all inherit — the originality is using the talk show format to expose the gap between the performed warmth of celebrity and the cold transactions underneath it, and the character logic of Hank is the show's moral center precisely because he never sees it."},
  {n:"My Brilliant Friend",         pl:"HBO/RAI",        t:"Excellent",          f:"Drama",         ep:8,  y:2018, s:[9,9,8,9,8,8,9,9,8,8],   a:"Costanzo and Angri build Ferrante's dual protagonist structure with enough fidelity that the adaptation question becomes the show's subtext — whose story is this, Elena's or Lila's, and the structural achievement is sustaining that irresolution across eight episodes without the novel's first-person authority to lean on."},
  {n:"The Bad Kids",                pl:"iQIYI",          t:"Excellent",          f:"Thriller",      ep:12, y:2020, s:[10,9,8,9,9,9,9,9,8,8],  a:"Xin Shuang builds a structural trap so precise that the audience's moral certainty reverses twice before the finale — the subtext density is total, the character logic of every child is built from irrecoverable circumstance, and the show understands that innocence and culpability can occupy the same person at the same time."},
  {n:"The OA",                      pl:"Netflix",        t:"Excellent",          f:"Sci-Fi",        ep:8,  y:2016, s:[8,9,7,9,6,10,8,9,9,8],  a:"Marling and Batmanglij build a show whose structural ambition exceeds its execution — the premise is genuinely original, the emotional logic of the basement scenes is constructed with total conviction, and the finale earns either everything or nothing depending on whether you've bought in, which is exactly the gamble they intended."},
  {n:"Sherlock",                    pl:"BBC One",        t:"Very Good",          f:"Mystery",       ep:3,  y:2010, s:[7,7,9,6,7,8,8,5,6,5],   a:"Gatiss and Moffat find the one voice that makes Holmes contemporary without updating him — the dialogue is the character, and Cumberbatch delivers it like a man who finds human conversation a fascinating but slightly broken system."},
  {n:"Beef",                        pl:"Netflix",        t:"Very Good",          f:"Comedy-Drama",  ep:10, y:2023, s:[8,8,8,9,7,8,8,7,8,8],   a:"Lee Sung Jin builds a road rage incident into a meditation on immigrant shame — the thematic coherence holds because both protagonists are running from the same thing through opposite directions."},
  {n:"Adolescence",                 pl:"Netflix",        t:"Very Good",          f:"Limited",       ep:4,  y:2025, s:[9,8,7,8,9,9,7,7,8,8],   a:"Thorne's single-take structure is not a gimmick — the economy of having no cuts means the audience can't look away from what the family is doing to itself in real time, and the structural commitment earns the final episode's devastation."},
  {n:"Chernobyl",                   pl:"HBO",            t:"Very Good",          f:"Limited",       ep:5,  y:2019, s:[10,7,7,9,10,7,7,7,8,8], a:"Mazin builds the disaster from institutional logic outward — the structural and economic precision is that every failure is a bureaucratic failure first, and the horror is how recognizable the decision-making is."},
  {n:"Lost",                        pl:"ABC",            t:"Very Good",          f:"Sci-Fi",        ep:25, y:2004, s:[7,7,6,7,5,9,7,6,7,6],   a:"Abrams, Lindelof and Lieber's structural originality is the flashback as character revelation — in season one, cutting to the past recontextualizes the present in ways that feel genuinely surprising rather than merely delayed."},
  {n:"The West Wing",               pl:"NBC",            t:"Very Good",          f:"Drama",         ep:22, y:1999, s:[7,7,10,8,7,8,7,6,7,7],  a:"Sorkin writes dialogue that thinks faster than the characters can — the walk-and-talk is a craft decision, not a stylistic habit, because the pace of the conversation is the argument for competent governance."},
  {n:"Pachinko",                    pl:"Apple TV+",      t:"Very Good",          f:"Drama",         ep:8,  y:2022, s:[8,8,7,9,7,7,8,8,8,8],   a:"Kogonada and Suljic use the multi-generational structure so the thematic weight accumulates across time periods — Sunja's survival is comprehensible as character logic only once you've seen what her descendants are still paying for it."},
  {n:"Fleabag",                     pl:"BBC Three",      t:"Very Good",          f:"Comedy-Drama",  ep:6,  y:2016, s:[8,8,9,8,9,9,8,7,9,8],  a:"Waller-Bridge makes the fourth wall breaks structural rather than stylistic — the moment she stops breaking it is the emotional axis of the whole series because the audience loses the only honest relationship she has."},
  {n:"Fargo",                       pl:"FX",             t:"Very Good",          f:"Anthology",     ep:10, y:2014, s:[9,8,8,8,8,7,9,7,7,7],   a:"Hawley builds a Coen Brothers world with enough structural confidence that the homage becomes its own thing — the tonal control is in keeping the violence deadpan when the characters would make it operatic."},
  {n:"Slings & Arrows",             pl:"Showcase",       t:"Very Good",          f:"Comedy-Drama",  ep:6,  y:2003, s:[8,8,8,8,8,7,8,7,7,6],   a:"Whittaker and McKinney find a structural conceit — mounting Hamlet while being haunted by the last director who mounted it — that makes the Shakespeare thematically load-bearing rather than decorative."},
  {n:"The Office (UK)",             pl:"BBC Two",        t:"Very Good",          f:"Comedy",        ep:6,  y:2001, s:[8,8,8,8,9,9,8,8,7,6],   a:"Gervais and Merchant use the mockumentary form so the camera's presence is always a moral question — David Brent is performing for an audience that's performing indifference, and the economy means there's nowhere to hide."},
  {n:"Mr Inbetween",                pl:"FX",             t:"Very Good",          f:"Comedy-Drama",  ep:6,  y:2018, s:[7,8,8,7,10,7,9,7,7,7],  a:"Edgerton builds a hitman whose domesticity is completely sincere — the economy is total, the tonal control is in playing both registers straight, and the show's originality is refusing to make the violence and the tenderness comment on each other."},
  {n:"Long Story Short",            pl:"Netflix",        t:"Very Good",          f:"Animation",     ep:10, y:2025, s:[8,8,7,8,7,8,8,7,7,7],   a:"The structural device of accelerated time is used with enough emotional discipline that the comedy and the loss accumulate together rather than alternating."},
  {n:"Seinfeld",                    pl:"NBC",            t:"Very Good",          f:"Comedy",        ep:5,  y:1989, s:[6,7,8,6,7,9,8,5,6,5],   a:"David and Seinfeld invent a structural rule — no learning, no hugging — and execute it with enough originality that the show's refusal to be warm becomes its own kind of moral position."},
  {n:"The Boys",                    pl:"Amazon",         t:"Very Good",          f:"Sci-Fi",        ep:8,  y:2019, s:[7,7,7,8,7,8,8,6,6,7],   a:"Kripke uses the superhero genre as political satire with enough thematic coherence that the violence isn't shock value — Homelander is a specific diagnosis of what happens when power has no accountability and needs to be loved."},
  {n:"Bad Sisters",                 pl:"Apple TV+",      t:"Very Good",          f:"Comedy-Drama",  ep:10, y:2022, s:[8,7,7,7,7,7,9,6,7,7],   a:"McInerney's tonal control is the achievement — a show about plotting murder that is also genuinely about grief and sisterhood, and neither register undermines the other because the target earns what's coming."},
  {n:"Justified",                   pl:"FX",             t:"Very Good",          f:"Drama",         ep:13, y:2010, s:[8,9,9,8,8,8,9,7,7,6],   a:"Yost and Graham give Raylan and Boyd a dynamic where the dialogue between them is a form of mutual recognition — two men who understand each other completely and have chosen opposite sides, and every scene they share is structured around what they won't say."},
  {n:"The Good Place",              pl:"NBC",            t:"Very Good",          f:"Comedy",        ep:13, y:2016, s:[9,8,8,9,8,9,8,8,7,7],   a:"Schur's structural originality is the first-season twist, but the thematic achievement is that the show uses it to ask whether people can actually change — and answers that question with enough seriousness that the philosophy is load-bearing rather than decorative."},
  {n:"Peep Show",                   pl:"Channel 4",      t:"Very Good",          f:"Comedy",        ep:6,  y:2003, s:[7,9,9,8,9,10,8,8,7,6],  a:"Armstrong and Bain make the POV camera structurally necessary — the originality is that we hear the characters' internal voices, which are always more cowardly than what they say, and the comedy is the gap between thought and action."},
  {n:"The Expanse",                 pl:"Syfy/Amazon",    t:"Very Good",          f:"Sci-Fi",        ep:10, y:2015, s:[8,8,7,8,7,8,7,7,6,7],   a:"Naren Shankar builds hard science fiction where the structural integrity comes from taking physics seriously — the Epstein Drive's limitations are plot constraints, and the thematic coherence is that expansion of human civilization reproduces human hierarchy."},
  {n:"Black Mirror",                pl:"Channel 4",      t:"Very Good",          f:"Anthology",     ep:3,  y:2011, s:[8,7,8,9,9,10,8,7,7,8],  a:"Brooker's structural economy is a short-story writer's — each episode uses exactly the technology it needs and no more, and the originality is that the horror is never the technology itself but the human behavior that the technology makes slightly more efficient."},
  {n:"Curb Your Enthusiasm",        pl:"HBO",            t:"Very Good",          f:"Comedy",        ep:10, y:2000, s:[8,8,9,7,9,9,8,6,7,6],   a:"David improvises a structural tightness that scripted comedy rarely achieves — the callbacks are load-bearing, and the originality is that Larry's social pathology is presented with enough internal logic that his grievances are almost always technically correct."},
  {n:"Veep",                        pl:"HBO",            t:"Very Good",          f:"Comedy",        ep:8,  y:2012, s:[7,8,9,7,8,8,8,6,7,6],   a:"Iannucci builds a political world where the dialogue is the politics — Selina's team speaks in status moves and the comedy is structural, built from the gap between their self-importance and their actual irrelevance."},
  {n:"Rick and Morty",              pl:"Adult Swim",     t:"Very Good",          f:"Animation",     ep:11, y:2013, s:[7,8,9,8,8,9,9,7,6,7],   a:"Harmon and Roiland find a tonal register where nihilism and genuine emotion coexist without either undermining the other — the originality is that Rick's intelligence is presented as a prison rather than a superpower."},
  {n:"Avatar: The Last Airbender",  pl:"Nickelodeon",    t:"Very Good",          f:"Animation",     ep:20, y:2005, s:[8,8,7,8,7,9,8,7,7,6],   a:"DiMartino and Konietzko build a world where the structural logic of bending is also the thematic logic — Aang's airbender pacifism is a genuine position in conflict with what the plot requires, and the show doesn't cheat it."},
  {n:"BoJack Horseman",             pl:"Netflix",        t:"Very Good",          f:"Animation",     ep:12, y:2014, s:[7,8,8,8,7,9,8,8,8,8],   a:"Raphael Bob-Waksberg uses the animated world to literalize depression's distortion — BoJack's self-destruction follows a character logic so precise that each relapse is structurally inevitable, and the show's originality is refusing to make recovery feel clean."},
  {n:"Batman: The Animated Series", pl:"Fox Kids",       t:"Very Good",          f:"Animation",     ep:28, y:1992, s:[7,8,8,8,6,9,9,7,7,6],   a:"Timm and Dini build a tonal register that takes the villains seriously as psychological portraits — the originality is that every Rogues Gallery episode is about the particular shape of a broken person's pain rather than the mechanics of a scheme."},
  {n:"The Good Wife",               pl:"CBS",            t:"Very Good",          f:"Drama",         ep:23, y:2009, s:[8,8,8,8,7,7,8,7,6,6],   a:"The Kings build Alicia's professional competence as the show's emotional anchor — the structural achievement is a network procedural with enough character logic that the case-of-the-week format serves the long arc rather than interrupting it."},
  {n:"Peaky Blinders",              pl:"BBC One",        t:"Very Good",          f:"Drama",         ep:6,  y:2013, s:[8,8,8,7,8,7,8,7,6,6],   a:"Knight builds Tommy Shelby as a man whose structural function is to be three moves ahead of everyone — the tonal control is in keeping the violence operatic without tipping into self-parody, and the character logic holds because Tommy's intelligence is also his isolation."},
  {n:"30 Rock",                     pl:"NBC",            t:"Very Good",          f:"Comedy",        ep:21, y:2006, s:[7,8,9,7,6,8,8,6,6,6],   a:"Fey and Carlock build a joke density that requires the dialogue to operate on three levels simultaneously — the originality is that the show satirizes the industry it's made inside without the satire ever becoming the point."},
  {n:"Halt and Catch Fire",         pl:"AMC",            t:"Very Good",          f:"Drama",         ep:10, y:2014, s:[7,8,8,7,8,7,8,7,7,7],   a:"Rogers and Cantwell build the tech industry's early years through character logic rather than mythology — the tonal achievement is finding genuine drama in people who are driven by a vision they can't fully articulate, which is what the industry actually looked like."},
  {n:"Poker Face",                  pl:"Peacock",        t:"Very Good",          f:"Mystery",       ep:10, y:2023, s:[8,8,8,7,8,8,8,6,6,6],   a:"Johnson inverts the procedural — showing the crime first, then Charlie solving it — and the structural elegance is that the inverted form is the character: a woman who can't be lied to in a genre built on deception."},
  {n:"The Pitt",                    pl:"Max",            t:"Very Good",          f:"Drama",         ep:15, y:2025, s:[9,8,8,8,9,7,8,7,7,7],   a:"Green builds the ER as a pressure system — the structural economy of real time means every scene is load-bearing, and the tonal control is in keeping the medical crisis and the institutional crisis running at exactly the same temperature."},
  {n:"Silo",                        pl:"Apple TV+",      t:"Very Good",          f:"Sci-Fi",        ep:10, y:2023, s:[8,8,7,8,8,7,7,7,6,7],   a:"Graham Yost builds the silo's social hierarchy with enough structural logic that the mystery of the outside world is less interesting than the question of why the inside world works the way it does."},
  {n:"The Handmaid's Tale",         pl:"Hulu",           t:"Very Good",          f:"Drama",         ep:10, y:2017, s:[8,8,7,9,7,7,8,7,8,9],   a:"Miller's structural discipline is in never letting Offred's interiority tip into speechifying — the thematic and contextual weight is carried by what June observes and endures rather than what she explains, and the silence does more work than the voiceover."},
  {n:"Only Murders in the Building",pl:"Hulu",           t:"Very Good",          f:"Mystery",       ep:10, y:2021, s:[8,8,8,7,8,8,8,6,7,7],   a:"Martin, Short and Selick build a mystery where the structural pleasure is the amateur investigators' incompetence — the originality is that the podcast format is also a character study of three lonely people who need the case more than they need the solution."},
  {n:"The Marvelous Mrs. Maisel",   pl:"Amazon",         t:"Very Good",          f:"Comedy-Drama",  ep:8,  y:2017, s:[8,8,9,7,7,8,9,6,7,6],   a:"Sherman-Palladino builds a period comedy where the dialogue velocity is the show's visual signature — the tonal control is in sustaining a register of sustained exhilaration across a full season without it curdling into exhaustion."},
  {n:"Misaeng",                     pl:"tvN",            t:"Very Good",          f:"Drama",         ep:20, y:2014, s:[8,9,8,9,8,8,8,8,8,8],   a:"Yoon Tae-ho builds a workplace drama where every office dynamic is also a class and gender argument — the character logic of Jang Geurae's outsider status is the structural engine, and the show understands that competence earned outside the system is only legible to the system on the system's terms."},
  {n:"Call My Agent",               pl:"France 2",       t:"Very Good",          f:"Comedy-Drama",  ep:6,  y:2015, s:[8,8,8,7,8,8,8,7,7,7],   a:"Jaoui and Taddeï build a workplace comedy where the industry's vanity is structural — each episode's celebrity guest is a mirror for the agents' own insecurities, and the ensemble character logic holds because everyone in the building is performing a version of themselves they can't quite sustain."},
  {n:"Babylon Berlin",              pl:"Sky One",        t:"Very Good",          f:"Drama",         ep:8,  y:2017, s:[9,8,8,8,8,8,8,7,7,8],   a:"von Borries and Tykwer build Weimar-era Berlin as a structural argument — the city's chaos is the show's formal principle, and the thematic coherence is that every institution depicted is already collapsing in ways its occupants can't yet name."},
  {n:"Spaced",                      pl:"Channel 4",      t:"Very Good",          f:"Comedy",        ep:7,  y:1999, s:[8,8,9,7,9,9,9,7,7,6],   a:"Wright and Pegg build a sitcom where the visual language is the comedy — the pop-culture references are structural rather than decorative, and the originality is that the genre parody works because the characters' emotional lives are completely sincere."},
  {n:"Schitt's Creek",              pl:"CBC/Pop",        t:"Very Good",          f:"Comedy",        ep:13, y:2015, s:[7,8,8,7,7,7,8,6,7,7],   a:"Daniel and Eugene Levy build character arcs where the growth is structural — the Rose family's transformation from contemptible to sympathetic is engineered across seasons with enough restraint that you don't notice it happening until it already has."},
  {n:"What We Do in the Shadows",   pl:"FX",             t:"Very Good",          f:"Comedy",        ep:10, y:2019, s:[8,8,9,7,8,8,9,6,6,6],   a:"Clement and Waititi's mockumentary format is doing something the original film couldn't — the originality is that the Staten Island setting makes the vampires' irrelevance to modernity the show's actual subject, and Nandor's sincere confusion is more interesting than any satire."},
  {n:"Frasier",                     pl:"NBC",            t:"Very Good",          f:"Comedy",        ep:24, y:1993, s:[8,8,9,7,8,7,8,7,7,6],   a:"Angell, Casey and Lee build the most structurally precise network sitcom ever made — the farce mechanics are always in service of character exposure, and the originality is that Frasier's pretension is presented as a genuine wound rather than a target."},
  {n:"Cheers",                      pl:"NBC",            t:"Very Good",          f:"Comedy",        ep:22, y:1982, s:[7,8,9,7,8,7,8,7,7,6],   a:"Charles, Charles and Burrows establish the grammar of the American ensemble sitcom — the character logic of Sam and Diane creates the template for every will-they-won't-they dynamic that follows, and the bar as structural container makes every relationship inevitable."},
  {n:"Fauda",                       pl:"Yes Oh",         t:"Very Good",          f:"Thriller",      ep:12, y:2015, s:[8,8,8,8,8,8,8,7,7,8],   a:"Issacharoff and Lavi build the conflict's moral ambiguity into the show's structure — Doron's undercover work requires him to inhabit the enemy's humanity, and the thematic coherence is that the show refuses to resolve whether this makes him more or less dangerous than the people he's hunting."},
  {n:"Homicide: Life on the Street", pl:"NBC",           t:"Very Good",          f:"Drama",         ep:22, y:1993, s:[8,9,9,8,8,8,8,8,7,7],   a:"Levinson and Simon build the precinct as a pressure cooker where every detective's moral compromise is the show's actual subject — the dialogue is the first time network television sounded like people actually talk, and the structural restraint of leaving cases unsolved was a genuine formal argument."},
  {n:"Spiral",                      pl:"France 2",       t:"Very Good",          f:"Thriller",      ep:8,  y:2005, s:[9,9,8,8,9,8,8,8,7,7],   a:"Groix builds the French justice system as a structurally compromised institution — running the police, the lawyers, and the judiciary in parallel means the audience watches the same case from three incompatible moral positions simultaneously, and the structural integrity is that none of them is wrong."},
  {n:"Law & Order",                 pl:"NBC",            t:"Very Good",          f:"Drama",         ep:22, y:1990, s:[8,7,7,7,8,8,8,6,6,7],   a:"Wolf invents the two-act procedural — the crime half and the courtroom half running at exactly the same temperature — and the structural originality is that the format is also an argument: the law is a system, not a person, and the system's logic is always more interesting than any individual inside it."},
  {n:"Monk",                        pl:"USA Network",    t:"Very Good",          f:"Mystery",       ep:13, y:2002, s:[7,8,8,6,7,7,8,5,6,5],   a:"Breckman builds the OCD detective as a structural principle rather than a quirk — Monk's disorder is the reason he solves cases and the reason he can't live, and the character logic is that his disability and his gift are the same thing, which gives the procedural format more emotional weight than it usually carries."},
  {n:"Hacks",                       pl:"Max",            t:"Very Good",          f:"Comedy-Drama",  ep:10, y:2021, s:[8,9,9,8,8,8,9,7,8,8],   a:"Statsky, Einbinder and Higginbotham build a mentorship where the generational conflict is structural — Deborah and Ava's comedy instincts are incompatible in ways that map precisely onto their different relationships with compromise, and the character logic of both women is sharp enough that the audience is never fully on either side."},
  {n:"NYPD Blue",                   pl:"ABC",            t:"Very Good",          f:"Drama",         ep:22, y:1993, s:[8,8,8,7,7,7,8,7,7,7],   a:"Bochco and Milch build the detective procedural as a character study of institutional masculinity — Sipowicz's arc across the season is the show's structural spine, and the dialogue finds a register of inarticulate honesty that network television had never attempted before."},
  {n:"Oz",                          pl:"HBO",            t:"Very Good",          f:"Drama",         ep:8,  y:1997, s:[7,8,7,8,6,9,7,7,7,8],   a:"Fontana builds the prison as a laboratory for institutional violence — the structural roughness is real but the originality is total, and Oz invented the HBO drama's willingness to treat consequence as permanent before The Sopranos made it elegant."},
  {n:"Delhi Crime",                 pl:"Netflix",        t:"Very Good",          f:"Drama",         ep:7,  y:2019, s:[8,8,8,8,8,7,8,7,7,8],   a:"Richie Mehta builds the investigation as an institutional portrait — the structural achievement is running the police procedure and the survivor's trauma at the same pace so neither subsumes the other, and the thematic coherence is that the crime is never separable from the social conditions that produced it."},
  {n:"Occupied",                    pl:"TV2",            t:"Very Good",          f:"Thriller",      ep:10, y:2015, s:[8,8,7,8,8,8,8,7,7,8],   a:"Røssum and Jo Nesbø build the occupation as a structural slow burn — the originality is that the threat is always political before it is physical, and the thematic coherence is that Norway's complicity in its own occupation is more disturbing than any external aggressor could be."},
  {n:"Kingdom",                     pl:"Netflix",        t:"Very Good",          f:"Drama",         ep:6,  y:2019, s:[9,8,7,9,9,9,8,7,7,8],   a:"Kim Eun-hui uses the zombie plague as a structural argument about class — the undead spread from the bottom up because hunger and desperation travel the same routes, and the structural economy of six episodes means every scene is doing political and genre work simultaneously."},
  {n:"Shrinking",                   pl:"Apple TV+",      t:"Solid",              f:"Comedy-Drama",  ep:10, y:2023, s:[7,8,8,7,7,6,8,6,6,6],   a:"Lawrence and Segel build a therapy show where the therapist is the most broken person in the room — the tonal and character logic holds because Jimmy's bad advice is given with genuine love, which is a more interesting wrong than selfishness."},
  {n:"Ted Lasso",                   pl:"Apple TV+",      t:"Solid",              f:"Comedy",        ep:10, y:2020, s:[7,7,7,7,7,6,8,5,6,6],   a:"Sudeikis and Lawrence build sincerity as a structural value in a genre that usually treats it as naivety — the tonal control is in playing Ted's optimism completely straight, which makes it work when it shouldn't."},
  {n:"The Diplomat",                pl:"Netflix",        t:"Solid",              f:"Drama",         ep:8,  y:2023, s:[7,6,7,6,7,5,7,5,5,6],   a:"Caulfield builds enough structural momentum that the plot mechanics carry the show past the tonal inconsistencies — Kate Wyler's character logic holds in the procedural scenes even when the dialogue reaches for Sorkin and lands somewhere short."},
  {n:"Stranger Things",             pl:"Netflix",        t:"Solid",              f:"Sci-Fi",        ep:8,  y:2016, s:[8,6,5,6,7,6,7,4,6,6],   a:"The Duffer Brothers build a structural engine that runs on nostalgia — the first season's economy is tight enough that the Spielberg references feel earned rather than borrowed, and Eleven's character logic gives the supernatural stakes a human anchor."},
  {n:"White Lotus",                 pl:"HBO",            t:"Solid",              f:"Anthology",     ep:6,  y:2021, s:[7,7,7,7,7,7,7,6,6,6],   a:"White builds a consistent tonal register around class anxiety — the structural evenness means no scene does more than its job, which is appropriate for a show whose subject is people who have everything and feel nothing."},
  {n:"Top of the Lake",             pl:"BBC/Sundance",   t:"Solid",              f:"Drama",         ep:7,  y:2013, s:[6,7,7,7,5,7,6,7,6,6],   a:"Campion builds the New Zealand landscape as a psychological condition — the subtext of every Robin scene is a woman trying to investigate a crime in the community that shaped her trauma, and the character logic holds even when the structure doesn't."},
  {n:"Downton Abbey",               pl:"ITV",            t:"Solid",              f:"Drama",         ep:7,  y:2010, s:[7,6,6,5,6,4,7,4,5,4],   a:"Fellowes builds tonal consistency as the show's primary achievement — Downton knows exactly what kind of comfort it's offering, the structural engine runs on propriety and disruption, and it delivers reliably on both."},
  {n:"The Newsroom",                pl:"HBO",            t:"Solid",              f:"Drama",         ep:10, y:2012, s:[6,5,8,7,5,5,5,4,5,6],   a:"Sorkin's dialogue is the show's ceiling and its problem — the characters are too articulate to be plausible and the tonal register mistakes eloquence for depth, but the speeches are genuinely well-constructed arguments even when the drama around them isn't."},
  {n:"Arcane",                      pl:"Netflix",        t:"Solid",              f:"Animation",     ep:9,  y:2021, s:[8,7,6,7,7,7,7,6,7,6],   a:"Linke and Yee build the structural opposition between Piltover and the Undercity with enough thematic coherence that the class conflict is legible even to viewers who've never played the game — the visual craft is the show's strongest dimension."},
  {n:"Abbott Elementary",           pl:"ABC",            t:"Solid",              f:"Comedy",        ep:13, y:2021, s:[6,7,7,6,7,5,7,4,5,5],   a:"Quinta Brunson builds a workplace comedy where the institution's failure is structural — the character logic of teachers who keep showing up despite the conditions is the show's emotional engine, and the mockumentary form makes the systemic critique feel personal rather than polemical."},
  {n:"The Simpsons",                pl:"Fox",            t:"Solid",              f:"Animation",     ep:13, y:1989, s:[5,6,7,6,6,8,7,5,5,5],   a:"Groening, Brooks and Simon build a satirical originality that is genuinely unprecedented — season one hasn't found the show's full voice yet but the family's internal logic is already distinct, and the subversion of sitcom form is already structurally intentional."},
  {n:"Money Heist",                 pl:"Netflix",        t:"Solid",              f:"Thriller",      ep:13, y:2017, s:[7,6,5,6,5,7,6,4,5,5],   a:"Pina builds structural momentum as the show's primary asset — the heist mechanics generate enough forward motion that the tonal inconsistencies are less damaging than they would be in a slower show, and the Professor's planning has enough originality to carry the exposition weight."},
  {n:"Community",                   pl:"NBC",            t:"Solid",              f:"Comedy",        ep:25, y:2009, s:[7,7,8,7,6,7,7,6,5,5],   a:"Harmon builds a show about a study group that keeps finding structural forms to inhabit — the originality is the genre parody episodes, and the dialogue is sharp enough that the characters hold together across wildly different registers."},
  {n:"It's Always Sunny",           pl:"FX",             t:"Solid",              f:"Comedy",        ep:7,  y:2005, s:[6,6,7,5,7,8,7,4,5,5],   a:"McElhenney, Day and Glenn Howerton build a comic originality around characters who are purely id — the tonal consistency is in refusing to punish them conventionally, and the economy of the gang's self-destruction is what makes each episode structurally complete."},
  {n:"House",                       pl:"Fox",            t:"Solid",              f:"Drama",         ep:22, y:2004, s:[7,7,8,6,6,7,7,5,6,6],   a:"Shore builds the diagnostic procedural as a character study — the structural engine is the differential diagnosis as an argument between House's cynicism and everyone else's faith in people, and the originality is that the case is always a mirror for whatever the team can't say to each other directly."},
  {n:"Grey's Anatomy",              pl:"ABC",            t:"Solid",              f:"Drama",         ep:9,  y:2005, s:[7,7,7,6,6,5,7,5,7,7],   a:"Rhimes builds an ensemble where the hospital is a pressure amplifier — the structural achievement is sustaining emotional escalation across a full season of network television, and the character logic of Meredith's damage is consistent enough to anchor even the episodes that strain plausibility."},
  {n:"Yellowstone",                 pl:"Paramount+",     t:"Solid",              f:"Drama",         ep:9,  y:2018, s:[7,7,7,6,6,6,8,5,6,6],   a:"Sheridan builds the ranch as a structural stand-in for American land mythology — the tonal control is in playing the violence and the landscape with equal seriousness, and the character logic of John Dutton holds because his contradictions are rooted in something the show takes seriously even when the plotting doesn't."},
  {n:"Suits",                       pl:"USA Network",    t:"Solid",              f:"Drama",         ep:12, y:2011, s:[7,6,7,5,6,5,7,4,5,5],   a:"Korsh builds a legal drama where the dialogue velocity substitutes for subtext — the structural engine is the secret at the center, and the tonal consistency is in treating corporate law as genuinely high stakes, which the audience accepts because the show never breaks character about it."},
  {n:"Desperate Housewives",        pl:"ABC",            t:"Solid",              f:"Drama",         ep:23, y:2004, s:[7,6,6,5,6,6,7,4,5,5],   a:"Cherry builds the suburban satire as a structural premise — the mystery spine gives the ensemble comedy enough forward momentum to function, and the tonal control is in keeping the darkness and the absurdity running at the same temperature so neither cancels the other."},
  {n:"Vis a Vis",                   pl:"Antena 3",       t:"Solid",              f:"Drama",         ep:13, y:2015, s:[7,7,7,6,6,7,7,5,6,6],   a:"Sánchez builds a prison drama where the structural engine is escalation — each episode raises the stakes past plausibility but the tonal commitment is total, and the character logic of Macarena's transformation from naivety to survival holds because the show never lets her off the hook for the choices she makes to stay alive."},
  {n:"Manifest",                    pl:"NBC",            t:"Solid",              f:"Sci-Fi",        ep:13, y:2018, s:[6,6,5,5,5,5,6,4,5,5],   a:"Rake builds a mystery-box procedural where the structural engine is the calling — the show's consistency is in treating the supernatural as personal consequence rather than spectacle, and the family logic holds even when the mythology doesn't earn its complexity."},
  {n:"Virgin River",                pl:"Netflix",        t:"Solid",              f:"Drama",         ep:10, y:2019, s:[5,6,5,4,5,4,6,4,6,4],   a:"Higgins builds tonal consistency as the whole product — the show knows its audience wants emotional safety with friction enough to keep watching, and the structural engine is the romantic obstacle repeated with enough variation to feel like development without ever genuinely threatening the outcome."},
  {n:"Cobra Kai",                   pl:"YouTube/Netflix",t:"Solid",              f:"Drama",         ep:10, y:2018, s:[7,7,6,6,6,6,7,5,6,5],   a:"Hurwitz, Schlossberg and Heald build a structural rehabilitation of a villain that actually works — the character logic of Johnny Lawrence's arc is the show's only genuine craft achievement, and it's enough to carry the nostalgia weight the rest of the show is hauling."},
  {n:"Station 19",                  pl:"ABC",            t:"Solid",              f:"Drama",         ep:10, y:2018, s:[5,6,6,5,5,4,6,4,6,5],   a:"Rhimes builds a procedural where the station is the pressure container — the structural engine is the emergency as emotional accelerant, and the show's consistency is in treating its ensemble's personal crises as equally urgent as the fires, which is either its strength or its problem depending on your tolerance for crossover mechanics."},
  {n:"Friends",                     pl:"NBC",            t:"Functional Popular", f:"Comedy",        ep:24, y:1994, s:[6,6,6,4,6,4,6,2,5,4],   a:"Crane and Kauffman build tonal consistency and cast chemistry as load-bearing — the structural engine is the group dynamic, the dialogue is functional rather than distinctive, and the show's achievement is sustained watchability over a decade."},
  {n:"Squid Game",                  pl:"Netflix",        t:"Functional Popular", f:"Thriller",      ep:9,  y:2021, s:[7,5,4,7,6,7,5,5,6,7],   a:"Hwang Dong-hyuk builds a structural clarity that makes the allegory legible globally — the game mechanics are the thematic architecture, and the contextual resonance carries the show past the moments where character logic gives way to spectacle."},
  {n:"Wednesday",                   pl:"Netflix",        t:"Functional Popular", f:"Fantasy",       ep:8,  y:2022, s:[5,5,5,4,5,4,5,3,5,5],   a:"Burton builds tonal consistency around Ortega's performance — the structural and dialogue limitations are carried by a character presence strong enough that Wednesday's voice holds the show together when the architecture around her doesn't."},
  {n:"Bridgerton",                  pl:"Netflix",        t:"Functional Popular", f:"Drama",         ep:8,  y:2020, s:[5,5,4,4,5,4,5,3,5,4],   a:"Rhimes and Van Dusen build a tonal register that is entirely its own — the anachronism is consistent enough to function as a structural choice, and the show's achievement is making Regency romance feel genuinely contemporary without pretending to be serious about either."},
  {n:"Big Bang Theory",             pl:"CBS",            t:"Functional Popular", f:"Comedy",        ep:17, y:2007, s:[4,4,5,3,5,4,4,1,3,3],   a:"Lorre and Prady build a structural consistency around a single tonal register — the laugh track and the character types are load-bearing precisely because they signal to the audience exactly what kind of show this is and deliver it without deviation."},
  {n:"Parks and Recreation",        pl:"NBC",            t:"Functional Popular", f:"Comedy",        ep:6,  y:2009, s:[5,5,6,5,6,5,5,4,5,5],   a:"Schur and Mendel build Leslie Knope's sincerity as the structural and tonal anchor — the show's consistency is in treating government competence as genuinely admirable, which is a more interesting position than the cynicism its premise invited."},
  {n:"NCIS",                        pl:"CBS",            t:"Functional Popular", f:"Drama",         ep:23, y:2003, s:[6,5,5,4,6,3,6,3,4,4],   a:"Bellisario and Harmon build a procedural so structurally reliable that the formula becomes the product — the character logic of Gibbs's rules is the show's only genuine invention, and the tonal consistency is total because the show never asks more of itself than the audience asks of it."},
  {n:"CSI",                         pl:"CBS",            t:"Functional Popular", f:"Drama",         ep:23, y:2000, s:[6,5,5,4,6,6,6,3,4,5],   a:"Zuiker builds the forensic procedural as a structural innovation — the evidence-first approach removes character subjectivity from the investigation, and the originality is that making the science the protagonist was a genuine formal decision even if the show never fully exploited what it implied."},
  {n:"Reacher",                     pl:"Amazon",         t:"Functional Popular", f:"Drama",         ep:8,  y:2022, s:[6,6,5,4,7,4,6,3,5,4],   a:"Raelle Cohen builds structural economy as the show's primary virtue — Reacher arrives, assesses, and solves with a procedural clarity that is genuinely pleasurable, and the tonal consistency is in never asking the audience to take it more seriously than it takes itself."},
  {n:"Two and a Half Men",          pl:"CBS",            t:"Functional Popular", f:"Comedy",        ep:22, y:2003, s:[5,5,6,3,6,3,6,2,4,3],   a:"Lorre and Aronsohn build a structural consistency so total that the show becomes its own genre — the joke mechanics run on a single register for twelve seasons without variation, and the achievement is delivering that register with enough craft that the audience never had to work."},
  {n:"Heartland",                   pl:"CBC",            t:"Functional Popular", f:"Drama",         ep:13, y:2007, s:[5,5,5,4,5,3,5,3,5,3],   a:"Crocker builds comfort television with enough structural reliability that the show has run for fifteen seasons on the same engine — the horse-and-family formula is consistent rather than crafted, and the emotional beats arrive on schedule because the audience knows exactly where they're standing."},
  {n:"Lucifer",                     pl:"Fox/Netflix",    t:"Functional Popular", f:"Drama",         ep:13, y:2016, s:[5,6,5,4,5,5,5,3,5,5],   a:"Henderson builds a procedural on a high-concept premise — the devil as police consultant — and the structural achievement is making that premise sustainable across seasons, though the character logic of Lucifer's arc strains whenever the show has to reconcile his celestial mythology with the case-of-the-week format."},
  {n:"Outer Banks",                 pl:"Netflix",        t:"Functional Popular", f:"Drama",         ep:10, y:2020, s:[5,5,5,4,5,4,5,3,5,4],   a:"Pate and Causey build a teen adventure where the structural engine is the treasure hunt layered over the class conflict — the tonal consistency is in playing both registers at the same volume, and the show's achievement is sustained momentum despite a character logic that routinely bends to plot necessity."},
  {n:"The Witcher",                 pl:"Netflix",        t:"Functional Popular", f:"Fantasy",       ep:8,  y:2019, s:[5,5,5,4,5,5,5,3,4,4],   a:"Hissrich builds a fantasy procedural where the timeline fragmentation is either the show's most interesting structural choice or its most damaging — the character logic of Geralt holds in isolation, but the world's rules are applied inconsistently enough that the mythology never fully earns the emotional weight it asks for."},
  {n:"Ginny & Georgia",             pl:"Netflix",        t:"Functional Popular", f:"Drama",         ep:10, y:2021, s:[5,5,5,4,5,4,5,3,5,5],   a:"Fiel builds a mother-daughter drama where the tonal range is the show's ambition — moving between teen comedy, family drama, and dark thriller within episodes — and the structural problem is that the registers don't comment on each other, they just alternate, which means the show is never fully any of the things it's trying to be."},
  {n:"House of Cards",              pl:"Netflix",        t:"Below Par",          f:"Drama",         ep:13, y:2013, s:[6,5,5,5,5,4,4,3,4,4],   a:"Willimon builds a structural momentum that the character logic can't sustain — Frank's direct address creates a tonal intimacy the show mistakes for subtext, and the cynicism is too consistent to generate genuine dramatic tension."},
  {n:"Emily in Paris",              pl:"Netflix",        t:"Below Par",          f:"Comedy",        ep:10, y:2020, s:[3,2,3,2,4,2,4,1,3,3],   a:"Holbrook builds a tonal consistency that is the show's only structural achievement — Emily in Paris knows exactly what it is and delivers it without apology, which is a real thing even when what it is has no interest in interiority or consequence."},
  {n:"Entourage",                   pl:"HBO",            t:"Below Par",          f:"Comedy-Drama",  ep:8,  y:2004, s:[5,5,6,3,6,4,6,2,4,3],   a:"Ellin builds a fantasy of access that mistakes proximity to power for dramatic tension — the character logic is thin because the show has no interest in consequences, and the tonal register of uncomplicated aspiration is consistent but has nothing to say about itself."},
  {n:"Fate: The Winx Saga",         pl:"Netflix",        t:"Below Par",          f:"Fantasy",       ep:6,  y:2021, s:[3,3,3,2,4,2,3,2,3,3],   a:"Bhattacharya strips the source material of its tonal identity and replaces it with prestige-drama aesthetics the writing can't support — the structural engine is the school setting plus the chosen-one arc, and neither the character logic nor the world rules are developed enough to generate genuine stakes."},
  {n:"Jupiter's Legacy",            pl:"Netflix",        t:"Below Par",          f:"Fantasy",       ep:8,  y:2021, s:[4,4,4,4,4,4,4,3,3,3],   a:"Shelton builds a superhero drama where the structural ambition — generational conflict between the founding heroes and their children — is clear but never executed with enough character logic to make either generation compelling, and the tonal register oscillates between mythic and procedural without committing to either."},
];

const SHOW_MAP = Object.fromEntries(SHOWS.map(s => [s.n, s]));

const ADAPTED_SHOWS = new Set([
  "Slow Horses","Normal People","My Brilliant Friend","Pachinko","The Handmaid's Tale",
  "Shogun","Sacred Games","The Expanse","Silo","Babylon Berlin","The Witcher","Reacher",
  "Sherlock","Invincible","The Boys","Lucifer","Batman: The Animated Series","Watchmen",
  "The Last of Us","Arcane","Fargo","Cobra Kai","Wednesday","Game of Thrones","Kingdom",
]);

const TIER_ORDER = ["Elite","Excellent","Very Good","Solid","Functional Popular","Below Par"];
// Tiers use grayscale only — color is reserved for band position
const TIER_WEIGHT = { "Elite":600,"Excellent":500,"Very Good":500,"Solid":400,"Functional Popular":400,"Below Par":400 };

function anchorBracket(v) {
  if (v === 10) return 10;
  if (v >= 8)   return 8;
  if (v >= 6)   return 6;
  if (v >= 4)   return 4;
  if (v >= 2)   return 2;
  return 0;
}

function nextBracket(v) {
  if (v === 10) return null;
  if (v >= 8)   return 10;
  if (v >= 6)   return 8;
  if (v >= 4)   return 6;
  if (v >= 2)   return 4;
  return 2;
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      fontSize:11, padding:"4px 10px", borderRadius:20,
      border: active ? "1px solid rgba(0,0,0,0.5)" : "1px solid var(--color-border-tertiary)",
      background: active ? "var(--color-text-primary)" : "transparent",
      color: active ? "var(--color-background-primary)" : "var(--color-text-secondary)",
      cursor:"pointer", whiteSpace:"nowrap", fontFamily:"var(--font-sans)",
    }}>{children}</button>
  );
}

// ─── BAND-COLORED SPARKLINE ────────────────────────────────────────────────
// Each bar is colored by its band position:
//   below floor = red, in band = green, above ceiling = amber
function Sparkline({ scores }) {
  return (
    <div>
      <div style={{display:"flex",gap:3,alignItems:"flex-end",height:32}}>
        {DIMS.map((d,i) => {
          const v = scores[i];
          const pos = bandPosition(v, d);
          const col = bandColor(pos);
          const isCore = PRIMARY_DIMS.includes(d.code);
          return (
            <div key={d.code} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
              <div style={{width:"100%",height:Math.round((v/10)*32),background:col,borderRadius:2,opacity:isCore?1:0.6}}/>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:3,marginTop:3}}>
        {DIMS.map(d => {
          const isCore = PRIMARY_DIMS.includes(d.code);
          return (
            <div key={d.code} style={{flex:1,fontSize:9,textAlign:"center",color:isCore?"var(--color-text-secondary)":"var(--color-text-tertiary)",fontWeight:isCore?500:400}}>
              {d.code}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BAND INDICATOR (mini visualization) ───────────────────────────────────
// Shows the 0–10 range with floor/ceiling markers and score position
function BandIndicator({ score, dim }) {
  const pos = bandPosition(score, dim);
  const col = bandColor(pos);
  const floorPct = (dim.floor / 10) * 100;
  const ceilPct = (dim.ceiling / 10) * 100;
  const scorePct = (score / 10) * 100;

  return (
    <div style={{position:"relative",height:6,background:"var(--color-background-secondary)",borderRadius:3,overflow:"visible",marginTop:4,marginBottom:2}}>
      {/* Band zone (floor to ceiling) */}
      <div style={{
        position:"absolute",top:0,bottom:0,
        left:`${floorPct}%`,
        width:`${ceilPct - floorPct}%`,
        background:"rgba(29,158,117,0.12)",
        borderRadius:3,
      }}/>
      {/* Floor marker */}
      <div style={{position:"absolute",top:-2,bottom:-2,left:`${floorPct}%`,width:1,background:"rgba(163,45,45,0.35)"}}/>
      {/* Ceiling marker */}
      <div style={{position:"absolute",top:-2,bottom:-2,left:`${ceilPct}%`,width:1,background:"rgba(196,139,24,0.35)"}}/>
      {/* Score dot */}
      <div style={{
        position:"absolute",top:"50%",
        left:`${scorePct}%`,
        transform:"translate(-50%,-50%)",
        width:8,height:8,borderRadius:"50%",
        background:col,
        boxShadow:`0 0 0 2px var(--color-background-primary)`,
      }}/>
    </div>
  );
}


// ─── HEADER ─────────────────────────────────────────────────────────────────
function Header({ view, setView }) {
  const tabs = [["show","Shows"],["dimension","Dimensions"]];
  const idx = tabs.findIndex(([k]) => k === view);
  const slotW = 100 / tabs.length;
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.5rem"}}>
      <div style={{fontSize:15,fontWeight:500,color:"var(--color-text-primary)"}}>Story Weight</div>
      <div style={{display:"flex",background:"var(--color-background-secondary)",borderRadius:20,padding:3,position:"relative",gap:0}}>
        <div style={{
          position:"absolute", top:3,
          left:`calc(${idx * slotW}% + 3px)`,
          height:"calc(100% - 6px)",
          width:`calc(${slotW}% - 3px)`,
          background:"var(--color-background-primary)",
          borderRadius:16,
          boxShadow:"0 0 0 0.5px var(--color-border-tertiary)",
          transition:"left 0.18s ease",
          pointerEvents:"none",
        }}/>
        {tabs.map(([key,label]) => (
          <button key={key} onClick={() => setView(key)} style={{
            position:"relative", zIndex:1,
            fontSize:12, padding:"5px 14px", borderRadius:16, border:"none", cursor:"pointer",
            fontFamily:"var(--font-sans)",
            background:"transparent",
            color: view===key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            fontWeight: view===key ? 500 : 400,
            transition:"color 0.18s",
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

// ─── SHOW LIST ──────────────────────────────────────────────────────────────
function ShowProfileView({ onSelect }) {
  const [sortKey, setSortKey] = useState("az");
  const [sortAsc, setSortAsc] = useState(true);
  const [query, setQuery]     = useState("");

  function cycleSort(key) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(key === "az"); }
  }

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? SHOWS.filter(s =>
      s.n.toLowerCase().includes(q) || s.pl.toLowerCase().includes(q) ||
      s.f.toLowerCase().includes(q) || s.t.toLowerCase().includes(q)
    ) : SHOWS;
    return [...filtered].sort((a,b) => {
      let v = 0;
      if (sortKey==="tier") v = TIER_ORDER.indexOf(a.t) - TIER_ORDER.indexOf(b.t);
      if (sortKey==="az")   v = a.n.localeCompare(b.n);
      if (sortKey==="year") v = a.y - b.y;
      return sortAsc ? v : -v;
    });
  }, [sortKey, sortAsc, query]);

  const arrow = k => sortKey===k ? (sortAsc?" ↑":" ↓") : "";
  const btnStyle = k => ({
    fontSize:11, padding:"4px 12px", borderRadius:20,
    border: sortKey===k ? "1px solid rgba(0,0,0,0.4)" : "1px solid var(--color-border-tertiary)",
    background:"transparent",
    color: sortKey===k ? "var(--color-text-primary)" : "var(--color-text-secondary)",
    cursor:"pointer", whiteSpace:"nowrap",
  });

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:"1.25rem",flexWrap:"wrap"}}>
        <input type="text" placeholder="Search…" value={query}
          onChange={e => setQuery(e.target.value)}
          style={{flex:1,minWidth:120,fontSize:13,padding:"6px 10px",borderRadius:8,
            border:"1px solid var(--color-border-tertiary)",background:"var(--color-background-primary)",
            color:"var(--color-text-primary)",outline:"none"}}
          onFocus={e => e.target.style.borderColor="rgba(0,0,0,0.35)"}
          onBlur={e  => e.target.style.borderColor="var(--color-border-tertiary)"}
        />
        {[["tier","tier"],["az","A–Z"],["year","year"]].map(([k,l]) => (
          <button key={k} style={btnStyle(k)} onClick={() => cycleSort(k)}>{l}{arrow(k)}</button>
        ))}
      </div>
      {sorted.length === 0 ? (
        <div style={{textAlign:"center",padding:"3rem 0",color:"var(--color-text-tertiary)",fontSize:13}}>
          No shows match "{query}"
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
          {sorted.map(sh => (
            <div key={sh.n} role="button" tabIndex={0}
              onClick={() => onSelect(sh)}
              onKeyDown={e => (e.key==="Enter"||e.key===" ") && onSelect(sh)}
              style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",
                borderRadius:"var(--border-radius-lg)",padding:"12px 14px",cursor:"pointer",
                transition:"border-color 0.15s",outline:"none"}}
              onMouseEnter={e => e.currentTarget.style.borderColor="var(--color-border-secondary)"}
              onMouseLeave={e => e.currentTarget.style.borderColor="var(--color-border-tertiary)"}
            >
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,gap:6}}>
                <div style={{minWidth:0,flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sh.n}</div>
                  <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sh.y} · {sh.pl}</div>
                </div>
                <span style={{fontSize:10,fontWeight:TIER_WEIGHT[sh.t],flexShrink:0,whiteSpace:"nowrap",padding:"2px 6px",borderRadius:10,background:"var(--color-background-secondary)",color:"var(--color-text-secondary)"}}>
                  {sh.t}
                </span>
              </div>
              <Sparkline scores={sh.s} />
            </div>
          ))}
        </div>
      )}
      <div style={{marginTop:"2.5rem",paddingTop:"1.25rem",borderTop:"0.5px solid var(--color-border-tertiary)",fontSize:11,color:"var(--color-text-tertiary)"}}>
        150 shows · 10 dimensions · Season 1 only
      </div>
    </div>
  );
}

// ─── SHOW DETAIL ────────────────────────────────────────────────────────────
function ShowDetailPage({ show, onBack }) {
  const [selDim, setSelDim] = useState(0);

  const dim     = DIMS[selDim];
  const score   = show.s[selDim];
  const pos     = bandPosition(score, dim);
  const col     = bandColor(pos);
  const current = anchorBracket(score);
  const next    = nextBracket(score);

  function opacityFor(level) {
    if (level===current) return 1;
    if (level===next)    return 0.55;
    return 0.45;
  }
  function tagFor(level) {
    if (level===current) return { label:"current", bg:col+"1A", color:col };
    if (level===next)    return { label:"next",    bg:"rgba(0,0,0,0.05)",  color:"var(--color-text-tertiary)" };
    return null;
  }

  return (
    <div style={{maxWidth:580}}>
      <button onClick={onBack}
        style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:13,color:"var(--color-text-secondary)",background:"none",border:"none",cursor:"pointer",marginBottom:"1.5rem",padding:0}}
        onMouseEnter={e => e.currentTarget.style.color="var(--color-text-primary)"}
        onMouseLeave={e => e.currentTarget.style.color="var(--color-text-secondary)"}
      >← all shows</button>

      <div style={{fontSize:22,fontWeight:500,color:"var(--color-text-primary)",marginBottom:4}}>{show.n}</div>
      <div style={{fontSize:13,color:"var(--color-text-tertiary)",marginBottom:show.a?"1rem":"1.75rem"}}>
        {show.y} · {show.pl} · <span style={{fontWeight:TIER_WEIGHT[show.t]}}>{show.t}</span>
        <span style={{marginLeft:12}}>{show.f} · S1 {show.ep} ep</span>
      </div>

      {show.a && (
        <div style={{fontSize:13,lineHeight:1.7,color:"var(--color-text-primary)",fontStyle:"italic",borderLeft:"2px solid var(--color-border-secondary)",paddingLeft:"0.85rem",marginBottom:"1.75rem"}}>
          {show.a}
        </div>
      )}

      {/* Active couplings */}
      {(() => {
        const active = activeCouplings(show);
        if (!active.length) return null;
        const tensions   = active.filter(c => c.level === "tension" || c.level === "tradeoff");
        const strengths  = active.filter(c => c.level === "strength");
        return (
          <div style={{marginBottom:"1.75rem",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-lg)",padding:"14px 16px"}}>
            <div style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:"0.85rem"}}>Dimensional profile</div>
            {tensions.length > 0 && (
              <div style={{marginBottom: strengths.length ? "0.85rem" : 0}}>
                <div style={{fontSize:10,color:"#A32D2D",fontWeight:500,marginBottom:"0.5rem"}}>Tensions navigated</div>
                {tensions.map(c => (
                  <div key={c.dims.join("-")} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:10,fontWeight:600,color:"#A32D2D"}}>{c.dims[0]} {c.scoreA}</span>
                    <span style={{fontSize:9,color:"var(--color-text-tertiary)"}}>↔</span>
                    <span style={{fontSize:10,fontWeight:600,color:"#A32D2D"}}>{c.dims[1]} {c.scoreB}</span>
                  </div>
                ))}
              </div>
            )}
            {strengths.length > 0 && (
              <div>
                <div style={{fontSize:10,color:"#1D9E75",fontWeight:500,marginBottom:"0.5rem"}}>Reinforcing strengths</div>
                {strengths.map(c => (
                  <div key={c.dims.join("-")} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:10,fontWeight:600,color:"#1D9E75"}}>{c.dims[0]} {c.scoreA}</span>
                    <span style={{fontSize:9,color:"var(--color-text-tertiary)"}}>+</span>
                    <span style={{fontSize:10,fontWeight:600,color:"#1D9E75"}}>{c.dims[1]} {c.scoreB}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Dimension dropdown */}
      <select
        value={selDim}
        onChange={e => setSelDim(Number(e.target.value))}
        style={{
          width:"100%", marginBottom:"1.75rem",
          padding:"8px 12px", borderRadius:8,
          border:"0.5px solid var(--color-border-secondary)",
          background:"var(--color-background-secondary)",
          color:"var(--color-text-primary)",
          fontSize:13, fontFamily:"var(--font-sans)",
          appearance:"none", cursor:"pointer",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center"
        }}
      >
        {DIMS.map((d,i) => (
          <option key={d.code} value={i}>{d.code} — {d.name}</option>
        ))}
      </select>

      {/* Score + band position */}
      <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:6}}>
        <span style={{fontSize:24,fontWeight:500,color:col}}>{score}</span>
        <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:col+"1A",color:col,fontWeight:500}}>
          {bandLabel(pos)}
        </span>
      </div>

      {/* Band indicator bar */}
      <div style={{marginBottom:"1.5rem",paddingRight:"10%"}}>
        <BandIndicator score={score} dim={dim} />
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{fontSize:9,color:"var(--color-text-tertiary)"}}>0</span>
          <span style={{fontSize:9,color:"#A32D2D",opacity:0.6}}>floor {dim.floor}</span>
          <span style={{fontSize:9,color:"#C48B18",opacity:0.6}}>ceiling {dim.ceiling}</span>
          <span style={{fontSize:9,color:"var(--color-text-tertiary)"}}>10</span>
        </div>
      </div>

      {/* Relevant failure mode based on position */}
      {pos !== "inBand" && (
        <div style={{
          borderLeft:`2px solid ${pos === "above" ? "#C48B18" : "#A32D2D"}`,
          paddingLeft:"0.85rem",marginBottom:"1.5rem",borderRadius:0
        }}>
          <div style={{fontSize:11,fontWeight:500,color:pos === "above" ? "#C48B18" : "#A32D2D",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:"0.4rem"}}>
            {pos === "above" ? "Over-tuning risk" : "The trap"}
          </div>
          <div style={{fontSize:13,lineHeight:1.65,color:"var(--color-text-primary)",fontStyle:"italic"}}>
            {pos === "above" ? dim.overTuning : dim.failureMode}
          </div>
        </div>
      )}

      {/* Scoring rubric */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {[10,8,6,4,2,0].map(level => {
          const op  = opacityFor(level);
          const tag = tagFor(level);
          // Zone indicator
          let zoneTag = null;
          if (level > dim.ceiling) zoneTag = { label:"above ceiling", color:"#C48B18" };
          else if (level >= dim.floor) zoneTag = { label:"in band", color:"#1D9E75" };
          else zoneTag = { label:"below floor", color:"#A32D2D" };

          return (
            <div key={level} style={{display:"flex",gap:14,alignItems:"flex-start",opacity:op}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",flexShrink:0,width:16,paddingTop:3}}>
                <span style={{fontSize:11,fontWeight:500,textAlign:"right",color:op===1?col:"var(--color-text-tertiary)"}}>{level}</span>
              </div>
              <div style={{flex:1}}>
                <span style={{fontSize:13,lineHeight:1.65,color:op===1?"var(--color-text-primary)":"var(--color-text-secondary)"}}>
                  {dim.anchors[level]}
                  {tag && (
                    <span style={{display:"inline-block",fontSize:9,padding:"1px 6px",borderRadius:8,marginLeft:6,background:tag.bg,color:tag.color,verticalAlign:"middle",position:"relative",top:-1}}>
                      {tag.label}
                    </span>
                  )}
                </span>
                {/* Small zone label on right of current bracket */}
                {level === current && zoneTag && (
                  <div style={{marginTop:4}}>
                    <span style={{fontSize:9,color:zoneTag.color,opacity:0.7}}>{zoneTag.label}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ─── DIMENSION VIEW ─────────────────────────────────────────────────────────
function DimensionProfileView() {
  const [selDimIdx, setSelDimIdx] = useState(0);
  const dim = DIMS[selDimIdx];
  const isCore = PRIMARY_DIMS.includes(dim.code);

  return (
    <div style={{maxWidth:580}}>
      <select
        value={selDimIdx}
        onChange={e => setSelDimIdx(Number(e.target.value))}
        style={{
          width:"100%", marginBottom:"1.25rem",
          padding:"8px 12px", borderRadius:8,
          border:"0.5px solid var(--color-border-secondary)",
          background:"var(--color-background-secondary)",
          color:"var(--color-text-primary)",
          fontSize:13, fontFamily:"var(--font-sans)",
          appearance:"none", cursor:"pointer",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center"
        }}
      >
        {DIMS.map((d,i) => (
          <option key={d.code} value={i}>{d.code} — {d.name}</option>
        ))}
      </select>

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"0.5rem"}}>
        <div style={{fontSize:22,fontWeight:500,color:"var(--color-text-primary)"}}>{dim.name}</div>
        {isCore && <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"var(--color-text-primary)",flexShrink:0}}/>}
      </div>
      <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:"1rem"}}>{dim.code} · 0–10 scale · Band: {dim.floor}–{dim.ceiling}</div>

      {/* Band visualization */}
      <div style={{marginBottom:"1.75rem"}}>
        <div style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:"0.65rem"}}>Band zones</div>
        <div style={{display:"flex",height:28,borderRadius:6,overflow:"hidden",border:"0.5px solid var(--color-border-tertiary)"}}>
          {/* Below floor */}
          <div style={{
            width:`${(dim.floor / 10) * 100}%`,
            background:"rgba(163,45,45,0.08)",
            display:"flex",alignItems:"center",justifyContent:"center",
            borderRight:"1px solid rgba(163,45,45,0.2)",
          }}>
            <span style={{fontSize:9,color:"#A32D2D",fontWeight:500}}>0–{dim.floor - 1}</span>
          </div>
          {/* In band */}
          <div style={{
            width:`${((dim.ceiling - dim.floor) / 10) * 100}%`,
            background:"rgba(29,158,117,0.08)",
            display:"flex",alignItems:"center",justifyContent:"center",
            borderRight:"1px solid rgba(196,139,24,0.2)",
          }}>
            <span style={{fontSize:9,color:"#1D9E75",fontWeight:500}}>{dim.floor}–{dim.ceiling}</span>
          </div>
          {/* Above ceiling */}
          <div style={{
            width:`${((10 - dim.ceiling) / 10) * 100}%`,
            background:"rgba(196,139,24,0.08)",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            <span style={{fontSize:9,color:"#C48B18",fontWeight:500}}>{dim.ceiling + 1}–10</span>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10,color:"var(--color-text-tertiary)"}}>
          <span>Below floor</span>
          <span>In band</span>
          <span>Above ceiling</span>
        </div>
      </div>

      {/* Scoring rubric */}
      <div style={{marginBottom:"1.75rem"}}>
        <div style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:"0.85rem"}}>Scoring rubric</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[10,8,6,4,2,0].map(level => {
            let zoneColor = "#1D9E75";
            if (level > dim.ceiling) zoneColor = "#C48B18";
            else if (level < dim.floor) zoneColor = "#A32D2D";
            return (
              <div key={level} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",flexShrink:0,width:16,paddingTop:3}}>
                  <span style={{fontSize:11,fontWeight:500,textAlign:"right",color:zoneColor}}>{level}</span>
                </div>
                <span style={{fontSize:13,lineHeight:1.65,color:"var(--color-text-primary)"}}>{dim.anchors[level]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier anchors */}
      <div style={{marginBottom:"1.75rem",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-lg)",padding:"14px 16px"}}>
        <div style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:"0.85rem"}}>Reference tier anchors</div>
        {[["high","8–10"],["mid","5–7"],["low","0–4"]].map(([tier, range]) => (
          <div key={tier} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:"0.6rem"}}>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"var(--color-background-primary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-tertiary)",flexShrink:0,whiteSpace:"nowrap",marginTop:1}}>{range}</span>
            <span style={{fontSize:12,lineHeight:1.6,color:"var(--color-text-secondary)"}}>{dim.tierAnchors[tier]}</span>
          </div>
        ))}
      </div>

      {/* Below floor failure mode */}
      <div style={{borderLeft:"2px solid #A32D2D",paddingLeft:"0.85rem",marginBottom:"1.25rem",borderRadius:0}}>
        <div style={{fontSize:11,fontWeight:500,color:"#A32D2D",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:"0.4rem"}}>The trap (below floor)</div>
        <div style={{fontSize:13,lineHeight:1.65,color:"var(--color-text-primary)",fontStyle:"italic"}}>{dim.failureMode}</div>
      </div>

      {/* Above ceiling failure mode */}
      <div style={{borderLeft:"2px solid #C48B18",paddingLeft:"0.85rem",marginBottom:"1.75rem",borderRadius:0}}>
        <div style={{fontSize:11,fontWeight:500,color:"#C48B18",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:"0.4rem"}}>Over-tuning (above ceiling)</div>
        <div style={{fontSize:13,lineHeight:1.65,color:"var(--color-text-primary)",fontStyle:"italic"}}>{dim.overTuning}</div>
      </div>

      {/* Couplings */}
      {couplingsFor(dim.code).length > 0 && (
        <div style={{marginBottom:"1.75rem"}}>
          <div style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:"0.85rem"}}>Couplings</div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {couplingsFor(dim.code).map(c => (
              <div key={c.otherCode} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:3,paddingTop:2}}>
                  <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:8,
                    background: c.type==="antagonistic" ? "rgba(163,45,45,0.08)" : "rgba(29,158,117,0.08)",
                    color:      c.type==="antagonistic" ? "#A32D2D"              : "#1D9E75",
                    whiteSpace:"nowrap"
                  }}>{c.otherCode}</span>
                  <span style={{fontSize:9,color:"var(--color-text-tertiary)",whiteSpace:"nowrap"}}>
                    {c.type==="antagonistic" ? "tension" : "reinforces"}
                  </span>
                </div>
                <span style={{fontSize:12,lineHeight:1.65,color:"var(--color-text-secondary)"}}>{c.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOT ───────────────────────────────────────────────────────────────────
export default function StoryWeight() {
  const [view, setView]             = useState("show");
  const [selectedShow, setSelectedShow] = useState(null);

  function handleSelectShow(sh) { setSelectedShow(sh); }
  function handleBackFromShow() { setSelectedShow(null); window.scrollTo(0,0); }
  function handleSetView(v) { setView(v); setSelectedShow(null); window.scrollTo(0,0); }

  return (
    <div style={{fontFamily:"var(--font-sans)",padding:"1.5rem",minHeight:"100vh",color:"var(--color-text-primary)",maxWidth:640,margin:"0 auto"}}>
      <Header view={view} setView={handleSetView}/>

      {view === "show" && (
        selectedShow
          ? <ShowDetailPage show={selectedShow} onBack={handleBackFromShow}/>
          : <ShowProfileView onSelect={handleSelectShow}/>
      )}

      {view === "dimension" && <DimensionProfileView/>}
    </div>
  );
}
