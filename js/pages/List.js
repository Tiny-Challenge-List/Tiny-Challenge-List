//search bar code by aelz

import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
  components: { Spinner, LevelAuthors },

  data: () => ({
    list: [],
    editors: [],
    loading: true,
    selected: 0,
    errors: [],
    searchQuery: "",
    roleIconMap,
    store,
  }),

  computed: {
    filteredList() {
      if (!this.searchQuery) return this.list;

      return this.list.filter(item => {
        const level = item?.[0];
        if (!level?.name) return false;

        return level.name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      });
    },

    selectedLevel() {
      return this.filteredList[this.selected]
        ? this.filteredList[this.selected][0]
        : null;
    },

    selectedIndexInFullList() {
      if (!this.selectedLevel) return this.selected + 1;

      return (
        this.list.findIndex(
          item => item[0] && item[0].id === this.selectedLevel.id
        ) + 1
      );
    },
  },

  watch: {
    searchQuery() {
      this.selected = 0;
    },
  },

  methods: {
    embed,
    score,

    getOriginalRank(level) {
      let index = this.list.findIndex(
        item => item[0] && item[0].id === level.id
      );
      return index >= 0 ? index + 1 : this.selected + 1;
    },
  },

  async mounted() {
    let rawList = await fetchList();
    this.editors = await fetchEditors();

    this.list = (rawList || []).map(item => {
      if (Array.isArray(item)) return item;
      return [item, null];
    });

    const hiddenUsers = ["finni1505", "D3adSpac3"];

    this.list.forEach(([level]) => {
      if (level && Array.isArray(level.records)) {
        level.records = level.records.filter(
          record => !hiddenUsers.includes(record.user.toLowerCase())
        );
      }
    });

    if (!this.list.length) {
      this.errors = [
        "Failed to load list. Retry in a few minutes or notify list staff.",
      ];
    } else {
      this.errors.push(
        ...this.list
          .filter(([_, err]) => err)
          .map(([_, err]) => `Failed to load level. (${err}.json)`)
      );

      if (!this.editors) {
        this.errors.push("Failed to load list editors.");
      }
    }

    this.loading = false;
  },

  template: `
    <main v-if="loading">
      <Spinner></Spinner>
    </main>

    <main v-else class="page-list">
      <div class="list-container">

        <!-- SEARCH -->
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="Search levels..." />
        </div>

        <!-- LIST -->
        <table class="list" v-if="filteredList.length">
          <tr v-for="(item, i) in filteredList" :key="i">
            <td class="rank">
              <p v-if="getOriginalRank(item[0]) <= 150" class="type-label-lg">
                #{{ getOriginalRank(item[0]) }}
              </p>
              <p v-else class="type-label-lg">Legacy</p>
            </td>

            <td class="level" :class="{ 'active': selected === i, 'error': !item[0] }">
              <button @click="selected = i">
                <span class="type-label-lg">
                  {{ item[0]?.name || \`Error (\${item[1]}.json)\` }}
                </span>
              </button>
            </td>
          </tr>
        </table>

        <p v-if="filteredList.length === 0">
          No levels match your search.
        </p>
      </div>

      <!-- LEVEL DETAILS -->
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
            frameborder="0"
          ></iframe>

          <ul class="stats">
            <li>
              <div class="type-title-sm">Points when completed</div>
              <p>
                {{ score(getOriginalRank(selectedLevel), 100, selectedLevel.percentToQualify) }}
              </p>
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

          <h2>Records</h2>

          <p v-if="selectedIndexInFullList <= 75">
            <strong>{{ selectedLevel.percentToQualify }}%</strong> or better to qualify
          </p>
          <p v-else-if="selectedIndexInFullList <= 150">
            <strong>100%</strong> or better to qualify
          </p>
          <p v-else>This level does not accept new records.</p>

          <table class="records">
            <tr v-for="record in selectedLevel.records || []" class="record">
              <td class="percent">
                <p>{{ record.percent }}%</p>
              </td>
              <td class="user">
                <a :href="record.link" target="_blank" class="type-label-lg">
                  {{ record.user }}
                </a>
              </td>
              <td class="mobile">
                <img
                  v-if="record.mobile"
                  :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`"
                >
              </td>
              <td>
                <p>{{ record.hz }}</p>
              </td>
            </tr>
          </table>

        </div>
      </div>

      <div v-else class="level" style="height: 100%; display:flex; justify-content:center; align-items:center;">
        <p>(ノಠ益ಠ)ノ彡┻━┻</p>
      </div>
    </main>
  `,
};