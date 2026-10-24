import path from "node:path";

import { Autumn } from "autumn-js";

if (process.env.__VARLOCK_ENV === undefined) {
  process.chdir(path.resolve(process.cwd(), "apps/web"));
  await import("varlock/auto-load");
}

const { env } = await import("../apps/web/src/env.server");

const autumn = new Autumn({ secretKey: env.AUTUMN_SECRET_KEY });

const plans = [
  { id: "hobby", name: "Hobby", usd: 19, myr: 39, credits: 1600 },
  { id: "daily", name: "Daily", usd: 39, myr: 129, credits: 7600 },
] as const;

const setup = async () => {
  try {
    await autumn.features.create({
      featureId: "credits",
      name: "Content Credits",
      type: "metered",
      consumable: true,
    });
    console.log("✅ Credits feature created");
  } catch {
    console.log("ℹ️ Credits feature already configured");
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
          items: [
            {
              featureId: "credits",
              included: plan.credits,
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
