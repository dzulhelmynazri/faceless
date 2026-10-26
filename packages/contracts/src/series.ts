import { z } from "zod";

export interface SeriesPreset {
  id: string;
  title: string;
  description: string;
  nichePrompt: string;
  exampleScript: string;
}

export const SERIES_PRESETS: readonly SeriesPreset[] = [
  {
    id: "scary-stories",
    title: "Scary stories",
    description: "Scary stories that give you goosebumps",
    nichePrompt:
      "Storytelling format. True historical horror stories and dark real-world events with psychological terror elements. Focus on elite military operatives/legendary snipers/assassins and their story, feel free to touch cold war stories that have been recorded into movies, nuclear disasters/radiation poisoning/toxic waste cover-ups, serial killers/psychiatric escapees/mass murderers, unexplained disappearances/missing persons with dark implications, Cold War espionage/containment breaches, military black ops, extreme survival cases, cult leaders/mass manipulation, plane crashes/maritime disasters with survivor horror, abandoned research stations/lost expeditions. Exclude fictional monsters/supernatural entities - focus on real human evil, natural predators, scientific disasters, documented historical events that feel too disturbing to be true but are factual. IT'S EXTREMELY IMPORTANT THAT IT'S BASED ON REAL EVENTS.",
    exampleScript: `Did you know there are bodies on Mount Everest that are used as trail markers?

Mount Everest, the highest point on earth, is also one of the deadliest.

Above 8,000 meters lies the death zone, where the air is so thin, your body starts shutting down.

Oxygen is scarce, thinking becomes foggy, and every step is torture.

Over 300 climbers have died on Everest, and most of them are still up there.

Their bodies, frozen solid by the cold, can't be recovered.

Helicopters can't fly that high and it's too dangerous to carry the dead back down.

So they stay where they fell.

One of the most infamous is a man known as Green Boots, believed to be Indian climber Sewang Paljor.

He died during a blizzard in 1996.

His body rests in a cave near the main route to the summit, curled on his side, his neon green boots poking out of the snow.

For years, climbers would say, once you pass green boots, you're almost there.

Then there's Sleeping Beauty, an American climber who died just short of the summit.

Her body sits upright, strapped to her gear, her long hair frozen in the wind.

Her face is tilted upward, eyes closed.

Some climbers pause in silence.

Others step over the bodies, barely looking.

Everest doesn't just hold the dreams of the living, it keeps the dead as warnings.`,
  },
  {
    id: "history",
    title: "History",
    description:
      "Viral videos about history spanning from ancient times to the modern day.",
    nichePrompt:
      "Storytelling format. True historical events and fascinating accounts from all eras. Focus on ancient civilizations/Egyptian pharaohs/Mesopotamian empires, Greek city-states/Roman conquests/Byzantine intrigues, Viking raids/Norse exploration/medieval kingdoms, Crusades/Islamic Golden Age/Mongol invasions, Renaissance discoveries/Age of Exploration/colonial expansion, Ottoman Empire/Safavid Persia/Mughal India, Chinese dynasties/Japanese samurai/Korean kingdoms, African empires/Mali/Songhai/Ethiopian highlands, Aztec/Inca/Maya civilizations/pre-Columbian Americas, American Revolution/French Revolution/Napoleonic Wars, Industrial Revolution/Victorian era/Belle Époque, World War I/Russian Revolution/interwar period, World War II/Holocaust/Pacific Theater, Cold War/decolonization/space race, Arab Spring/modern conflicts/contemporary geopolitics. Emphasize political intrigue/palace coups/assassinations, military strategies/legendary battles/tactical innovations, cultural exchanges/trade routes/diplomatic missions, scientific breakthroughs/technological advances/medical discoveries, religious movements/philosophical schools/intellectual revolutions, social upheavals/class struggles/popular revolts, exploration/expeditions/cartographic achievements, art movements/architectural marvels/literary works. Include specific details about key figures/their motivations/personal struggles, turning points/decisive moments/unintended consequences, daily life/social customs/economic systems, long-term impact/historical significance/modern relevance. Focus on power struggles/succession crises, cultural clashes/adaptation, innovation/resistance to change, heroic achievements/tragic downfalls, forgotten civilizations/lost knowledge, diplomatic breakthroughs/failed negotiations, strategic victories/devastating defeats. Emphasize documented historical events with dramatic human elements that shaped civilizations and continue influencing the modern world. IT'S EXTREMELY IMPORTANT THAT IT'S BASED ON REAL EVENTS.",
    exampleScript: `Did you know a man literally prevented a nuclear war by himself and got fired in return?

Stanislav Petrov was an officer responsible for launching nuclear bombs at the enemy, if such attack was necessary.

And on the night of September 26th, 1983, he was sitting in a secret bunker near Moscow.

Until the warning system suddenly blared.

American nuclear missile had just been launched. Then another and another.

Five in total, the computer said this was a real attack.

The man on duty was trained to report such events immediately.

That call would trigger a full Soviet counter attack.

Thousands of missiles aimed at the US, but he hesitated, something didn't feel right.

There was no radar confirmation, no visual proof. Why only five missiles?

A real attack would launch hundreds.

He made the call, false alarm.

It was a glitch caused by sunlight reflecting off clouds.

His decision may have saved the world, but instead of being rewarded, he was quietly reprimanded.

Instinct prevented a global catastrophe.`,
  },
  {
    id: "greek-mythology",
    title: "Greek Mythology",
    description: "Shocking and dramatic stories from Greek mythology.",
    nichePrompt:
      'Greek mythology storytelling focused on the Olympic gods, legendary heroes, and their wild interactions. Your content explores the most shocking, dramatic, and messed-up stories from Greek myth — divine betrayals, cursed bloodlines, monster origins, god-on-god warfare, forbidden love, brutal punishments, and the twisted family dynamics of Mount Olympus. Sources include Homer\'s Iliad and Odyssey, Hesiod\'s Theogony, Ovid\'s Metamorphoses, Apollodorus, and other classical texts. Every story should feel like you\'re exposing just how unhinged the Greek gods actually were. Stick to the mainstream gods and characters people have already heard of — Zeus, Poseidon, Hades, Athena, Ares, Aphrodite, Apollo, Hermes, Hercules, Achilles, Medusa, Perseus, Odysseus, the Titans, etc. This is for the general brainrotted TikTok population, so the language must be so dumb anyone can understand it. Think "Zeus was basically the worst husband in history" energy, not academic lecture. Make the gods feel like messy, dramatic, overpowered reality TV characters. Make sure the videos have variety, they shouldn\'t all follow the same structure, they must be unique. Some should be about rivalries, some about origin stories, some about punishments, some about love triangles, some about wars. The story always starts with "Did you know that in Greek Mythology...?" and the hook should share a really intriguing fact that creates an open loop, something that makes the person say "WTF."',
    exampleScript: `Did you know that in Greek mythology, there was a man so beautiful that he fell in love with himself?

His name was Narcissus.

When he was born, his mother asked the seer Tiresias whether her son would live a long life. The answer was a chilling riddle.

He will live a long life only if he never comes to know himself.

No one understood those words until the day of the tragedy.

Narcissus grew up to possess an inhuman beauty. But his heart was made of ice. He rejected everyone with cruelty.

His most famous victim was Echo, a nymph cursed to repeat only the last words spoken by others. She followed him everywhere, hopelessly in love. But when she tried to embrace him, he pushed her away in disgust.

Echo wasted away from grief until nothing remained of her but her voice.

But Nemesis, the goddess of vengeance, saw everything. She decided that Narcissus had to feel the same pain. To love someone he could never have.

She led him to a crystal clear pool of water. When Narcissus bent down to drink, he saw his reflection. And in that instant, the curse was fulfilled.

He fell desperately in love with that image.

He tried to kiss it, but the water rippled and the face vanished. He tried to embrace it, but his hands met only cold emptiness.

Then Narcissus understood the terrible truth. He was in love with himself.

Unable to tear himself away from that reflection, he stopped eating and drinking. Wasting away until he died.

And there, where his body fell, nothing remained except a white flower with a golden heart.

It still bears his name today.`,
  },
  {
    id: "historical-figures",
    title: "Historical Figures",
    description:
      "Life story in one minute videos about the most important historical figures.",
    nichePrompt:
      'Life story in one minute videos about most important historical figures. Think last three US presidents, the historical US presidents (only those that were really important), other leaders US was for example involved in war with (Saddam Hussein, Gadaffi), most important, WWII leaders, the soviets, Napoleon, Shakespeare, Columbus, then go back even more in history to ancient times to Caesar, philosophers, Genghis Khan, Alexander the great. Those should give you idea of the direction I want to take, the principle is that they have to be EXTREMELY IMPORTANT + well known by every american regardless of education. Make sure to have variety in the concepts, don\'t always pick the same era. Copy the structure of the example script and always start with a "Did you know..." style hook that teases the single most surprising, intriguing, or little-known fact about {full_name} to maximize organic reach (e.g. "Did you know {full_name} ...?"). The hook MUST be short, quick and sharp (one punchy sentence, ideally under 12 words) and centered on something genuinely fascinating or shocking. Do NOT summarize their whole life or list multiple facts in the hook, pick one jaw-dropping detail that makes the viewer instantly need to know more. The script should be structured similar to the example script and it should also flow very similarly in regard to what we talk about in the script etc. But make sure it really fits the person and his achievements and is oriented around that. You can also build it around any climaxes in his life or how he proved everyone wrong, be unique. STRICTLY EXCLUDE: Adolf Hitler, Joseph Goebbels, Heinrich Himmler, Hermann Göring, Rudolf Hess, Adolf Eichmann, Josef Mengele, Reinhard Heydrich, and any other Nazi party leaders or prominent Nazi figures. Do not create content that features, glorifies, or centers on any Nazi individuals.',
    exampleScript: `Did you know Donald Trump was once $900 million in debt and still became a billionaire again?

Donald Trump was born in 1946 in New York to a major real estate family. He graduated from the Wharton School of Business and joined his father's company.

In the 1970s and 80s, Trump reshaped Manhattan with major developments including the iconic Trump Tower, luxury hotels, and casinos. In the 1990s, his empire nearly collapsed under massive debt and bankruptcies. Trump didn't give up and rebuilt his business.

In the 2000s, he became a national celebrity through the TV show The Apprentice and the phrase "You're fired."

In 2016, he won the presidential election and became the 45th President of the United States. His administration focused on tax cuts, strict immigration policies, and new trade deals.

After losing the 2020 election, many believed his political career was over, but Trump didn't give up. He returned and won again in 2024. Since 2025, he serves as the 47th President, one of the few U.S. leaders to regain power after leaving office.

Trump's story is about persistence, falling, rebuilding, and refusing to quit.`,
  },
  {
    id: "true-crime",
    title: "True Crime",
    description: "Viral videos about true crime stories.",
    nichePrompt:
      "Storytelling format. Real criminal cases and heists with dramatic execution and shocking aftermath. Focus on elaborate bank heists/vault penetrations/armored car robberies, art thefts/museum break-ins/gallery infiltrations, jewel heists/diamond exchanges/precious metal thefts, casino robberies/gambling house infiltrations/money laundering schemes, corporate embezzlement/white-collar fraud/financial manipulation, prison escapes/maximum security breakouts/fugitive manhunts, organized crime operations/mafia hits/cartel activities, serial killer cases/methodical murderers/psychological profiling breakthroughs, kidnapping schemes/ransom demands/hostage situations, drug trafficking operations/smuggling networks/border infiltrations, counterfeiting rings/forgery operations/identity theft schemes, cybercrime cases/hacking operations/digital fraud, assassination plots/political murders/contract killings, insurance fraud/staged accidents/false death schemes, blackmail operations/extortion rings/corruption scandals, cold cases/unsolved mysteries/breakthrough investigations, witness protection failures/informant betrayals/undercover operations gone wrong, international crime syndicates/cross-border operations/diplomatic immunity abuse. Emphasize meticulous planning/reconnaissance/inside information, sophisticated tools/technical expertise/professional execution, law enforcement response/investigation techniques/forensic breakthroughs, legal proceedings/courtroom drama/sentencing outcomes, media coverage/public reaction/cultural impact. Include specific details about criminal methodology/security vulnerabilities exploited, investigation process/evidence gathering/breakthrough moments, arrests/trials/plea bargains/sentences, stolen goods recovery/financial losses/victim impact, long-term consequences/criminal careers/rehabilitation attempts. Stories should feature: cat-and-mouse pursuits/detective work, criminal ingenuity/law enforcement adaptation, betrayals/double-crosses/honor among thieves, justice served/cases gone cold, criminal legends/notorious reputations. Focus on documented rare cases with compelling execution details and significant aftermath that demonstrate criminal sophistication and investigative excellence. IT'S EXTREMELY IMPORTANT THAT IT'S BASED ON REAL EVENTS.",
    exampleScript: `Did you know a Lamborghini engineer spent 18 months infiltrating Ferrari just to destroy them from within?

In 2019, Francesco Moretti walked through Ferrari's gates with fake credentials and a deadly plan.

Posing as a quality control specialist, he had complete access to their production lines.

For months, he introduced microscopic flaws into carbon fiber components invisible to standard inspection.

Each sabotage part was a ticking time bomb waiting to fail.

The recall started small, then exploded into a 23 million dollar nightmare for Ferrari.

But Moretti wasn't done.

During a fire drill, he slipped into the restricted R&D facility.

He photographed classified blueprints of their hybrid V12 engine, then triggered a controlled explosion to erase his tracks.

Ferrari's forensic team found his weakness.

A distinctive welding signature on every sabotage part.

At Milan airport, police arrested him with encrypted drives containing 12,000 stolen documents.

His perfect infiltration was undone by the very craft that got him inside.

Corporate espionage had never been so personal.`,
  },
  {
    id: "stoic-motivation",
    title: "Stoic Motivation",
    description: "Viral videos about stoic philosophy and life lessons.",
    nichePrompt:
      "Stoic philosophy, life lessons, wisdom, and motivational content. Focus on ancient Stoic philosophers/Marcus Aurelius/Seneca/Epictetus, Greek wisdom/Socrates/Plato/Aristotle, Eastern philosophy/Buddhism/Taoism/Confucianism, Renaissance thinkers/Enlightenment philosophers/modern wisdom traditions, self-improvement gurus/Tony Robbins/Jim Rohn/Brian Tracy, new generation motivators/Naval Ravikant/Luke Belmar/Andrew Huberman, business philosophy/entrepreneurial mindset/wealth building principles, productivity systems/time management/habit formation, mental models/decision making frameworks/cognitive biases, mindfulness practices/meditation techniques/spiritual growth, physical health/fitness motivation/longevity principles, relationship wisdom/communication skills/emotional intelligence, financial literacy/investment philosophy/economic principles, creative thinking/innovation/problem solving approaches, leadership principles/team building/organizational wisdom, resilience building/overcoming adversity/mental toughness, purpose finding/meaning creation/legacy building, minimalism/essentialism/intentional living, gratitude practices/positive psychology/happiness research. Emphasize practical wisdom/actionable insights/real-world applications, personal development/character building/virtue ethics, success principles/achievement strategies/goal setting methodologies, work-life balance/stress management/inner peace cultivation, continuous learning/intellectual growth/skill development, authentic living/value alignment/integrity principles. Include specific details about philosophical concepts/practical applications/daily practices, historical context/modern relevance/timeless principles, scientific backing/research evidence/proven methodologies, personal transformation/behavioral change/mindset shifts. Focus on inspirational content/motivational frameworks/life-changing perspectives that encourage self-improvement/personal growth/meaningful living while maintaining family-friendly/professional/uplifting tone throughout.",
    exampleScript: `Marcus Aurelius ruled the most powerful empire on Earth.

Yet every morning, he reminded himself that today he would meet liars, the ungrateful, and the arrogant.

Not to complain. But to prepare.

He knew something most people forget.

You can't control what others do. You can only control how you respond.

Two thousand years ago, he wrote that the obstacle in your path becomes the path.

Every setback is training. Every rejection is redirection.

The Stoics believed that peace doesn't come from avoiding problems.

It comes from building the strength to face them.

So when life hits you hard, remember this.

A river doesn't fight the rocks in its way. It flows around them and keeps moving.

Your struggles are not stopping you. They're shaping you.

The question isn't whether hard times will come.

The question is who you'll become because of them.`,
  },
  {
    id: "good-morals",
    title: "Good morals",
    description: "Viral videos that teach people good morals and life lessons.",
    nichePrompt:
      "Storytelling format. Moral lesson stories showing virtue and integrity rewarded through realistic scenarios with escalating difficulty levels. Focus on workplace integrity/whistleblowing/standing up to corruption, small acts of kindness/helping strangers/community service, honesty in business/returning lost items/admitting mistakes, family loyalty/caring for elderly parents/sibling reconciliation, friendship loyalty/keeping secrets/defending others, academic integrity/refusing to cheat/helping struggling classmates, financial honesty/paying debts/refusing bribes/ethical investing, environmental responsibility/conservation efforts/sustainable living, standing up to bullying/discrimination/social injustice, forgiveness/second chances/redemption stories, perseverance through hardship/overcoming addiction/career setbacks, mentorship/teaching/passing on wisdom, charitable giving/volunteering/sacrificing for others, courage in dangerous situations/moral stands/speaking truth to power, patience/delayed gratification/long-term thinking, humility/admitting wrongs/learning from criticism. Emphasize realistic consequences/believable rewards, gradual character development/personal growth, community recognition/career advancement/relationship improvements, inner peace/self-respect/legacy building, unexpected opportunities/doors opening/positive reputation effects. Include specific details about initial moral dilemmas/temptations faced/pressure to compromise, step-by-step decision-making process/internal struggles/support systems, immediate costs/short-term sacrifices/social pressure, gradual positive outcomes/compound benefits/ripple effects on others, long-term vindication/success/fulfillment. Stories should feature: relatable modern settings/contemporary challenges, ordinary people/accessible role models, measurable improvements/tangible rewards, realistic timeframes/believable progression, authentic dialogue/genuine emotions, practical wisdom/applicable lessons. Present documented cases/real-world examples/contemporary success stories that demonstrate moral behavior leading to genuine personal and professional rewards.",
    exampleScript: `A homeless man found a backpack on a park bench. Inside was twenty thousand dollars in cash.

He could have walked away. No one would have known.

Instead, he sat there for three hours waiting for someone to come back.

When the owner finally returned, panicked and crying, he handed it over without hesitation.

She was a single mother. That money was everything she had saved for her daughter's surgery.

The story went viral. A local business owner saw it and offered him a job on the spot.

Within a year, he had an apartment, a savings account, and something he hadn't felt in years.

Purpose.

People asked him why he didn't keep the money.

He said, "Taking it would have made me rich for a week. Giving it back made me someone I could respect for the rest of my life."

One decision changed everything.

Not because the universe rewarded him. But because he rewarded himself with integrity.`,
  },
  {
    id: "children-stories",
    title: "Children stories",
    description: "Heartwarming animal stories with a lesson, perfect for kids.",
    nichePrompt:
      'Storytelling format. Heartwarming animated stories for kids aged 3 to 8, watched on a parent\'s phone or played at bedtime. The proven formula: a small, cute character gets into real but safe trouble, someone helps, and it ends in a warm reunion or a happy fix, followed by the lesson said out loud. Parents feel good showing it, and kids need to know how it ends. CHARACTERS: The hero is a baby or little animal (kitten, puppy, bunny, duckling, baby elephant, little penguin, fox cub, baby panda, chick), sometimes a toy or a magical creature. Mama and papa animals, friends, and kind helpers appear often. Give the hero a simple, cute name and one signature visual detail that is mentioned in the first sentence and comes back later (for example "a tiny kitten named Mochi with a little blue bell"). Every image is drawn from the script alone, so this detail keeps the hero looking the same in every scene. Even better when the detail also matters to the plot. STORY TYPES: Rotate across videos and never repeat the same situation with the same outcome: Rescue or reunion, Mistake and making it right, Clever little hero, Funny mix-up, Kindness paid back. HOOK: Never start with "Did you know". The first sentence names the hero and drops them straight into the problem, often as "Once upon a time". NARRATION: A warm, gentle storyteller in third person, like a parent reading aloud. Every sentence shows an action we can see, not just a feeling. Use short lines of dialogue, sound words, and a sound or phrase that comes back at the end. End with the lesson said plainly in one simple sentence. LANGUAGE: Very simple words a five year old understands, short sentences, warm and sing-song. STRICTLY AVOID: graphic danger, injuries, blood, death, real villains or anyone getting hurt, separations that are not resolved, crying used just for sadness, bullying that isn\'t resolved kindly, romance, gross-out humor, medicine or doctor procedures, weapons, dangerous behavior kids could copy, and any copyrighted or branded characters.',
    exampleScript: `Once upon a time, a tiny kitten named Mochi with a little blue bell got lost in the rain.

She had chased a butterfly too far from home. Now the sky was dark, and the puddles were big.

"Mama? Mama, where are you?" Mochi cried. Ring, ring, went her little bell.

She hid under a big green leaf, shivering.

Far away, Mama Cat's ears popped up. Ring, ring. She knew that sound!

Mama ran through the rain, splash, splash, splash, and there was Mochi.

She wrapped her warm tail around her baby and carried her all the way home.

Mochi learned to always stay close to Mama. And Mama never stopped listening for that little bell.`,
  },
] as const;

