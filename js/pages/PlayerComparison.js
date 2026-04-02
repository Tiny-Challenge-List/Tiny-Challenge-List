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
            <div class="page-leaderboard" style="display:flex; gap:20px;">
        
                <!-- LEFT SIDE -->
                <div style="width:40%;">
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard" :key="i">
                            <td>#{{ i + 1 }}</td>
        
                            <td>
                                {{ ientry.user }}
                            </td>
        
                            <td>
                                {{ localize(ientry.total || 0) }}
                            </td>
        
                            <td>
                                <button @click="selected = i">
                                    View
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>
        
                <!-- RIGHT SIDE -->
                <div style="width:60%;">
        
                    <h1>Player Comparison</h1>
        
                    <h2>
                        #{{ selected + 1 }} {{ entry.user }}
                    </h2>
        
                    <h3>{{ localize(entry.total || 0) }}</h3>
        
                    <h2 v-if="topHardest.length">
                        Top 15 Hardest
                    </h2>
        
                    <table class="table">
                        <tr v-for="(score, i) in topHardest" :key="i">
                            <td>#{{ score.rank }}</td>
                            <td>{{ score.level }}</td>
                            <td>+{{ localize(score.score) }}</td>
                        </tr>
                    </table>
        
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

    async mounted() {
        try {
            const res = await fetch("https://script.google.com/macros/s/AKfycby_xB4R69fxzm_mEcruv5W6I11RoErEngz_Sww0npUGpuhEWW71HagzSyssQAtQdbIN/exec");
            const data = await res.json();

            console.log("API DATA:", data);

            this.leaderboard = data.map(player => ({
                user: player.user || player.username,
                total: player.total || player.points || 0,
                completed: player.completed || []
            }));

        } catch (e) {
            console.error(e);
            this.err.push("Failed to load leaderboard");
        }

        this.leaderboard.sort((a, b) => (b.total || 0) - (a.total || 0));

        this.loading = false;
    },

    methods: {
        localize
    }
};
