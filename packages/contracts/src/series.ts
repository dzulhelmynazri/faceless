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

export const selectNicheSchema = z.object({
  customDescription: z.string().optional(),
  mode: z.enum(["preset", "custom"]),
  presetId: z.string().optional(),
});

export type SelectNicheInput = z.infer<typeof selectNicheSchema>;

export interface SeriesVoice {
  id: string;
  name: string;
  gender: "male" | "female";
  tag: string;
}

export interface SeriesLanguage {
  code: string;
  label: string;
  flag: string;
}

export const SERIES_LANGUAGES: readonly SeriesLanguage[] = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Spanish" },
  { code: "fr", flag: "🇫🇷", label: "French" },
  { code: "de", flag: "🇩🇪", label: "German" },
  { code: "hi", flag: "🇮🇳", label: "Hindi" },
  { code: "it", flag: "🇮🇹", label: "Italian" },
  { code: "ja", flag: "🇯🇵", label: "Japanese" },
  { code: "ko", flag: "🇰🇷", label: "Korean" },
  { code: "ms", flag: "🇲🇾", label: "Malay" },
  { code: "pl", flag: "🇵🇱", label: "Polish" },
  { code: "pt", flag: "🇵🇹", label: "Portuguese" },
  { code: "tr", flag: "🇹🇷", label: "Turkish" },
] as const;

export const SERIES_VOICES: readonly SeriesVoice[] = [
  // Row 1
  { gender: "male", id: "adam", name: "Adam", tag: "Confident" },
  { gender: "female", id: "brittney", name: "Brittney", tag: "Energetic" },
  { gender: "male", id: "jonah", name: "Jonah", tag: "Storyteller" },

  // Row 2
  { gender: "female", id: "hope", name: "Hope", tag: "Bright" },
  { gender: "male", id: "jamal", name: "Jamal", tag: "Chill" },
  { gender: "female", id: "zara", name: "Zara", tag: "Conversational" },

  // Row 3
  { gender: "male", id: "peter", name: "Peter", tag: "Confident" },
  { gender: "female", id: "jessica", name: "Jessica", tag: "Conversational" },
  { gender: "male", id: "james", name: "James", tag: "Husky" },

  // Row 4
  { gender: "female", id: "jessa", name: "Jessa", tag: "Casual" },
  { gender: "male", id: "brian", name: "Brian", tag: "Deep" },
  { gender: "female", id: "danielle", name: "Danielle", tag: "Canadian" },

  // Row 5
  { gender: "male", id: "michael", name: "Michael", tag: "Conversational" },
  { gender: "female", id: "lily", name: "Lily", tag: "Expressive" },
  { gender: "male", id: "hunter", name: "Hunter", tag: "Gritty" },

  // Row 6
  { gender: "female", id: "victoria", name: "Victoria", tag: "Upbeat" },
  { gender: "male", id: "archer", name: "Archer", tag: "British" },
  { gender: "female", id: "veda", name: "Veda", tag: "Eerie" },

  // Row 7
  { gender: "male", id: "ian", name: "Ian", tag: "Mysterious" },
  { gender: "female", id: "freya", name: "Freya", tag: "Australian" },
  { gender: "male", id: "liam", name: "Liam", tag: "Warm" },

  // Row 8
  { gender: "female", id: "lauren", name: "Lauren", tag: "Mysterious" },
  { gender: "male", id: "sully", name: "Sully", tag: "Deep" },
  { gender: "female", id: "riley", name: "Riley", tag: "Energetic" },

  // Row 9
  { gender: "male", id: "vincent", name: "Vincent", tag: "Suspenseful" },
  { gender: "female", id: "laura", name: "Laura", tag: "Irish" },
  { gender: "male", id: "titan", name: "Titan", tag: "Powerful" },

  // Row 10
  { gender: "female", id: "autumn", name: "Autumn", tag: "Calm" },
  { gender: "male", id: "knox", name: "Knox", tag: "Serious" },
  { gender: "female", id: "lorraine", name: "Lorraine", tag: "Wise" },

  // Row 11
  { gender: "male", id: "tom", name: "Tom", tag: "Australian" },
  { gender: "female", id: "misha", name: "Misha", tag: "Bold" },
  { gender: "male", id: "declan", name: "Declan", tag: "Eerie" },

  // Row 12
  { gender: "female", id: "isla", name: "Isla", tag: "Scottish" },
  { gender: "male", id: "spuds", name: "Spuds", tag: "Grandpa" },
  { gender: "female", id: "nayva", name: "Nayva", tag: "Intense" },

  // Row 13
  { gender: "male", id: "chuck", name: "Chuck", tag: "Raspy" },
  { gender: "female", id: "empress", name: "Empress", tag: "Smoky" },
  { gender: "male", id: "david", name: "David", tag: "Cinematic" },

  // Row 14
  { gender: "female", id: "mae", name: "Mae", tag: "Southern" },
  { gender: "male", id: "matt", name: "Matt", tag: "Casual" },
  { gender: "female", id: "vanessa", name: "Vanessa", tag: "Soft" },

  // Row 15
  { gender: "male", id: "edwin", name: "Edwin", tag: "Warm" },
  { gender: "female", id: "ravenna", name: "Ravenna", tag: "Villain" },
  { gender: "male", id: "jedediah", name: "Jedediah", tag: "Southern" },

  // Row 16
  { gender: "male", id: "angus", name: "Angus", tag: "Scottish" },
  { gender: "male", id: "wyatt", name: "Wyatt", tag: "Cowboy" },
  { gender: "male", id: "astro", name: "Astro", tag: "Smooth" },

  // Row 17
  { gender: "male", id: "alex", name: "Alex", tag: "Upbeat" },
  { gender: "male", id: "nassim", name: "Nassim", tag: "Powerful" },
  { gender: "male", id: "john", name: "John", tag: "Storyteller" },

  // Row 18
  { gender: "male", id: "justin", name: "Justin", tag: "Clear" },
  { gender: "female", id: "monika", name: "Monika", tag: "Indian" },
  { gender: "male", id: "olaniyi", name: "Olaniyi", tag: "Nigerian" },

  // Row 19
  { gender: "female", id: "thandi", name: "Thandi", tag: "South African" },
  { gender: "male", id: "ruhaan", name: "Ruhaan", tag: "Indian" },
  { gender: "female", id: "tolani", name: "Tolani", tag: "Nigerian" },

  // Row 20
  { gender: "male", id: "denzel", name: "Denzel", tag: "Jamaican" },
  { gender: "female", id: "annakay", name: "Annakay", tag: "Jamaican" },
  { gender: "male", id: "ren", name: "Ren", tag: "South African" },
] as const;

export interface SeriesMusicTrack {
  id: string;
  title: string;
  description: string;
}

export const SERIES_MUSIC_PRESETS: readonly SeriesMusicTrack[] = [
  {
    description: "Haunting and unsettling melody",
    id: "creepy-melody",
    title: "Creepy melody",
  },
  {
    description: "Dark and chilling piano keys",
    id: "horror-piano",
    title: "Horror piano",
  },
  {
    description: "Suspenseful and intriguing atmosphere",
    id: "unsolved-mystery",
    title: "Unsolved mystery",
  },
  {
    description: "Eerie chiptune with a haunting retro feel",
    id: "8-bit-slowed",
    title: "8-bit slowed",
  },
  {
    description: "Building tension and anticipation for dramatic reveals",
    id: "quiet-before-storm",
    title: "Quiet before storm",
  },
  {
    description: "Orchestral and majestic for epic storytelling",
    id: "brilliant-symphony",
    title: "Brilliant symphony",
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
