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
    levelMap() {
      const map = new Map();

      if (!Array.isArray(this.list)) return map;

      this.list.forEach((item) => {
        if (!Array.isArray(item)) return;

        const lvl = item[0];
        if (lvl && lvl.id) {
          map.set(lvl.id, lvl);
        }
      });

      return map;
    },

    selectedPack() {
      return this.packs[this.selectedPackIndex] || null;
    },

    selectedLevelId() {
      if (!this.selectedPack) return null;
      return this.selectedPack.levels[this.selectedLevelIndex] || null;
    },

    selectedLevel() {
      if (!this.selectedLevelId) return null;
      return this.levelMap.get(this.selectedLevelId) || null;
    },

    packCompletions() {
      if (!this.selectedPack) return [];

      const userMap = new Map();
      const totalLevels = this.selectedPack.levels.length;

      this.selectedPack.levels.forEach((levelId) => {
        const level = this.levelMap.get(levelId);
        if (!level) return;

        const countedUsers = new Set();

        // verifier
        if (level.verifier) {
          const key = this.normalize(level.verifier);
          countedUsers.add(key);

          if (!userMap.has(key)) {
            userMap.set(key, {
              user: level.verifier,
              completions: 1,
              verifications: 1,
            });
          } else {
            const u = userMap.get(key);
            u.completions++;
            u.verifications++;
          }
        }

        // records
        if (Array.isArray(level.records)) {
          level.records.forEach((record) => {
            if (!record || record.percent !== 100) return;

            const key = this.normalize(record.user);

            if (countedUsers.has(key)) return;
            countedUsers.add(key);

            if (!userMap.has(key)) {
              userMap.set(key, {
                user: record.user,
                completions: 1,
                verifications: 0,
              });
            } else {
              userMap.get(key).completions++;
            }
          });
        }
      });

      return Array.from(userMap.values()).sort(
        (a, b) => b.completions - a.completions
      );
    },
  },

  async mounted() {
    const normalize = (name) =>
      typeof name === "string" ? name.trim().toLowerCase() : "";

    try {
      const list = await fetchList();

      const packsData = await fetch("/data/_packs.json").then((res) =>
        res.json()
      );

      const hiddenData = await fetch("/data/_hiddenUsers.json").then((res) =>
        res.json()
      );

      const hiddenUsers = hiddenData.map(normalize);

      const processRecords = (records) => {
        if (!Array.isArray(records)) return [];

        return records
          .filter(
            (record) =>
              record &&
              record.user &&
              !hiddenUsers.includes(normalize(record.user))
          )
          .map((record) => ({
            ...record,
            user:
              normalize(record.user) === "zis76"
                ? "zis08"
                : record.user,
          }));
      };

      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (!Array.isArray(item)) return;

          const level = item[0];

          if (level && Array.isArray(level.records)) {
            level.records = processRecords(level.records);
          }
        });
      }

      this.list = Array.isArray(list) ? list : [];
      this.packs = Array.isArray(packsData) ? packsData : [];
    } catch (err) {
      console.error("Mounted error:", err);
    } finally {
      this.loading = false;
    }
  },

  methods: {
    embed,

    normalize(name) {
      return typeof name === "string"
        ? name.trim().toLowerCase()
        : "";
    },
  },

  template: `
    <main v-if="loading">
      <Spinner></Spinner>
    </main>

    <main v-else class="page-list-packs">
      
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
        <table class="list" v-if="selectedPack">
          <tr v-for="(levelId, i) in selectedPack.levels" :key="levelId">
            <td class="rank">
              <p class="type-label-lg">#{{ i + 1 }}</p>
            </td>

            <td class="level" :class="{ active: selectedLevelIndex === i }">
              <button @click="selectedLevelIndex = i">
                <span class="type-label-lg">
                  {{ levelMap.get(levelId) ? levelMap.get(levelId).name : 'Error' }}
                </span>
              </button>
            </td>
          </tr>
        </table>
      </div>

      <div class="level-container" v-if="selectedLevel">
        <div class="level">
          <h1>{{ selectedLevel.name }}</h1>

          <LevelAuthors
            :author="selectedLevel.author"
            :creators="selectedLevel.creators"
            :verifier="selectedLevel.verifier"
          />

          <iframe
            class="video"
            :src="embed(selectedLevel.showcase || selectedLevel.verification)"
          ></iframe>

          <ul class="stats">
            <li><div>ID</div><p>{{ selectedLevel.id }}</p></li>
            <li><div>FPS</div><p>{{ selectedLevel.fps || 'Any' }}</p></li>
            <li><div>VERSION</div><p>{{ selectedLevel.version || 'Any' }}</p></li>
          </ul>

          <div v-if="packCompletions.length">
            <h2>Pack Progression</h2>

            <table class="list">
              <tr v-for="user in packCompletions" :key="user.user">
                <td>
                  {{ user.user }}
                  <span v-if="user.completions === selectedPack.levels.length">👑</span>
                </td>

                <td>
                  {{ user.completions }} / {{ selectedPack.levels.length }}
                </td>
              </tr>
            </table>
          </div>

        </div>
      </div>
    </main>
  `,
};