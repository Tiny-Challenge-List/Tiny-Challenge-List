<script>
function startApp() {
  const container = document.getElementById("leaderboard");
  const details = document.getElementById("details");

  if (!container || !details) return; // not on the right page

  const API_URL = "https://script.google.com/macros/s/AKfycbx8PEtkBUuxNLNp4OblKhbWRebAhiG4Upfem9TyVqTcissFCu3itMwESqwibNeZ-w0_/exec";

  let data = [];

  fetch(API_URL)
    .then(res => res.json())
    .then(json => {
      console.log("API Data:", json);

      if (!json.data) {
        container.innerHTML = "Invalid data format.";
        return;
      }

      data = json.data;
      renderLeaderboard();
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = "Error loading data.";
    });

  function renderLeaderboard() {
    container.innerHTML = "";

    data.forEach((user, index) => {
      const div = document.createElement("div");
      div.className = "user";

      div.innerHTML = `
        <span>#${index + 1}</span>
        <span>${user["Player"] || "Unknown"}</span>
        <span>${(user["Points"] || 0).toLocaleString()}</span>
      `;

      div.onclick = () => {
        document.querySelectorAll(".user").forEach(u => u.classList.remove("active"));
        div.classList.add("active");
        showDetails(user, index);
      };

      container.appendChild(div);
    });
  }

  function showDetails(user, rank) {
    const completions = [];

    for (let i = 1; i <= 15; i++) {
      let key =
        i === 1 ? "1st Hardest" :
        i === 2 ? "2nd Hardest" :
        i === 3 ? "3rd Hardest" :
        `${i}th Hardest`;

      if (user[key]) {
        completions.push({ rank: i, name: user[key] });
      }
    }

    details.innerHTML = `
      <h1>#${rank + 1} ${user["Player"]}</h1>
      <h2>${user["Points"].toLocaleString()}</h2>
      <h3>Top 15 Hardests</h3>
      ${
        completions.length
          ? completions.map(c => `
              <div class="completion">
                #${c.rank} — ${c.name}
              </div>
            `).join("")
          : "<p>No data found.</p>"
      }
    `;
  }
}


window.addEventListener("load", startApp);

window.addEventListener("hashchange", () => {
  setTimeout(startApp, 100); // wait for page render
});
</script>
