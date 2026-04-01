<script>
function loadLeaderboard() {
  // Only run on your leaderboard route
  if (!location.hash.includes("playercomp")) return;

  console.log("Loading leaderboard...");

  // Find a place to inject into
  let app = document.getElementById("leaderboard-app");

  if (!app) {
    app = document.createElement("div");
    app.id = "leaderboard-app";

    app.innerHTML = `
      <div id="leaderboard"></div>
      <div id="details">
        <h1>Select a user</h1>
      </div>
    `;

    document.body.appendChild(app);
  }

  const container = document.getElementById("leaderboard");
  const details = document.getElementById("details");

  const API_URL = "https://script.google.com/macros/s/AKfycbx8PEtkBUuxNLNp4OblKhbWRebAhiG4Upfem9TyVqTcissFCu3itMwESqwibNeZ-w0_/exec";

  fetch(API_URL)
    .then(res => res.json())
    .then(json => {
      console.log("API:", json);

      if (!json.data) {
        container.innerHTML = "Bad data format";
        return;
      }

      const data = json.data;
      container.innerHTML = "";

      data.forEach((user, index) => {
        const div = document.createElement("div");
        div.className = "user";

        div.innerHTML = `
          <span>#${index + 1}</span>
          <span>${user["Player"]}</span>
          <span>${user["Points"]}</span>
        `;

        div.onclick = () => showDetails(user, index);
        container.appendChild(div);
      });

      function showDetails(user, rank) {
        const completions = [];

        for (let i = 1; i <= 15; i++) {
          let key =
            i === 1 ? "1st Hardest" :
            i === 2 ? "2nd Hardest" :
            i === 3 ? "3rd Hardest" :
            `${i}th Hardest`;

          if (user[key]) {
            completions.push(`#${i} — ${user[key]}`);
          }
        }

        details.innerHTML = `
          <h1>#${rank + 1} ${user["Player"]}</h1>
          <h2>${user["Points"]}</h2>
          ${completions.join("<br>")}
        `;
      }
    });
}


window.addEventListener("load", loadLeaderboard);

window.addEventListener("hashchange", loadLeaderboard);
</script>

window.addEventListener("hashchange", () => {
  setTimeout(startApp, 200);
});
</script>