export const VOICE_CATEGORIES = [
  "all",
  "storytelling",
  "social",
  "documentary",
  "conversational",
  "character",
] as const;

export type VoiceCategory = (typeof VOICE_CATEGORIES)[number];

export const ELEVENLABS_MODELS = ["eleven_v4_turbo"] as const;

export type ElevenLabsModel = (typeof ELEVENLABS_MODELS)[number];

export const ELEVENLABS_DEFAULT_MODEL: ElevenLabsModel = "eleven_v4_turbo";

export const ELEVENLABS_PRICING = {
  eleven_v4_turbo: {
    pricePer1kChars: 0.04,
    pricePerChar: 0.00004,
  },
} as const;

export interface SeriesVoice {
  id: string;
  name: string;
  gender: "male" | "female";
  tag: string;
  category: VoiceCategory;
  flag: string;
  sampleUrl: string;
  language: string;
}

export interface SeriesLanguage {
  code: string;
  flag: string;
  label: string;
}

export const SERIES_LANGUAGES: readonly SeriesLanguage[] = [
  { code: "en", flag: "🇺🇸", label: "English (US)" },
  { code: "en-gb", flag: "🇬🇧", label: "English (UK)" },
  { code: "ms", flag: "🇲🇾", label: "Malay" },
  { code: "id", flag: "🇮🇩", label: "Indonesian" },
  { code: "es", flag: "🇪🇸", label: "Spanish" },
  { code: "fr", flag: "🇫🇷", label: "French" },
  { code: "de", flag: "🇩🇪", label: "German" },
  { code: "it", flag: "🇮🇹", label: "Italian" },
  { code: "pt", flag: "🇧🇷", label: "Portuguese" },
  { code: "ja", flag: "🇯🇵", label: "Japanese" },
  { code: "ko", flag: "🇰🇷", label: "Korean" },
  { code: "zh", flag: "🇨🇳", label: "Chinese" },
  { code: "hi", flag: "🇮🇳", label: "Hindi" },
  { code: "ar", flag: "🇸🇦", label: "Arabic" },
  { code: "ru", flag: "🇷🇺", label: "Russian" },
  { code: "vi", flag: "🇻🇳", label: "Vietnamese" },
  { code: "th", flag: "🇹🇭", label: "Thai" },
  { code: "tl", flag: "🇵🇭", label: "Filipino (Tagalog)" },
  { code: "tr", flag: "🇹🇷", label: "Turkish" },
  { code: "pl", flag: "🇵🇱", label: "Polish" },
  { code: "nl", flag: "🇳🇱", label: "Dutch" },
  { code: "sv", flag: "🇸🇪", label: "Swedish" },
] as const;

