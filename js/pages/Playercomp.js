<script>
function initLeaderboard() {
  console.log("INIT RUNNING");

  // Only run on correct page
  if (!location.hash.includes("playercomp")) {
    console.log("Not on playercomp page");
    return;
  }

  // Remove old version if it exists
  const old = document.getElementById("leaderboard-app");
  if (old) old.remove();

  // CREATE UI (force visible)
  const app = document.createElement("div");
  app.id = "leaderboard-app";

  app.style.position = "fixed";
  app.style.top = "80px";
  app.style.left = "0";
  app.style.right = "0";
  app.style.bottom = "0";
  app.style.background = "white";
  app.style.zIndex = "9999";
  app.style.display = "flex";

  app.innerHTML = `
    <div id="leaderboard" style="width:40%; overflow:auto; border-right:1px solid #ccc;"></div>
    <div id="details" style="flex:1; padding:20px;">
      <h1>Select a user</h1>
    </div>
  `;

  document.body.appendChild(app);

  const container = document.getElementById("leaderboard");
  const details = document.getElementById("details");

  const API_URL = "https://script.google.com/macros/s/AKfycbx8PEtkBUuxNLNp4OblKhbWRebAhiG4Upfem9TyVqTcissFCu3itMwESqwibNeZ-w0_/exec";

  fetch(API_URL)
    .then(res => res.json())
    .then(json => {
      console.log("API DATA:", json);

      if (!json.data) {
        container.innerHTML = "Invalid API data";
        return;
      }

      const data = json.data;
      container.innerHTML = "";

      data.forEach((user, index) => {
        const div = document.createElement("div");

        div.style.padding = "10px";
        div.style.cursor = "pointer";
        div.style.borderBottom = "1px solid #eee";

        div.innerHTML = `
          <b>#${index + 1}</b> ${user["Player"]} — ${user["Points"]}
        `;

        div.onclick = () => {
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
            <h1>#${index + 1} ${user["Player"]}</h1>
            <h2>${user["Points"]}</h2>
            ${completions.join("<br>")}
          `;
        };

        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error("FETCH ERROR:", err);
      container.innerHTML = "Failed to load data";
    });
}


// RUN MULTIPLE TIMES (SPA SAFE)
setInterval(initLeaderboard, 1000);
window.addEventListener("hashchange", initLeaderboard);
</script>
