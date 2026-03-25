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

    // Pack completion
  packCompletions() {
    if (!this.selectedPack) return [];
  
    const userMap = new Map();
  
    this.selectedPack.levels.forEach((levelId) => {
      const level = this.list.find(([lvl]) => lvl?.id === levelId)?.[0];
      if (!level) return;
  
      if (level.verifier) {
        const verifier = level.verifier;
  
        if (!userMap.has(verifier)) {
          userMap.set(verifier, {
            user: verifier,
            completions: 1,
            verifications: 1,
          });
        } else {
          const u = userMap.get(verifier);
          u.completions++;
          u.verifications = (u.verifications || 0) + 1;
        }
      }
  
      if (level.records) {
        level.records.forEach((record) => {
          if (record.percent !== 100) return;
  
          const username = record.user;
  
          if (!userMap.has(username)) {
            userMap.set(username, {
              user: username,
              completions: 1,
              verifications: 0,
            });
          } else {
            userMap.get(username).completions++;
          }
        });
      }
    });
  
    return Array.from(userMap.values()).sort(
      (a, b) => b.completions - a.completions
    );
  }

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
          <tr
            v-for="(levelId, i) in selectedPack.levels"
            :key="levelId"
          >
            <td class="rank">
              <p class="type-label-lg">
                #{{ i + 1 }}
              </p>
            </td>

            <td
              class="level"
              :class="{ active: selectedLevelIndex === i }"
            >
              <button @click="selectedLevelIndex = i">
                <span class="type-label-lg">
                  {{
                    list.find(([lvl]) => lvl?.id === levelId)?.[0]?.name ||
                    'Error'
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
          
          <!-- Pack completions -->
          <div class="pack-completions" v-if="packCompletions.length">
            <h2>Pack Progression</h2>
            <table class="list">
              <tr v-for="(user, i) in packCompletions" :key="user.user">
                <td class="rank">#{{ i + 1 }}</td>
                <td class="name">{{ user.user }}</td>
                <td class="completions">
                  {{ user.completions }} total
                </td>
              </tr>
            </table>
          </div>
          
        </div>
      </div>
    </main>
  `,
};