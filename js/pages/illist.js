import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchIllist } from "../main/js/ilcontent.js";

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

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="illist && illist.length">
                    <tr v-for="(item, i) in illist" :key="i">
                        <td class="rank">
                            <p class="type-label-lg">#{{ i + 1 }}</p>
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
            </div>

            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>

                    <LevelAuthors 
                        :author="level.author" 
                        :creators="level.creators" 
                        :verifier="level.verifier">
                    </LevelAuthors>

                    <iframe class="video" :src="video" frameborder="0"></iframe>

                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Version</div>
                            <p>{{ level.version || '2.2' }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">FPS</div>
                            <p>{{ level.fps || 'Any' }}</p>
                        </li>
                    </ul>

                    <h2>Records</h2>

                    <p>
                        <strong>{{ level.percentToQualify }}%</strong> or better to qualify
                    </p>

                    <table class="records">
                        <tr v-for="(record, rIndex) in level.records" :key="rIndex" class="record">
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
                                    alt="Mobile">
                            </td>

                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <div v-else class="level empty">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>

            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-if="errors.length">
                        <p class="error" v-for="(error, i) in errors" :key="i">
                            {{ error }}
                        </p>
                    </div>

                    <div class="og">
                        <p class="type-label-md">
                            Website layout made by 
                            <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a>
                        </p>
                    </div>

                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="(editor, i) in editors" :key="i">
                                <img 
                                    :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" 
                                    :alt="editor.role">

                                <a v-if="editor.link" 
                                   class="type-label-lg link" 
                                   target="_blank" 
                                   :href="editor.link">
                                    {{ editor.name }}
                                </a>

                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>

                    <h3>Submission Requirements</h3>
                    <p>You can copy one level on the list</p>
                    <p>Achieved the record without hacks (FPS bypass allowed)</p>
                    <p>Must match the level ID on the site</p>
                    <p>Must include clicks/taps or raw audio</p>
                    <p>Must show full attempt + death animation</p>
                    <p>Must show end screen</p>
                    <p>No secret routes or bug routes</p>
                    <p>No easy modes</p>
                    <p>No hitboxes on invisible levels</p>
                </div>
            </div>
        </main>
    `,

    data: () => ({
        illist: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),

    computed: {
        level() {
            return this.illist?.[this.selected]?.[0] || null;
        },

        video() {
            if (!this.level?.showcase) {
                return embed(this.level?.verification);
            }
            return embed(this.level.showcase);
        }
    },

    async mounted() {
        try {
            this.illist = await fetchIllist();
            this.editors = await fetchEditors();

            if (!this.illist) {
                this.errors.push("Failed to load illist.");
            } else {
                this.errors.push(
                    ...this.illist
                        .filter(([_, err]) => err)
                        .map(([_, err]) => `Failed to load level. (${err}.json)`)
                );
            }

            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }

        } catch (e) {
            console.error(e);
            this.errors.push("Unexpected error occurred.");
        }

        this.loading = false;
    },

    methods: {
        embed,
        score,
    },
};