export const SERIES_VOICES: readonly SeriesVoice[] = [
  // English (US) 🇺🇸
  {
    category: "storytelling",
    flag: "🇺🇸",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "en",
    name: "Adam",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/d6905d7a-dd26-4187-bfff-1bd3a5ea7cac.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "storytelling",
    flag: "🇺🇸",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "en",
    name: "Brian",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/2dd3e72c-4fd3-42f1-93ea-abc5d4e5aa1d.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "social",
    flag: "🇦🇺",
    gender: "male",
    id: "IKne3meq5aSn9XLyUdCD",
    language: "en",
    name: "Charlie",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/102de6f2-22ed-43e0-a1f1-111fa75c5481.mp3",
    tag: "Casual & Relatable",
  },
  {
    category: "social",
    flag: "🇺🇸",
    gender: "male",
    id: "TX3LPaxmHKxFdv7VOQHJ",
    language: "en",
    name: "Liam",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/63148076-6363-42db-aea8-31424308b92c.mp3",
    tag: "Energetic Creator",
  },
  {
    category: "character",
    flag: "🇺🇸",
    gender: "male",
    id: "N2lVS1w4EtoT3dr4eOWO",
    language: "en",
    name: "Callum",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/N2lVS1w4EtoT3dr4eOWO/ac833bd8-ffda-4938-9ebc-b0f99ca25481.mp3",
    tag: "Dramatic Villain",
  },
  {
    category: "conversational",
    flag: "🇺🇸",
    gender: "male",
    id: "CwhRBWXzGAHq8TQ4Fs17",
    language: "en",
    name: "Roger",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/CwhRBWXzGAHq8TQ4Fs17/58ee3ff5-f6f2-4628-93b8-e38eb31806b0.mp3",
    tag: "Resonant & Classy",
  },
  {
    category: "conversational",
    flag: "🇺🇸",
    gender: "male",
    id: "iP95p4xoKVk53GoZ742B",
    language: "en",
    name: "Chris",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/iP95p4xoKVk53GoZ742B/3f4bde72-cc48-40dd-829f-57fbf906f4d7.mp3",
    tag: "Charming & Natural",
  },
  {
    category: "conversational",
    flag: "🇺🇸",
    gender: "male",
    id: "cjVigY5qzO86Huf0OWal",
    language: "en",
    name: "Eric",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/cjVigY5qzO86Huf0OWal/d098fda0-6456-4030-b3d8-63aa048c9070.mp3",
    tag: "Smooth & Trustworthy",
  },
  {
    category: "conversational",
    flag: "🇺🇸",
    gender: "male",
    id: "bIHbv24MWmeRgasZH58o",
    language: "en",
    name: "Will",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/bIHbv24MWmeRgasZH58o/8caf8f3d-ad29-4980-af41-53f20c72d7a4.mp3",
    tag: "Chill Optimist",
  },
  {
    category: "documentary",
    flag: "🇺🇸",
    gender: "male",
    id: "pqHfZKP75CvOlQylNhV4",
    language: "en",
    name: "Bill",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/pqHfZKP75CvOlQylNhV4/d782b3ff-84ba-4029-848c-acf01285524d.mp3",
    tag: "Wise & Mature",
  },
  {
    category: "character",
    flag: "🇺🇸",
    gender: "male",
    id: "SOYHLrjzK2X1ezoPC6cr",
    language: "en",
    name: "Harry",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/SOYHLrjzK2X1ezoPC6cr/86d178f6-f4b6-4e0e-85be-3de19f490794.mp3",
    tag: "Fierce & Rough",
  },
  {
    category: "conversational",
    flag: "🇺🇸",
    gender: "male",
    id: "SAz9YHcvj6GT2YYXdXww",
    language: "en",
    name: "River",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/SAz9YHcvj6GT2YYXdXww/e6c95f0b-2227-491a-b3d7-2249240decb7.mp3",
    tag: "Calm & Neutral",
  },
  {
    category: "storytelling",
    flag: "🇺🇸",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "en",
    name: "Sarah",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2216a32186.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "documentary",
    flag: "🇺🇸",
    gender: "female",
    id: "XrExE9yKIg1WjnnlVkGX",
    language: "en",
    name: "Matilda",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/XrExE9yKIg1WjnnlVkGX/b930e18d-6b4d-466e-bab2-0ae97c6d8535.mp3",
    tag: "Professional & Upbeat",
  },
  {
    category: "conversational",
    flag: "🇺🇸",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "en",
    name: "Jessica",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-846c-c3a11683d45a.mp3",
    tag: "Bright & Warm",
  },
  {
    category: "social",
    flag: "🇺🇸",
    gender: "female",
    id: "FGY2WhTYpPnrIDTdsKH5",
    language: "en",
    name: "Laura",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/FGY2WhTYpPnrIDTdsKH5/67341759-ad08-41a5-be6e-de12fe448618.mp3",
    tag: "Enthusiastic & Sassy",
  },
  {
    category: "documentary",
    flag: "🇺🇸",
    gender: "female",
    id: "hpp4J3VqNfWAUOO0d1Us",
    language: "en",
    name: "Bella",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/hpp4J3VqNfWAUOO0d1Us/dab0f5ba-3aa4-48a8-9fad-f138fea1126d.mp3",
    tag: "Polished & Friendly",
  },
  {
    category: "storytelling",
    flag: "🇺🇸",
    gender: "female",
    id: "21m00Tcm4TlvDq8ikWAM",
    language: "en",
    name: "Rachel",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-5c96-470d-8312-aab3b3d8f50a.mp3",
    tag: "Calm & Expressive",
  },
  {
    category: "social",
    flag: "🇺🇸",
    gender: "female",
    id: "9BWtsMINqrJLrRacOk9x",
    language: "en",
    name: "Aria",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/9BWtsMINqrJLrRacOk9x/405766b8-1f4e-4d3c-aba1-6f25333823ec.mp3",
    tag: "Expressive & Dynamic",
  },
  {
    category: "conversational",
    flag: "🇺🇸",
    gender: "female",
    id: "AZnzlk1XvdvUeBnXmlld",
    language: "en",
    name: "Domi",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/508e12d0-a7f7-4d86-a0d3-f3884ff353ed.mp3",
    tag: "Strong & Confident",
  },
  {
    category: "storytelling",
    flag: "🇺🇸",
    gender: "female",
    id: "MF3mGyEYCl7XYWbV9V6O",
    language: "en",
    name: "Elli",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/d8ecadea-9e48-4e5d-868a-2ec3d7397861.mp3",
    tag: "Emotional & Engaging",
  },
  {
    category: "conversational",
    flag: "🇺🇸",
    gender: "male",
    id: "ErXwobaYiN019PkySvjV",
    language: "en",
    name: "Antoni",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/ee9ac367-91ee-4a56-818a-2bd1a9dbe83a.mp3",
    tag: "Well-Rounded",
  },
  {
    category: "character",
    flag: "🇺🇸",
    gender: "male",
    id: "2EiwWnXFnvU5JabPnv8n",
    language: "en",
    name: "Clyde",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/2EiwWnXFnvU5JabPnv8n/65d80f52-703f-4cae-a91d-75d4e200ed02.mp3",
    tag: "Gritty Veteran",
  },
  {
    category: "conversational",
    flag: "🇺🇸",
    gender: "male",
    id: "yoZ06aMxZJJ28mfd3POQ",
    language: "en",
    name: "Sam",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/ac9d1c91-92ce-4b20-8cc2-3187a7da49ec.mp3",
    tag: "Raspy & Casual",
  },

  // English (UK) 🇬🇧
  {
    category: "storytelling",
    flag: "🇬🇧",
    gender: "male",
    id: "JBFqnCBsd6RMkjVDRZzb",
    language: "en-gb",
    name: "George",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1a-0721-4787-aafb-06a6e705cac5.mp3",
    tag: "British Storyteller",
  },
  {
    category: "documentary",
    flag: "🇬🇧",
    gender: "male",
    id: "onwK4e9ZLuTAKqWW03F9",
    language: "en-gb",
    name: "Daniel",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/7eee0236-1a72-4b86-b303-5dcadc007ba9.mp3",
    tag: "Broadcaster",
  },
  {
    category: "conversational",
    flag: "🇬🇧",
    gender: "male",
    id: "CwhRBWXzGAHq8TQ4Fs17",
    language: "en-gb",
    name: "Arthur",
    sampleUrl: "/series/voices/en-gb-arthur.mp3",
    tag: "Warm & Classic",
  },
  {
    category: "social",
    flag: "🇬🇧",
    gender: "male",
    id: "TX3LPaxmHKxFdv7VOQHJ",
    language: "en-gb",
    name: "Oliver",
    sampleUrl: "/series/voices/en-gb-oliver.mp3",
    tag: "Energetic & Youthful",
  },
  {
    category: "storytelling",
    flag: "🇬🇧",
    gender: "female",
    id: "pFZP5JQG7iQjIQuC4Bku",
    language: "en-gb",
    name: "Lily",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/pFZP5JQG7iQjIQuC4Bku/89b68b35-b3dd-4348-a84a-a3c13a3c2b30.mp3",
    tag: "Velvety & Warm",
  },
  {
    category: "documentary",
    flag: "🇬🇧",
    gender: "female",
    id: "Xb7hH8MSUJpSbSDYk0k2",
    language: "en-gb",
    name: "Alice",
    sampleUrl:
      "https://storage.googleapis.com/eleven-public-prod/premade/voices/Xb7hH8MSUJpSbSDYk0k2/d10f7534-11f6-41fe-a012-2de1e482d336.mp3",
    tag: "British Educator",
  },
  {
    category: "storytelling",
    flag: "🇬🇧",
    gender: "female",
    id: "XrExE9yKIg1WjnnlVkGX",
    language: "en-gb",
    name: "Charlotte",
    sampleUrl: "/series/voices/en-gb-charlotte.mp3",
    tag: "Poised & Sophisticated",
  },
  {
    category: "social",
    flag: "🇬🇧",
    gender: "female",
    id: "FGY2WhTYpPnrIDTdsKH5",
    language: "en-gb",
    name: "Eleanor",
    sampleUrl: "/series/voices/en-gb-eleanor.mp3",
    tag: "Vibrant & Friendly",
  },

  // Malay 🇲🇾
  {
    category: "storytelling",
    flag: "🇲🇾",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "ms",
    name: "Hafiz",
    sampleUrl: "/series/voices/ms-hafiz.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇲🇾",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "ms",
    name: "Farhan",
    sampleUrl: "/series/voices/ms-farhan.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "conversational",
    flag: "🇲🇾",
    gender: "male",
    id: "CwhRBWXzGAHq8TQ4Fs17",
    language: "ms",
    name: "Ammar",
    sampleUrl: "/series/voices/ms-ammar.mp3",
    tag: "Resonant & Engaging",
  },
  {
    category: "character",
    flag: "🇲🇾",
    gender: "male",
    id: "SOYHLrjzK2X1ezoPC6cr",
    language: "ms",
    name: "Khai",
    sampleUrl: "/series/voices/ms-khai.mp3",
    tag: "Bold & Dramatic",
  },
  {
    category: "social",
    flag: "🇲🇾",
    gender: "male",
    id: "TX3LPaxmHKxFdv7VOQHJ",
    language: "ms",
    name: "Danial",
    sampleUrl: "/series/voices/ms-adam.mp3",
    tag: "Casual & Energetic",
  },
  {
    category: "storytelling",
    flag: "🇲🇾",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "ms",
    name: "Siti",
    sampleUrl: "/series/voices/ms-siti.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇲🇾",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "ms",
    name: "Nurul",
    sampleUrl: "/series/voices/ms-nurul.mp3",
    tag: "Bright & Warm",
  },
  {
    category: "storytelling",
    flag: "🇲🇾",
    gender: "female",
    id: "XrExE9yKIg1WjnnlVkGX",
    language: "ms",
    name: "Aisyah",
    sampleUrl: "/series/voices/ms-aisyah.mp3",
    tag: "Expressive & Elegant",
  },
  {
    category: "social",
    flag: "🇲🇾",
    gender: "female",
    id: "FGY2WhTYpPnrIDTdsKH5",
    language: "ms",
    name: "Maya",
    sampleUrl: "/series/voices/ms-maya.mp3",
    tag: "Friendly & Upbeat",
  },

  // Indonesian 🇮🇩
  {
    category: "storytelling",
    flag: "🇮🇩",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "id",
    name: "Budi",
    sampleUrl: "/series/voices/id-budi.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇮🇩",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "id",
    name: "Rian",
    sampleUrl: "/series/voices/id-rian.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "conversational",
    flag: "🇮🇩",
    gender: "male",
    id: "CwhRBWXzGAHq8TQ4Fs17",
    language: "id",
    name: "Dimas",
    sampleUrl: "/series/voices/id-dimas.mp3",
    tag: "Resonant & Warm",
  },
  {
    category: "character",
    flag: "🇮🇩",
    gender: "male",
    id: "SOYHLrjzK2X1ezoPC6cr",
    language: "id",
    name: "Bayu",
    sampleUrl: "/series/voices/id-bayu.mp3",
    tag: "Deep & Authoritative",
  },
  {
    category: "social",
    flag: "🇮🇩",
    gender: "male",
    id: "TX3LPaxmHKxFdv7VOQHJ",
    language: "id",
    name: "Danial",
    sampleUrl: "/series/voices/id-danial.mp3",
    tag: "Energetic Creator",
  },
  {
    category: "storytelling",
    flag: "🇮🇩",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "id",
    name: "Dewi",
    sampleUrl: "/series/voices/id-dewi.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇮🇩",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "id",
    name: "Sari",
    sampleUrl: "/series/voices/id-sari.mp3",
    tag: "Bright & Warm",
  },
  {
    category: "storytelling",
    flag: "🇮🇩",
    gender: "female",
    id: "XrExE9yKIg1WjnnlVkGX",
    language: "id",
    name: "Putri",
    sampleUrl: "/series/voices/id-putri.mp3",
    tag: "Elegant Narrator",
  },
  {
    category: "social",
    flag: "🇮🇩",
    gender: "female",
    id: "FGY2WhTYpPnrIDTdsKH5",
    language: "id",
    name: "Nadia",
    sampleUrl: "/series/voices/id-nadia.mp3",
    tag: "Upbeat & Friendly",
  },

  // Spanish 🇪🇸
  {
    category: "storytelling",
    flag: "🇪🇸",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "es",
    name: "Mateo",
    sampleUrl: "/series/voices/es-mateo.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇪🇸",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "es",
    name: "Diego",
    sampleUrl: "/series/voices/es-diego.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "conversational",
    flag: "🇪🇸",
    gender: "male",
    id: "CwhRBWXzGAHq8TQ4Fs17",
    language: "es",
    name: "Alejandro",
    sampleUrl: "/series/voices/es-alejandro.mp3",
    tag: "Resonant & Expressive",
  },
  {
    category: "social",
    flag: "🇪🇸",
    gender: "male",
    id: "TX3LPaxmHKxFdv7VOQHJ",
    language: "es",
    name: "Javier",
    sampleUrl: "/series/voices/es-javier.mp3",
    tag: "Energetic Creator",
  },
  {
    category: "storytelling",
    flag: "🇪🇸",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "es",
    name: "Sofia",
    sampleUrl: "/series/voices/es-sofia.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇪🇸",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "es",
    name: "Valentina",
    sampleUrl: "/series/voices/es-valentina.mp3",
    tag: "Bright & Warm",
  },
  {
    category: "storytelling",
    flag: "🇪🇸",
    gender: "female",
    id: "XrExE9yKIg1WjnnlVkGX",
    language: "es",
    name: "Carmen",
    sampleUrl: "/series/voices/es-carmen.mp3",
    tag: "Poised & Captivating",
  },
  {
    category: "social",
    flag: "🇪🇸",
    gender: "female",
    id: "FGY2WhTYpPnrIDTdsKH5",
    language: "es",
    name: "Lucía",
    sampleUrl: "/series/voices/es-lucia.mp3",
    tag: "Friendly & Vibrant",
  },

  // French 🇫🇷
  {
    category: "storytelling",
    flag: "🇫🇷",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "fr",
    name: "Antoine",
    sampleUrl: "/series/voices/fr-antoine.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇫🇷",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "fr",
    name: "Hugo",
    sampleUrl: "/series/voices/fr-hugo.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "conversational",
    flag: "🇫🇷",
    gender: "male",
    id: "CwhRBWXzGAHq8TQ4Fs17",
    language: "fr",
    name: "Louis",
    sampleUrl: "/series/voices/fr-louis.mp3",
    tag: "Warm & Refined",
  },
  {
    category: "social",
    flag: "🇫🇷",
    gender: "male",
    id: "TX3LPaxmHKxFdv7VOQHJ",
    language: "fr",
    name: "Lucas",
    sampleUrl: "/series/voices/fr-lucas.mp3",
    tag: "Dynamic & Youthful",
  },
  {
    category: "storytelling",
    flag: "🇫🇷",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "fr",
    name: "Camille",
    sampleUrl: "/series/voices/fr-camille.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇫🇷",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "fr",
    name: "Manon",
    sampleUrl: "/series/voices/fr-manon.mp3",
    tag: "Bright & Warm",
  },
  {
    category: "storytelling",
    flag: "🇫🇷",
    gender: "female",
    id: "XrExE9yKIg1WjnnlVkGX",
    language: "fr",
    name: "Juliette",
    sampleUrl: "/series/voices/fr-juliette.mp3",
    tag: "Graceful Narrator",
  },
  {
    category: "social",
    flag: "🇫🇷",
    gender: "female",
    id: "FGY2WhTYpPnrIDTdsKH5",
    language: "fr",
    name: "Chloé",
    sampleUrl: "/series/voices/fr-chloe.mp3",
    tag: "Sparkling & Upbeat",
  },

  // German 🇩🇪
  {
    category: "storytelling",
    flag: "🇩🇪",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "de",
    name: "Lukas",
    sampleUrl: "/series/voices/de-lukas.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇩🇪",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "de",
    name: "Felix",
    sampleUrl: "/series/voices/de-felix.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "conversational",
    flag: "🇩🇪",
    gender: "male",
    id: "CwhRBWXzGAHq8TQ4Fs17",
    language: "de",
    name: "Jonas",
    sampleUrl: "/series/voices/de-jonas.mp3",
    tag: "Warm & Balanced",
  },
  {
    category: "social",
    flag: "🇩🇪",
    gender: "male",
    id: "TX3LPaxmHKxFdv7VOQHJ",
    language: "de",
    name: "Max",
    sampleUrl: "/series/voices/de-max.mp3",
    tag: "Energetic & Fresh",
  },
  {
    category: "storytelling",
    flag: "🇩🇪",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "de",
    name: "Hannah",
    sampleUrl: "/series/voices/de-hannah.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇩🇪",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "de",
    name: "Lena",
    sampleUrl: "/series/voices/de-lena.mp3",
    tag: "Bright & Warm",
  },
  {
    category: "storytelling",
    flag: "🇩🇪",
    gender: "female",
    id: "XrExE9yKIg1WjnnlVkGX",
    language: "de",
    name: "Mia",
    sampleUrl: "/series/voices/de-mia.mp3",
    tag: "Poised Storyteller",
  },
  {
    category: "social",
    flag: "🇩🇪",
    gender: "female",
    id: "FGY2WhTYpPnrIDTdsKH5",
    language: "de",
    name: "Emma",
    sampleUrl: "/series/voices/de-emma.mp3",
    tag: "Cheerful & Engaging",
  },

  // Italian 🇮🇹
  {
    category: "storytelling",
    flag: "🇮🇹",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "it",
    name: "Giovanni",
    sampleUrl: "/series/voices/it-giovanni.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇮🇹",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "it",
    name: "Marco",
    sampleUrl: "/series/voices/it-marco.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "storytelling",
    flag: "🇮🇹",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "it",
    name: "Chiara",
    sampleUrl: "/series/voices/it-chiara.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇮🇹",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "it",
    name: "Giulia",
    sampleUrl: "/series/voices/it-giulia.mp3",
    tag: "Bright & Warm",
  },

  // Portuguese 🇧🇷
  {
    category: "storytelling",
    flag: "🇧🇷",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "pt",
    name: "Lucas",
    sampleUrl: "/series/voices/pt-lucas.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇧🇷",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "pt",
    name: "Thiago",
    sampleUrl: "/series/voices/pt-thiago.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "storytelling",
    flag: "🇧🇷",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "pt",
    name: "Camila",
    sampleUrl: "/series/voices/pt-camila.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇧🇷",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "pt",
    name: "Beatriz",
    sampleUrl: "/series/voices/pt-beatriz.mp3",
    tag: "Bright & Warm",
  },

  // Japanese 🇯🇵
  {
    category: "storytelling",
    flag: "🇯🇵",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "ja",
    name: "Kenji",
    sampleUrl: "/series/voices/ja-kenji.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇯🇵",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "ja",
    name: "Daiki",
    sampleUrl: "/series/voices/ja-daiki.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "conversational",
    flag: "🇯🇵",
    gender: "male",
    id: "CwhRBWXzGAHq8TQ4Fs17",
    language: "ja",
    name: "Ren",
    sampleUrl: "/series/voices/ja-ren.mp3",
    tag: "Calm & Resonant",
  },
  {
    category: "social",
    flag: "🇯🇵",
    gender: "male",
    id: "TX3LPaxmHKxFdv7VOQHJ",
    language: "ja",
    name: "Haruto",
    sampleUrl: "/series/voices/ja-haruto.mp3",
    tag: "Youthful & Bright",
  },
  {
    category: "storytelling",
    flag: "🇯🇵",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "ja",
    name: "Sakura",
    sampleUrl: "/series/voices/ja-sakura.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇯🇵",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "ja",
    name: "Yuka",
    sampleUrl: "/series/voices/ja-yuka.mp3",
    tag: "Bright & Warm",
  },
  {
    category: "storytelling",
    flag: "🇯🇵",
    gender: "female",
    id: "XrExE9yKIg1WjnnlVkGX",
    language: "ja",
    name: "Aoi",
    sampleUrl: "/series/voices/ja-aoi.mp3",
    tag: "Gentle & Expressive",
  },
  {
    category: "social",
    flag: "🇯🇵",
    gender: "female",
    id: "FGY2WhTYpPnrIDTdsKH5",
    language: "ja",
    name: "Hina",
    sampleUrl: "/series/voices/ja-hina.mp3",
    tag: "Cheerful Creator",
  },

  // Korean 🇰🇷
  {
    category: "storytelling",
    flag: "🇰🇷",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "ko",
    name: "Minho",
    sampleUrl: "/series/voices/ko-minho.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇰🇷",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "ko",
    name: "Junseo",
    sampleUrl: "/series/voices/ko-junseo.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "conversational",
    flag: "🇰🇷",
    gender: "male",
    id: "CwhRBWXzGAHq8TQ4Fs17",
    language: "ko",
    name: "Do-hyun",
    sampleUrl: "/series/voices/ko-dohyun.mp3",
    tag: "Warm & Trustworthy",
  },
  {
    category: "social",
    flag: "🇰🇷",
    gender: "male",
    id: "TX3LPaxmHKxFdv7VOQHJ",
    language: "ko",
    name: "Min-jae",
    sampleUrl: "/series/voices/ko-minjae.mp3",
    tag: "Energetic Creator",
  },
  {
    category: "storytelling",
    flag: "🇰🇷",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "ko",
    name: "Jiwoo",
    sampleUrl: "/series/voices/ko-jiwoo.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇰🇷",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "ko",
    name: "Sohee",
    sampleUrl: "/series/voices/ko-sohee.mp3",
    tag: "Bright & Warm",
  },
  {
    category: "storytelling",
    flag: "🇰🇷",
    gender: "female",
    id: "XrExE9yKIg1WjnnlVkGX",
    language: "ko",
    name: "Seo-yeon",
    sampleUrl: "/series/voices/ko-seoyeon.mp3",
    tag: "Expressive Narrator",
  },
  {
    category: "social",
    flag: "🇰🇷",
    gender: "female",
    id: "FGY2WhTYpPnrIDTdsKH5",
    language: "ko",
    name: "Yu-na",
    sampleUrl: "/series/voices/ko-yuna.mp3",
    tag: "Bright & Lively",
  },

  // Chinese 🇨🇳
  {
    category: "storytelling",
    flag: "🇨🇳",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "zh",
    name: "Wei",
    sampleUrl: "/series/voices/zh-wei.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇨🇳",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "zh",
    name: "Chen",
    sampleUrl: "/series/voices/zh-chen.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "conversational",
    flag: "🇨🇳",
    gender: "male",
    id: "CwhRBWXzGAHq8TQ4Fs17",
    language: "zh",
    name: "Hao",
    sampleUrl: "/series/voices/zh-hao.mp3",
    tag: "Steady & Resonant",
  },
  {
    category: "social",
    flag: "🇨🇳",
    gender: "male",
    id: "TX3LPaxmHKxFdv7VOQHJ",
    language: "zh",
    name: "Bowen",
    sampleUrl: "/series/voices/zh-bowen.mp3",
    tag: "Vibrant Creator",
  },
  {
    category: "storytelling",
    flag: "🇨🇳",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "zh",
    name: "Jing",
    sampleUrl: "/series/voices/zh-jing.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇨🇳",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "zh",
    name: "Meiling",
    sampleUrl: "/series/voices/zh-meiling.mp3",
    tag: "Bright & Warm",
  },
  {
    category: "storytelling",
    flag: "🇨🇳",
    gender: "female",
    id: "XrExE9yKIg1WjnnlVkGX",
    language: "zh",
    name: "Xiaoyan",
    sampleUrl: "/series/voices/zh-xiaoyan.mp3",
    tag: "Gentle & Captivating",
  },
  {
    category: "social",
    flag: "🇨🇳",
    gender: "female",
    id: "FGY2WhTYpPnrIDTdsKH5",
    language: "zh",
    name: "Tingting",
    sampleUrl: "/series/voices/zh-tingting.mp3",
    tag: "Upbeat & Friendly",
  },

  // Hindi 🇮🇳
  {
    category: "storytelling",
    flag: "🇮🇳",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "hi",
    name: "Aarav",
    sampleUrl: "/series/voices/hi-aarav.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇮🇳",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "hi",
    name: "Rohan",
    sampleUrl: "/series/voices/hi-rohan.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "storytelling",
    flag: "🇮🇳",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "hi",
    name: "Priya",
    sampleUrl: "/series/voices/hi-priya.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇮🇳",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "hi",
    name: "Ananya",
    sampleUrl: "/series/voices/hi-ananya.mp3",
    tag: "Bright & Warm",
  },

  // Arabic 🇸🇦
  {
    category: "storytelling",
    flag: "🇸🇦",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "ar",
    name: "Tariq",
    sampleUrl: "/series/voices/ar-tariq.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇸🇦",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "ar",
    name: "Omar",
    sampleUrl: "/series/voices/ar-omar.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "conversational",
    flag: "🇸🇦",
    gender: "male",
    id: "CwhRBWXzGAHq8TQ4Fs17",
    language: "ar",
    name: "Zayd",
    sampleUrl: "/series/voices/ar-zayd.mp3",
    tag: "Warm & Articulate",
  },
  {
    category: "social",
    flag: "🇸🇦",
    gender: "male",
    id: "TX3LPaxmHKxFdv7VOQHJ",
    language: "ar",
    name: "Karim",
    sampleUrl: "/series/voices/ar-karim.mp3",
    tag: "Energetic Narrator",
  },
  {
    category: "storytelling",
    flag: "🇸🇦",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "ar",
    name: "Layla",
    sampleUrl: "/series/voices/ar-layla.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇸🇦",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "ar",
    name: "Yasmin",
    sampleUrl: "/series/voices/ar-yasmin.mp3",
    tag: "Bright & Warm",
  },
  {
    category: "storytelling",
    flag: "🇸🇦",
    gender: "female",
    id: "XrExE9yKIg1WjnnlVkGX",
    language: "ar",
    name: "Nour",
    sampleUrl: "/series/voices/ar-nour.mp3",
    tag: "Expressive & Poised",
  },
  {
    category: "social",
    flag: "🇸🇦",
    gender: "female",
    id: "FGY2WhTYpPnrIDTdsKH5",
    language: "ar",
    name: "Maryam",
    sampleUrl: "/series/voices/ar-maryam.mp3",
    tag: "Lively & Engaging",
  },

  // Russian 🇷🇺
  {
    category: "storytelling",
    flag: "🇷🇺",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "ru",
    name: "Dimitri",
    sampleUrl: "/series/voices/ru-dimitri.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇷🇺",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "ru",
    name: "Mikhail",
    sampleUrl: "/series/voices/ru-mikhail.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "storytelling",
    flag: "🇷🇺",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "ru",
    name: "Anastasia",
    sampleUrl: "/series/voices/ru-anastasia.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇷🇺",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "ru",
    name: "Elena",
    sampleUrl: "/series/voices/ru-elena.mp3",
    tag: "Bright & Warm",
  },

  // Vietnamese 🇻🇳
  {
    category: "storytelling",
    flag: "🇻🇳",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "vi",
    name: "Minh",
    sampleUrl: "/series/voices/vi-minh.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇻🇳",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "vi",
    name: "Nam",
    sampleUrl: "/series/voices/vi-nam.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "storytelling",
    flag: "🇻🇳",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "vi",
    name: "Linh",
    sampleUrl: "/series/voices/vi-linh.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇻🇳",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "vi",
    name: "Mai",
    sampleUrl: "/series/voices/vi-mai.mp3",
    tag: "Bright & Warm",
  },

  // Thai 🇹🇭
  {
    category: "storytelling",
    flag: "🇹🇭",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "th",
    name: "Somchai",
    sampleUrl: "/series/voices/th-somchai.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇹🇭",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "th",
    name: "Arthit",
    sampleUrl: "/series/voices/th-arthit.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "storytelling",
    flag: "🇹🇭",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "th",
    name: "Anong",
    sampleUrl: "/series/voices/th-anong.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇹🇭",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "th",
    name: "Mali",
    sampleUrl: "/series/voices/th-mali.mp3",
    tag: "Bright & Warm",
  },

  // Filipino 🇵🇭
  {
    category: "storytelling",
    flag: "🇵🇭",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "tl",
    name: "Joshua",
    sampleUrl: "/series/voices/tl-joshua.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇵🇭",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "tl",
    name: "Carlo",
    sampleUrl: "/series/voices/tl-carlo.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "storytelling",
    flag: "🇵🇭",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "tl",
    name: "Maria",
    sampleUrl: "/series/voices/tl-maria.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇵🇭",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "tl",
    name: "Angel",
    sampleUrl: "/series/voices/tl-angel.mp3",
    tag: "Bright & Warm",
  },

  // Turkish 🇹🇷
  {
    category: "storytelling",
    flag: "🇹🇷",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "tr",
    name: "Emre",
    sampleUrl: "/series/voices/tr-emre.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇹🇷",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "tr",
    name: "Can",
    sampleUrl: "/series/voices/tr-can.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "storytelling",
    flag: "🇹🇷",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "tr",
    name: "Elif",
    sampleUrl: "/series/voices/tr-elif.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇹🇷",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "tr",
    name: "Zeynep",
    sampleUrl: "/series/voices/tr-zeynep.mp3",
    tag: "Bright & Warm",
  },

  // Polish 🇵🇱
  {
    category: "storytelling",
    flag: "🇵🇱",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "pl",
    name: "Jan",
    sampleUrl: "/series/voices/pl-jan.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇵🇱",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "pl",
    name: "Piotr",
    sampleUrl: "/series/voices/pl-piotr.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "storytelling",
    flag: "🇵🇱",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "pl",
    name: "Zofia",
    sampleUrl: "/series/voices/pl-zofia.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇵🇱",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "pl",
    name: "Maja",
    sampleUrl: "/series/voices/pl-maja.mp3",
    tag: "Bright & Warm",
  },

  // Dutch 🇳🇱
  {
    category: "storytelling",
    flag: "🇳🇱",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "nl",
    name: "Daan",
    sampleUrl: "/series/voices/nl-daan.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇳🇱",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "nl",
    name: "Lars",
    sampleUrl: "/series/voices/nl-lars.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "storytelling",
    flag: "🇳🇱",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "nl",
    name: "Emma",
    sampleUrl: "/series/voices/nl-emma.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇳🇱",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "nl",
    name: "Sanne",
    sampleUrl: "/series/voices/nl-sanne.mp3",
    tag: "Bright & Warm",
  },

  // Swedish 🇸🇪
  {
    category: "storytelling",
    flag: "🇸🇪",
    gender: "male",
    id: "pNInz6obpgDQGcFmaJgB",
    language: "sv",
    name: "Erik",
    sampleUrl: "/series/voices/sv-erik.mp3",
    tag: "Viral Storyteller",
  },
  {
    category: "documentary",
    flag: "🇸🇪",
    gender: "male",
    id: "nPczCjzI2devNBz1zQrb",
    language: "sv",
    name: "Nils",
    sampleUrl: "/series/voices/sv-nils.mp3",
    tag: "Deep Documentary",
  },
  {
    category: "storytelling",
    flag: "🇸🇪",
    gender: "female",
    id: "EXAVITQu4vr4xnSDxMaL",
    language: "sv",
    name: "Mimi",
    sampleUrl: "/series/voices/sv-mimi.mp3",
    tag: "Confident Narrator",
  },
  {
    category: "conversational",
    flag: "🇸🇪",
    gender: "female",
    id: "cgSgspJ2msm6clMCkdW9",
    language: "sv",
    name: "Astrid",
    sampleUrl: "/series/voices/sv-astrid.mp3",
    tag: "Bright & Warm",
  },
] as const;

