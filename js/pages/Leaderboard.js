import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';

export default {
  components: { Spinner },

  data: () => ({
    leaderboard: [],
    packs: [], // loads _packs.json
    loading: true,
    selected: 0,
    err: [],
  }),

  computed: {
    entry() {
      return this.leaderboard[this.selected] || {
        completed: [],
        verified: [],
        progressed: [],
        user: '',
        total: 0,
      };
    },

    top150() {
      return (this.entry.completed || []).filter(score => score.rank <= 150);
    },

    above150() {
      return (this.entry.completed || []).filter(score => score.rank > 150);
    },

    // Detect packs automatically based on both verified and completed levels
    playerPacks() {
      const levelIDs = new Set([
        ...(this.entry.verified || []).map(v => Number(v.id || v.level || 0)),
        ...(this.entry.completed || []).map(c => Number(c.id || c.level || 0)),
      ]);

      return this.packs
        .filter(pack => pack.levels.every(levelID => levelIDs.has(levelID)))
        .map(pack => ({
          level: pack.name,
          score: pack.points,
          players: [this.entry.user],
        }));
    },
  },

  async mounted() {
    // Load leaderboard
    const [leaderboard, err] = await fetchLeaderboard();
    console.log('Leaderboard loaded:', leaderboard, err);

    const excludedUsers = ['finni1505'];

    this.leaderboard = leaderboard
      .filter(entry => !excludedUsers.includes(entry.user))
      .map(entry => ({
        ...entry,
        user:
          (entry.user || '').trim().toLowerCase() === 'zis76'
            ? 'zis08'
            : (entry.user || '').trim().toLowerCase(),
      }));

    this.err = err;

    // Load packs
    try {
      const res = await fetch('/data/_packs.json');
      this.packs = await res.json();
      console.log('Packs loaded:', this.packs);
    } catch (e) {
      console.error('Failed to load _packs.json', e);
      this.packs = [];
    }

    this.selected = 0;
    this.loading = false;
  },

  methods: {
    localize,
  },

  template: `
<main v-if="loading">
  <Spinner />
</main>

<main v-else class="page-leaderboard-container">
  <div class="page-leaderboard">

    <!-- Leaderboard -->
    <div class="board-container">
      <table class="board">
        <tr v-for="(ientry, i) in leaderboard" :key="i">
          <td>#{{ i + 1 }}</td>
          <td>{{ localize(ientry.total) }}</td>
          <td :class="{ 'active': selected == i }">
            <button @click="selected = i">{{ ientry.user }}</button>
          </td>
        </tr>
      </table>
    </div>

    <!-- Player Details -->
    <div class="player-container">
      <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
      <h3>Total: {{ entry.total }}</h3>

      <!-- Verified Levels -->
      <h2 v-if="entry.verified.length">Verified ({{ entry.verified.length }})</h2>
      <table class="table" v-if="entry.verified.length">
        <tr v-for="score in entry.verified" :key="score.rank">
          <td>#{{ score.rank }}</td>
          <td>{{ score.level }}</td>
          <td>+{{ localize(score.score) }}</td>
        </tr>
      </table>

      <!-- Pack Completion (auto-detected) -->
      <h2 v-if="playerPacks.length">Pack Completion ({{ playerPacks.length }})</h2>
      <table class="table" v-if="playerPacks.length">
        <tr v-for="(pack, i) in playerPacks" :key="i">
          <td>#{{ i + 1 }}</td>
          <td>{{ pack.level }}</td>
          <td>+{{ localize(pack.score) }}</td>
        </tr>
      </table>

      <!-- Top 150 -->
      <h2 v-if="top150.length">Completions ({{ top150.length }})</h2>
      <table class="table" v-if="top150.length">
        <tr v-for="score in top150" :key="score.rank">
          <td>#{{ score.rank }}</td>
          <td>{{ score.level }}</td>
          <td>+{{ localize(score.score) }}</td>
        </tr>
      </table>

      <!-- Above 150 -->
      <h2 v-if="above150.length">Legacy Completions ({{ above150.length }})</h2>
      <table class="table" v-if="above150.length">
        <tr v-for="score in above150" :key="score.rank">
          <td>#{{ score.rank }}</td>
          <td>{{ score.level }}</td>
          <td>+{{ localize(score.score) }}</td>
        </tr>
      </table>

    </div>
  </div>
</main>
  `,
};