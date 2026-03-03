import { useState, useRef, useEffect, useCallback } from "react";

// ── GELUIDSEFFECTEN ───────────────────────────────────────────────────────────
var _audioCtx = null;

function getAudioCtx() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; }
  }
  return _audioCtx;
}

// Unlock AudioContext op elke touchend — ook swipes triggeren dit
function unlockOnTouch() {
  var ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") ctx.resume();
}
document.addEventListener("touchend", unlockOnTouch, {passive: true});
document.addEventListener("mouseup",  unlockOnTouch, {passive: true});

function playPing() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now  = ctx.currentTime;
    var osc  = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.start(now);
    osc.stop(now + 0.38);
  } catch(e) {}
}

// Korte woesh — hoog naar laag in 0.2s
function playSwoosh() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime;
    var dur = 0.18;

    var osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + dur);

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  } catch(e) {}
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const GROUPS = [
  { id:"all",       label:"All",       emoji:"🌊" },
  { id:"rifvis",    label:"Reef fish",  emoji:"🐠" },
  { id:"haai",      label:"Sharks",     emoji:"🦈" },
  { id:"schildpad", label:"Turtles",  emoji:"🐢" },
  { id:"inktvis",   label:"Cephalopods", emoji:"🐙" },
  { id:"zoogdier",  label:"Mammals", emoji:"🐋" },
  { id:"koraal",    label:"Corals",    emoji:"🪸" },
  { id:"zeldzaam",  label:"Rare",   emoji:"💎" },
];

