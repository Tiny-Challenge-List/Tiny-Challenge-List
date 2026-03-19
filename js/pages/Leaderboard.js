import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },

    data: () => ({
        leaderboard: [],
        packCompletion: [], // 👈 NEW
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

                <div class="board-container">
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard" :key="i">
                            <td class="rank">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="player-container">
                    <div class="player">

                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ entry.total }}</h3>

                        <!-- VERIFIED -->
                        <h2 v-if="entry.verified.length > 0">
                            Verified ({{ entry.verified.length }})
                        </h2>
                        <table class="table">
                            <tr v-for="score in entry.verified" :key="score.rank">
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

                        <!-- PACK COMPLETION -->
                        <h2 v-if="playerPacks.length > 0">
                            Pack Completion ({{ playerPacks.length }})
                        </h2>
                        <table class="table">
                            <tr v-for="(score, i) in playerPacks" :key="i">
                                <td class="rank">
                                    <p>#{{ i + 1 }}</p>
                                </td>

                                <td class="level">
                                    <p class="type-label-lg">{{ score.level }}</p>
                                </td>

                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>

                        <!-- TOP 150 -->
                        <h2 v-if="top150.length > 0">
                            Completions ({{ top150.length }})
                        </h2>
                        <table class="table">
                            <tr v-for="score in top150" :key="score.rank">
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

                        <!-- ABOVE 150 -->
                        <h2 v-if="above150.length > 0">
                            Legacy Completions ({{ above150.length }})
                        </h2>
                        <table class="table">
                            <tr v-for="score in above150" :key="score.rank">
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

                        <!-- PROGRESSED -->
                        <h2 v-if="entry.progressed.length > 0">
                            Progressed ({{ entry.progressed.length }})
                        </h2>
                        <table class="table">
                            <tr v-for="score in entry.progressed" :key="score.rank">
                                <td class="rank"><p>#{{ score.rank }}</p></td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">
                                        {{ score.percent }}% {{ score.level }}
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
                progressed: [],
                user: '',
                total: 0
            };
        },

        top150() {
            return (this.entry.completed || []).filter(score => score.rank <= 150);
        },

        above150() {
            return (this.entry.completed || []).filter(score => score.rank > 150);
        },

        // FILTER PACKS PER PLAYER
        playerPacks() {
            return this.packCompletion.filter(
                p => p.player.toLowerCase() === this.entry.user.toLowerCase()
            );
        }
    },

    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();

        const excludedUsers = ["finni1505"];

        const filteredLeaderboard = leaderboard
            .filter(entry => !excludedUsers.includes(entry.user))
            .map(entry => ({
                ...entry,
                user: entry.user.trim().toLowerCase() === "zis76"
                    ? "zis08"
                    : entry.user
            }));

        this.leaderboard = filteredLeaderboard;

        // LOAD PACK COMPLETIONS
        const res = await fetch("/pack-completions.json");
        this.packCompletion = await res.json();

        this.selected = 0;
        this.err = err;
        this.loading = false;
    },

    methods: {
        localize,
    },
};