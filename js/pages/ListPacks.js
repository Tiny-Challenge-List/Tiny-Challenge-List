import { fetchList } from "../content.js";
import { embed } from "../util.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

export default {
  components: { Spinner, LevelAuthors },

  data: () => ({
    packs: [],
    list: [],
    selectedPackIndex: 0,
    selectedLevelIndex: 0,
    loading: true,
  }),

  computed: {
    selectedPack() {
      return this.packs[this.selectedPackIndex] || null;
    },

    selectedLevelId() {
      return this.selectedPack?.levels[this.selectedLevelIndex] || null;
    },

    selectedLevel() {
      return (
        this.list.find(([lvl]) => lvl?.id === this.selectedLevelId)?.[0] ||
        null
      );
    },

    getOriginalRank() {
      return (levelId) => {
        return (
          this.list.findIndex(([lvl]) => lvl?.id === levelId) + 1 || "?"
        );
      };
    },

    // Completed levels from localStorage
    completedLevels() {
      return JSON.parse(localStorage.getItem("completedLevels") || "[]");
    },

    // Count how many completed in current pack
    completedCount() {
      if (!this.selectedPack) return 0;

      return this.selectedPack.levels.filter((id) =>
        this.completedLevels.includes(id)
      ).length;
    },

    // Check if pack fully completed
    isPackCompleted() {
      if (!this.selectedPack) return false;

      return this.selectedPack.levels.every((id) =>
        this.completedLevels.includes(id)
      );
    },
  },

  async mounted() {
    const list = await fetchList();
    const packsData = await fetch("/data/_packs.json").then((res) =>
      res.json()
    );

    this.list = list;
    this.packs = packsData;
    this.loading = false;
  },

  methods: {
    embed,

    // Mark a level as completed
    markCompleted(levelId) {
      const completed = new Set(
        JSON.parse(localStorage.getItem("completedLevels") || "[]")
      );

      completed.add(levelId);

      localStorage.setItem(
        "completedLevels",
        JSON.stringify([...completed])
      );
    },
  },

  template: `
    <main v-if="loading">
      <Spinner></Spinner>
    </main>

    <main v-else class="page-list-packs">

      <!-- Pack selector -->
      <div class="pack-selector">
        <button
          v-for="(pack, index) in packs"
          :key="pack.id"
          :class="{ active: index === selectedPackIndex }"
          @click="selectedPackIndex = index; selectedLevelIndex = 0"
          :style="{ '--color-background': pack.color }"
        >
          {{ pack.name }}
        </button>
      </div>

      <div class="list-container">

        <!-- Level list -->
        <table class="list" v-if="selectedPack">
          <tr v-for="(levelId, i) in selectedPack.levels" :key="levelId">

            <td class="rank">
              <p class="type-label-lg">#{{ i + 1 }}</p>
            </td>

            <td class="level" :class="{ active: selectedLevelIndex === i }">
              <button @click="selectedLevelIndex = i">

                <span class="type-label-lg">
                  {{
                    list.find(([lvl]) => lvl?.id === levelId)?.[0]?.name ||
                    'Error'
                  }}
                </span>

                <!-- Per-level completion check -->
                <span v-if="completedLevels.includes(levelId)">✔</span>

              </button>
            </td>

          </tr>
        </table>

      </div>

      <!-- Level detail -->
      <div class="level-container" v-if="selectedLevel">
        <div class="level">

          <h1>{{ selectedLevel.name }}</h1>

          <LevelAuthors
            :author="selectedLevel.author"
            :creators="selectedLevel.creators"
            :verifier="selectedLevel.verifier"
          ></LevelAuthors>

          <iframe
            class="video"
            id="videoframe"
            :src="embed(selectedLevel.showcase || selectedLevel.verification)"
            frameborder="0"
          ></iframe>

          <!-- Completion button (for testing/manual marking) -->
          <button @click="markCompleted(selectedLevel.id)">
            Mark as Completed
          </button>

          <ul class="stats">

            <li>
              <div class="type-title-sm">Completion</div>
              <p>
                {{ completedCount }} / {{ selectedPack.levels.length }}
                <span v-if="isPackCompleted">All Completed</span>
              </p>
            </li>

            <li>
              <div class="type-title-sm">Points when completed</div>
              <p>{{ selectedPack.points || 'N/A' }}</p>
            </li>

            <li>
              <div class="type-title-sm">ID</div>
              <p>{{ selectedLevel.id }}</p>
            </li>

            <li>
              <div class="type-title-sm">FPS</div>
              <p>{{ selectedLevel.fps || 'Any' }}</p>
            </li>

            <li>
              <div class="type-title-sm">VERSION</div>
              <p>{{ selectedLevel.version || 'Any' }}</p>
            </li>

          </ul>

        </div>
      </div>

    </main>
  `,
};