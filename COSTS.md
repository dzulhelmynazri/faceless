# SaaS Unit Economics & Generation Cost Breakdown

This document outlines the operational costs (COGS), Stripe payment fees, and net profit margins across all subscription tiers for the Faceless AI Video platform.

---

## 1. Subscription Plans

| Tier | Price | Video Allocation | Posting Cadence | Target Audience |
| :-- | :-- | :-- | :-- | :-- |
| **Starter** | **$19 / month** | **12 videos / month** | 3 videos / week | Beginners / Hobbyists |
| **Growth** | **$39 / month** | **30 videos / month** | 1 video / day | Consistent creators |
| **Pro** | **$69 / month** | **60 videos / month** | 2 videos / day | Power creators & agencies |

---

## 2. Stripe Payment Processing Fees

Stripe standard processing fee: **2.9% + $0.30** per successful charge.

| Tier | Price | Stripe Calculation | Stripe Deducts | Net Revenue Received |
| :-- | :-- | :-- | :-- | :-- |
| **Starter** | $19.00 | `($19.00 * 2.9%) + $0.30` | **$0.85** | **$18.15** |
| **Growth** | $39.00 | `($39.00 * 2.9%) + $0.30` | **$1.43** | **$37.57** |
| **Pro** | $69.00 | `($69.00 * 2.9%) + $0.30` | **$2.30** | **$66.70** |

---

## 3. Cost of Goods Sold (COGS) Per 45-Second Video

A typical faceless video has: **1 narrative script (~120 words), 1 studio voiceover track, 5 visual scenes (1 image every 8-9 seconds), dynamic animated captions, and ducked background audio.**

| Step | Provider / Service | Cost (ElevenLabs Turbo v2.5) | Cost (Edge TTS) | Details |
| :-- | :-- | :-- | :-- | :-- |
| **1. Script & Hooks** | AI Gateway (`gpt-4o-mini`) | **$0.001** | **$0.001** | ~2,000 input/output tokens |
| **2. Voiceover (TTS)** | **ElevenLabs (`eleven_turbo_v2_5`)** | **$0.030** | **$0.000** | ~600 chars (~45-60s) @ **$0.05 / 1k chars** |
| **3. Scene Visuals** | FLUX Schnell via Gateway | **$0.015** | **$0.015** | 5 scenes × $0.003 / image |
| **4. Video Rendering** | Remotion Engine | **$0.020** | **$0.020** | Compiles audio, captions, motion & scenes into MP4 |
| **5. Storage & CDN** | Cloudflare R2 (files-sdk) | **$0.001** | **$0.001** | MP4 storage with zero egress bandwidth fees |
| **Total Cost / Video** | — | **~$0.067** _(~6.7¢)_ | **~$0.037** _(~3.7¢)_ |  |

---

## 4. Profit & Margin Breakdown by Plan

### A. Using ElevenLabs Turbo v2.5 (`eleven_turbo_v2_5` @ $0.05 / 1k chars)

#### 🟢 Starter Tier: $19 / month (12 videos)

- **Gross Revenue**: $19.00
- **Stripe Fee**: -$0.85
- **Net Revenue**: $18.15
- **Video Generation Cost** (12 videos × $0.067): **-$0.80** _(ElevenLabs audio: $0.36)_
- **Net Profit**: **$17.35 / month**
- **Net Margin**: **91.3%** 🚀

#### 🔵 Growth Tier: $39 / month (30 videos — 1 daily)

- **Gross Revenue**: $39.00
- **Stripe Fee**: -$1.43
- **Net Revenue**: $37.57
- **Video Generation Cost** (30 videos × $0.067): **-$2.01** _(ElevenLabs audio: $0.90)_
- **Net Profit**: **$35.56 / month**
- **Net Margin**: **91.2%** 🚀

#### 🟣 Pro Tier: $69 / month (60 videos — 2 daily)

- **Gross Revenue**: $69.00
- **Stripe Fee**: -$2.30
- **Net Revenue**: $66.70
- **Video Generation Cost** (60 videos × $0.067): **-$4.02** _(ElevenLabs audio: $1.80)_
- **Net Profit**: **$62.68 / month**
- **Net Margin**: **90.8%** 🚀

---

### B. Using Edge TTS (Free Neural Voices)

| Tier | Price | Stripe Fee | Generation Cost | Net Profit | Net Margin |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **Starter (12 vids)** | $19.00 | $0.85 | $0.44 | **$17.71** | **93.2%** |
| **Growth (30 vids)** | $39.00 | $1.43 | $1.11 | **$36.46** | **93.5%** |
| **Pro (60 vids)** | $69.00 | $2.30 | $2.22 | **$64.48** | **93.4%** |

---

## 5. Revenue & Profit Projections at Scale (ElevenLabs Turbo v2.5)

Assumes an average customer mix: **40% Starter ($19)**, **45% Growth ($39)**, **15% Pro ($69)** $\rightarrow$ **Average Revenue Per User (ARPU) = ~$35.50 / mo**.

| Active Paying Users | Monthly Revenue (MRR) | Stripe Processing Fees | ElevenLabs + Video Compute | **Net Monthly Profit** | **Annual Run Rate (ARR)** |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **25 users** | **$888** | ~$33 | ~$104 | **~$751 / mo** | $9,012 |
| **50 users** | **$1,775** | ~$66 | ~$208 | **~$1,501 / mo** | $18,012 |
| **100 users** | **$3,550** | ~$133 | ~$415 | **~$3,002 / mo** | $36,024 |
| **250 users** | **$8,875** | ~$332 | ~$1,038 | **~$7,505 / mo** | $90,060 |
| **500 users** | **$17,750** | ~$664 | ~$2,077 | **~$15,009 / mo** | $180,108 |
| **1,000 users** | **$35,500** | ~$1,328 | ~$4,154 | **~$30,018 / mo** | $360,216 |

---

## 6. Strategic Takeaways

1. **High Margin Resilience**: Even with ElevenLabs studio-quality voice synthesis, net profit margins stay above **90%** across all subscription tiers.
2. **Low Churn Advantage**: High-fidelity narration (voices like Adam, Brian, Charlie) produces viral-quality retention, increasing subscriber lifetime value (LTV).
3. **Upsell Opportunities**:
   - Provide standard allocations (12, 30, 60 videos).
   - Offer credit top-up packs ($10 for 10 extra videos) if users exceed their monthly limit.
