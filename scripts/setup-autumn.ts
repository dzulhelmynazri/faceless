import path from "node:path";

import { Autumn } from "autumn-js";

if (process.env.__VARLOCK_ENV === undefined) {
  process.chdir(path.resolve(process.cwd(), "apps/web"));
  await import("varlock/auto-load");
}

const { env } = await import("../apps/web/src/env.server");

const autumn = new Autumn({ secretKey: env.AUTUMN_SECRET_KEY });

const plans = [
  {
    id: "hobby",
    name: "Hobby",
    usd: 19,
    myr: 39,
    series: 1,
    postsPerWeek: "3 times per week",
  },
  {
    id: "daily",
    name: "Daily",
    usd: 39,
    myr: 129,
    series: 1,
    postsPerWeek: "every day",
  },
  {
    id: "pro",
    name: "Pro",
    usd: 69,
    myr: 229,
    series: 1,
    postsPerWeek: "2 times per day",
  },
] as const;

const setup = async () => {
  try {
    await autumn.features.create({
      featureId: "series",
      name: "Active Series",
      type: "metered",
      consumable: false,
    });
    console.log("✅ Series feature created");
  } catch {
    console.log("ℹ️ Series feature already configured");
  }

  await Promise.all(
    plans.map(async (plan) => {
      const price = {
        amount: plan.usd,
        interval: "month" as const,
        additionalCurrencies: [{ currency: "myr", amount: plan.myr }],
      };

      try {
        await autumn.plans.create({
          planId: plan.id,
          name: plan.name,
          price,
          metadata: {
            postsPerWeek: plan.postsPerWeek,
          },
          items: [
            {
              featureId: "series",
              included: plan.series,
            },
          ],
        });

        console.log(`✅ ${plan.name} created`);
      } catch {
        try {
          await autumn.plans.update({
            planId: plan.id,
            price,
          });

          console.log(`✅ ${plan.name} updated`);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);

          console.log(`ℹ️ ${plan.name} update note:`, message);
        }
      }
    })
  );

  console.log("🎉 Autumn setup complete!");
};

await setup();