export interface SeriesMusicTrack {
  id: string;
  title: string;
  description: string;
  url: string;
}

export const SERIES_MUSIC_PRESETS: readonly SeriesMusicTrack[] = [
  {
    description: "Haunting and unsettling melody",
    id: "creepy-melody",
    title: "Creepy melody",
    url: "/series/music/creepy-melody.mp3",
  },
  {
    description: "Dark and chilling piano keys",
    id: "horror-piano",
    title: "Horror piano",
    url: "/series/music/horror-piano.mp3",
  },
  {
    description: "Suspenseful and intriguing atmosphere",
    id: "unsolved-mystery",
    title: "Unsolved mystery",
    url: "/series/music/unsolved-mystery.mp3",
  },
  {
    description: "Eerie chiptune with a haunting retro feel",
    id: "8-bit-slowed",
    title: "8-bit slowed",
    url: "/series/music/8-bit-slowed.mp3",
  },
  {
    description: "Building tension and anticipation for dramatic reveals",
    id: "quiet-before-storm",
    title: "Quiet before storm",
    url: "/series/music/quiet-before-storm.mp3",
  },
  {
    description: "Orchestral and majestic for epic storytelling",
    id: "brilliant-symphony",
    title: "Brilliant symphony",
    url: "/series/music/brilliant-symphony.mp3",
  },
] as const;

