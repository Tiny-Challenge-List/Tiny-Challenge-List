import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },

    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
        totalLevels: 0
    }),

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">

                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>

                <!-- LEADERBOARD -->
                <div class="board-container">
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard" :key="i">
                            <td class="rank">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">
                                    {{ localize(getTop15Score(ientry)) }}
                                </p>
                            </td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- PLAYER VIEW -->
                <div class="player-container">
                    <div class="player">

                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ localize(getTop15Score(entry)) }}</h3>

                        <h2>Top 15 Scores</h2>
                        <table class="table">
                            <tr v-for="(score, i) in top15Breakdown" :key="i">
                                <td class="rank">
                                    <p>{{ score.rankLabel }}</p>
                                </td>
                                <td class="level">
                                    <span class="type-label-lg">
                                        {{ score.level }}
                                    </span>
                                </td>
                                <td class="score">
                                    <p>{{ score.value }}</p>
                                </td>
                            </tr>
                        </table>

                    </div>
                </div>

            </div>
        </main>
    `,

    computed: {
        entry() {
            return this.leaderboard[this.selected] || {
                completed: [],
                verified: [],
                user: ''
            };
        },

        // BUILD TOP 15 WITH PENALTIES
        top15Breakdown() {
            const scores = this.buildScoreList(this.entry);
            return scores.slice(0, 15);
        }
    },

    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();

        const excludedUsers = ["finni1505", "D3adSpac3"];

        this.leaderboard = leaderboard
            .filter(entry => !excludedUsers.includes(entry.user));

        const allLevels = new Set();
        this.leaderboard.forEach(entry => {
            [...(entry.completed || []), ...(entry.verified || [])]
                .forEach(l => allLevels.add(l.level));
        });
        this.totalLevels = allLevels.size;

        this.leaderboard.sort((a, b) => {
            return this.getTop15Score(a) - this.getTop15Score(b);
        });

        this.selected = 0;
        this.err = err;
        this.loading = false;
    },

    methods: {
        localize,

        buildScoreList(entry) {
            const scores = [];

            const playerLevels = new Set([
                ...(entry.completed || []).map(l => l.level),
                ...(entry.verified || []).map(l => l.level)
            ]);

            [...(entry.completed || []), ...(entry.verified || [])]
                .forEach(l => {
                    scores.push({
                        level: l.level,
                        value: l.rank - 120,
                        rankLabel: `#${l.rank}`
                    });
                });

            const penaltyValue = this.totalLevels + 100;

            const uniqueLevels = new Set();
            this.leaderboard.forEach(e => {
                [...(e.completed || []), ...(e.verified || [])]
                    .forEach(l => uniqueLevels.add(l.level));
            });

            uniqueLevels.forEach(level => {
                if (!playerLevels.has(level)) {
                    scores.push({
                        level: "Participation Penalty",
                        value: penaltyValue,
                        rankLabel: "—"
                    });
                }
            });

            // sort LOW → HIGH (best first)
            return scores.sort((a, b) => a.value - b.value);
        },

        getTop15Score(entry) {
            const scores = this.buildScoreList(entry);
            return scores
                .slice(0, 15)
                .reduce((sum, s) => sum + s.value, 0);
        }
    },
};