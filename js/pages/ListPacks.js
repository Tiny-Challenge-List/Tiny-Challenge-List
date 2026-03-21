import { fetchList } from "../content.js";
import { embed } from "../util.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

export default {
  components: { Spinner, LevelAuthors },

  data: () => ({
    packs: [],
    list: [], 
    levels: [], 
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
        this.levels.find(([lvl]) => lvl?.id === this.selectedLevelId)?.[0] ||
        null
      );
    },

    // Combine completed + verified
    getUserCompletions() {
      return (user) => [
        ...(user.completed || []),
        ...(user.verified || [])
      ];
    },

    sortedUsers() {
      if (!this.selectedPack) return [];

      return [...this.list]
        .map(user => {
          const completed = this.getUserCompletions(user);

          const progress = this.selectedPack.levels.filter(id =>
            completed.includes(id)
          ).length;

          return {
            ...user,
            progress,
            total: this.selectedPack.levels.length
          };
        })
        .sort((a, b) => {
          // Sort
          if (b.progress !== a.progress) {
            return b.progress - a.progress;
          }

          return (b.verified?.length || 0) - (a.verified?.length || 0);
        });
    },
  },

  async mounted() {
    const users = await fetchList();
    const levels = await fetch("/data/_list.json").then(res => res.json()); // 👈 LEVELS
    const packsData = await fetch("/data/_packs.json").then(res => res.json());

    this.list = users;
    this.levels = levels;
    this.packs = packsData;
    this.loading = false;
  },

  methods: {
    embed,
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
                    levels.find(([lvl]) => lvl?.id === levelId)?.[0]?.name ||
                    levelId
                  }}
                </span>
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

          <ul class="stats">
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

          <!-- COMPLETION TAB -->
          <div class="completion-tab">
            <h2>Completions</h2>

            <table class="user-list">
              <tr v-for="(user, index) in sortedUsers" :key="user.name">

                <!-- Rank -->
                <td class="rank">
                  #{{ index + 1 }}
                </td>

                <!-- Username -->
                <td class="user-name">
                  {{ user.name }}
                </td>

                <!-- Progress -->
                <td class="progress">
                  {{ user.progress }} / {{ user.total }}
                </td>

                <!-- Completed -->
                <td class="status">
                  <span v-if="user.progress === user.total">✔</span>
                  <span v-else>—</span>
                </td>

              </tr>
            </table>
          </div>

        </div>
      </div>

    </main>
  `,
};