export interface SeriesArtStyle {
  id: string;
  name: string;
  image: string;
}

export const SERIES_ART_STYLES: readonly SeriesArtStyle[] = [
  {
    id: "comic",
    image: "/series/art-styles/comic.png",
    name: "Comic",
  },
  {
    id: "creepy-comic",
    image: "/series/art-styles/creepy-comic.png",
    name: "Creepy Comic",
  },
  {
    id: "modern-cartoon",
    image: "/series/art-styles/modern-cartoon.png",
    name: "Modern Cartoon",
  },
  {
    id: "disney",
    image: "/series/art-styles/disney.png",
    name: "Disney",
  },
  {
    id: "anime",
    image: "/series/art-styles/anime.png",
    name: "Anime",
  },
  {
    id: "dark-fantasy",
    image: "/series/art-styles/dark-fantasy.png",
    name: "Dark Fantasy",
  },
  {
    id: "fantastic",
    image: "/series/art-styles/fantastic.png",
    name: "Fantastic",
  },
  {
    id: "ghibli",
    image: "/series/art-styles/ghibli.png",
    name: "Ghibli",
  },
  {
    id: "lego",
    image: "/series/art-styles/lego.png",
    name: "Lego",
  },
  {
    id: "mythology",
    image: "/series/art-styles/mythology.png",
    name: "Mythology",
  },
  {
    id: "painting",
    image: "/series/art-styles/painting.png",
    name: "Painting",
  },
  {
    id: "pixel-art",
    image: "/series/art-styles/pixel-art.png",
    name: "Pixel Art",
  },
  {
    id: "polaroid",
    image: "/series/art-styles/polaroid.png",
    name: "Polaroid",
  },
  {
    id: "realism",
    image: "/series/art-styles/realism.png",
    name: "Realism",
  },
] as const;

