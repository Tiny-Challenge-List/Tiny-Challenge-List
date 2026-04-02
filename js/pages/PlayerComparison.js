<template>
  <main>
    <div v-if="loading" class="spinner">Loading...</div>

    <p v-else-if="error" class="error">{{ error }}</p>

    <div v-else class="container">

      <!-- LEFT SIDE -->
      <div class="left">
        <table class="board">
          <tr 
            v-for="(p, i) in leaderboard" 
            :key="i"
            :class="{ active: i === selected }"
          >
            <td>#{{ i + 1 }}</td>
            <td>{{ p.user }}</td>
            <td>{{ localize(p.total) }}</td>
            <td>
              <button 
                @click="selected = i"
                :disabled="i === selected"
              >
                View
              </button>
            </td>
          </tr>
        </table>
      </div>

      <!-- RIGHT SIDE -->
      <div class="right">
        <h1>Player Comparison</h1>

        <template v-if="entry">
          <h2>#{{ selected + 1 }} {{ entry.user }}</h2>
          <h3>{{ localize(entry.total) }}</h3>

          <h2 v-if="topHardest.length">Top Hardest</h2>

          <table v-if="topHardest.length" class="table">
            <tr v-for="score in topHardest" :key="score.rank">
              <td>#{{ score.rank }}</td>
              <td>{{ score.level }}</td>
            </tr>
          </table>

          <p v-else>No data available</p>
        </template>
      </div>

    </div>
  </main>
</template>

<script>
export default {
  name: "PlayerComparison",

  data() {
    return {
      leaderboard: [],
      loading: true,
      selected: 0,
      error: null,
    };
  },

  computed: {
    entry() {
      return this.leaderboard[this.selected] || null;
    },

    topHardest() {
      return this.entry?.completed?.slice(0, 15) || [];
    }
  },

  async mounted() {
      try {
        const res = await fetch("https://script.google.com/macros/s/AKfycbwDklQbeFU7qBzt4xpo6yd-W6TjfAtTi4L3lfQsT7beIP7jRNQXss03tgdqJOiyP-Xf/exec");
    
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
        const json = await res.json();
        const data = json.data; // ⭐ FIX HERE
    
        this.leaderboard = data
          .map(this.transformPlayer)
          .sort((a, b) => b.total - a.total);
    
      } catch (e) {
        console.error(e);
        this.error = "Failed to load leaderboard";
      } finally {
        this.loading = false;
      }
    },

  methods: {
    localize(num) {
      return Number(num).toLocaleString();
    },

    transformPlayer(player) {
      const completed = [];

      for (let i = 1; i <= 15; i++) {
        const key = `${i}${this.getSuffix(i)} Hardest`;

        if (player[key]) {
          completed.push({
            level: player[key],
            rank: i
          });
        }
      }

      return {
        user: player.Player || player.player || 'Unknown',
        total: player.Points || player.points || 0,
        completed
      };
    },

    getSuffix(n) {
      if (n % 100 >= 11 && n % 100 <= 13) return "th";
      return ["th", "st", "nd", "rd"][n % 10] || "th";
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.left {
  width: 40%;
}

.right {
  width: 60%;
}

.board {
  width: 100%;
  border-collapse: collapse;
}

.board td {
  padding: 6px;
}

.board tr.active {
  background: #2a2a2a;
  color: white;
}

.table {
  width: 100%;
  margin-top: 10px;
}

.table td {
  padding: 6px;
}

button {
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: red;
  padding: 20px;
}

.spinner {
  padding: 20px;
}
</style>
