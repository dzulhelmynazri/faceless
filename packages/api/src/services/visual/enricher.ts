const ART_STYLE_MODIFIERS = {
  comic:
    "vintage American comic book style, bold ink line art, halftone dot shading, dynamic action angle, vibrant graphic novel aesthetic",
  "creepy-comic":
    "eerie graphic novel horror aesthetic, deep stark shadows, grotesque ink hatching, desaturated palette with blood red accents, gritty atmosphere",
  "modern-cartoon":
    "modern vibrant 2D cartoon style, clean vector outlines, playful bright lighting, contemporary animation studio aesthetic",
  disney:
    "whimsical 3D animation style, expressive character faces, magical glowing ambient lighting, Pixar Disney render, Unreal Engine 5",
  anime:
    "high-end Japanese anime aesthetic, Makoto Shinkai sky and volumetric lighting, crisp cel-shaded lines, cinematic composition",
  "dark-fantasy":
    "dark gothic fantasy oil painting, Elden Ring and Dark Souls atmosphere, chiaroscuro lighting, eerie fog, gritty textures",
  fantastic:
    "surreal fantasy world, vibrant bioluminescent flora, ethereal magical atmosphere, dreamlike epic landscape",
  ghibli:
    "hand-painted Studio Ghibli gouache background, soft nostalgic watercolor textures, lush greenery, pastoral peaceful mood",
  lego: "miniature Lego brick diorama, glossy plastic brick textures, macro tilt-shift photography, playful construction",
  mythology:
    "ancient classical mythological fresco, marble statues, golden hour divine sunlight, epic Hellenic or Norse lore illustration",
  painting:
    "textured classical canvas oil painting, visible expressive impasto brushstrokes, rich warm palette, museum masterpiece",
  "pixel-art":
    "retro 16-bit pixel art, detailed pixel shading, nostalgic arcade RPG aesthetic, vibrant color palette, crisp pixel grid",
  polaroid:
    "vintage 90s instant Polaroid photograph, film grain, soft lens flare, bleached highlights, nostalgic candid snapshot",
  realism:
    "35mm cinematic photograph, realistic skin textures, natural directional lighting, shallow depth of field, 8k photorealistic",
} as const;

const VERTICAL_COMPOSITION_TOKENS =
  "vertical 9:16 portrait aspect ratio, full vertical composition, cinematic lighting, high production value";

const TEXT_SUPPRESSION_TOKENS =
  "clean visual, no text, no captions, no subtitles, no words, no watermarks, no split screens, no borders";

export interface EnrichPromptInput {
  visualPrompt: string;
  artStyleId: string;
}

export const enrichPromptWithStyle = ({
  visualPrompt,
  artStyleId,
}: EnrichPromptInput): string => {
  const isKnownStyle = (id: string): id is keyof typeof ART_STYLE_MODIFIERS =>
    id in ART_STYLE_MODIFIERS;

  const styleModifier = isKnownStyle(artStyleId)
    ? ART_STYLE_MODIFIERS[artStyleId]
    : ART_STYLE_MODIFIERS.realism;

  return `${visualPrompt.trim()}, ${styleModifier}, ${VERTICAL_COMPOSITION_TOKENS}, ${TEXT_SUPPRESSION_TOKENS}`;
};
