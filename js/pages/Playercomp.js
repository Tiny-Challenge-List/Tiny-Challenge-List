<script>
function startApp() {
  console.log("START APP RUNNING");

  const container = document.getElementById("leaderboard");
  const details = document.getElementById("details");

  console.log("leaderboard:", container);
  console.log("details:", details);

  // ❌ If these are null → THIS is your problem
  if (!container || !details) {
    console.log("Elements not found, retrying...");
    return;
  }

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


setInterval(startApp, 500);

window.addEventListener("hashchange", () => {
  setTimeout(startApp, 200);
});
</script>
