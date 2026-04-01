<script>
document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "https://script.google.com/macros/s/AKfycbx8PEtkBUuxNLNp4OblKhbWRebAhiG4Upfem9TyVqTcissFCu3itMwESqwibNeZ-w0_/exec";

  let data = [];

  fetch(API_URL)
    .then(res => res.json())
    .then(json => {
      console.log("API Data:", json);

      // ✅ FIX: access json.data
      data = json.data;

      renderLeaderboard();
    })
    .catch(err => {
      console.error("Error:", err);
      document.getElementById("leaderboard").innerHTML = "Failed to load data.";
    });


  function renderLeaderboard() {
    const container = document.getElementById("leaderboard");
    container.innerHTML = "";

    data.forEach((user, index) => {
      const div = document.createElement("div");
      div.className = "user";

      const name = user["Player"] || "Unknown";
      const score = user["Points"] || 0;

      div.innerHTML = `
        <span>#${index + 1}</span>
        <span>${name}</span>
        <span>${score.toLocaleString()}</span>
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
    const details = document.getElementById("details");

    // ✅ Build completions manually from your fields
    const completions = [];

    for (let i = 1; i <= 15; i++) {
      let key;

      if (i === 1) key = "1st Hardest";
      else if (i === 2) key = "2nd Hardest";
      else if (i === 3) key = "3rd Hardest";
      else key = `${i}th Hardest`;

      if (user[key]) {
        completions.push({
          rank: i,
          name: user[key]
        });
      }
    }

    details.innerHTML = `
      <h1>#${rank + 1} ${user["Player"]}</h1>
      <h2>${user["Points"].toLocaleString()}</h2>
      <h3>Top 15 Hardests</h3>
      ${
        completions.length > 0
          ? completions.map(c => `
              <div class="completion">
                #${c.rank} — ${c.name}
              </div>
            `).join("")
          : "<p>No data found.</p>"
      }
    `;
  }

});
</script>
