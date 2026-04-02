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
                                    {{ localize(getTop15Total(ientry)) }}
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
                        <h3>{{ localize(getTop15Total(entry)) }}</h3>

                        <!-- ONLY TOP 15 -->
                        <h2 v-if="top15Levels.length > 0">
                            Top 15 Levels
                        </h2>
                        <table class="table">
                            <tr v-for="score in top15Levels" :key="score.level">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">
                                        {{ score.level }}
                                    </a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
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

        // GET TOP 15 LEVELS
        top15Levels() {
            const allScores = [
                ...(this.entry.completed || []),
                ...(this.entry.verified || [])
            ];

            return allScores
                .sort((a, b) => b.score - a.score)
                .slice(0, 15);
        }
    },

    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();

        const excludedUsers = ["finni1505", "D3adSpac3"];

        this.leaderboard = leaderboard
            .filter(entry => !excludedUsers.includes(entry.user));

        // SORT BY TOP 15 TOTAL
        this.leaderboard.sort((a, b) => {
            return this.getTop15Total(b) - this.getTop15Total(a);
        });

        this.selected = 0;
        this.err = err;
        this.loading = false;
    },

    methods: {
        localize,

        // SUM OF TOP 15 SCORES
        getTop15Total(entry) {
            const allScores = [
                ...(entry.completed || []),
                ...(entry.verified || [])
            ];

            const sorted = allScores.sort((a, b) => b.score - a.score);
            const top15 = sorted.slice(0, 15);

            return top15.reduce((sum, s) => sum + (s.score || 0), 0);
        }
    },
};