export interface SeriesCaptionStyle {
  id: string;
  name: string;
}

export const SERIES_CAPTION_STYLES: readonly SeriesCaptionStyle[] = [
  { id: "bold-stroke", name: "Bold Stroke" },
  { id: "red-highlight", name: "Red Highlight" },
  { id: "sleek", name: "Sleek" },
  { id: "karaoke", name: "Karaoke" },
  { id: "majestic", name: "Majestic" },
  { id: "beast", name: "Beast" },
  { id: "elegant", name: "Elegant" },
  { id: "pixel", name: "Pixel" },
  { id: "clarity", name: "Clarity" },
] as const;

export interface SeriesEffect {
  id: string;
  name: string;
  description: string;
  isNew?: boolean;
}

export const SERIES_EFFECTS: readonly SeriesEffect[] = [
  {
    id: "glitch",
    name: "Glitch effect",
    description:
      "Glitches the subject with chromatic distortion and eerie shake — perfect for horror, thrillers, and scary content.",
    isNew: true,
  },
] as const;

export interface SeriesDurationOption {
  id: string;
  label: string;
  monetizable?: boolean;
}

export const SERIES_DURATIONS: readonly SeriesDurationOption[] = [
  {
    id: "30-40",
    label: "30-40 seconds",
  },
  {
    id: "60-70",
    label: "60-70 seconds",
    monetizable: true,
  },
] as const;

