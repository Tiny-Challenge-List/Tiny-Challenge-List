<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Leaderboard</title>

  <!-- External CSS -->
  <link rel="stylesheet" href="styles.css">
</head>

<body>

  <!-- APP CONTAINER -->
  <div id="leaderboard-app">
    <div id="leaderboard"></div>

    <div id="details">
      <h1>Select a user</h1>
    </div>
  </div>

  <!-- JS INSIDE HTML -->
  <script>
  document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "https://script.google.com/macros/s/AKfycbx8PEtkBUuxNLNp4OblKhbWRebAhiG4Upfem9TyVqTcissFCu3itMwESqwibNeZ-w0_/exec";

    let data = [];

    fetch(API_URL)
      .then(res => res.json())
      .then(json => {
        console.log("API Data:", json);
        data = json;
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

        const name = user.name || "Unknown";
        const score = user.score || 0;

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

      const completions = Array.isArray(user.completions) ? user.completions : [];

      const top15 = completions
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 15);

      details.innerHTML = `
        <h1>#${rank + 1} ${user.name || "Unknown"}</h1>
        <h2>${(user.score || 0).toLocaleString()}</h2>
        <h3>Top 15 Completions</h3>
        ${
          top15.length > 0
            ? top15.map(c => `
                <div class="completion">
                  #${c.rank || "?"} — ${c.name || "Unknown"}
                </div>
              `).join("")
            : "<p>No completions found.</p>"
        }
      `;
    }

  });
  </script>

</body>
</html>
