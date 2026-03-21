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

    // Combine completed + verified
    getUserCompletions() {
      return (user) => [
        ...(user.completed || []),
        ...(user.verified || [])
      ];
    },

    // Check if user completed pack
    userCompletedPack() {
      return (user, pack) => {
        if (!user || !pack) return false;

        const completed = this.getUserCompletions(user);

        return pack.levels.every(id =>
          completed.includes(id)
        );
      };
    },

    // Count progress
    userProgress() {
      return (user, pack) => {
        if (!user || !pack) return [0, 0];

        const completed = this.getUserCompletions(user);

        const count = pack.levels.filter(id =>
          completed.includes(id)
        ).length;

        return [count, pack.levels.length];
      };
    },
  },

  async mounted() {
    const list = await fetchList(); // users
    const packsData = await fetch("/data/_packs.json").then(res => res.json());

    this.list = list;
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
                  {{ levelId }}
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
              <tr v-for="user in list" :key="user.name">

                <td class="user-name">
                  {{ user.name }}
                </td>

                <td class="progress">
                  {{ userProgress(user, selectedPack)[0] }} /
                  {{ userProgress(user, selectedPack)[1] }}
                </td>

                <td class="status">
                  <span v-if="userCompletedPack(user, selectedPack)">✔</span>
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