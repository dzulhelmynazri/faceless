import { mergeRouters } from "../../trpc";
import { episodesRouter } from "./episodes";
import { seriesCoreRouter } from "./series";

export const seriesRouter = mergeRouters(seriesCoreRouter, episodesRouter);