const CREATURES = [
  // ── RIFVISSEN ──
  { id:1,  group:"rifvis",    taxon:127313,  name:"Clownvis",               latin:"Amphiprioninae",           depthMin:3,  depthMax:15,  temp:"26°C", rarity:"Common",    emoji:"🐠", color:"#FF6B35", photo:"https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&q=80",  fact:"Leeft in symbiose with zeeanemonen die voor andere vissen giftig zijn.",        locations:["Ras Mohammed","Similan Islands","Great Barrier Reef"], seasons:{all:true} },
  { id:7,  group:"rifvis",    taxon:85550,   name:"Murene",                  latin:"Gymnothorax javanicus",   depthMin:1,  depthMax:50,  temp:"27°C", rarity:"Common",    emoji:"🐍", color:"#69DB7C", photo:"https://images.unsplash.com/photo-1498623116890-37e912163d5d?w=600&q=80",  fact:"Heeft twee kaaksets: één om te bijten, één om prooi naar binnen te trekken.", locations:["Blue Hole Dahab","Ras Mohammed","Great Barrier Reef"], seasons:{all:true} },
  { id:8,  group:"rifvis",    taxon:47113,   name:"Naaktslak",               latin:"Chromodoris willani",     depthMin:5,  depthMax:30,  temp:"26°C", rarity:"Uncommon", emoji:"🐌", color:"#DA77F2", photo:"https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=600&q=80",  fact:"Kan zijn eigen penis afwerpen en in 24 uur een nieuwe aanmaken.",             locations:["Raja Ampat","Similan Islands","Malediven"], seasons:{all:true} },
  { id:9,  group:"rifvis",    taxon:85553,   name:"Napoleonvis",             latin:"Cheilinus undulatus",     depthMin:1,  depthMax:60,  temp:"26°C", rarity:"Uncommon", emoji:"🐟", color:"#4ECDC4", photo:"https://images.unsplash.com/photo-1544551763-92ab472cad5d?w=600&q=80",  fact:"Kan tot 2 meter lang worden en 190 kg wegen.",                               locations:["Ras Mohammed","Similan Islands","Great Barrier Reef","Malediven"], seasons:{all:true} },
  { id:10, group:"rifvis",    taxon:47230,   name:"Papegaaivis",             latin:"Scaridae",                depthMin:1,  depthMax:30,  temp:"27°C", rarity:"Common",    emoji:"🦜", color:"#69DB7C", photo:"https://images.unsplash.com/photo-1611689342806-0863700f2b4e?w=600&q=80",  fact:"Bijt koraal af en poept wit zand — stranden bestaan deels uit uitwerpselen.", locations:["Great Barrier Reef","Raja Ampat","Malediven","Similan Islands"], seasons:{all:true} },
  { id:11, group:"rifvis",    taxon:48921,   name:"Vlindervissen",           latin:"Chaetodon",               depthMin:1,  depthMax:20,  temp:"26°C", rarity:"Common",    emoji:"🦋", color:"#FFD93D", photo:"https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=600&q=80",  fact:"Leeft monogaam — partners blijven hun hele leven bij elkaar.",               locations:["Ras Mohammed","Similan Islands","Great Barrier Reef","Malediven"], seasons:{all:true} },
  { id:12, group:"rifvis",    taxon:47178,   name:"Rifbaars",                latin:"Lutjanus",                depthMin:5,  depthMax:50,  temp:"25°C", rarity:"Common",    emoji:"🐡", color:"#FF6B9D", photo:"https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=600&q=80",  fact:"Schoolt in enorme scholen van duizenden vissen.",                             locations:["Ras Mohammed","Cocos Island","Galápagos","Raja Ampat"], seasons:{all:true} },
  { id:13, group:"rifvis",    taxon:50786,   name:"Lionsvis",                latin:"Pterois volitans",        depthMin:1,  depthMax:50,  temp:"26°C", rarity:"Uncommon", emoji:"🦁", color:"#FF6B35", photo:"https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=600&q=80",  fact:"De rugstekels zijn giftig — een prik veroorzaakt intense pijn.",             locations:["Ras Mohammed","Great Barrier Reef","Similan Islands"], seasons:{all:true} },
  { id:41, group:"rifvis",    taxon:47225,   name:"Zeeëngel",                latin:"Pomacanthus",             depthMin:5,  depthMax:60,  temp:"26°C", rarity:"Uncommon", emoji:"👼", color:"#74C0FC", photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",  fact:"Jongeren zien er volledig anders uit dan volwassenen — andere kleuren en strepen.", locations:["Ras Mohammed","Similan Islands","Raja Ampat","Great Barrier Reef"], seasons:{all:true} },
  { id:42, group:"rifvis",    taxon:49591,   name:"Gestreepte Grondelvis",   latin:"Valenciennea strigata",   depthMin:2,  depthMax:25,  temp:"27°C", rarity:"Common",    emoji:"🐟", color:"#A8E6CF", photo:"https://images.unsplash.com/photo-1544551763-92ab472cad5d?w=600&q=80",  fact:"Graaft holletjes in het zand en deelt die with garnalen in ruil voor bewaking.", locations:["Similan Islands","Malediven","Raja Ampat"], seasons:{all:true} },
  { id:43, group:"rifvis",    taxon:47209,   name:"Tandbaars",               latin:"Epinephelus",             depthMin:10, depthMax:100, temp:"25°C", rarity:"Uncommon", emoji:"🎣", color:"#FF6B9D", photo:"https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=600&q=80",  fact:"Begint als vrouwtje en verandert op latere leeftijd in een mannetje.",       locations:["Ras Mohammed","Great Barrier Reef","Cocos Island","Similan Islands"], seasons:{all:true} },
  { id:44, group:"rifvis",    taxon:47206,   name:"Kaketoe-wasse",           latin:"Coris gaimard",           depthMin:1,  depthMax:40,  temp:"26°C", rarity:"Uncommon", emoji:"🦜", color:"#FF6B35", photo:"https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&q=80",  fact:"Wisselt van kleur naarmate hij ouder wordt — elke fase ziet er anders uit.", locations:["Great Barrier Reef","Similan Islands","Malediven","Raja Ampat"], seasons:{all:true} },
  { id:45, group:"rifvis",    taxon:47208,   name:"Koraalduivel",            latin:"Synanceia verrucosa",     depthMin:3,  depthMax:30,  temp:"26°C", rarity:"Rare",  emoji:"👹", color:"#DA77F2", photo:"https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=600&q=80",  fact:"De giftigste vis ter wereld — vrijwel onzichtbaar door perfecte camouflage.", locations:["Ras Mohammed","Great Barrier Reef","Similan Islands"], seasons:{all:true} },

  // ── HAAIEN & ROGGEN ──
  { id:2,  group:"haai",      taxon:47273,   name:"Hamerhaai",               latin:"Sphyrna mokarran",        depthMin:1,  depthMax:80,  temp:"22°C", rarity:"Rare",  emoji:"🦈", color:"#4ECDC4", photo:"https://images.unsplash.com/photo-1560275619-4cc5fa59d3ae?w=600&q=80",  fact:"De brede kop vergroot het gezichtsfield tot bijna 360 graden.",                locations:["Ras Mohammed","Cocos Island","Galápagos"], seasons:{months:[1,2,3,10,11,12]} },
  { id:3,  group:"haai",      taxon:116944,  name:"Mantarog",                latin:"Mobula birostris",        depthMin:0,  depthMax:120, temp:"24°C", rarity:"Uncommon", emoji:"🦅", color:"#A8E6CF", photo:"https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&q=80",  fact:"Heeft het grootste brein van alle vissen, relatief aan zijn lichaamsgewicht.", locations:["Blue Hole Dahab","Similan Islands","Malediven"], seasons:{months:[11,12,1,2,3,4]} },
  { id:14, group:"haai",      taxon:47274,   name:"Witpuntrifhaai",          latin:"Triaenodon obesus",       depthMin:1,  depthMax:40,  temp:"26°C", rarity:"Common",    emoji:"🦈", color:"#74C0FC", photo:"https://images.unsplash.com/photo-1564419320461-6870880221ad?w=600&q=80",  fact:"Slaapt overdag op de zeebodem en jaagt 's nachts.",                          locations:["Similan Islands","Malediven","Great Barrier Reef","Raja Ampat"], seasons:{all:true} },
  { id:15, group:"haai",      taxon:47271,   name:"Bulhaai",                 latin:"Carcharhinus leucas",     depthMin:0,  depthMax:150, temp:"24°C", rarity:"Uncommon", emoji:"🦈", color:"#A8E6CF", photo:"https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=600&q=80",  fact:"Kan in zoet water overleven en zwemt rivieren op.",                          locations:["Cocos Island","Galápagos","Great Barrier Reef"], seasons:{all:true} },
  { id:16, group:"haai",      taxon:47275,   name:"Tijgerhaai",              latin:"Galeocerdo cuvier",       depthMin:0,  depthMax:140, temp:"23°C", rarity:"Rare",  emoji:"🦈", color:"#FFD93D", photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",  fact:"Eet vrijwel alles — er zijn autobanden en nummerplaten in gevonden.",        locations:["Galápagos","Cocos Island","Malediven"], seasons:{all:true} },
  { id:17, group:"haai",      taxon:47276,   name:"Zeeëngelhaai",            latin:"Squatina squatina",       depthMin:5,  depthMax:100, temp:"20°C", rarity:"Rare",  emoji:"🦈", color:"#DA77F2", photo:"https://images.unsplash.com/photo-1598764557991-b9f211b73b81?w=600&q=80",  fact:"Ligt plat op de bodem en is bijna onzichtbaar door camouflage.",             locations:["Blue Hole Dahab","Ras Mohammed"], seasons:{months:[3,4,5,6,7,8]} },
  { id:18, group:"haai",      taxon:47231,   name:"Pijlstaartrog",           latin:"Dasyatis pastinaca",      depthMin:1,  depthMax:60,  temp:"25°C", rarity:"Common",    emoji:"🪃", color:"#69DB7C", photo:"https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&q=80",  fact:"De giftige stakel kan tot 35 cm lang worden.",                               locations:["Ras Mohammed","Blue Hole Dahab","Similan Islands","Malediven"], seasons:{all:true} },
  { id:46, group:"haai",      taxon:47269,   name:"Zwartpuntrifhaai",        latin:"Carcharhinus melanopterus",depthMin:0, depthMax:75,  temp:"27°C", rarity:"Common",    emoji:"🦈", color:"#FF6B35", photo:"https://images.unsplash.com/photo-1564419320461-6870880221ad?w=600&q=80",  fact:"Herkenbaar aan de zwarte punten op de vinnen — zweeft graag in ondiep water.", locations:["Similan Islands","Malediven","Great Barrier Reef","Raja Ampat"], seasons:{all:true} },
  { id:47, group:"haai",      taxon:116945,  name:"Adelaarsrog",             latin:"Aetobatus narinari",      depthMin:1,  depthMax:80,  temp:"25°C", rarity:"Uncommon", emoji:"🦅", color:"#4ECDC4", photo:"https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&q=80",  fact:"Kan tot 3 meter breed worden en springt volledig uit het water.",             locations:["Galápagos","Cocos Island","Great Barrier Reef","Malediven"], seasons:{months:[4,5,6,7,8,9]} },
  { id:48, group:"haai",      taxon:47270,   name:"Citroenhaai",             latin:"Negaprion brevirostris",  depthMin:0,  depthMax:90,  temp:"24°C", rarity:"Uncommon", emoji:"🦈", color:"#FFD93D", photo:"https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=600&q=80",  fact:"Territoriaal en terughoudend — een van de weinige haaien die mensen active ontwijkt.", locations:["Galápagos","Cocos Island"], seasons:{all:true} },

  // ── SCHILDPADDEN ──
  { id:19, group:"schildpad", taxon:46558,   name:"Groene Zeeschildpad",     latin:"Chelonia mydas",          depthMin:0,  depthMax:50,  temp:"25°C", rarity:"Uncommon", emoji:"🐢", color:"#69DB7C", photo:"https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&q=80",  fact:"Keert altijd terug naar het strand waar ze geboren is om eieren te leggen.", locations:["Great Barrier Reef","Malediven","Similan Islands","Galápagos"], seasons:{all:true} },
  { id:20, group:"schildpad", taxon:46559,   name:"Karetschildpad",          latin:"Eretmochelys imbricata",  depthMin:0,  depthMax:30,  temp:"26°C", rarity:"Rare",  emoji:"🐢", color:"#FFD93D", photo:"https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80",  fact:"Gebruikt zijn puntige snavel om sponzen uit koraalrif te eten.",             locations:["Ras Mohammed","Great Barrier Reef","Similan Islands","Raja Ampat"], seasons:{all:true} },
  { id:21, group:"schildpad", taxon:46560,   name:"Lederschildpad",          latin:"Dermochelys coriacea",    depthMin:0,  depthMax:1000,temp:"20°C", rarity:"Rare",  emoji:"🐢", color:"#4ECDC4", photo:"https://images.unsplash.com/photo-1611001897207-f4b3a9e8e93b?w=600&q=80",  fact:"De grootste schildpad ter wereld — tot 700 kg en 2 meter lang.",             locations:["Cocos Island","Galápagos"], seasons:{months:[3,4,5,6]} },
  { id:49, group:"schildpad", taxon:46561,   name:"Onechte Karetschildpad",  latin:"Caretta caretta",         depthMin:0,  depthMax:200, temp:"24°C", rarity:"Uncommon", emoji:"🐢", color:"#FF6B35", photo:"https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&q=80",  fact:"Gebruikt haar sterke kaken om kreeften en schelpdieren te kraken.",          locations:["Ras Mohammed","Great Barrier Reef","Galápagos"], seasons:{months:[5,6,7,8,9]} },

  // ── INKTVISSEN & OCTOPUSSEN ──
  { id:5,  group:"inktvis",   taxon:82467,   name:"Blauwgeringde Octopus",   latin:"Hapalochlaena lunulata",  depthMin:0,  depthMax:50,  temp:"23°C", rarity:"Rare",  emoji:"🐙", color:"#FF6B9D", photo:"https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=600&q=80",  fact:"Eén van de giftigste zeedieren ter wereld — geen tegengif beschikbaar.",      locations:["Raja Ampat","Great Barrier Reef","Similan Islands"], seasons:{all:true} },
  { id:23, group:"inktvis",   taxon:82468,   name:"Mimikinktvis",            latin:"Thaumoctopus mimicus",    depthMin:3,  depthMax:30,  temp:"27°C", rarity:"Uncommon", emoji:"🐙", color:"#FFD93D", photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",  fact:"Imiteert meer dan 15 andere dierspeciesen, waaronder platvissen en zeeslangen.",locations:["Raja Ampat","Similan Islands"], seasons:{all:true} },
  { id:24, group:"inktvis",   taxon:82469,   name:"Reuzensepia",             latin:"Sepia apama",             depthMin:5,  depthMax:20,  temp:"20°C", rarity:"Uncommon", emoji:"🦑", color:"#A8E6CF", photo:"https://images.unsplash.com/photo-1564419320461-6870880221ad?w=600&q=80",  fact:"Kan kleur en textuur van zijn huid in milliseconden aanpassen.",             locations:["Great Barrier Reef"], seasons:{months:[5,6,7,8]} },
  { id:22, group:"inktvis",   taxon:82470,   name:"Reuzenpijlinktvis",       latin:"Architeuthis dux",        depthMin:200,depthMax:1000,temp:"8°C",  rarity:"Epic",    emoji:"🦑", color:"#DA77F2", photo:"https://images.unsplash.com/photo-1602526432604-029a709e131b?w=600&q=80",  fact:"Kan tot 13 meter lang worden — het grootste ongewerfielde dier op aarde.",    locations:["Galápagos","Cocos Island"], seasons:{all:true} },
  { id:50, group:"inktvis",   taxon:82471,   name:"Gewone Octopus",          latin:"Octopus vulgaris",        depthMin:0,  depthMax:150, temp:"22°C", rarity:"Common",    emoji:"🐙", color:"#FF6B35", photo:"https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=600&q=80",  fact:"Heeft drie harten, blauw bloed en kan door elke opening kruipen groter dan zijn bek.", locations:["Ras Mohammed","Blue Hole Dahab","Galápagos","Cocos Island"], seasons:{all:true} },
  { id:51, group:"inktvis",   taxon:82472,   name:"Vliegende Inktvis",       latin:"Todarodes pacificus",     depthMin:0,  depthMax:300, temp:"20°C", rarity:"Uncommon", emoji:"🦑", color:"#4ECDC4", photo:"https://images.unsplash.com/photo-1602526432604-029a709e131b?w=600&q=80",  fact:"Kan boven het wateroppervlak zweven door waterstralen uit zijn mantel te schieten.", locations:["Galápagos","Cocos Island","Great Barrier Reef"], seasons:{months:[4,5,6,7,8,9]} },

  // ── ZEEZOOGDIEREN ──
  { id:6,  group:"zoogdier",  taxon:35154,   name:"Walvishaai",              latin:"Rhincodon typus",         depthMin:0,  depthMax:700, temp:"21°C", rarity:"Epic",    emoji:"🐋", color:"#74C0FC", photo:"https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80",  fact:"De grootste vis op aarde — tot 12 meter lang en volledig onschadelijk.",      locations:["Malediven","Galápagos","Cocos Island"], seasons:{months:[10,11,12,1,2,3]} },
  { id:25, group:"zoogdier",  taxon:41803,   name:"Tuimelaar",               latin:"Tursiops truncatus",      depthMin:0,  depthMax:600, temp:"22°C", rarity:"Common",    emoji:"🐬", color:"#4ECDC4", photo:"https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=600&q=80",  fact:"Slaapt with één hersenhelft tegelijk zodat hij kan blijven zwemmen.",         locations:["Galápagos","Cocos Island","Great Barrier Reef","Malediven"], seasons:{all:true} },
  { id:26, group:"zoogdier",  taxon:41804,   name:"Bultrug",                 latin:"Megaptera novaeangliae",  depthMin:0,  depthMax:200, temp:"18°C", rarity:"Rare",  emoji:"🐋", color:"#A8E6CF", photo:"https://images.unsplash.com/photo-1544551763-92ab472cad5d?w=600&q=80",  fact:"Het gezang van mannetjes kan tot 32 km ver dragen.",                         locations:["Galápagos","Great Barrier Reef","Cocos Island"], seasons:{months:[6,7,8,9,10]} },
  { id:27, group:"zoogdier",  taxon:41805,   name:"Galápagos Zeeleeuw",      latin:"Zalophus wollebaeki",     depthMin:0,  depthMax:300, temp:"18°C", rarity:"Uncommon", emoji:"🦭", color:"#FFD93D", photo:"https://images.unsplash.com/photo-1551394481-a5261fff16c2?w=600&q=80",  fact:"Galápagos-zeeleeuwen zwemmen soms speels samen with diveers.",               locations:["Galápagos"], seasons:{all:true} },
  { id:28, group:"zoogdier",  taxon:41806,   name:"Dugong",                  latin:"Dugong dugon",            depthMin:1,  depthMax:40,  temp:"26°C", rarity:"Rare",  emoji:"🦭", color:"#69DB7C", photo:"https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&q=80",  fact:"Kan tot 70 jaar oud worden en ademt elke 6 minuten.",                        locations:["Malediven","Great Barrier Reef","Raja Ampat"], seasons:{all:true} },
  { id:40, group:"zoogdier",  taxon:41807,   name:"Potvis",                  latin:"Physeter macrocephalus",  depthMin:0,  depthMax:3000,temp:"10°C", rarity:"Epic",    emoji:"🐳", color:"#74C0FC", photo:"https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=600&q=80",  fact:"Duikt tot 3 km diep en kan meer dan 90 minuten zonder adem.",               locations:["Galápagos","Cocos Island","Malediven"], seasons:{months:[1,2,3,4,5]} },
  { id:52, group:"zoogdier",  taxon:41808,   name:"Spinnerdolfijn",          latin:"Stenella longirostris",   depthMin:0,  depthMax:300, temp:"25°C", rarity:"Common",    emoji:"🐬", color:"#4ECDC4", photo:"https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=600&q=80",  fact:"Springt en draait tot 7 keer zijn as in de lucht — niemand weet precies waarom.", locations:["Malediven","Similan Islands","Cocos Island","Galápagos"], seasons:{all:true} },
  { id:53, group:"zoogdier",  taxon:41809,   name:"Orka",                    latin:"Orcinus orca",            depthMin:0,  depthMax:500, temp:"15°C", rarity:"Rare",  emoji:"🐋", color:"#FFD93D", photo:"https://images.unsplash.com/photo-1544551763-92ab472cad5d?w=600&q=80",  fact:"De slimste roofdieren in de oceaan — jagen with complexe, doorgegeven strategieën.", locations:["Galápagos","Cocos Island"], seasons:{months:[6,7,8,9]} },

  // ── KORALEN & ANEMONEN ──
  { id:29, group:"koraal",    taxon:57473,   name:"Hersenkoraal",            latin:"Diploria labyrinthiformis",depthMin:1, depthMax:30,  temp:"27°C", rarity:"Common",    emoji:"🪸", color:"#FF6B9D", photo:"https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=600&q=80",  fact:"Groeit slechts 2 mm per jaar — sommige zijn meer dan 900 jaar oud.",        locations:["Great Barrier Reef","Raja Ampat","Malediven","Similan Islands"], seasons:{all:true} },
  { id:30, group:"koraal",    taxon:57474,   name:"Buisvormige Spons",       latin:"Aplysina archeri",        depthMin:10, depthMax:70,  temp:"25°C", rarity:"Common",    emoji:"🪸", color:"#DA77F2", photo:"https://images.unsplash.com/photo-1611001897207-f4b3a9e8e93b?w=600&q=80",  fact:"Filtert dagelijks tot 20.000 liter water.",                                  locations:["Great Barrier Reef","Raja Ampat","Cocos Island"], seasons:{all:true} },
  { id:31, group:"koraal",    taxon:57475,   name:"Zeeanemoon",              latin:"Actiniaria",              depthMin:0,  depthMax:50,  temp:"26°C", rarity:"Common",    emoji:"🌸", color:"#FF6B35", photo:"https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&q=80",  fact:"Heeft giftige tentakels maar leeft in symbiose with clownvissen.",            locations:["Ras Mohammed","Similan Islands","Raja Ampat","Great Barrier Reef"], seasons:{all:true} },
  { id:32, group:"koraal",    taxon:57476,   name:"Zwart Koraal",            latin:"Antipatharia",            depthMin:15, depthMax:200, temp:"24°C", rarity:"Rare",  emoji:"🪸", color:"#4ECDC4", photo:"https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=600&q=80",  fact:"Kan meer dan 4000 jaar oud worden — een van de langst levende organismen.",  locations:["Blue Hole Dahab","Galápagos","Cocos Island"], seasons:{all:true} },
  { id:54, group:"koraal",    taxon:57477,   name:"Tafelkoraal",             latin:"Acropora hyacinthus",     depthMin:1,  depthMax:30,  temp:"27°C", rarity:"Uncommon", emoji:"🪸", color:"#69DB7C", photo:"https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=600&q=80",  fact:"Biedt bescherming aan honderden speciesen vissen en ongewerfielden.",           locations:["Great Barrier Reef","Raja Ampat","Similan Islands","Malediven"], seasons:{all:true} },
  { id:55, group:"koraal",    taxon:57478,   name:"Zeekomkommer",            latin:"Holothuria scabra",       depthMin:0,  depthMax:30,  temp:"27°C", rarity:"Common",    emoji:"🥒", color:"#FFD93D", photo:"https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&q=80",  fact:"Ademt door zijn anus en gooit zijn organen uit bij gevaar — die groeien terug.", locations:["Ras Mohammed","Similan Islands","Great Barrier Reef","Malediven","Raja Ampat"], seasons:{all:true} },
  { id:56, group:"koraal",    taxon:57479,   name:"Zeester",                 latin:"Acanthaster planci",      depthMin:3,  depthMax:50,  temp:"26°C", rarity:"Uncommon", emoji:"⭐", color:"#FF6B9D", photo:"https://images.unsplash.com/photo-1611001897207-f4b3a9e8e93b?w=600&q=80",  fact:"Eet koraal op en kan een uitbraak een heel rif vernietigen.",                locations:["Great Barrier Reef","Similan Islands","Raja Ampat","Malediven"], seasons:{all:true} },

  // ── ZELDZAAM & DIEPZEE ──
  { id:4,  group:"zeldzaam",  taxon:81998,   name:"Zeepaardtje",             latin:"Hippocampus kuda",        depthMin:1,  depthMax:20,  temp:"25°C", rarity:"Uncommon", emoji:"🐴", color:"#FFD93D", photo:"https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=600&q=80",  fact:"Het mannetje draagt de jongen — de enige species waarbij dat voorkomt.",        locations:["Similan Islands","Malediven","Raja Ampat"], seasons:{all:true} },
  { id:33, group:"zeldzaam",  taxon:82001,   name:"Naaldenvis",              latin:"Fistularia commersonii",  depthMin:1,  depthMax:200, temp:"24°C", rarity:"Uncommon", emoji:"🗡",  color:"#A8E6CF", photo:"https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&q=80",  fact:"Kan zijn bek uitrekken tot dezelfde lengte als zijn eigen lichaam.",         locations:["Ras Mohammed","Blue Hole Dahab","Similan Islands"], seasons:{all:true} },
  { id:34, group:"zeldzaam",  taxon:82002,   name:"Zeeappel",                latin:"Echinus esculentus",      depthMin:1,  depthMax:40,  temp:"20°C", rarity:"Common",    emoji:"🔴", color:"#FF6B9D", photo:"https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=600&q=80",  fact:"De stekels kunnen afbreken en in huid vastzitten.",                          locations:["Blue Hole Dahab","Galápagos","Great Barrier Reef"], seasons:{all:true} },
  { id:35, group:"zeldzaam",  taxon:82003,   name:"Ribbenkwal",              latin:"Ctenophora",              depthMin:0,  depthMax:1000,temp:"15°C", rarity:"Rare",  emoji:"🪼", color:"#74C0FC", photo:"https://images.unsplash.com/photo-1602526432604-029a709e131b?w=600&q=80",  fact:"Bioluminesceert 's nachts in spectaculaire kleuren.",                        locations:["Galápagos","Cocos Island","Blue Hole Dahab"], seasons:{all:true} },
  { id:36, group:"zeldzaam",  taxon:82004,   name:"Wolhaai",                 latin:"Orectolobus maculatus",   depthMin:0,  depthMax:110, temp:"22°C", rarity:"Rare",  emoji:"😴", color:"#69DB7C", photo:"https://images.unsplash.com/photo-1564419320461-6870880221ad?w=600&q=80",  fact:"Slaapt overdag op de bodem en ademt zonder te bewegen.",                    locations:["Great Barrier Reef","Similan Islands"], seasons:{months:[4,5,6,7,8,9,10]} },
  { id:37, group:"zeldzaam",  taxon:82005,   name:"Draakje van de Zee",      latin:"Phycodurus eques",        depthMin:3,  depthMax:50,  temp:"18°C", rarity:"Epic",    emoji:"🐲", color:"#DA77F2", photo:"https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=600&q=80",  fact:"Zo perfect gecamoufleerd als zeewier dat ze vrijwel onzichtbaar zijn.",     locations:["Great Barrier Reef"], seasons:{months:[9,10,11,12,1,2]} },
  { id:38, group:"zeldzaam",  taxon:82006,   name:"Mantiskreeft",            latin:"Odontodactylus scyllarus",depthMin:3,  depthMax:40,  temp:"26°C", rarity:"Uncommon", emoji:"🦐", color:"#FF6B35", photo:"https://images.unsplash.com/photo-1611689342806-0863700f2b4e?w=600&q=80",  fact:"Heeft 16 kleurreceptoren (mensen 3) en slaat toe with 80 km/u.",             locations:["Raja Ampat","Similan Islands","Great Barrier Reef"], seasons:{all:true} },
  { id:39, group:"zeldzaam",  taxon:82007,   name:"Spookpijlinktvis",        latin:"Vampyroteuthis infernalis",depthMin:600,depthMax:900, temp:"4°C",  rarity:"Epic",    emoji:"🦇", color:"#4ECDC4", photo:"https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=600&q=80",  fact:"Geen echte inktvis of octopus — een levend fossiel uit een uitgestorven orde.", locations:["Galápagos","Cocos Island"], seasons:{all:true} },
  { id:57, group:"zeldzaam",  taxon:82008,   name:"Blauwe Gestreepte Murene",latin:"Rhinomuraena quaesita",   depthMin:1,  depthMax:60,  temp:"26°C", rarity:"Uncommon", emoji:"💙", color:"#74C0FC", photo:"https://images.unsplash.com/photo-1498623116890-37e912163d5d?w=600&q=80",  fact:"Begint als mannelijk en blauw, verandert later naar geel vrouwtje.",         locations:["Similan Islands","Raja Ampat","Malediven","Great Barrier Reef"], seasons:{all:true} },
  { id:58, group:"zeldzaam",  taxon:82009,   name:"Frogfish",                latin:"Antennarius striatus",    depthMin:5,  depthMax:70,  temp:"25°C", rarity:"Rare",  emoji:"🐸", color:"#FF6B9D", photo:"https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=600&q=80",  fact:"Gebruikt een lokaas op zijn hoofd om prooi aan te trekken en sloct die dan in 6 ms op.", locations:["Raja Ampat","Similan Islands","Malediven"], seasons:{all:true} },
  { id:59, group:"zeldzaam",  taxon:82010,   name:"Vuurkwal",                latin:"Chrysaora fuscescens",    depthMin:0,  depthMax:200, temp:"18°C", rarity:"Uncommon", emoji:"🪼", color:"#FF6B35", photo:"https://images.unsplash.com/photo-1602526432604-029a709e131b?w=600&q=80",  fact:"Tentakels kunnen tot 3 meter lang worden en branden ook los van het lichaam.", locations:["Galápagos","Cocos Island","Great Barrier Reef"], seasons:{months:[11,12,1,2,3]} },
  { id:60, group:"zeldzaam",  taxon:82011,   name:"Krokodilvissen",          latin:"Papilloculiceps longiceps",depthMin:0, depthMax:25,  temp:"26°C", rarity:"Rare",  emoji:"🐊", color:"#69DB7C", photo:"https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&q=80",  fact:"Ligt volledig stil op de bodem — zo goed gecamoufleerd dat diveers er bijna op stappen.", locations:["Ras Mohammed","Blue Hole Dahab"], seasons:{all:true} },
];


const SPOTS = [
  { name:"Ras Mohammed",      flag:"🇪🇬", region:"Rode Zee, Egypte",     temp:"22–28°C", depth:"5–40m",  lat:27.73,  lng:34.25,  rating:4.8,
    sites:["Shark Reef","Yolanda Reef","Anemone City","The Alternatives","Shark Observatory"] },
  { name:"Blue Hole Dahab",   flag:"🇪🇬", region:"Rode Zee, Egypte",     temp:"22–26°C", depth:"5–130m", lat:28.57,  lng:34.54,  rating:4.9,
    sites:["The Arch","The Bells","Saddle","Lagoon","Canyon"] },
  { name:"Similan Islands",   flag:"🇹🇭", region:"Andamanzee, Thailand", temp:"26–30°C", depth:"5–30m",  lat:8.65,   lng:97.64,  rating:4.7,
    sites:["Elephant Head Rock","Christmas Point","East of Eden","Fantasy Reef","Anita's Reef"] },
  { name:"Malediven",         flag:"🇲🇻", region:"Indische Oceaan",      temp:"27–30°C", depth:"3–40m",  lat:3.20,   lng:73.22,  rating:4.9,
    sites:["Manta Point","Fish Head","Shark Point","Banana Reef","HP Reef"] },
  { name:"Raja Ampat",        flag:"🇮🇩", region:"Indonesië",            temp:"27–30°C", depth:"5–40m",  lat:-0.23,  lng:130.52, rating:5.0,
    sites:["Cape Kri","Sardine Reef","Blue Magic","Manta Sandy","Boo Rock"] },
  { name:"Great Barrier Reef",flag:"🇦🇺", region:"Australië",            temp:"23–28°C", depth:"3–20m",  lat:-18.29, lng:147.70, rating:4.8,
    sites:["Cod Hole","Osprey Reef","Steve's Bommie","Ribbon Reef #10","Coral Gardens"] },
  { name:"Galápagos",         flag:"🇪🇨", region:"Ecuador",              temp:"18–26°C", depth:"10–30m", lat:-0.95,  lng:-90.97, rating:4.9,
    sites:["Gordon Rocks","Wolf Island","Darwin Island","Kicker Rock","North Seymour"] },
  { name:"Cocos Island",      flag:"🇨🇷", region:"Costa Rica",           temp:"24–28°C", depth:"10–40m", lat:5.53,   lng:-87.06, rating:4.7,
    sites:["Manuelita","Dirty Rock","Alcyone","Bajo Alcyone","Chat's Point"] },
];

const MOCK_OBS = {
  "Ras Mohammed":      {1:312,2:48, 3:22, 4:91, 5:8,  6:5,  7:267,8:19, 9:88, 10:144,11:201,12:99, 13:55, 14:11,15:7, 16:4, 17:33,18:188,19:44,20:31,21:2, 22:0, 23:3, 24:0, 25:12,26:4, 27:0, 28:2, 29:155,30:88, 31:310,32:67, 33:201,34:88,35:22,36:0, 37:0, 38:11,39:0, 40:2, 41:55,42:33,43:88,44:22,45:11,46:44,47:8, 48:3, 49:18,50:77,51:5, 52:8, 53:2, 54:44,55:199,56:33,57:5, 58:3, 59:2, 60:88 },
  "Blue Hole Dahab":   {1:88, 2:31, 3:61, 4:44, 5:3,  6:12, 7:199,8:27, 9:33, 10:55, 11:88, 12:44, 13:22, 14:8, 15:4, 16:3, 17:55,18:99, 19:22,20:18,21:1, 22:0, 23:1, 24:0, 25:5, 26:2, 27:0, 28:1, 29:88, 30:44, 31:155,32:44, 33:144,34:66,35:55,36:0, 37:0, 38:5, 39:0, 40:1, 41:22,42:11,43:33,44:8, 45:5, 46:18,47:3, 48:1, 49:8, 50:33,51:2, 52:3, 53:1, 54:22,55:88, 56:11,57:2, 58:1, 59:1, 60:122},
  "Similan Islands":   {1:420,2:37, 3:88, 4:133,5:44, 6:18, 7:95, 8:76, 9:66, 10:210,11:155,12:88, 13:44, 14:99,15:22,16:11,17:5, 18:155,19:110,20:55,21:3, 22:1, 23:44,24:5, 25:33,26:8, 27:0, 28:11,29:200,30:110,31:255,32:22, 33:88, 34:55,35:11,36:22,37:0, 38:66,39:0, 40:4, 41:88,42:66,43:111,44:44,45:22,46:133,47:22,48:8, 49:11,50:55,51:18,52:44,53:4, 54:155,55:244,56:66,57:33,58:44,59:8, 60:11},
  "Malediven":         {1:510,2:29, 3:201,4:188,5:11, 6:94, 7:77, 8:120,9:88, 10:188,11:210,12:66, 13:33, 14:155,15:33,16:44,17:4, 18:201,19:188,20:88,21:4, 22:2, 23:22,24:8, 25:99,26:11,27:0, 28:55,29:310,30:155,31:200,32:33, 33:55, 34:44,35:22,36:11,37:0, 38:44,39:0, 40:22,41:111,42:88,43:133,44:55,45:22,46:188,47:44,48:11,49:22,50:66,51:22,52:88,53:5, 54:200,55:310,56:88,57:44,58:55,59:11,60:8 },
  "Raja Ampat":        {1:387,2:19, 3:66, 4:244,5:87, 6:33, 7:44, 8:310,9:44, 10:220,11:180,12:110,13:55, 14:88, 15:18,16:9, 17:3, 18:88, 19:155,20:44,21:2, 22:3, 23:88,24:11,25:44,26:6, 27:0, 28:44,29:280,30:200,31:310,32:11, 33:33, 34:44,35:11,36:33,37:0, 38:110,39:0, 40:8, 41:99,42:122,43:88,44:66,45:33,46:155,47:33,48:8, 49:11,50:44,51:22,52:55,53:4, 54:233,55:288,56:99,57:55,58:88,59:8, 60:5 },
  "Great Barrier Reef":{1:601,2:55, 3:44, 4:77, 5:122,6:21, 7:133,8:88, 9:99, 10:310,11:244,12:155,13:88, 14:177,15:66,16:33,17:8, 18:244,19:310,20:155,21:11,22:4, 23:55,24:199,25:155,26:44,27:0, 28:88,29:400,30:288,31:350,32:22, 33:66, 34:99,35:33,36:88,37:44,38:155,39:2, 40:11,41:133,42:100,43:155,44:88,45:44,46:210,47:66,48:22,49:44,50:88,51:33,52:111,53:11,54:310,55:400,56:155,57:44,58:66,59:22,60:11},
  "Galápagos":         {1:44, 2:201,3:33, 4:11, 5:6,  6:155,7:22, 8:8,  9:11, 10:22, 11:33, 12:88, 13:11, 14:22, 15:99,16:133,17:4, 18:55, 19:88, 20:99, 21:55,22:88,23:11,24:4, 25:188,26:133,27:244,28:22,29:55, 30:33, 31:44, 32:99, 33:22, 34:77,35:88,36:11,37:0, 38:22,39:66,40:88,41:22,42:11,43:44,44:8, 45:5, 46:33, 47:99,48:66,49:44,50:55,51:44,52:133,53:88,54:22,55:66, 56:33,57:3, 58:8, 59:44,60:3 },
  "Cocos Island":      {1:33, 2:188,3:22, 4:8,  5:4,  6:99, 7:18, 8:5,  9:8,  10:18, 11:22, 12:66, 13:8,  14:18, 15:77,16:110,17:3, 18:44, 19:55, 20:77, 21:44,22:66,23:8, 24:3, 25:144,26:99, 27:11, 28:11,29:33, 30:22, 31:33, 32:77, 33:11, 34:55,35:66,36:8, 37:0, 38:11,39:44,40:66,41:11,42:8, 43:22,44:5, 45:3, 46:18, 47:55,48:44,49:22,50:33,51:33,52:88,53:66,54:11,55:33, 56:22,57:2, 58:5, 59:33,60:2 },
};

// ── SEIZOEN HELPERS ──────────────────────────────────────────────────────────
var MONTHS_NL = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
function isInSeason(creature, month) {
  if (!creature.seasons || creature.seasons.all) return true;
  return (creature.seasons.months||[]).indexOf(month) >= 0;
}
function bestMonths(creature) {
  if (!creature.seasons || creature.seasons.all) return "Het hele jaar";
  return (creature.seasons.months||[]).map(function(m){return MONTHS_NL[m-1];}).join(", ");
}
function depthLabel(c) {
  return c.depthMin+"–"+c.depthMax+"m";
}

const RC = {"Common":"#74C0FC","Uncommon":"#69DB7C","Rare":"#FFD93D","Epic":"#FF6B9D"};
const RS = {"Common":1,"Uncommon":2,"Rare":3,"Epic":4};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function scoreSpot(spot, wishlist) {
  if (!wishlist.length) return 0;
  return Math.round(wishlist.filter(function(c) { return c.locations.indexOf(spot.name) >= 0; }).length / wishlist.length * 100);
}
function sortByObs(list, obs) {
  if (!obs) return list;
  return list.slice().sort(function(a,b) { return (obs[b.id]||0) - (obs[a.id]||0); });
}

// ── SUPABASE ─────────────────────────────────────────────────────────────────
var SUPA_URL = "https://cgjjioimfaznpnsymhxh.supabase.co";
var SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnamppb2ltZmF6bnBuc3ltaHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDgwMTMsImV4cCI6MjA4ODAyNDAxM30.P_g-RMC7t4AJsBFmylp8tf2nt5SMOGTe1xOelaaN2Oo";

var _supaToken = null; // JWT from sign-in
var _supaUid   = null;

async function supaFetch(path, opts) {
  var headers = {
    "Content-Type": "application/json",
    "apikey": SUPA_KEY,
    "Authorization": "Bearer " + (_supaToken || SUPA_KEY),
  };
  if (opts && opts.prefer) headers["Prefer"] = opts.prefer;
  var res = await fetch(SUPA_URL + path, {
    method: opts && opts.method || "GET",
    headers: headers,
    body: opts && opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 204) return {};
  return res.json();
}

// Auth
async function supaSignUp(email, password, name) {
  var res = await supaFetch("/auth/v1/signup", {
    method: "POST",
    body: { email, password, data: { name } },
  });
  if (res.error) throw new Error(res.error.message || "Sign up failed");
  return res;
}

async function supaSignIn(email, password) {
  var res = await supaFetch("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email, password },
  });
  if (res.error) throw new Error(res.error.message || "Sign in failed");
  _supaToken = res.access_token;
  _supaUid   = res.user && res.user.id;
  // Persist session in localStorage for page reload
  try { localStorage.setItem("dl_sess", JSON.stringify({token: _supaToken, uid: _supaUid})); } catch(e) {}
  return res;
}

async function supaSignOut() {
  try { await supaFetch("/auth/v1/logout", {method:"POST"}); } catch(e) {}
  _supaToken = null; _supaUid = null;
  try { localStorage.removeItem("dl_sess"); } catch(e) {}
}

async function supaRestoreSession() {
  try {
    var raw = localStorage.getItem("dl_sess");
    if (!raw) return null;
    var s = JSON.parse(raw);
    if (!s || !s.token) return null;
    _supaToken = s.token;
    _supaUid   = s.uid;
    // Verify token is still valid
    var user = await supaFetch("/auth/v1/user");
    if (user.error) { _supaToken = null; _supaUid = null; localStorage.removeItem("dl_sess"); return null; }
    return { uid: _supaUid, user };
  } catch(e) { return null; }
}

// Profile
async function supaGetProfile(uid) {
  var res = await supaFetch("/rest/v1/profiles?id=eq."+uid+"&select=*");
  return Array.isArray(res) ? res[0] : null;
}

async function supaUpsertProfile(profile) {
  return supaFetch("/rest/v1/profiles", {
    method: "POST", prefer: "resolution=merge-duplicates",
    body: profile,
  });
}

// User data (spotted, wishlist, custom_fields)
async function supaGetUserData(uid) {
  var res = await supaFetch("/rest/v1/user_data?user_id=eq."+uid+"&select=*");
  return Array.isArray(res) ? res[0] : null;
}

async function supaUpsertUserData(data) {
  return supaFetch("/rest/v1/user_data?on_conflict=user_id", {
    method: "POST", prefer: "resolution=merge-duplicates",
    body: data,
  });
}

// Dives
async function supaGetDives(uid) {
  var res = await supaFetch("/rest/v1/dives?user_id=eq."+uid+"&order=date.desc&select=*");
  return Array.isArray(res) ? res : [];
}

async function supaUpsertDive(dive) {
  return supaFetch("/rest/v1/dives", {
    method: "POST", prefer: "resolution=merge-duplicates",
    body: dive,
  });
}

async function supaDeleteDive(id) {
  return supaFetch("/rest/v1/dives?id=eq."+id, { method: "DELETE" });
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{--bg:#050d1a;--teal:#4ECDC4;--w10:rgba(255,255,255,.10);--w06:rgba(255,255,255,.06);--w04:rgba(255,255,255,.04);--mu:rgba(255,255,255,.4);--fa:rgba(255,255,255,.22);}
body{background:var(--bg);}
.app{font-family:'DM Sans',sans-serif;background:var(--bg);min-height:100vh;max-width:390px;margin:0 auto;color:#fff;display:flex;flex-direction:column;}
@keyframes rise{0%{transform:translateY(100vh);opacity:0}15%{opacity:1}100%{transform:translateY(-120px);opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
.bubble{position:fixed;border-radius:50%;background:rgba(78,205,196,.06);animation:rise linear infinite;pointer-events:none;z-index:0;}
.screen{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;}
.header{padding:50px 22px 10px;display:flex;align-items:center;justify-content:space-between;}
.logo{font-family:'DM Serif Display',serif;font-size:23px;font-style:italic;color:var(--teal);}
.logo span{color:#fff;font-style:normal;}
.hright{font-size:11px;color:var(--mu);text-align:right;line-height:1.6;}
.gfilter{display:flex;gap:6px;padding:0 22px 10px;overflow-x:auto;scrollbar-width:none;}
.gfilter::-webkit-scrollbar{display:none;}
.gb{display:flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;border:1px solid var(--w10);background:var(--w04);color:var(--mu);font-family:'DM Sans',sans-serif;font-size:11px;cursor:pointer;white-space:nowrap;flex-shrink:0;}
.gb.on{background:rgba(78,205,196,.12);border-color:rgba(78,205,196,.3);color:var(--teal);font-weight:600;}
.gcount{font-size:9px;background:rgba(255,255,255,.1);border-radius:8px;padding:1px 5px;}
.pbar{height:2px;background:var(--w06);margin:0 22px 4px;}
.pfill{height:100%;background:linear-gradient(90deg,var(--teal),#69DB7C);border-radius:2px;transition:width .3s;}
.plabel{display:flex;justify-content:space-between;padding:0 22px 8px;font-size:10px;color:rgba(255,255,255,.35);}
.sortbar{display:flex;align-items:center;justify-content:space-between;padding:0 22px 8px;}
.sortlbl{font-size:10px;color:var(--mu);}
.srcbadge{font-size:9px;padding:2px 8px;border-radius:8px;font-weight:600;}
.legend{display:flex;justify-content:center;gap:12px;padding:0 22px 8px;}
.leg{display:flex;align-items:center;gap:4px;font-size:9px;color:var(--fa);text-transform:uppercase;letter-spacing:.3px;}
.legdot{width:6px;height:6px;border-radius:50%;}
.cardarea{flex:1;display:flex;align-items:center;justify-content:center;padding:0 22px;}
.stack{position:relative;width:100%;height:390px;}
.shadowcard{position:absolute;inset:0;background:var(--w04);border:1px solid rgba(255,255,255,.05);border-radius:28px;transform:scale(.95) translateY(12px);}
.card{position:absolute;inset:0;border-radius:28px;overflow:hidden;cursor:grab;user-select:none;touch-action:none;box-shadow:0 20px 60px rgba(0,0,0,.7);}
.card:active{cursor:grabbing;}
.cimg{position:absolute;inset:0;background-size:cover;background-position:center;}
.coverlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(2,8,18,.97) 0%,rgba(2,8,18,.2) 52%,transparent 100%);}
.ctop{position:absolute;top:0;left:0;right:0;height:60px;background:linear-gradient(to bottom,rgba(2,8,18,.4),transparent);}
.hint{position:absolute;left:50%;transform:translateX(-50%);padding:8px 18px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:2px;pointer-events:none;z-index:10;border:2px solid;}
.hr{top:36%;color:#69DB7C;border-color:#69DB7C;background:rgba(105,219,124,.15);}
.hl{top:36%;color:#FF6B6B;border-color:#FF6B6B;background:rgba(255,107,107,.15);}
.hu{top:26%;color:#FFD93D;border-color:#FFD93D;background:rgba(255,211,61,.15);}
.cinfo{position:absolute;bottom:0;left:0;right:0;padding:14px 18px 16px;}
.cbadge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:9px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;margin-bottom:5px;}
.cname{font-family:'DM Serif Display',serif;font-size:24px;line-height:1.1;margin-bottom:1px;}
.clatin{font-size:10px;color:rgba(255,255,255,.42);font-style:italic;margin-bottom:8px;}
.cstats{display:flex;gap:12px;margin-bottom:7px;}
.csl{font-size:8px;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.5px;}
.csv{font-size:12px;font-weight:600;}
.cfact{font-size:10px;color:rgba(255,255,255,.5);line-height:1.5;border-top:1px solid rgba(255,255,255,.08);padding-top:7px;font-style:italic;}
.obsbadge{position:absolute;top:12px;left:12px;font-size:9px;font-weight:600;background:rgba(0,0,0,.55);border:1px solid rgba(78,205,196,.3);color:#4ECDC4;padding:3px 8px;border-radius:8px;}
.gtag{position:absolute;top:42px;left:12px;font-size:9px;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);padding:2px 7px;border-radius:6px;}
.pcredit{position:absolute;top:12px;right:12px;font-size:8px;color:rgba(255,255,255,.3);background:rgba(0,0,0,.4);padding:2px 6px;border-radius:6px;}
.dirrow{display:flex;justify-content:center;align-items:center;padding:6px 22px 2px;}
.dbtn{display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;padding:6px 16px;border-radius:10px;}
.dmid{display:flex;flex-direction:column;align-items:center;gap:2px;margin:0 4px;}
.dcenter{width:44px;height:44px;border-radius:50%;border:1.5px solid var(--w10);display:flex;align-items:center;justify-content:center;font-size:16px;background:var(--w04);}
.nav{display:flex;background:rgba(5,13,26,.97);border-top:1px solid rgba(255,255,255,.07);padding:10px 0 24px;}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:var(--fa);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:8px;text-transform:uppercase;letter-spacing:.5px;padding:7px;}
.nb.on{color:var(--teal);}
.ni{font-size:17px;}
.scroll{flex:1;overflow-y:auto;padding:0 22px 20px;}
.scroll::-webkit-scrollbar{width:3px;}
.scroll::-webkit-scrollbar-thumb{background:var(--w10);border-radius:2px;}
.stitle{font-family:'DM Serif Display',serif;font-size:20px;font-style:italic;margin-bottom:12px;color:rgba(255,255,255,.88);}
.empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:var(--mu);text-align:center;padding:40px;}
.wishitem{background:rgba(255,211,61,.05);border:1px solid rgba(255,211,61,.15);border-radius:14px;padding:10px;display:flex;align-items:center;gap:10px;margin-bottom:7px;}
.wishphoto{width:42px;height:42px;border-radius:10px;background-size:cover;background-position:center;flex-shrink:0;}
.spotcard{border-radius:14px;padding:14px;margin-bottom:8px;cursor:pointer;}
.sbar{height:3px;border-radius:2px;margin-top:7px;background:rgba(255,255,255,.07);overflow:hidden;}
.sfill{height:100%;border-radius:2px;}
.mtags{display:flex;gap:5px;margin-top:7px;flex-wrap:wrap;}
.mtag{font-size:10px;padding:2px 7px;border-radius:8px;background:var(--w06);border:1px solid var(--w10);}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px;}
.scard{background:var(--w04);border:1px solid var(--w10);border-radius:12px;padding:10px;display:flex;align-items:center;gap:8px;}
.sphoto{width:36px;height:36px;border-radius:8px;background-size:cover;background-position:center;flex-shrink:0;}
.fb{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);}
.fbc{background:#0c1a2b;border:1px solid var(--w10);border-radius:22px;padding:28px 34px;text-align:center;max-width:280px;animation:pop .28s cubic-bezier(.34,1.56,.64,1);}
.fbphoto{width:80px;height:80px;border-radius:16px;background-size:cover;background-position:center;margin:0 auto 12px;}
.ft{font-family:'DM Serif Display',serif;font-size:22px;margin-bottom:5px;}
.fs{font-size:11px;color:var(--mu);line-height:1.5;}
.mleg{display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap;}
.mlegitem{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--mu);}
.mlegdot{width:8px;height:8px;border-radius:50%;}
.spotdetail{background:rgba(10,20,35,.98);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:16px;margin-bottom:12px;position:relative;animation:fadeUp .25s ease;}
.ascreen{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;animation:fadeUp .4s ease;}
.alogo{font-family:'DM Serif Display',serif;font-size:38px;font-style:italic;color:var(--teal);margin-bottom:4px;}
.alogo span{color:#fff;font-style:normal;}
.asub{font-size:13px;color:var(--mu);margin-bottom:36px;text-align:center;}
.acard{background:rgba(13,27,42,.9);border:1px solid var(--w10);border-radius:24px;padding:28px;width:100%;max-width:340px;}
.atabs{display:flex;margin-bottom:24px;background:var(--w04);border-radius:12px;padding:3px;}
.atab{flex:1;padding:8px;border:none;background:none;color:var(--mu);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;border-radius:10px;}
.atab.on{background:rgba(78,205,196,.15);color:var(--teal);font-weight:600;}
.field{margin-bottom:14px;}
.field label{display:block;font-size:10px;color:var(--mu);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
.field input{width:100%;background:var(--w06);border:1px solid var(--w10);border-radius:10px;padding:11px 14px;color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;}
.field input::placeholder{color:rgba(255,255,255,.2);}
.authwrap{display:flex;flex-direction:column;justify-content:center;padding:48px 28px;min-height:100vh;}
.aform{display:flex;flex-direction:column;gap:10px;}
.ainp{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:13px 16px;color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;width:100%;}
.ainp::placeholder{color:rgba(255,255,255,.35);}
.ainp:focus{border-color:var(--teal);background:rgba(78,205,196,.06);}
.abtn{width:100%;padding:13px;background:var(--teal);border:none;border-radius:12px;color:#050d1a;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;margin-top:4px;}
.aswitch{background:none;border:none;color:rgba(255,255,255,.4);font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;padding:4px 0;text-align:center;}
.amsg{font-size:12px;text-align:center;padding:6px 0;border-radius:8px;}
.aok{color:#69DB7C;}.aerr{color:#FF6B6B;}
.amsg{font-size:11px;text-align:center;margin-top:10px;padding:8px;border-radius:8px;}
.aerr{color:#FF6B6B;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.2);}
.aok{color:#69DB7C;background:rgba(105,219,124,.08);border:1px solid rgba(105,219,124,.2);}
.phdr{padding:50px 22px 16px;display:flex;align-items:center;gap:14px;}
.avatar{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--teal),#0f3460);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#050d1a;flex-shrink:0;}
.statgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 22px 16px;}
.statbox{background:var(--w04);border:1px solid var(--w10);border-radius:14px;padding:14px;text-align:center;}
.statnum{font-family:'DM Serif Display',serif;font-size:24px;color:var(--teal);}
.statlbl{font-size:9px;color:var(--mu);text-transform:uppercase;letter-spacing:.5px;margin-top:2px;}
.logoutbtn{margin:0 22px 16px;width:calc(100% - 44px);padding:11px;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.2);border-radius:12px;color:#FF6B6B;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;}
`;

// ── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Bubbles() {
  return (
    <div>
      {[0,1,2,3,4,5].map(function(i) {
        return <div key={i} className="bubble" style={{
          width:(6+i*2.3)+"px", height:(6+i*2.3)+"px",
          left:(10+i*14)+"%",
          animationDuration:(8+i*1.5)+"s",
          animationDelay:(i*2)+"s",
        }}/>;
      })}
    </div>
  );
}

function Stars(props) {
  var n = RS[props.rarity] || 1;
  var s = "";
  for (var i=0;i<n;i++) s+="★";
  for (var j=n;j<4;j++) s+="☆";
  return <span>{s}</span>;
}


// ── LOG FORM ─────────────────────────────────────────────────────────────────
// DiveSession: swipe through species after a dive.
// Spotted = right, Not seen = left. Done = dive opgeslagen.
// Daarna kun je optioneel details toevoegen.

function haversine(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dLat = (lat2-lat1)*Math.PI/180;
  var dLng = (lng2-lng1)*Math.PI/180;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
    Math.sin(dLng/2)*Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function sortCreaturesBySpot(creatures, spotName) {
  var obs = MOCK_OBS[spotName] || {};
  // Separate creatures that occur at this spot vs. don't
  var here    = creatures.filter(function(c){ return c.locations.indexOf(spotName) >= 0; });
  var notHere = creatures.filter(function(c){ return c.locations.indexOf(spotName) < 0; });
  // Sort by observation count descending
  here.sort(function(a,b){ return (obs[b.id]||0) - (obs[a.id]||0); });
  notHere.sort(function(a,b){ return (obs[b.id]||0) - (obs[a.id]||0); });
  return here.concat(notHere);
}

function LocationPicker(props) {
  // props: spots, onConfirm(spot), onCancel
  var [selected, setSelected] = useState(props.suggested);
  var [gpsStatus, setGpsStatus] = useState(props.gpsStatus); // "loading"|"found"|"denied"|"unsupported"

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"#050d1a",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"50px 22px 20px"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,fontStyle:"italic",color:"#4ECDC4",marginBottom:4}}>Where did you dive?</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>
          {gpsStatus==="loading" && "📡 Getting location..."}
          {gpsStatus==="found"   && "📍 Nearest spot suggested"}
          {gpsStatus==="denied"  && "📍 No GPS — choose manually"}
          {gpsStatus==="unsupported" && "📍 Choose your dive site"}
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 22px"}}>
        {props.spots.map(function(spot) {
          var isSel = selected && selected.name === spot.name;
          var dist  = props.userPos ? Math.round(haversine(props.userPos.lat, props.userPos.lng, spot.lat, spot.lng)) : null;
          return (
            <div key={spot.name} onClick={function(){setSelected(spot);}}
              style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",marginBottom:8,borderRadius:18,cursor:"pointer",
                background: isSel ? "rgba(78,205,196,.12)" : "rgba(255,255,255,.04)",
                border: "2px solid " + (isSel ? "rgba(78,205,196,.4)" : "rgba(255,255,255,.07)")}}>
              <div style={{fontSize:28,flexShrink:0}}>{spot.flag}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:600}}>{spot.name}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{spot.region}</div>
                {dist !== null && (
                  <div style={{fontSize:10,marginTop:2,color: dist<500?"#69DB7C": dist<2000?"#FFD93D":"rgba(255,255,255,.3)"}}>
                    {dist < 1 ? "< 1 km" : dist+" km away"}
                  </div>
                )}
              </div>
              {isSel && <div style={{fontSize:22,color:"#4ECDC4"}}>✓</div>}
            </div>
          );
        })}
      </div>

      <div style={{padding:"16px 22px 44px",display:"flex",gap:10}}>
        <button onClick={props.onCancel}
          style={{flex:1,padding:16,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:18,color:"rgba(255,255,255,.5)",fontFamily:"'DM Sans',sans-serif",fontSize:14,cursor:"pointer"}}>
          Cancel
        </button>
        <button onClick={function(){if(selected) props.onConfirm(selected);}}
          disabled={!selected}
          style={{flex:2,padding:16,background:selected?"#4ECDC4":"rgba(255,255,255,.06)",border:"none",borderRadius:18,color:selected?"#050d1a":"rgba(255,255,255,.2)",fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:700,cursor:selected?"pointer":"default"}}>
          {selected ? "Dive at "+selected.name.split(" ")[0]+" →" : "Choose a site"}
        </button>
      </div>
    </div>
  );
}

function DiveSession(props) {
  // props: creatures, spots, onDone(seenIds, spot), onCancel
  var [phase, setPhase]   = useState("location"); // "location" | "swiping"
  var [spot, setSpot]     = useState(null);
  var [sorted, setSorted] = useState([]);
  var [userPos, setUserPos] = useState(null);
  var [gpsStatus, setGpsStatus] = useState("loading");
  var [suggested, setSuggested] = useState(null);

  var [idx, setIdx]       = useState(0);
  var [seen, setSeen]     = useState([]);
  var [wished, setWished] = useState([]);
  var [dragX, setDragX]   = useState(0);
  var [dragY, setDragY]   = useState(0);
  var [dragging, setDragging] = useState(false);
  var [hint, setHint]     = useState(null);
  var dragStart = useRef(null);

  // Get GPS on mount
  useEffect(function() {
    if (!navigator.geolocation) {
      setGpsStatus("unsupported");
      setSuggested(props.spots[0]);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        var uLat = pos.coords.latitude;
        var uLng = pos.coords.longitude;
        setUserPos({lat:uLat, lng:uLng});
        setGpsStatus("found");
        // Find nearest spot
        var nearest = props.spots.reduce(function(best, s) {
          var d = haversine(uLat, uLng, s.lat, s.lng);
          return d < best.dist ? {spot:s, dist:d} : best;
        }, {spot:props.spots[0], dist:Infinity});
        setSuggested(nearest.spot);
      },
      function() {
        setGpsStatus("denied");
        setSuggested(props.spots[0]);
      },
      {timeout:6000, maximumAge:60000}
    );
  }, []);

  function confirmSpot(s) {
    setSpot(s);
    setSorted(sortCreaturesBySpot(props.creatures, s.name));
    setPhase("swiping");
  }

  // Swipe handlers
  var cur = sorted[idx];
  var total = sorted.length;
  var pct = total > 0 ? Math.round(idx / total * 100) : 0;
  // How many creatures are "likely" at this spot
  var likelyCount = spot ? props.creatures.filter(function(c){return c.locations.indexOf(spot.name)>=0;}).length : 0;

  function onStart(e) {
    if (e.touches) e.preventDefault();
    var t = e.touches ? e.touches[0] : e;
    dragStart.current = {x:t.clientX, y:t.clientY};
    setDragging(true);
  }
  function onMove(e) {
    if (e.touches) e.preventDefault();
    if (!dragging || !dragStart.current) return;
    var t = e.touches ? e.touches[0] : e;
    var dx = t.clientX - dragStart.current.x;
    var dy = t.clientY - dragStart.current.y;
    setDragX(dx); setDragY(dy);
    var ax = Math.abs(dx), ay = Math.abs(dy);
    if (ay > ax && dy < 0 && ay > 30) setHint("wish");
    else if (dx > 30) setHint("yes");
    else if (dx < -30) setHint("no");
    else setHint(null);
  }
  function onEnd(e) {
    if (e && e.touches !== undefined) e.preventDefault();
    var ax = Math.abs(dragX), ay = Math.abs(dragY);
    if (ay > ax && dragY < -80) doSwipe("wish");
    else if (ax > 80 && dragX > 0) doSwipe("yes");
    else if (ax > 80 && dragX < 0) doSwipe("no");
    else { setDragX(0); setDragY(0); setDragging(false); setHint(null); }
  }
  function doSwipe(dir) {
    var newSeen   = dir==="yes"  ? seen.concat([cur.id])   : seen;
    var newWished = dir==="wish" ? wished.concat([cur.id]) : wished;
    setDragX(0); setDragY(0); setDragging(false); setHint(null);
    if (dir==="yes")  playPing();
    if (dir==="wish") { playSwoosh(); props.onWish(cur); }
    if (idx + 1 >= total) {
      props.onDone(newSeen, newWished, spot);
    } else {
      setSeen(newSeen);
      setWished(newWished);
      setIdx(function(i){return i+1;});
    }
  }

  var rot = dragX / 20;
  var hintOp = Math.min(Math.max(Math.abs(dragX), Math.abs(dragY)) / 80, 1);

  // ── LOCATION PICKER ──
  if (phase === "location") {
    // Still fetching GPS — show loading briefly then render picker
    return (
      <LocationPicker
        spots={props.spots}
        suggested={suggested}
        userPos={userPos}
        gpsStatus={gpsStatus}
        onConfirm={confirmSpot}
        onCancel={props.onCancel}
      />
    );
  }

  // ── SWIPE SESSION ──
  var isUnlikelyZone = idx >= likelyCount;

  function finish() {
    props.onDone(seen, wished, spot);
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"#050d1a",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"50px 22px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,fontStyle:"italic",color:"#4ECDC4"}}>
            {spot.flag} {spot.name}
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>
            {idx+1} / {total} · {isUnlikelyZone ? "⚠️ rarely here" : "✓ expected here"}
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={finish}
            style={{padding:"7px 14px",background:"rgba(78,205,196,.12)",border:"1px solid rgba(78,205,196,.3)",borderRadius:16,color:"#4ECDC4",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            Done ✓
          </button>
          <button onClick={props.onCancel} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>✕</button>
        </div>
      </div>

      <div style={{height:3,background:"rgba(255,255,255,.06)",margin:"0 22px 4px"}}>
        <div style={{height:"100%",background:"linear-gradient(90deg,#4ECDC4,#69DB7C)",borderRadius:2,width:pct+"%",transition:"width .2s"}}/>
      </div>
      <div style={{height:3,background:"rgba(255,255,255,.06)",margin:"0 22px 12px",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,height:"100%",width:Math.round(likelyCount/total*100)+"%",background:"rgba(105,219,124,.4)",borderRadius:2}}/>
        <div style={{position:"absolute",top:0,left:Math.round(likelyCount/total*100)+"%",height:"100%",right:0,background:"rgba(255,211,61,.2)",borderRadius:2}}/>
      </div>

      <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:8,fontSize:10,color:"rgba(255,255,255,.35)"}}>
        <span style={{color:"#FF6B6B"}}>← Not seen</span>
        <span style={{color:"#FFD93D"}}>↑ Wishlist</span>
        <span style={{color:"#69DB7C"}}>Spotted →</span>
      </div>

      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 22px"}}>
        <div style={{position:"relative",width:"100%",height:360}}>
          {sorted[idx+1] && (
            <div style={{position:"absolute",inset:0,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.05)",borderRadius:28,transform:"scale(.95) translateY(10px)"}}/>
          )}
          <div
            style={{position:"absolute",inset:0,borderRadius:28,overflow:"hidden",cursor:"grab",userSelect:"none",touchAction:"none",boxShadow:"0 20px 60px rgba(0,0,0,.7)",
              transform:"translateX("+dragX+"px) translateY("+(dragY<0?dragY:0)+"px) rotate("+rot+"deg)",
              transition:dragging?"none":"transform .3s cubic-bezier(.34,1.56,.64,1)"}}
            onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
            onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
          >
            <div style={{position:"absolute",inset:0,backgroundImage:"url("+cur.photo+")",backgroundSize:"cover",backgroundPosition:"center"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(2,8,18,.95) 0%,rgba(2,8,18,.15) 55%,transparent 100%)"}}/>
            {isUnlikelyZone && (
              <div style={{position:"absolute",top:0,left:0,right:0,padding:"8px 16px",background:"rgba(255,211,61,.1)",borderBottom:"1px solid rgba(255,211,61,.15)",fontSize:10,color:"#FFD93D",textAlign:"center"}}>
                ⚠️ Rarely seen at {spot.name}
              </div>
            )}
            {hint==="yes"  && <div style={{position:"absolute",top:"36%",left:"50%",transform:"translateX(-50%)",padding:"10px 22px",borderRadius:12,fontSize:15,fontWeight:700,letterSpacing:2,border:"2px solid #69DB7C",color:"#69DB7C",background:"rgba(105,219,124,.15)",opacity:hintOp,whiteSpace:"nowrap"}}>SPOTTED ✓</div>}
            {hint==="no"   && <div style={{position:"absolute",top:"36%",left:"50%",transform:"translateX(-50%)",padding:"10px 22px",borderRadius:12,fontSize:15,fontWeight:700,letterSpacing:2,border:"2px solid #FF6B6B",color:"#FF6B6B",background:"rgba(255,107,107,.15)",opacity:hintOp,whiteSpace:"nowrap"}}>NOT SEEN</div>}
            {hint==="wish" && <div style={{position:"absolute",top:"26%",left:"50%",transform:"translateX(-50%)",padding:"10px 22px",borderRadius:12,fontSize:15,fontWeight:700,letterSpacing:2,border:"2px solid #FFD93D",color:"#FFD93D",background:"rgba(255,211,61,.15)",opacity:hintOp,whiteSpace:"nowrap"}}>WISHLIST ⭐</div>}
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"14px 18px 18px"}}>
              <div style={{display:"inline-flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                <div style={{padding:"3px 10px",borderRadius:20,fontSize:9,fontWeight:600,textTransform:"uppercase",background:"rgba(78,205,196,.1)",color:"#4ECDC4",border:"1px solid rgba(78,205,196,.2)"}}>{cur.rarity}</div>
                {cur.locations.indexOf(spot.name)>=0 && <div style={{padding:"3px 10px",borderRadius:20,fontSize:9,fontWeight:600,textTransform:"uppercase",background:"rgba(105,219,124,.1)",color:"#69DB7C",border:"1px solid rgba(105,219,124,.2)"}}>✓ expected here</div>}
              </div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:26,lineHeight:1.1,marginBottom:2}}>{cur.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.4)",fontStyle:"italic",marginBottom:8}}>{cur.latin}</div>
              <div style={{display:"flex",gap:14,marginBottom:6}}>
                <div><div style={{fontSize:8,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".5px"}}>Depth</div><div style={{fontSize:12,fontWeight:600,color:cur.color}}>{cur.depth}</div></div>
                <div><div style={{fontSize:8,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".5px"}}>Temp</div><div style={{fontSize:12,fontWeight:600,color:cur.color}}>{cur.temp}</div></div>
                <div><div style={{fontSize:8,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".5px"}}>Obs.</div><div style={{fontSize:12,fontWeight:600,color:cur.color}}>{(MOCK_OBS[spot.name]||{})[cur.id]||0}</div></div>
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.45)",fontStyle:"italic",borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:7,lineHeight:1.5}}>{cur.fact}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumb buttons — subtiel, swipe is de hoofdactie */}
      <div style={{display:"flex",gap:8,padding:"10px 28px 4px",justifyContent:"center"}}>
        <button onClick={function(){doSwipe("no");}}
          style={{width:44,height:36,background:"rgba(255,107,107,.08)",border:"1px solid rgba(255,107,107,.2)",borderRadius:12,color:"rgba(255,107,107,.7)",fontSize:15,cursor:"pointer"}}>
          ✕
        </button>
        <button onClick={function(){doSwipe("wish");}}
          style={{width:44,height:36,background:"rgba(255,211,61,.06)",border:"1px solid rgba(255,211,61,.15)",borderRadius:12,color:"rgba(255,211,61,.7)",fontSize:14,cursor:"pointer"}}>
          ⭐
        </button>
        <button onClick={function(){doSwipe("yes");}}
          style={{width:100,height:36,background:"rgba(105,219,124,.1)",border:"1px solid rgba(105,219,124,.25)",borderRadius:12,color:"rgba(105,219,124,.8)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          ✓ Spotted
        </button>
      </div>
      <div style={{textAlign:"center",padding:"6px 22px 32px"}}>
        <button onClick={finish} style={{background:"none",border:"none",color:"rgba(255,255,255,.25)",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          {seen.length > 0 ? "Done — "+seen.length+" species spotted" : "Done — nothing spotted"}
        </button>
      </div>
    </div>
  )
}

// ── CUSTOM FIELD TYPES ───────────────────────────────────────────────────────
var FIELD_TYPES = [
  { type:"number", label:"Number",   placeholder:"e.g. 12",         icon:"🔢" },
  { type:"text",   label:"Text",   placeholder:"e.g. notes",icon:"📝" },
  { type:"rating", label:"Rating",   placeholder:"1–5 stars",    icon:"⭐" },
  { type:"bool",   label:"Yes/No",  placeholder:"checkbox",       icon:"☑️" },
];

function CustomFieldInput(props) {
  // props: field, value, onChange
  var f = props.field;
  if (f.type === "rating") {
    return (
      <div style={{display:"flex",gap:6}}>
        {[1,2,3,4,5].map(function(n){
          return (
            <button key={n} onClick={function(){props.onChange(n);}}
              style={{width:38,height:38,borderRadius:10,border:"1px solid "+(props.value>=n?"rgba(255,211,61,.4)":"rgba(255,255,255,.1)"),background:props.value>=n?"rgba(255,211,61,.1)":"rgba(255,255,255,.04)",color:props.value>=n?"#FFD93D":"rgba(255,255,255,.3)",fontSize:16,cursor:"pointer"}}>
              ★
            </button>
          );
        })}
      </div>
    );
  }
  if (f.type === "bool") {
    return (
      <div style={{display:"flex",gap:8}}>
        {["Yes","No"].map(function(opt){
          var on = props.value===opt;
          return (
            <button key={opt} onClick={function(){props.onChange(opt);}}
              style={{flex:1,padding:"12px 0",borderRadius:12,border:"1px solid "+(on?"rgba(78,205,196,.4)":"rgba(255,255,255,.1)"),background:on?"rgba(78,205,196,.12)":"rgba(255,255,255,.04)",color:on?"#4ECDC4":"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:on?600:400,cursor:"pointer"}}>
              {opt}
            </button>
          );
        })}
      </div>
    );
  }
  var inp = {width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding:"13px 14px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:15,outline:"none"};
  return (
    <input type={f.type==="number"?"number":"text"} inputMode={f.type==="number"?"numeric":"text"}
      placeholder={f.placeholder} value={props.value||""}
      onChange={function(e){props.onChange(e.target.value);}}
      style={inp}/>
  );
}


// DetailSheet: slide-up na het loggen voor optionele details
function DetailSheet(props) {
  // props: dive (partial), spots, onSave(updatedDive), onSkip
  var [loc, setLoc]       = useState(props.dive.location || props.spots[0].name);
  var [site, setSite]     = useState("");
  var [customSite, setCustomSite] = useState("");
  var [date, setDate]     = useState(new Date().toISOString().split("T")[0]);
  var [timeIn, setTimeIn] = useState("");
  var [depth, setDepth]   = useState("");
  var [dur, setDur]       = useState("");
  var [vis, setVis]       = useState("");
  var [wtemp, setWtemp]   = useState("");
  var [buddy, setBuddy]   = useState("");
  var [gas, setGas]       = useState("lucht");
  var [nitrox, setNitrox] = useState("32");
  var [diveTypes, setDiveTypes] = useState([]);

  var [extraOpen, setExtraOpen]   = useState(false);
  var [extra, setExtra]           = useState(props.dive.creatures.slice());
  var [customValues, setCustomValues] = useState({});
  function setCVal(label, val) {
    setCustomValues(function(p){ var n=Object.assign({},p); n[label]=val; return n; });
  }

  function toggleExtra(id) {
    setExtra(function(p) {
      return p.indexOf(id)>=0 ? p.filter(function(x){return x!==id;}) : p.concat([id]);
    });
  }

  function save() {
    var spot = props.spots.find(function(s){return s.name===loc;}) || props.spots[0];
    props.onSave(Object.assign({}, props.dive, {
      location: loc,
      site: site==="_custom" ? customSite : site,
      flag: spot.flag,
      region: spot.region,
      date: date,
      timeIn: timeIn,
      depth: depth ? depth+"m" : "?",
      duration: dur ? dur+" min" : "?",
      visibility: vis ? vis+"m" : "?",
      waterTemp: wtemp ? wtemp+"°C" : "?",
      buddy: buddy,
      gas: gas==="nitrox" ? "Nitrox "+nitrox+"%" : "Air",
      diveTypes: diveTypes,
      creatures: extra,
      customValues: customValues,
    }));
  }

  function skip() {
    props.onSave(Object.assign({}, props.dive, { creatures: extra, customValues: customValues }));
  }

  var inp = {width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:"14px 16px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:16,outline:"none",colorScheme:"dark"};
  var lbl = {display:"block",fontSize:10,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8};

  var extraCreatures = CREATURES.filter(function(c){return extra.indexOf(c.id)>=0;});
  var allCreatures   = CREATURES;

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"flex-end"}}>
      <div style={{background:"#0a1625",border:"1px solid rgba(255,255,255,.1)",borderRadius:"28px 28px 0 0",width:"100%",maxHeight:"88vh",overflowY:"auto",padding:"28px 22px 48px"}}>
        <div style={{width:40,height:4,background:"rgba(255,255,255,.15)",borderRadius:2,margin:"0 auto 24px"}}/>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,fontStyle:"italic",marginBottom:6}}>Add details</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:20}}>{extra.length} species spotted · optioneel aanvullen</div>

        {/* Spotted tijdens dive — editable */}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.7)"}}>Spotted tijdens dive</div>
            <button onClick={function(){setExtraOpen(function(p){return !p;});}}
              style={{fontSize:11,padding:"4px 12px",background:"rgba(78,205,196,.1)",border:"1px solid rgba(78,205,196,.25)",borderRadius:14,color:"#4ECDC4",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              {extraOpen ? "Close" : "+ Add"}
            </button>
          </div>

          {/* Current spotted list */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom: extraOpen ? 12 : 0}}>
            {extraCreatures.length === 0
              ? <div style={{fontSize:11,color:"rgba(255,255,255,.25)",fontStyle:"italic"}}>No species selected</div>
              : extraCreatures.map(function(c){
                return (
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(105,219,124,.08)",border:"1px solid rgba(105,219,124,.2)",borderRadius:20,padding:"4px 10px",fontSize:11}}>
                    <div style={{width:16,height:16,borderRadius:4,backgroundImage:"url("+c.photo+")",backgroundSize:"cover",backgroundPosition:"center"}}/>
                    {c.name}
                    <button onClick={function(){toggleExtra(c.id);}} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:12,padding:"0 0 0 2px",lineHeight:1}}>✕</button>
                  </div>
                );
              })
            }
          </div>

          {/* Picker */}
          {extraOpen && (
            <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:16,padding:12}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginBottom:10}}>Tap to add or remove</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {allCreatures.map(function(c){
                  var on = extra.indexOf(c.id)>=0;
                  return (
                    <div key={c.id} onClick={function(){toggleExtra(c.id);}}
                      style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:12,cursor:"pointer",
                        background: on ? "rgba(105,219,124,.1)" : "rgba(255,255,255,.03)",
                        border: "1px solid "+(on ? "rgba(105,219,124,.3)" : "rgba(255,255,255,.07)")}}>
                      <div style={{width:28,height:28,borderRadius:7,backgroundImage:"url("+c.photo+")",backgroundSize:"cover",backgroundPosition:"center",flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:10,fontWeight:600,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                        <div style={{fontSize:8,color:"rgba(255,255,255,.3)"}}>{c.depth}</div>
                      </div>
                      {on && <div style={{color:"#69DB7C",fontSize:12,flexShrink:0}}>✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{marginBottom:14}}>
          <label style={lbl}>Location</label>
          <select value={loc} onChange={function(e){setLoc(e.target.value); setSite("");}} style={Object.assign({},inp,{cursor:"pointer"})}>
            {props.spots.map(function(s){return <option key={s.name} value={s.name} style={{background:"#0d1b2a"}}>{s.flag+" "+s.name}</option>;})}
          </select>
        </div>
        <div style={{marginBottom:14}}>
          <label style={lbl}>Site</label>
          {(function(){
            var curSpot = props.spots.find(function(s){return s.name===loc;});
            var sites = curSpot && curSpot.sites ? curSpot.sites : [];
            return (
              <div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom: site==="_custom" ? 8 : 0}}>
                  {sites.map(function(s){
                    return (
                      <button key={s} onClick={function(){setSite(s);}}
                        style={{padding:"7px 12px",borderRadius:20,border:"1px solid "+(site===s?"rgba(78,205,196,.4)":"rgba(255,255,255,.1)"),background:site===s?"rgba(78,205,196,.1)":"rgba(255,255,255,.04)",color:site===s?"#4ECDC4":"rgba(255,255,255,.5)",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>
                        {s}
                      </button>
                    );
                  })}
                  <button onClick={function(){setSite("_custom");}}
                    style={{padding:"7px 12px",borderRadius:20,border:"1px solid "+(site==="_custom"?"rgba(255,211,61,.4)":"rgba(255,255,255,.1)"),background:site==="_custom"?"rgba(255,211,61,.08)":"rgba(255,255,255,.04)",color:site==="_custom"?"#FFD93D":"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>
                    + Other site
                  </button>
                </div>
                {site==="_custom" && (
                  <input placeholder="Site name" value={customSite} onChange={function(e){setCustomSite(e.target.value);}}
                    style={Object.assign({},inp,{marginTop:4})} autoFocus/>
                )}
              </div>
            );
          })()}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          <div>
            <label style={lbl}>Date</label>
            <input type="date" value={date} onChange={function(e){setDate(e.target.value);}} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Entry time</label>
            <input type="time" value={timeIn} onChange={function(e){setTimeIn(e.target.value);}} style={inp}/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          <div>
            <label style={lbl}>Max depth (m)</label>
            <input type="number" inputMode="numeric" placeholder="18" value={depth} onChange={function(e){setDepth(e.target.value);}} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Duration (min)</label>
            <input type="number" inputMode="numeric" placeholder="52" value={dur} onChange={function(e){setDur(e.target.value);}} style={inp}/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          <div>
            <label style={lbl}>Visibility (m)</label>
            <input type="number" inputMode="numeric" placeholder="20" value={vis} onChange={function(e){setVis(e.target.value);}} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Water temp (°C)</label>
            <input type="number" inputMode="numeric" placeholder="24" value={wtemp} onChange={function(e){setWtemp(e.target.value);}} style={inp}/>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={lbl}>Dive type</label>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {["🏖 Shore","⛵ Boat","🌊 Drift","🚶 Walk-in","🛳 Liveaboard","➕ Other"].map(function(opt){
              var on = diveTypes.indexOf(opt)>=0;
              return (
                <button key={opt} onClick={function(){
                  setDiveTypes(function(p){ return p.indexOf(opt)>=0 ? p.filter(function(x){return x!==opt;}) : p.concat([opt]); });
                }}
                  style={{padding:"8px 13px",borderRadius:20,border:"1px solid "+(on?"rgba(78,205,196,.4)":"rgba(255,255,255,.1)"),background:on?"rgba(78,205,196,.12)":"rgba(255,255,255,.04)",color:on?"#4ECDC4":"rgba(255,255,255,.45)",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:on?600:400,cursor:"pointer"}}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={lbl}>Gas</label>
          <div style={{display:"flex",gap:8}}>
            <button onClick={function(){setGas("lucht");}}
              style={{flex:1,padding:"14px 0",borderRadius:14,border:"2px solid "+(gas==="lucht"?"rgba(78,205,196,.5)":"rgba(255,255,255,.1)"),background:gas==="lucht"?"rgba(78,205,196,.12)":"rgba(255,255,255,.04)",color:gas==="lucht"?"#4ECDC4":"rgba(255,255,255,.5)",fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:gas==="lucht"?700:400,cursor:"pointer"}}>
              💨 Air
            </button>
            <button onClick={function(){setGas("nitrox");}}
              style={{flex:1,padding:"14px 0",borderRadius:14,border:"2px solid "+(gas==="nitrox"?"rgba(105,219,124,.5)":"rgba(255,255,255,.1)"),background:gas==="nitrox"?"rgba(105,219,124,.12)":"rgba(255,255,255,.04)",color:gas==="nitrox"?"#69DB7C":"rgba(255,255,255,.5)",fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:gas==="nitrox"?700:400,cursor:"pointer"}}>
              🟢 Nitrox
            </button>
          </div>
          {gas==="nitrox" && (
            <div style={{marginTop:10}}>
              <label style={lbl}>% Oxygen</label>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <input type="range" min="22" max="40" value={nitrox} onChange={function(e){setNitrox(e.target.value);}}
                  style={{flex:1,accentColor:"#69DB7C",height:6,cursor:"pointer"}}/>
                <div style={{fontSize:22,fontWeight:700,color:"#69DB7C",minWidth:52,textAlign:"right"}}>{nitrox}%</div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"rgba(255,255,255,.25)",marginTop:4}}>
                <span>22% (min)</span><span>32% (standaard)</span><span>40% (max)</span>
              </div>
            </div>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
          <div>
            <label style={lbl}>Buddy</label>
            <input placeholder="naam" value={buddy} onChange={function(e){setBuddy(e.target.value);}} style={inp}/>
          </div>
        </div>

        {props.customFields && props.customFields.length > 0 && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.7)",marginBottom:12}}>Custom fields</div>
            {props.customFields.map(function(f){
              return (
                <div key={f.id} style={{marginBottom:14}}>
                  <label style={lbl}>{f.icon} {f.label}{f.unit?" ("+f.unit+")":""}</label>
                  <CustomFieldInput field={f} value={customValues[f.label]} onChange={function(v){setCVal(f.label,v);}}/>
                </div>
              );
            })}
          </div>
        )}
        <button onClick={save}
          style={{width:"100%",padding:18,background:"#4ECDC4",border:"none",borderRadius:18,color:"#050d1a",fontFamily:"'DM Sans',sans-serif",fontSize:16,fontWeight:700,cursor:"pointer",marginBottom:12}}>
          Save ✓
        </button>
        <button onClick={skip}
          style={{width:"100%",padding:16,background:"none",border:"1px solid rgba(255,255,255,.1)",borderRadius:18,color:"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif",fontSize:14,cursor:"pointer"}}>
          Skip details
        </button>
      </div>
    </div>
  );
}

// ── FILTER BAR ───────────────────────────────────────────────────────────────
function FilterBar(props) {
  var RARITIES = ["Common","Uncommon","Rare","Epic"];
  var DEPTHS = [[0,20,"Shallow 0–20m"],[20,60,"Mid 20–60m"],[60,300,"Deep 60m+"]];
  var curMonth = new Date().getMonth()+1;

  return (
    <div style={{padding:"0 22px 10px"}}>
      <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
        {/* Season toggle */}
        <button onClick={function(){props.onSeasonToggle(!props.filterSeason);}}
          style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:20,border:"1px solid "+(props.filterSeason?"rgba(255,211,61,.4)":"rgba(255,255,255,.1)"),background:props.filterSeason?"rgba(255,211,61,.1)":"rgba(255,255,255,.04)",color:props.filterSeason?"#FFD93D":"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
          📅 {MONTHS_NL[curMonth-1]}
        </button>
        {/* Depth filters */}
        {DEPTHS.map(function(d){
          var on = props.filterDepth[0]===d[0] && props.filterDepth[1]===d[1];
          return (
            <button key={d[2]} onClick={function(){props.onDepthChange(on?[0,300]:[d[0],d[1]]);}}
              style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:20,border:"1px solid "+(on?"rgba(78,205,196,.4)":"rgba(255,255,255,.1)"),background:on?"rgba(78,205,196,.1)":"rgba(255,255,255,.04)",color:on?"#4ECDC4":"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
              ⬇️ {d[2]}
            </button>
          );
        })}
        {/* Rarity filters */}
        {RARITIES.map(function(r){
          var on = props.filterRarity.indexOf(r)>=0;
          return (
            <button key={r} onClick={function(){
              props.onRarityChange(on ? props.filterRarity.filter(function(x){return x!==r;}) : props.filterRarity.concat([r]));
            }}
              style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:20,border:"1px solid "+(on?RC[r]+"66":"rgba(255,255,255,.1)"),background:on?RC[r]+"18":"rgba(255,255,255,.04)",color:on?RC[r]:"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
              {r}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── DETAIL CARD ───────────────────────────────────────────────────────────────
function DetailCard(props) {
  // props: creature, spotted, wishlisted, liveObs, mockObs, onClose, onSpot, onWish
  var c = props.creature;
  var isSpotted   = props.spotted;
  var isWishlisted = props.wishlisted;
  var liveCount   = props.liveObs[c.id] || 0;
  var mockCount   = props.mockObs[c.id] || 0;
  var obsCount    = liveCount > 0 ? liveCount : mockCount;
  var obsLabel    = liveCount > 0 ? "Live iNat" : "Sim.";

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"flex-end"}} onClick={props.onClose}>
      <div onClick={function(e){e.stopPropagation();}}
        style={{background:"#0a1625",border:"1px solid rgba(255,255,255,.1)",borderRadius:"28px 28px 0 0",width:"100%",maxHeight:"88vh",overflowY:"auto",paddingBottom:44}}>
        {/* Hero photo */}
        <div style={{position:"relative",height:240,backgroundImage:"url("+c.photo+")",backgroundSize:"cover",backgroundPosition:"center",borderRadius:"28px 28px 0 0"}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,#0a1625 0%,transparent 60%)",borderRadius:"28px 28px 0 0"}}/>
          <button onClick={props.onClose} style={{position:"absolute",top:16,right:16,width:34,height:34,borderRadius:"50%",background:"rgba(0,0,0,.5)",border:"none",color:"rgba(255,255,255,.7)",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          <div style={{position:"absolute",bottom:16,left:20,right:20}}>
            <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
              <div style={{padding:"3px 10px",borderRadius:20,fontSize:9,fontWeight:600,textTransform:"uppercase",background:RC[c.rarity]+"22",color:RC[c.rarity],border:"1px solid "+RC[c.rarity]+"44"}}>{c.rarity}</div>
              {(GROUPS.find(function(g){return g.id===c.group;})||{emoji:"",label:""}) && (
                <div style={{padding:"3px 10px",borderRadius:20,fontSize:9,fontWeight:600,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)"}}>
                  {(GROUPS.find(function(g){return g.id===c.group;})||{emoji:""}).emoji} {(GROUPS.find(function(g){return g.id===c.group;})||{label:""}).label}
                </div>
              )}
            </div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,lineHeight:1.1}}>{c.name}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.45)",fontStyle:"italic",marginTop:2}}>{c.latin}</div>
          </div>
        </div>

        <div style={{padding:"20px 22px 0"}}>
          {/* Stats row */}
          <div style={{display:"flex",gap:0,marginBottom:20,background:"rgba(255,255,255,.04)",borderRadius:16,overflow:"hidden",border:"1px solid rgba(255,255,255,.08)"}}>
            {[
              ["⬇️","Depth",depthLabel(c)],
              ["🌡","Temp",c.temp],
              ["🔬","Obs.",obsCount>0?obsCount.toLocaleString()+"*":"?"],
            ].map(function(s,i){
              return (
                <div key={i} style={{flex:1,padding:"12px 8px",textAlign:"center",borderRight:i<2?"1px solid rgba(255,255,255,.08)":"none"}}>
                  <div style={{fontSize:14}}>{s[0]}</div>
                  <div style={{fontSize:8,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".5px",marginTop:2}}>{s[1]}</div>
                  <div style={{fontSize:13,fontWeight:700,color:"#4ECDC4",marginTop:2}}>{s[2]}</div>
                </div>
              );
            })}
          </div>

          {/* Seizoen */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>📅 Best season</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {MONTHS_NL.map(function(m,i){
                var on = !c.seasons || c.seasons.all || (c.seasons.months||[]).indexOf(i+1)>=0;
                return (
                  <div key={m} style={{padding:"4px 8px",borderRadius:8,fontSize:10,fontWeight:on?600:400,
                    background:on?"rgba(78,205,196,.15)":"rgba(255,255,255,.04)",
                    color:on?"#4ECDC4":"rgba(255,255,255,.2)",
                    border:"1px solid "+(on?"rgba(78,205,196,.3)":"rgba(255,255,255,.06)")}}>
                    {m}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Locations */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>📍 Found at</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {c.locations.map(function(loc){
                var s = [{name:"Ras Mohammed",flag:"🇪🇬"},{name:"Blue Hole Dahab",flag:"🇪🇬"},{name:"Similan Islands",flag:"🇹🇭"},{name:"Malediven",flag:"🇲🇻"},{name:"Raja Ampat",flag:"🇮🇩"},{name:"Great Barrier Reef",flag:"🇦🇺"},{name:"Galápagos",flag:"🇪🇨"},{name:"Cocos Island",flag:"🇨🇷"}];
                var spot = s.find(function(x){return x.name===loc;})||{flag:""};
                return (
                  <div key={loc} style={{padding:"5px 10px",borderRadius:20,fontSize:11,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.7)"}}>
                    {spot.flag} {loc}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feit */}
          <div style={{background:"rgba(78,205,196,.05)",border:"1px solid rgba(78,205,196,.15)",borderRadius:16,padding:14,marginBottom:20}}>
            <div style={{fontSize:10,color:"rgba(78,205,196,.7)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>💡 Did you know</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.75)",lineHeight:1.6,fontStyle:"italic"}}>"{c.fact}"</div>
          </div>

          {obsCount>0 && <div style={{fontSize:9,color:"rgba(255,255,255,.2)",textAlign:"right",marginBottom:12}}>* {obsLabel} waarnemingen nabij huidige locatie</div>}

          {/* Action buttons */}
          <div style={{display:"flex",gap:10}}>
            {!isSpotted ? (
              <button onClick={props.onSpot}
                style={{flex:2,padding:"16px 0",background:"rgba(105,219,124,.12)",border:"2px solid rgba(105,219,124,.3)",borderRadius:18,color:"#69DB7C",fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:700,cursor:"pointer"}}>
                ✓ Spotted
              </button>
            ) : (
              <div style={{flex:2,padding:"16px 0",background:"rgba(105,219,124,.06)",border:"1px solid rgba(105,219,124,.2)",borderRadius:18,color:"rgba(105,219,124,.6)",fontFamily:"'DM Sans',sans-serif",fontSize:14,textAlign:"center"}}>
                ✓ Already spotted
              </div>
            )}
            {!isWishlisted ? (
              <button onClick={props.onWish}
                style={{flex:1,padding:"16px 0",background:"rgba(255,211,61,.08)",border:"2px solid rgba(255,211,61,.2)",borderRadius:18,color:"#FFD93D",fontFamily:"'DM Sans',sans-serif",fontSize:18,cursor:"pointer"}}>
                ⭐
              </button>
            ) : (
              <div style={{flex:1,padding:"16px 0",background:"rgba(255,211,61,.04)",border:"1px solid rgba(255,211,61,.15)",borderRadius:18,color:"rgba(255,211,61,.4)",fontFamily:"'DM Sans',sans-serif",fontSize:18,textAlign:"center"}}>
                ⭐
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FIELD MANAGER ────────────────────────────────────────────────────────────
function FieldManager(props) {
  // props: fields, onChange, onClose
  var [adding, setAdding] = useState(false);
  var [newLabel, setNewLabel] = useState("");
  var [newType, setNewType]   = useState("number");
  var [newUnit, setNewUnit]   = useState("");

  var TYPES = [
    {type:"number", icon:"🔢", label:"Number"},
    {type:"text",   icon:"📝", label:"Text"},
    {type:"rating", icon:"⭐", label:"Rating"},
    {type:"bool",   icon:"☑️", label:"Yes/No"},
  ];

  function addField() {
    if (!newLabel.trim()) return;
    var f = {id: Date.now(), label: newLabel.trim(), type: newType, unit: newUnit.trim(),
      icon: (TYPES.find(function(t){return t.type===newType;})||{icon:"📋"}).icon};
    props.onChange(props.fields.concat([f]));
    setNewLabel(""); setNewUnit(""); setAdding(false);
  }

  function removeField(id) {
    props.onChange(props.fields.filter(function(f){return f.id!==id;}));
  }

  var inp = {background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding:"12px 14px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none"};

  return (
    <div style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end"}}>
      <div style={{background:"#0a1625",border:"1px solid rgba(255,255,255,.1)",borderRadius:"28px 28px 0 0",width:"100%",maxHeight:"85vh",overflowY:"auto",padding:"28px 22px 48px"}}>
        <div style={{width:40,height:4,background:"rgba(255,255,255,.15)",borderRadius:2,margin:"0 auto 24px"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,fontStyle:"italic"}}>Custom fields</div>
          <button onClick={props.onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",fontSize:18,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:20,lineHeight:1.6}}>
          Voeg je eigen fielden toe aan het logboek — tankdruk, stroming, waterspecies, wat je wilt.
        </div>

        {/* Existing fields */}
        {props.fields.length === 0 && !adding && (
          <div style={{textAlign:"center",padding:"20px 0 24px",color:"rgba(255,255,255,.25)",fontSize:13,fontStyle:"italic"}}>
            Nog geen eigen fielden
          </div>
        )}
        {props.fields.map(function(f) {
          var typeInfo = TYPES.find(function(t){return t.type===f.type;})||{label:"?"};
          return (
            <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,marginBottom:8}}>
              <div style={{fontSize:20}}>{f.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600}}>{f.label}{f.unit ? " ("+f.unit+")" : ""}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginTop:1}}>{typeInfo.label}</div>
              </div>
              <button onClick={function(){removeField(f.id);}}
                style={{background:"rgba(255,107,107,.08)",border:"1px solid rgba(255,107,107,.2)",borderRadius:10,color:"#FF6B6B",width:32,height:32,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>
                ✕
              </button>
            </div>
          );
        })}

        {/* Add new field form */}
        {adding ? (
          <div style={{background:"rgba(78,205,196,.05)",border:"1px solid rgba(78,205,196,.15)",borderRadius:18,padding:16,marginTop:8}}>
            <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.6)",marginBottom:12}}>Nieuw field</div>

            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:7}}>Name</div>
              <input placeholder="bv. Tankdruk begin" value={newLabel} onChange={function(e){setNewLabel(e.target.value);}}
                style={Object.assign({},inp,{width:"100%"})} autoFocus/>
            </div>

            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:7}}>Type</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {TYPES.map(function(t){
                  var on = newType===t.type;
                  return (
                    <button key={t.type} onClick={function(){setNewType(t.type);}}
                      style={{padding:"11px 0",borderRadius:12,border:"1px solid "+(on?"rgba(78,205,196,.4)":"rgba(255,255,255,.1)"),background:on?"rgba(78,205,196,.1)":"rgba(255,255,255,.04)",color:on?"#4ECDC4":"rgba(255,255,255,.45)",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:on?600:400,cursor:"pointer"}}>
                      {t.icon} {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {newType==="number" && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:7}}>Unit (optional)</div>
                <input placeholder="e.g. bar, °C, m/s" value={newUnit} onChange={function(e){setNewUnit(e.target.value);}}
                  style={Object.assign({},inp,{width:"100%"})}/>
              </div>
            )}

            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button onClick={function(){setAdding(false); setNewLabel(""); setNewUnit("");}}
                style={{flex:1,padding:12,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,color:"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer"}}>
                Cancel
              </button>
              <button onClick={addField} disabled={!newLabel.trim()}
                style={{flex:2,padding:12,background:newLabel.trim()?"#4ECDC4":"rgba(255,255,255,.06)",border:"none",borderRadius:12,color:newLabel.trim()?"#050d1a":"rgba(255,255,255,.2)",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:newLabel.trim()?"pointer":"default"}}>
                Add ✓
              </button>
            </div>
          </div>
        ) : (
          <button onClick={function(){setAdding(true);}}
            style={{width:"100%",padding:14,marginTop:8,background:"rgba(78,205,196,.08)",border:"1px dashed rgba(78,205,196,.3)",borderRadius:14,color:"#4ECDC4",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}}>
            + Nieuw field toevoegen
          </button>
        )}
      </div>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function AuthScreen(props) {
  var [mode,setMode]   = useState("login");
  var [email,setEmail] = useState("");
  var [pass,setPass]   = useState("");
  var [pass2,setPass2] = useState("");
  var [name,setName]   = useState("");
  var [msg,setMsg]     = useState({text:"",ok:false});
  var [loading,setLoading] = useState(false);

  async function submit() {
    setMsg({text:"",ok:false});
    if (!email || !pass) { setMsg({text:"Fill in all fields",ok:false}); return; }
    setLoading(true);
    try {
      if (mode === "register") {
        if (!name) { setMsg({text:"Enter your name",ok:false}); setLoading(false); return; }
        if (pass !== pass2) { setMsg({text:"Passwords don't match",ok:false}); setLoading(false); return; }
        if (pass.length < 6) { setMsg({text:"Password too short (min. 6 characters)",ok:false}); setLoading(false); return; }
        // Sign up with Supabase
        var res = await supaSignUp(email, pass, name);
        // Auto sign in after registration
        var signIn = await supaSignIn(email, pass);
        var uid = signIn.user && signIn.user.id;
        var joined = new Date().toISOString().slice(0,7);
        var profile = { id: uid, name: name, email: email, joined: joined };
        await supaUpsertProfile(profile);
        await supaUpsertUserData({ user_id: uid, spotted: [], wishlist: [], custom_fields: [] });
        props.onLogin(uid, { name, email, joined, spotted:[], wishlist:[], dives:[], customFields:[] });
      } else {
        var signIn = await supaSignIn(email, pass);
        var uid = signIn.user && signIn.user.id;
        // Load profile + user data + dives
        var [profile, userData, dives] = await Promise.all([
          supaGetProfile(uid),
          supaGetUserData(uid),
          supaGetDives(uid),
        ]);
        var ud = {
          name: profile && profile.name || email,
          email: email,
          joined: profile && profile.joined || "",
          spotted:      (userData && userData.spotted)       || [],
          wishlist:     (userData && userData.wishlist)      || [],
          customFields: (userData && userData.custom_fields) || [],
          dives: dives.map(function(d){ return {
            id: d.id, location: d.location, flag: d.flag, region: d.region,
            site: d.site||"", date: d.date, timeIn: d.time_in||"",
            depth: d.depth, duration: d.duration, visibility: d.visibility,
            waterTemp: d.water_temp||"", gas: d.gas||"", buddy: d.buddy||"",
            diveTypes: d.dive_types||[], creatures: d.creatures||[],
            customValues: d.custom_values||{}, notes: d.notes||"",
          };}),
        };
        props.onLogin(uid, ud);
      }
    } catch(e) {
      var msg = e.message || "Something went wrong";
      if (msg.includes("already registered")) msg = "Email already in use";
      if (msg.includes("Invalid login")) msg = "Invalid email or password";
      setMsg({text: msg, ok: false});
    }
    setLoading(false);
  }

  return (
    <div className="authwrap">
      <div style={{textAlign:"center",marginBottom:32}}>
        <div className="logo" style={{fontSize:32,marginBottom:8}}>Dive<span>Log</span></div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.4)"}}>Your personal dive log</div>
      </div>
      <div className="aform">
        {mode==="register" && (
          <input className="ainp" placeholder="Your name" value={name}
            onChange={function(e){setName(e.target.value);}} autoComplete="name"/>
        )}
        <input className="ainp" placeholder="Email address" value={email} type="email"
          onChange={function(e){setEmail(e.target.value);}} autoComplete="email"/>
        <input className="ainp" placeholder="Password" value={pass} type="password"
          onChange={function(e){setPass(e.target.value);}} autoComplete={mode==="login"?"current-password":"new-password"}/>
        {mode==="register" && (
          <input className="ainp" placeholder="Confirm password" value={pass2} type="password"
            onChange={function(e){setPass2(e.target.value);}} autoComplete="new-password"/>
        )}
        <button className="abtn" onClick={submit} disabled={loading}>
          {loading ? "⏳ Loading..." : mode==="login" ? "Log in →" : "Sign up →"}
        </button>
        <button className="aswitch" onClick={function(){setMode(mode==="login"?"register":"login");setMsg({text:"",ok:false});}}>
          {mode==="login" ? "No account yet? Sign up" : "Already have an account? Log in"}
        </button>
        {msg.text ? <div className={"amsg " + (msg.ok?"aok":"aerr")}>{msg.text}</div> : null}
      </div>
    </div>
  );
}

// ── LEAFLET MAP ───────────────────────────────────────────────────────────────
function MapView(props) {
  var mapRef = useRef(null);
  var inst = useRef(null);
  var marks = useRef([]);

  function drawMarkers(L) {
    marks.current.forEach(function(m){m.remove();});
    marks.current = [];
    props.spots.forEach(function(spot) {
      var inW = props.wishlist.some(function(w){return w.locations.indexOf(spot.name)>=0;});
      var inS = props.spotted.some(function(s){return s.locations.indexOf(spot.name)>=0;});
      var sel = props.selected && props.selected.name === spot.name;
      var col = inS ? "#69DB7C" : inW ? "#FFD93D" : "#4ECDC4";
      var sz = sel ? 18 : 12;
      var icon = L.divIcon({className:"",html:'<div style="width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:'+col+';border:2px solid white;box-shadow:0 0 '+(sel?16:8)+'px '+col+';cursor:pointer;"></div>',iconSize:[sz,sz],iconAnchor:[sz/2,sz/2]});
      var sc = scoreSpot(spot, props.wishlist);
      var m = L.marker([spot.lat,spot.lng],{icon}).addTo(inst.current).on("click",function(){props.onSelect(spot);});
      m.bindTooltip('<div style="font-family:sans-serif;font-size:12px;color:#fff;background:#0d1b2a;border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:6px 10px;">'+spot.flag+' '+spot.name+(sc>0?'<br><span style="color:'+col+';font-size:10px;">'+sc+'% match</span>':'')+' </div>',{permanent:false,direction:"top",offset:[0,-8],opacity:1,className:"dltt"});
      marks.current.push(m);
    });
  }

  useEffect(function() {
    if (!document.getElementById("lcs")) {
      var l = document.createElement("link");
      l.id="lcs"; l.rel="stylesheet";
      l.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(l);
    }
    function init() {
      if (inst.current || !mapRef.current) return;
      var L = window.L;
      inst.current = L.map(mapRef.current,{center:[10,60],zoom:2,zoomControl:false,attributionControl:false});
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(inst.current);
      L.control.zoom({position:"topright"}).addTo(inst.current);
      drawMarkers(L);
    }
    if (window.L) { init(); }
    else {
      var s = document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      s.onload=init;
      document.head.appendChild(s);
    }
    return function() { if(inst.current){inst.current.remove();inst.current=null;} };
  }, []);

  useEffect(function() {
    if (inst.current && window.L) drawMarkers(window.L);
  }, [props.wishlist, props.spotted, props.selected]);

  return (
    <div style={{position:"relative",borderRadius:18,overflow:"hidden",border:"1px solid rgba(255,255,255,.1)",marginBottom:14}}>
      <div ref={mapRef} style={{height:200,width:"100%"}}/>
      <div style={{position:"absolute",bottom:8,left:10,fontSize:9,color:"rgba(255,255,255,.4)",background:"rgba(0,0,0,.5)",padding:"2px 7px",borderRadius:6,zIndex:999}}>© OpenStreetMap · CartoDB</div>
      <style>{".dltt .leaflet-tooltip{background:transparent!important;border:none!important;box-shadow:none!important;}"}</style>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  // All hooks at the top, unconditionally
  var [uid,setUid]           = useState(null);
  var [udata,setUdata]       = useState(null);
  var [booting,setBooting]   = useState(true);
  var [tab,setTab]           = useState("logbook");
  var [group,setGroup]       = useState("all");
  var [filterDepth,setFilterDepth] = useState([0,300]); // [min,max]
  var [filterRarity,setFilterRarity] = useState([]);    // [] = all
  var [filterSeason,setFilterSeason] = useState(false); // true = current month only
  var [detailCard,setDetailCard]     = useState(null);  // creature being viewed
  var [liveObs,setLiveObs]           = useState({});    // {creatureId: count} from iNaturalist
  var [spotted,setSpotted]   = useState([]);
  var [wishlist,setWishlist] = useState([]);
  var [cards,setCards]       = useState(function(){return CREATURES.slice();});
  var [dragX,setDragX]       = useState(0);
  var [dragY,setDragY]       = useState(0);
  var [dragging,setDragging] = useState(false);
  var [feedback,setFeedback] = useState(null);
  var [lastCard,setLastCard] = useState(null);
  var [selSpot,setSelSpot]   = useState(null);
  var [curSpot,setCurSpot]   = useState(SPOTS[0]);
  var [obsData,setObsData]   = useState(MOCK_OBS[SPOTS[0].name] || {});
  var [dives,setDives]       = useState([]);
  var [customFields,setCustomFields] = useState([]);
  var [fieldMgrOpen,setFieldMgrOpen] = useState(false);
  var [saving,setSaving]     = useState(false);
  var [diveSession,setDiveSession] = useState(false);
  var [detailDive,setDetailDive]   = useState(null);
  var [editDive,setEditDive]       = useState(null);   // dive being edited
  var [searchQuery,setSearchQuery] = useState("");
  var [exportingPdf,setExportingPdf] = useState(false);
  var [showStats,setShowStats]     = useState(false);
  var [confirmDelete,setConfirmDelete] = useState(null); // dive id to delete
  var dragStart = useRef(null);
  var saveTimer = useRef(null);

  // Boot: restore session from localStorage
  useEffect(function() {
    (async function() {
      try {
        var sess = await supaRestoreSession();
        if (sess && sess.uid) {
          var uid2 = sess.uid;
          var [profile, userData, dives] = await Promise.all([
            supaGetProfile(uid2),
            supaGetUserData(uid2),
            supaGetDives(uid2),
          ]);
          var ud = {
            name: profile && profile.name || "",
            email: profile && profile.email || "",
            joined: profile && profile.joined || "",
            spotted:      (userData && userData.spotted)       || [],
            wishlist:     (userData && userData.wishlist)      || [],
            customFields: (userData && userData.custom_fields) || [],
          };
          var mappedDives = dives.map(function(d){ return {
            id: d.id, location: d.location, flag: d.flag, region: d.region,
            site: d.site||"", date: d.date, timeIn: d.time_in||"",
            depth: d.depth, duration: d.duration, visibility: d.visibility,
            waterTemp: d.water_temp||"", gas: d.gas||"", buddy: d.buddy||"",
            diveTypes: d.dive_types||[], creatures: d.creatures||[],
            customValues: d.custom_values||{}, notes: d.notes||"",
          };});
          setUid(uid2);
          setUdata(ud);
          var sp = (ud.spotted||[]).map(function(id){return CREATURES.find(function(c){return c.id===id;});}).filter(Boolean);
          var wl = (ud.wishlist||[]).map(function(id){return CREATURES.find(function(c){return c.id===id;});}).filter(Boolean);
          setSpotted(sp);
          setWishlist(wl);
          setDives(mappedDives);
          setCustomFields(ud.customFields||[]);
          var spIds = new Set(sp.map(function(c){return c.id;}));
          setCards(sortByObs(CREATURES.filter(function(c){return !spIds.has(c.id);}), MOCK_OBS[SPOTS[0].name]||{}));
        }
      } catch(e) { console.error("Boot error:", e); }
      setBooting(false);
    })();
  }, []);

  // iNaturalist live data fetch for current spot
  useEffect(function() {
    if (!curSpot) return;
    var spot = curSpot;
    var creatures = group==="all" ? CREATURES : CREATURES.filter(function(c){return c.group===group;});
    var taxonIds = creatures.filter(function(c){return c.taxon;}).map(function(c){return c.taxon;});
    if (!taxonIds.length) return;
    var url = "https://api.inaturalist.org/v1/observations?taxon_id="+taxonIds.slice(0,10).join(",")
      +"&lat="+spot.lat+"&lng="+spot.lng+"&radius=200&per_page=0&verifiable=true";
    (async function(){
      try {
        var ctrl = new AbortController();
        var t = setTimeout(function(){ctrl.abort();}, 5000);
        var res = await fetch(url, {signal:ctrl.signal});
        clearTimeout(t);
        if (!res.ok) return;
        var data = await res.json();
        // iNat returns total_results per taxon_id batch — map back
        var newObs = {};
        (data.results||[]).forEach(function(obs){
          var tid = obs.taxon && obs.taxon.id;
          var c = CREATURES.find(function(x){return x.taxon===tid;});
          if (c) newObs[c.id] = (newObs[c.id]||0) + 1;
        });
        if (Object.keys(newObs).length > 0) setLiveObs(newObs);
      } catch(e) {}
    })();
  }, [curSpot, group]);

  async function exportDivePdf(dive, diveCreatures) {
    setExportingPdf(true);
    try {
      var speciesList = diveCreatures.map(function(c){return c.name+" ("+c.latin+")"}).join(", ")||"None";
      var customStr = dive.customValues && Object.keys(dive.customValues).length>0
        ? Object.keys(dive.customValues).map(function(k){return k+": "+dive.customValues[k];}).join(" | ")
        : "";

      var prompt = "Genereer een professionele HTML divelog pagina in PADI stijl voor het volgende dive:\n\n"
        +"Diver: "+(udata?udata.name:"Unknown")+"\n"
        +"Location: "+(dive.flag||"")+" "+dive.location+(dive.site?" — "+dive.site:"")+"\n"
        +"Regio: "+(dive.region||"")+"\n"
        +"Date: "+(dive.date||"")+(dive.timeIn?" | Water in: "+dive.timeIn:"")+"\n"
        +"Buddy: "+(dive.buddy||"—")+"\n"
        +"Max diepte: "+(dive.depth||"?")+"\n"
        +"Duur: "+(dive.duration||"?")+"\n"
        +"Zicht: "+(dive.visibility||"?")+"\n"
        +"Watertemp: "+(dive.waterTemp||"?")+"\n"
        +"Gas: "+(dive.gas||"Air")+"\n"
        +(customStr?"Extra: "+customStr+"\n":"")
        +"Spotted: "+speciesList+"\n\n"
        +"Generate a standalone HTML page (no external CSS, all inline). "
        +"Dark ocean style (#050d1a background), teal (#4ECDC4) accents, white text. "
        +"Gebruik een nette tabel voor de divedata. Toon de speciesen als nette tags. "
        +"Voeg onderaan een handtekeningfield toe. Print-vriendelijk. Geef ALLEEN de HTML terug, niks anders.";

      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:2000,
          messages:[{role:"user",content:prompt}]
        })
      });
      var data = await res.json();
      var html = (data.content||[]).map(function(b){return b.text||"";}).join("");
      var t3=String.fromCharCode(96,96,96); html=html.split(t3+"html").join("").split(t3).join("").trim();

      // Download as HTML file (works in sandboxed iframes)
      var blob = new Blob([html], {type:"text/html"});
      var url  = URL.createObjectURL(blob);
      var a    = document.createElement("a");
      a.href   = url;
      a.download = "divelog-"+dive.location.replace(/\s+/g,"-")+"-"+dive.date+".html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch(e) {
      alert("PDF export failed: "+e.message);
    }
    setExportingPdf(false);
  }

  function handleLogin(newUid, ud) {
    setUid(newUid);
    setUdata(ud);
    var sp = (ud.spotted||[]).map(function(id){return CREATURES.find(function(c){return c.id===id;});}).filter(Boolean);
    var wl = (ud.wishlist||[]).map(function(id){return CREATURES.find(function(c){return c.id===id;});}).filter(Boolean);
    setSpotted(sp);
    setWishlist(wl);
    setDives(ud.dives||[]);
    setCustomFields(ud.customFields||[]);
    var spIds = new Set(sp.map(function(c){return c.id;}));
    setCards(sortByObs(CREATURES.filter(function(c){return !spIds.has(c.id);}), MOCK_OBS[SPOTS[0].name]||{}));
  }

  async function handleLogout() {
    await supaSignOut();
    setUid(null); setUdata(null); setSpotted([]); setWishlist([]); setDives([]); setCustomFields([]);
    setCards(CREATURES.slice()); setTab("discover"); setGroup("all");
  }

  function persistFields(cf) {
    if (!uid) return;
    clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async function() {
      await supaUpsertUserData({
        user_id: uid,
        spotted:       spotted.map(function(c){return c.id;}),
        wishlist:      wishlist.map(function(c){return c.id;}),
        custom_fields: cf,
      });
      setSaving(false);
    }, 400);
  }

  function persist(sp, wl, dv) {
    if (!uid) return;
    clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async function() {
      // Save spotted + wishlist
      await supaUpsertUserData({
        user_id:       uid,
        spotted:       sp.map(function(c){return c.id;}),
        wishlist:      wl.map(function(c){return c.id;}),
        custom_fields: customFields,
      });
      setSaving(false);
    }, 800);
  }

  // Save a single dive to Supabase
  async function persistDive(dive) {
    if (!uid) return;
    await supaUpsertDive({
      id:           dive.id,
      user_id:      uid,
      location:     dive.location || "",
      flag:         dive.flag || "",
      region:       dive.region || "",
      site:         dive.site || "",
      date:         dive.date || "",
      time_in:      dive.timeIn || "",
      depth:        dive.depth || "",
      duration:     dive.duration || "",
      visibility:   dive.visibility || "",
      water_temp:   dive.waterTemp || "",
      gas:          dive.gas || "",
      buddy:        dive.buddy || "",
      dive_types:   dive.diveTypes || [],
      creatures:    dive.creatures || [],
      custom_values:dive.customValues || {},
      notes:        dive.notes || "",
    });
  }

  // Swipe logic
  var ax = Math.abs(dragX), ay = Math.abs(dragY);
  var dragUp    = ay > ax && dragY < 0 && ay > 28;
  var dragRight = ax > ay && dragX > 0 && ax > 28;
  var dragLeft  = ax > ay && dragX < 0 && ax > 28;
  var hintOp = Math.min(Math.max(ax,ay)/80, 1);
  var rot = dragUp ? 0 : dragX/18;

  function onStart(e) {
    if (e.touches) e.preventDefault();
    var t = e.touches ? e.touches[0] : e;
    dragStart.current = {x:t.clientX, y:t.clientY};
    setDragging(true);
  }
  function onMove(e) {
    if (e.touches) e.preventDefault();
    if (!dragging || !dragStart.current) return;
    var t = e.touches ? e.touches[0] : e;
    setDragX(t.clientX - dragStart.current.x);
    setDragY(t.clientY - dragStart.current.y);
  }
  function onEnd(e) {
    if (e && e.touches !== undefined) e.preventDefault();
    var ax2 = Math.abs(dragX), ay2 = Math.abs(dragY);
    if (ay2 > 80 && dragY < 0 && ay2 > ax2) doSwipe("wish");
    else if (ax2 > 80 && dragX > 0) doSwipe("yes");
    else if (ax2 > 80 && dragX < 0) doSwipe("no");
    else { setDragX(0); setDragY(0); setDragging(false); }
  }

  var cur = cards[0];

  function doSwipe(dir) {
    if (!cur) return;
    if (dir==="yes")  playPing();
    if (dir==="wish") playSwoosh();
    setLastCard(cur);
    var nsp = spotted, nwl = wishlist;
    if (dir === "yes") { nsp = spotted.concat([cur]); setSpotted(nsp); }
    if (dir === "wish" && !wishlist.find(function(x){return x.id===cur.id;})) { nwl = wishlist.concat([cur]); setWishlist(nwl); }
    setFeedback(dir);
    setTimeout(function(){setFeedback(null);}, 1200);
    setCards(function(p){return p.slice(1);});
    setDragX(0); setDragY(0); setDragging(false);
    persist(nsp, nwl);
  }

  function applyFilters(gid, dep, rar, seas, obs) {
    var cm = new Date().getMonth()+1;
    var spIds2 = new Set(spotted.map(function(c){return c.id;}));
    var filtered = CREATURES.filter(function(c){
      if (gid!=="all" && c.group!==gid) return false;
      if (dep[0]!==0||dep[1]!==300) { if ((c.depthMax||999)<dep[0]||(c.depthMin||0)>dep[1]) return false; }
      if (rar.length>0 && rar.indexOf(c.rarity)<0) return false;
      if (seas && !isInSeason(c,cm)) return false;
      if (spIds2.has(c.id)) return false;
      return true;
    });
    setCards(sortByObs(filtered, obs));
  }
  function changeGroup(gid) {
    setGroup(gid);
    applyFilters(gid, filterDepth, filterRarity, filterSeason, obsData);
  }

  function changeSpot(spot) {
    setCurSpot(spot);
    var obs = MOCK_OBS[spot.name] || {};
    setObsData(obs);
    var spIds = new Set(spotted.map(function(c){return c.id;}));
    var filtered = group==="all" ? CREATURES : CREATURES.filter(function(c){return c.group===group;});
    setCards(sortByObs(filtered.filter(function(c){return !spIds.has(c.id);}), obs));
  }

  var curMonth = new Date().getMonth()+1;
  var spIds = new Set(spotted.map(function(c){return c.id;}));
  var filteredC = CREATURES.filter(function(c){
    if (group!=="all" && c.group!==group) return false;
    if (filterDepth[0]!==0||filterDepth[1]!==300) {
      if ((c.depthMax||999) < filterDepth[0] || (c.depthMin||0) > filterDepth[1]) return false;
    }
    if (filterRarity.length>0 && filterRarity.indexOf(c.rarity)<0) return false;
    if (filterSeason && !isInSeason(c, curMonth)) return false;
    return true;
  });
  var totalInGroup = filteredC.length;
  var seenInGroup = spotted.filter(function(c){
    if (group!=="all" && c.group!==group) return false;
    return true;
  }).length;
  var pct = totalInGroup > 0 ? Math.round(seenInGroup/totalInGroup*100) : 0;
  var scoredSpots = SPOTS.map(function(s){return Object.assign({},s,{score:scoreSpot(s,wishlist),matches:wishlist.filter(function(w){return w.locations.indexOf(s.name)>=0;})});}).sort(function(a,b){return b.score-a.score;});

  var fbData = {
    yes:  {icon:"🎉",title:"Spotted!",       sub:lastCard ? lastCard.name+" toegevoegd" : ""},
    no:   {icon:"👋",title:"Volgende!",      sub:"Misschien een volgende dive"},
    wish: {icon:"⭐",title:"Op de wishlist!",sub:lastCard ? lastCard.name+" — we'll find the best spot" : ""},
  };

  // ── RENDER ──
  if (booting) {
    return (
      <div className="app" style={{justifyContent:"center",alignItems:"center"}}>
        <style>{css}</style>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:32,fontStyle:"italic",color:"#4ECDC4"}}>Dive<span style={{color:"white",fontStyle:"normal"}}>Log</span></div>
        <div style={{marginTop:16,fontSize:20,animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</div>
      </div>
    );
  }

  if (!uid) {
    return (
      <div className="app">
        <style>{css}</style>
        <Bubbles/>
        <AuthScreen onLogin={handleLogin}/>
      </div>
    );
  }

  return (
    <div className="app">
      <style>{css}</style>
      <Bubbles/>



      <div className="screen">
        <div className="header">
          <div className="logo">Dive<span>Log</span></div>
          <div className="hright">
            {udata ? "👋 "+udata.name.split(" ")[0] : ""}<br/>
            {"🤿 "+spotted.length+"/"+CREATURES.length+" · ⭐ "+wishlist.length}
            {saving ? <span style={{fontSize:9,color:"rgba(255,255,255,.25)",display:"block"}}>saving...</span> : null}
          </div>
        </div>

        {/* DISCOVER */}
        {detailCard && (
          <DetailCard
            creature={detailCard}
            spotted={!!spotted.find(function(x){return x.id===detailCard.id;})}
            wishlisted={!!wishlist.find(function(x){return x.id===detailCard.id;})}
            liveObs={liveObs}
            mockObs={obsData}
            onClose={function(){setDetailCard(null);}}
            onSpot={function(){
              if (!spotted.find(function(x){return x.id===detailCard.id;})){
                var ns=spotted.concat([detailCard]); setSpotted(ns); persist(ns,wishlist,dives);
              }
              setDetailCard(null);
            }}
            onWish={function(){
              if (!wishlist.find(function(x){return x.id===detailCard.id;})){
                var nw=wishlist.concat([detailCard]); setWishlist(nw); persist(spotted,nw,dives);
              }
              setDetailCard(null);
            }}
          />
        )}
        {tab==="discover" && (
          <div style={{display:"flex",flexDirection:"column",flex:1}}>
            <div className="gfilter">
              {GROUPS.map(function(g) {
                var cnt = g.id==="all"
                  ? CREATURES.filter(function(c){return !spIds.has(c.id);}).length
                  : CREATURES.filter(function(c){return c.group===g.id&&!spIds.has(c.id);}).length;
                return (
                  <button key={g.id} className={"gb"+(group===g.id?" on":"")} onClick={function(){changeGroup(g.id);}}>
                    {g.emoji} {g.label} <span className="gcount">{cnt}</span>
                  </button>
                );
              })}
            </div>
            <FilterBar
              filterDepth={filterDepth}
              filterRarity={filterRarity}
              filterSeason={filterSeason}
              onDepthChange={function(d){setFilterDepth(d); applyFilters(group,d,filterRarity,filterSeason,obsData);}}
              onRarityChange={function(r){setFilterRarity(r); applyFilters(group,filterDepth,r,filterSeason,obsData);}}
              onSeasonToggle={function(s){setFilterSeason(s); applyFilters(group,filterDepth,filterRarity,s,obsData);}}
            />
            <div className="pbar"><div className="pfill" style={{width:pct+"%"}}/></div>
            <div className="plabel">
              <span>{group==="all"?"All speciesen":(GROUPS.find(function(g){return g.id===group;})||{label:""}).label}</span>
              <span>{seenInGroup}/{totalInGroup} ({pct}%)</span>
            </div>
            <div className="sortbar">
              <div className="sortlbl">📍 Likely at{" "}
                <select value={curSpot.name} onChange={function(e){var s=SPOTS.find(function(x){return x.name===e.target.value;});if(s)changeSpot(s);}}
                  style={{background:"transparent",border:"none",color:"#4ECDC4",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,cursor:"pointer",outline:"none"}}>
                  {SPOTS.map(function(s){return <option key={s.name} value={s.name} style={{background:"#0d1b2a"}}>{s.flag+" "+s.name}</option>;})}
                </select>
              </div>
              <div className="srcbadge" style={{background:"rgba(255,211,61,.12)",color:"#FFD93D",border:"1px solid rgba(255,211,61,.2)"}}>● Sim.</div>
            </div>
            <div className="legend">
              <div className="leg"><div className="legdot" style={{background:"#69DB7C"}}/>Rechts=gespot</div>
              <div className="leg"><div className="legdot" style={{background:"#FF6B6B"}}/>Links=skip</div>
              <div className="leg"><div className="legdot" style={{background:"#FFD93D"}}/>Omhoog=wishlist</div>
            </div>
            <div className="cardarea">
              {cards.length === 0 ? (
                <div className="empty">
                  <div style={{fontSize:52}}>🌊</div>
                  <div style={{fontSize:16,fontWeight:600}}>All speciesen bekeken!</div>
                  <button onClick={function(){changeGroup("all");}} style={{marginTop:8,padding:"8px 18px",background:"rgba(78,205,196,.12)",border:"1px solid rgba(78,205,196,.25)",borderRadius:20,color:"#4ECDC4",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>All groepen →</button>
                </div>
              ) : (
                <div className="stack">
                  {cards[1] && <div className="shadowcard"/>}
                  <div className="card"
                    style={{transform:"translateX("+dragX+"px) translateY("+Math.min(dragY,0)+"px) rotate("+rot+"deg)",transition:dragging?"none":"transform .32s cubic-bezier(.34,1.56,.64,1)"}}
                    onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
                    onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
                  >
                    <div className="cimg" style={{backgroundImage:"url("+cur.photo+")"}}/>
                    <div className="ctop"/><div className="coverlay"/>
                    <div className="pcredit">Unsplash</div>
                    {(function(){
                      var live = liveObs[cur.id]||0;
                      var mock = obsData[cur.id]||0;
                      var cnt = live>0?live:mock;
                      var lbl = live>0?"🟢 Live":"🔬 Sim.";
                      return cnt>0 ? <div className="obsbadge">{lbl} {cnt.toLocaleString()}</div> : null;
                    })()}
                    <div className="gtag">{(GROUPS.find(function(g){return g.id===cur.group;})||{emoji:"",label:""}).emoji} {(GROUPS.find(function(g){return g.id===cur.group;})||{label:""}).label}</div>
                    {dragRight && <div className="hint hr" style={{opacity:hintOp}}>SPOTTED ✓</div>}
                    {dragLeft  && <div className="hint hl" style={{opacity:hintOp}}>SKIP ✕</div>}
                    {dragUp    && <div className="hint hu" style={{opacity:hintOp}}>WISHLIST ⭐</div>}
                    <button onClick={function(e){e.stopPropagation(); if(Math.abs(dragX)<8&&Math.abs(dragY)<8) setDetailCard(cur);}}
                      style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,.45)",border:"1px solid rgba(255,255,255,.15)",borderRadius:20,padding:"4px 10px",color:"rgba(255,255,255,.7)",fontSize:10,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",zIndex:5}}>
                      ℹ️ more info
                    </button>
                    <div className="cinfo">
                      <div className="cbadge" style={{background:RC[cur.rarity]+"1a",color:RC[cur.rarity],border:"1px solid "+RC[cur.rarity]+"33"}}>
                        <Stars rarity={cur.rarity}/> {cur.rarity}
                      </div>
                      <div className="cname">{cur.name}</div>
                      <div className="clatin">{cur.latin}</div>
                      <div className="cstats">
                        <div><div className="csl">Depth</div><div className="csv" style={{color:cur.color}}>{cur.depth}</div></div>
                        <div><div className="csl">Temp</div><div className="csv" style={{color:cur.color}}>{cur.temp}</div></div>
                        <div><div className="csl">Zones</div><div className="csv" style={{color:cur.color}}>{cur.locations.length}</div></div>
                      </div>
                      <div className="cfact">{cur.fact}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {cards.length > 0 && (
              <div className="dirrow">
                <button className="dbtn" onClick={function(){doSwipe("no");}}>
                  <span style={{fontSize:16,color:"#FF6B6B"}}>←</span>
                  <span style={{fontSize:8,textTransform:"uppercase",letterSpacing:".5px",color:"#FF6B6B"}}>Skip</span>
                </button>
                <div className="dmid">
                  <button className="dbtn" style={{padding:"3px 14px"}} onClick={function(){doSwipe("wish");}}>
                    <span style={{fontSize:16,color:"#FFD93D"}}>↑</span>
                    <span style={{fontSize:8,textTransform:"uppercase",letterSpacing:".5px",color:"#FFD93D"}}>Wishlist</span>
                  </button>
                  <div className="dcenter">🤿</div>
                </div>
                <button className="dbtn" onClick={function(){doSwipe("yes");}}>
                  <span style={{fontSize:16,color:"#69DB7C"}}>→</span>
                  <span style={{fontSize:8,textTransform:"uppercase",letterSpacing:".5px",color:"#69DB7C"}}>Spotted</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* WISHLIST */}
        {tab==="wishlist" && (
          <div className="scroll">
            <div className="stitle">Wereldkaart</div>
            <div className="mleg">
              <div className="mlegitem"><div className="mlegdot" style={{background:"#69DB7C"}}/>Spotted</div>
              <div className="mlegitem"><div className="mlegdot" style={{background:"#FFD93D"}}/>Wishlist</div>
              <div className="mlegitem"><div className="mlegdot" style={{background:"#4ECDC4"}}/>Beschikbaar</div>
            </div>
            <MapView spots={SPOTS} wishlist={wishlist} spotted={spotted} selected={selSpot}
              onSelect={function(s){setSelSpot(function(p){return p&&p.name===s.name?null:s;});}}/>
            {selSpot && (
              <div className="spotdetail">
                <button onClick={function(){setSelSpot(null);}} style={{position:"absolute",top:12,right:14,background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:16}}>✕</button>
                <div style={{fontSize:16,fontWeight:700}}>{selSpot.flag} {selSpot.name}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:10}}>{selSpot.region}</div>
                <div style={{display:"flex",gap:16,marginBottom:10}}>
                  {[["Temp",selSpot.temp],["Depth",selSpot.depth],["Rating","★ "+selSpot.rating]].map(function(pair){
                    return <div key={pair[0]}><div style={{fontSize:8,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".5px"}}>{pair[0]}</div><div style={{fontSize:13,fontWeight:600,color:"#4ECDC4"}}>{pair[1]}</div></div>;
                  })}
                </div>
                {wishlist.filter(function(w){return w.locations.indexOf(selSpot.name)>=0;}).length > 0 && (
                  <div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>Wishlist hier</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {wishlist.filter(function(w){return w.locations.indexOf(selSpot.name)>=0;}).map(function(c){
                        return <div key={c.id} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,211,61,.08)",border:"1px solid rgba(255,211,61,.2)",borderRadius:20,padding:"3px 9px",fontSize:11}}>
                          <div style={{width:14,height:14,borderRadius:3,backgroundImage:"url("+c.photo+")",backgroundSize:"cover",backgroundPosition:"center"}}/>
                          {c.name}
                        </div>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {wishlist.length === 0 ? (
              <div className="empty" style={{paddingTop:16,paddingBottom:16}}>
                <div style={{fontSize:38}}>⭐</div>
                <div style={{fontSize:14,fontWeight:600}}>Nog geen wishlist</div>
                <div style={{fontSize:12}}>Swipe up to add species</div>
              </div>
            ) : (
              <div>
                <div className="stitle">Mijn wishlist</div>
                {wishlist.map(function(w) {
                  return (
                    <div className="wishitem" key={w.id}>
                      <div className="wishphoto" style={{backgroundImage:"url("+w.photo+")"}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600}}>{w.name}</div>
                        <div style={{fontSize:10,color:RC[w.rarity]}}><Stars rarity={w.rarity}/> {w.rarity}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.32)",marginTop:2}}>{w.locations.join(" · ")}</div>
                      </div>
                      <button onClick={function(){var nw=wishlist.filter(function(x){return x.id!==w.id;});setWishlist(nw);persist(spotted,nw);}} style={{background:"none",border:"none",color:"rgba(255,255,255,.22)",cursor:"pointer",fontSize:14,padding:"4px 6px"}}>✕</button>
                    </div>
                  );
                })}
                <div className="stitle" style={{marginTop:18}}>Best dive sites</div>
                {scoredSpots.map(function(s) {
                  var c = s.score>=60?"#69DB7C":s.score>=30?"#FFD93D":"rgba(255,255,255,.15)";
                  var isSel = selSpot && selSpot.name===s.name;
                  return (
                    <div key={s.name} className="spotcard" onClick={function(){setSelSpot(function(p){return p&&p.name===s.name?null:s;});}}
                      style={{background:isSel?c+"12":s.score>0?c+"07":"var(--w03)",border:"1px solid "+(isSel?c+"50":s.score>0?c+"25":"rgba(255,255,255,.07)")}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{fontSize:14,fontWeight:600}}>{s.flag} {s.name}</div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.36)",marginTop:1}}>{s.region} · ★ {s.rating}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          {s.score>0 && <div style={{fontSize:16,fontWeight:700,color:c}}>{s.score}%</div>}
                          <div style={{fontSize:11,color:"rgba(255,255,255,.22)"}}>{isSel?"▲":"▼"}</div>
                        </div>
                      </div>
                      {s.matches.length>0 && (
                        <div>
                          <div className="mtags">{s.matches.map(function(m){return <span key={m.id} className="mtag">{m.emoji} {m.name}</span>;})}</div>
                          <div className="sbar"><div className="sfill" style={{width:s.score+"%",background:c}}/></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* LOGBOEK */}
        {tab==="logbook" && (
          <div style={{display:"flex",flexDirection:"column",flex:1}}>

            {/* Swipe session */}
            {diveSession && (
              <DiveSession
                creatures={CREATURES}
                spots={SPOTS}
                onCancel={function(){setDiveSession(false);}}
                onWish={function(creature) {
                  if (!wishlist.find(function(x){return x.id===creature.id;})) {
                    var nw = wishlist.concat([creature]);
                    setWishlist(nw);
                    persist(spotted, nw, dives);
                  }
                }}
                onDone={function(seenIds, wishedIds, diveSpot) {
                  setDiveSession(false);
                  var s = diveSpot || SPOTS[0];
                  var partial = {
                    id: Date.now(),
                    location: s.name, flag: s.flag, region: s.region,
                    date: new Date().toISOString().split("T")[0],
                    depth:"?", duration:"?", visibility:"?", buddy:"", creatures:seenIds,
                  };
                  setDetailDive(partial);
                  var newSpotted = spotted.slice();
                  seenIds.forEach(function(id) {
                    if (!newSpotted.find(function(c){return c.id===id;})) {
                      var c = CREATURES.find(function(c){return c.id===id;}); if(c) newSpotted.push(c);
                    }
                  });
                  var newWishlist = wishlist.slice();
                  wishedIds.forEach(function(id) {
                    if (!newWishlist.find(function(c){return c.id===id;})) {
                      var c = CREATURES.find(function(c){return c.id===id;}); if(c) newWishlist.push(c);
                    }
                  });
                  setSpotted(newSpotted); setWishlist(newWishlist);
                  persist(newSpotted, newWishlist, dives);
                }}
              />
            )}

            {/* Detail sheet (new dive) */}
            {detailDive && (
              <DetailSheet dive={detailDive} spots={SPOTS} customFields={customFields}
                onSave={function(updated) {
                  var nd = [updated].concat(dives); setDives(nd);
                  persist(spotted, wishlist, nd); persistDive(updated); setDetailDive(null);
                }}
                onSkip={function() {
                  var nd = [detailDive].concat(dives); setDives(nd);
                  persist(spotted, wishlist, nd); persistDive(detailDive); setDetailDive(null);
                }}
              />
            )}

            {/* Detail sheet (edit existing dive) */}
            {editDive && (
              <DetailSheet dive={editDive} spots={SPOTS} customFields={customFields}
                onSave={function(updated) {
                  var nd = dives.map(function(d){return d.id===updated.id ? updated : d;});
                  setDives(nd); persist(spotted, wishlist, nd); persistDive(updated); setEditDive(null);
                }}
                onSkip={function(){setEditDive(null);}}
              />
            )}

            {/* Header */}
            <div style={{padding:"50px 22px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,fontStyle:"italic"}}>Log</div>
                {dives.length>0 && <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>{dives.length} dive{dives.length!==1?"en":""} · {spotted.length} speciesen</div>}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {dives.length>0 && (
                  <button onClick={function(){setShowStats(function(p){return !p;});}}
                    style={{padding:"8px 12px",background:showStats?"rgba(255,211,61,.15)":"rgba(255,255,255,.06)",border:"1px solid "+(showStats?"rgba(255,211,61,.3)":"rgba(255,255,255,.1)"),borderRadius:20,color:showStats?"#FFD93D":"rgba(255,255,255,.5)",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    📊
                  </button>
                )}
                <button onClick={function(){setDiveSession(true);}}
                  style={{padding:"9px 14px",background:"rgba(78,205,196,.12)",border:"1px solid rgba(78,205,196,.3)",borderRadius:22,color:"#4ECDC4",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  🤿 Log
                </button>
              </div>
            </div>

            {/* Stats panel */}
            {showStats && dives.length>0 && (function(){
              var depths = dives.map(function(d){return parseFloat(d.depth)||0;}).filter(Boolean);
              var durs   = dives.map(function(d){return parseFloat(d.duration)||0;}).filter(Boolean);
              var maxD   = depths.length ? Math.max.apply(null,depths) : 0;
              var avgD   = depths.length ? Math.round(depths.reduce(function(a,b){return a+b;},0)/depths.length) : 0;
              var totMin = durs.reduce(function(a,b){return a+b;},0);
              var totH   = Math.floor(totMin/60); var totM = totMin%60;
              var locs   = {}; dives.forEach(function(d){locs[d.location]=(locs[d.location]||0)+1;});
              var topLoc = Object.keys(locs).sort(function(a,b){return locs[b]-locs[a];})[0]||"—";
              var rariest = dives.reduce(function(best,d){return d.creatures.length>best?d.creatures.length:best;},0);
              return (
                <div style={{margin:"0 22px 12px",background:"rgba(255,211,61,.05)",border:"1px solid rgba(255,211,61,.15)",borderRadius:18,padding:16}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#FFD93D",marginBottom:12}}>📊 Statistics</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {[
                      ["⬇️","Diepste dive",maxD?maxD+"m":"—"],
                      ["📐","Avg depth",avgD?avgD+"m":"—"],
                      ["⏱","Total time",totH?""+totH+"u "+totM+"m":"—"],
                      ["🤿","Dives",dives.length],
                      ["📍","Fav location",topLoc],
                      ["🐠","Most species",rariest||"—"],
                    ].map(function(s){
                      return (
                        <div key={s[0]} style={{background:"rgba(0,0,0,.2)",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
                          <div style={{fontSize:16}}>{s[0]}</div>
                          <div style={{fontSize:8,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".4px",margin:"4px 0 2px",lineHeight:1.2}}>{s[1]}</div>
                          <div style={{fontSize:13,fontWeight:700,color:"#FFD93D",lineHeight:1.2}}>{s[2]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Search bar */}
            {dives.length>0 && (
              <div style={{padding:"0 22px 10px",position:"relative"}}>
                <input
                  placeholder="🔍 Search by location, date, buddy..."
                  value={searchQuery}
                  onChange={function(e){setSearchQuery(e.target.value);}}
                  style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:"10px 14px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none"}}
                />
                {searchQuery && (
                  <button onClick={function(){setSearchQuery("");}} style={{position:"absolute",right:30,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:14}}>✕</button>
                )}
              </div>
            )}

            <div className="scroll" style={{paddingTop:4}}>
              {dives.length === 0 ? (
                <div className="empty">
                  <div style={{fontSize:60}}>🤿</div>
                  <div style={{fontSize:18,fontWeight:600}}>Eerste dive loggen?</div>
                  <div style={{fontSize:13,lineHeight:1.5,textAlign:"center"}}>Swipe through the species you spotted. Takes 2 minutes.</div>
                  <button onClick={function(){setDiveSession(true);}} style={{marginTop:8,padding:"14px 28px",background:"rgba(78,205,196,.12)",border:"1px solid rgba(78,205,196,.3)",borderRadius:22,color:"#4ECDC4",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    🤿 Log dive
                  </button>
                </div>
              ) : (function(){
                var q = searchQuery.toLowerCase().trim();
                var filtered = q ? dives.filter(function(d){
                  return (d.location||"").toLowerCase().indexOf(q)>=0
                    || (d.date||"").indexOf(q)>=0
                    || (d.buddy||"").toLowerCase().indexOf(q)>=0
                    || (d.site||"").toLowerCase().indexOf(q)>=0
                    || (d.notes||"").toLowerCase().indexOf(q)>=0;
                }) : dives;
                return (
                  <div>
                    {q && <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:12}}>{filtered.length} result{filtered.length!==1?"aten":"aat"} voor "{searchQuery}"</div>}
                    {filtered.map(function(d) {
                      var dc = CREATURES.filter(function(c){return (d.creatures||[]).indexOf(c.id)>=0;});
                      return (
                        <div key={d.id} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:20,padding:18,marginBottom:12}}>
                          {/* Header row */}
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                            <div>
                              <div style={{fontSize:17,fontWeight:700}}>{d.flag} {d.location}</div>
                              <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{d.site ? d.site+" · " : ""}{d.region}</div>
                            </div>
                            <div style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>{d.date}{d.timeIn?" · "+d.timeIn:""}</div>
                                {d.buddy ? <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>with {d.buddy}</div> : null}
                              </div>
                              {/* Edit/delete buttons */}
                              <div style={{display:"flex",gap:4,marginLeft:4}}>
                                <button onClick={function(){setEditDive(d);}}
                                  style={{width:28,height:28,borderRadius:8,background:"rgba(78,205,196,.1)",border:"1px solid rgba(78,205,196,.2)",color:"#4ECDC4",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
                                <button onClick={function(){setConfirmDelete(d.id);}}
                                  style={{width:28,height:28,borderRadius:8,background:"rgba(255,107,107,.1)",border:"1px solid rgba(255,107,107,.2)",color:"#FF6B6B",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:dc.length>0?12:0}}>
                            {[
                              d.timeIn          ? ["🕐", d.timeIn]        : null,
                              d.depth!=="?"     ? ["⬇️", d.depth]         : null,
                              d.duration!=="?"  ? ["⏱",  d.duration]      : null,
                              d.visibility!=="?"? ["👁",  d.visibility]    : null,
                              d.waterTemp && d.waterTemp!=="?" ? ["🌡",d.waterTemp] : null,
                              d.gas             ? ["⛽", d.gas]            : null,
                            ].filter(Boolean).map(function(pair){
                              return <div key={pair[0]}>
                                <div style={{fontSize:8,color:"rgba(255,255,255,.3)",marginBottom:1}}>{pair[0]}</div>
                                <div style={{fontSize:14,fontWeight:700,color:"#4ECDC4"}}>{pair[1]}</div>
                              </div>;
                            })}
                          </div>

                          {/* Species */}
                          {dc.length > 0 && (
                            <div style={{marginBottom:8}}>
                              <div style={{fontSize:9,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>{dc.length} species{dc.length!==1?"en":""} gespot</div>
                              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                                {dc.map(function(c){
                                  return (
                                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:"3px 9px",fontSize:11}}>
                                      <div style={{width:16,height:16,borderRadius:4,backgroundImage:"url("+c.photo+")",backgroundSize:"cover",backgroundPosition:"center",flexShrink:0}}/>
                                      {c.name}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Custom values */}
                          {d.customValues && Object.keys(d.customValues).length>0 && (
                            <div style={{display:"flex",gap:12,flexWrap:"wrap",borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:10,marginTop:4}}>
                              {Object.keys(d.customValues).map(function(k){
                                return <div key={k}>
                                  <div style={{fontSize:8,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".4px"}}>{k}</div>
                                  <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)"}}>{String(d.customValues[k])}</div>
                                </div>;
                              })}
                            </div>
                          )}

                          {d.diveTypes && d.diveTypes.length>0 && (
                            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                              {d.diveTypes.map(function(t){
                                return <div key={t} style={{padding:"2px 9px",borderRadius:20,fontSize:10,background:"rgba(78,205,196,.08)",border:"1px solid rgba(78,205,196,.2)",color:"#4ECDC4"}}>{t}</div>;
                              })}
                            </div>
                          )}
                          {d.notes && <div style={{marginTop:10,fontSize:11,color:"rgba(255,255,255,.4)",fontStyle:"italic",borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:8}}>{d.notes}</div>}

                          {/* Inline delete confirm */}
                          {confirmDelete===d.id && (
                            <div style={{marginTop:10,padding:"10px 12px",background:"rgba(255,107,107,.08)",border:"1px solid rgba(255,107,107,.2)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                              <div style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>Delete dive?</div>
                              <div style={{display:"flex",gap:6}}>
                                <button onClick={function(){setConfirmDelete(null);}}
                                  style={{padding:"5px 10px",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"rgba(255,255,255,.5)",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                                  No
                                </button>
                                <button onClick={function(){
                                  var nd=dives.filter(function(x){return x.id!==d.id;});
                                  setDives(nd); persist(spotted,wishlist,nd); supaDeleteDive(d.id); setConfirmDelete(null);
                                }}
                                  style={{padding:"5px 10px",background:"rgba(255,107,107,.15)",border:"1px solid rgba(255,107,107,.3)",borderRadius:8,color:"#FF6B6B",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                                  Yes, delete
                                </button>
                              </div>
                            </div>
                          )}

                          {/* PDF export per dive */}
                          <div style={{marginTop:12,display:"flex",justifyContent:"flex-end"}}>
                            <button onClick={function(){exportDivePdf(d, dc);}}
                              style={{padding:"5px 12px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:12,color:"rgba(255,255,255,.45)",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}>
                              {exportingPdf?"⏳ Generating...":"📄 Export PDF"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        {/* PROFIEL */}
        {tab==="profile" && (
          <div className="scroll" style={{paddingTop:0}}>
            <div className="phdr">
              <div className="avatar">{udata && udata.name ? udata.name[0].toUpperCase() : "?"}</div>
              <div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20}}>{udata ? udata.name : ""}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>Member since {udata ? udata.joined : ""}</div>
              </div>
            </div>
            <div className="statgrid">
              <div className="statbox"><div className="statnum">{spotted.length}</div><div className="statlbl">Spotted</div></div>
              <div className="statbox"><div className="statnum">{wishlist.length}</div><div className="statlbl">Wishlist</div></div>
              <div className="statbox"><div className="statnum">{dives.length}</div><div className="statlbl">Dives</div></div>
            </div>
            <div style={{padding:"0 22px 16px"}}>
              <div className="stitle">Progress by group</div>
              {GROUPS.filter(function(g){return g.id!=="all";}).map(function(g) {
                var total = CREATURES.filter(function(c){return c.group===g.id;}).length;
                var seen = spotted.filter(function(c){return c.group===g.id;}).length;
                var p2 = total>0?Math.round(seen/total*100):0;
                return (
                  <div key={g.id} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:11}}>
                      <span>{g.emoji} {g.label}</span>
                      <span style={{color:"rgba(255,255,255,.4)"}}>{seen}/{total}</span>
                    </div>
                    <div className="sbar"><div className="sfill" style={{width:p2+"%",background:p2===100?"#69DB7C":"#4ECDC4"}}/></div>
                  </div>
                );
              })}
            </div>
            {fieldMgrOpen && (
              <FieldManager
                fields={customFields}
                onClose={function(){setFieldMgrOpen(false);}}
                onChange={function(updated){
                  setCustomFields(updated);
                  persistFields(updated);
                }}
              />
            )}
            <div style={{padding:"0 22px 12px"}}>
              <button onClick={function(){setFieldMgrOpen(true);}}
                style={{width:"100%",padding:14,background:"rgba(78,205,196,.08)",border:"1px solid rgba(78,205,196,.2)",borderRadius:14,color:"#4ECDC4",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:8,textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>🗂</span>
                <div>
                  <div>Custom log fields</div>
                  <div style={{fontSize:11,fontWeight:400,color:"rgba(78,205,196,.6)",marginTop:1}}>{customFields.length===0?"No custom fields yet":customFields.length+" field"+(customFields.length!==1?"en":"")+" active"}</div>
                </div>
                <span style={{marginLeft:"auto",color:"rgba(255,255,255,.3)"}}>›</span>
              </button>
            </div>
            <button className="logoutbtn" onClick={handleLogout}>Log out</button>
          </div>
        )}

        <div className="nav">
          {[["discover","🔍","Discover"],["wishlist","⭐","Wishlist"],["logbook","📖","Log"],["profile","👤","Profile"]].map(function(item) {
            return (
              <button key={item[0]} className={"nb"+(tab===item[0]?" on":"")} onClick={function(){setTab(item[0]);}}>
                <span className="ni">{item[1]}</span>{item[2]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
