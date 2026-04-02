import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import ListPacks from './pages/ListPacks.js';
import PlayerComparison from './pages/Playercomp.js';


export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/roulette', component: Roulette },
    { path: '/listpacks', component: ListPacks },
    { path: '/player', component: PlayerComparison },
];
