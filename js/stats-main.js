import { ScoresService } from "./services/scores-service.js";
import { initStatsPage } from "./ui/stats-page.js";

const scoreService = new ScoresService();
initStatsPage({ scoreService });
