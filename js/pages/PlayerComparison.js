import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';

export default {
    name: "PlayerComparison",

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
                        Failed to load data: {{ err.join(', ') }}
                    </p>
                </div>
                
                <div v-if="err.length" style="background:red; color:white; padding:10px;">
                    {{ err.join(', ') }}
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
                                    {{ localize(ientry.total || 0) }}
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

                        <h1>Player Comparison</h1>
                        <h2>#{{ selected + 1 }} {{ entry.user }}</h2>

                        <h3>{{ localize(entry.total || 0) }}</h3>

                        <!-- TOP 15 HARDEST -->
                        <h2 v-if="topHardest.length > 0">
                            Top 15 Hardest ({{ topHardest.length }})
                        </h2>

                        <table class="table">
                            <tr v-for="(score, i) in topHardest" :key="i">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    {{ score.level }}
                                </td>
                                <td class="score">
                                    +{{ localize(score.score) }}
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
                user: '',
                total: 0,
                completed: []
            };
        },

        topHardest() {
            return (this.entry.completed || [])
                .filter(l => l.rank)
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 15);
        }
    },

        mounted() {
            const url = "https://script.google.com/macros/s/AKfycby_xB4R69fxzm_mEcruv5W6I11RoErEngz_Sww0npUGpuhEWW71HagzSyssQAtQdbIN/exec";
        
            const script = document.createElement("script");
        
            script.src = url + "?callback=handleData";
        
            document.body.appendChild(script);
        
            window.handleData = (json) => {
                const data = json.data;
        
                this.leaderboard = data.map(player => {
        
                    const completed = [];
        
                    for (let i = 1; i <= 15; i++) {
                        const key = i + this.getSuffix(i) + " Hardest";
        
                        if (player[key]) {
                            completed.push({
                                level: player[key],
                                rank: i
                            });
                        }
                    }
        
                    return {
                        user: player.Player,
                        total: player.Points || 0,
                        completed
                    };
                });
        
                this.leaderboard.sort((a, b) => b.total - a.total);
                this.loading = false;
            };
        },

    methods: {
        localize
    }
};