export const createSeriesInputSchema = z.object({
  name: z.string().trim().min(1, "Series name is required").max(100),
  nichePresetId: z.string().optional(),
  nichePrompt: z.string().trim().min(1, "Niche prompt is required"),
  exampleScript: z.string().optional(),
  language: z.string().default("en"),
  voiceId: z.string().min(1, "Voice is required"),
  musicTrackId: z.string().optional(),
  customMusicKey: z.string().optional(),
  customMusicUrl: z.string().optional(),
  tiktokSounds: z.string().optional(),
  artStyleId: z.string().min(1, "Art style is required"),
  captionStyleId: z.string().min(1, "Caption style is required"),
  glitchEffect: z.boolean().default(true),
  videoDuration: z.string().default("30-40"),
  publishTime: z.string().default("12:00 PM"),
  socialConnectionIds: z.array(z.string()).default([]),
});

export type CreateSeriesInput = z.infer<typeof createSeriesInputSchema>;

export const createSeriesOutputSchema = z.object({
  success: z.boolean(),
  seriesId: z.string(),
  name: z.string(),
});

export type CreateSeriesOutput = z.infer<typeof createSeriesOutputSchema>;

export const SERIES_STATUSES = ["ACTIVE", "PAUSED", "ARCHIVED"] as const;

export type SeriesStatus = (typeof SERIES_STATUSES)[number];

export const EPISODE_STATUSES = [
  "PENDING",
  "GENERATING",
  "READY_FOR_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "FAILED",
] as const;

export type EpisodeStatus = (typeof EPISODE_STATUSES)[number];

export const getSeriesListOutputSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    nichePresetId: z.string().nullable().optional(),
    language: z.string(),
    voiceId: z.string(),
    artStyleId: z.string(),
    captionStyleId: z.string(),
    videoDuration: z.string(),
    publishTime: z.string(),
    status: z.enum(SERIES_STATUSES),
    createdAt: z.string(),
    updatedAt: z.string(),
    episodeCount: z.number().int(),
    socialAccountCount: z.number().int(),
    platforms: z.array(z.enum(["TIKTOK", "YOUTUBE", "INSTAGRAM"])).optional(),
  })
);

export type GetSeriesListOutput = z.infer<typeof getSeriesListOutputSchema>;

export const getSeriesByIdInputSchema = z.object({
  id: z.string().min(1),
});

export type GetSeriesByIdInput = z.infer<typeof getSeriesByIdInputSchema>;

export const getSeriesByIdOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  nichePresetId: z.string().nullable(),
  nichePrompt: z.string(),
  exampleScript: z.string().nullable(),
  language: z.string(),
  voiceId: z.string(),
  musicTrackId: z.string().nullable(),
  customMusicKey: z.string().nullable().optional(),
  customMusicUrl: z.string().nullable().optional(),
  tiktokSounds: z.string().nullable(),
  artStyleId: z.string(),
  captionStyleId: z.string(),
  glitchEffect: z.boolean(),
  videoDuration: z.string(),
  publishTime: z.string(),
  status: z.enum(SERIES_STATUSES),
  createdAt: z.string(),
  updatedAt: z.string(),
  socialAccounts: z.array(
    z.object({
      id: z.string(),
      socialConnectionId: z.string(),
      platform: z.enum(["TIKTOK", "YOUTUBE", "INSTAGRAM"]),
      platformUserName: z.string(),
      avatarUrl: z.string().nullable(),
    })
  ),
  episodes: z.array(
    z.object({
      id: z.string(),
      episodeNumber: z.number().int(),
      title: z.string(),
      topic: z.string().nullable(),
      status: z.enum(EPISODE_STATUSES),
      videoUrl: z.string().nullable(),
      thumbnailUrl: z.string().nullable(),
      scheduledFor: z.string().nullable(),
      publishedAt: z.string().nullable(),
      createdAt: z.string(),
    })
  ),
});

export type GetSeriesByIdOutput = z.infer<typeof getSeriesByIdOutputSchema>;

export const updateSeriesStatusInputSchema = z.object({
  id: z.string().min(1),
  status: z.enum(SERIES_STATUSES),
});

export type UpdateSeriesStatusInput = z.infer<
  typeof updateSeriesStatusInputSchema
>;

export const updateSeriesStatusOutputSchema = z.object({
  success: z.boolean(),
  id: z.string(),
  status: z.enum(SERIES_STATUSES),
});

export type UpdateSeriesStatusOutput = z.infer<
  typeof updateSeriesStatusOutputSchema
>;

export const updateSeriesInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  publishTime: z.string().optional(),
});

export type UpdateSeriesInput = z.infer<typeof updateSeriesInputSchema>;

export const updateSeriesOutputSchema = z.object({
  success: z.boolean(),
  id: z.string(),
});

export type UpdateSeriesOutput = z.infer<typeof updateSeriesOutputSchema>;

export const deleteSeriesInputSchema = z.object({
  id: z.string().min(1),
});

export type DeleteSeriesInput = z.infer<typeof deleteSeriesInputSchema>;

export const deleteSeriesOutputSchema = z.object({
  success: z.boolean(),
});

export type DeleteSeriesOutput = z.infer<typeof deleteSeriesOutputSchema>;
