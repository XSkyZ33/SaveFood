export function updateLoginUI() {
  const loginBtnContainer = document.querySelector(".btn-access")?.parentNode;
  const token = localStorage.getItem("token");

  if (!loginBtnContainer || !token) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;

    if (Date.now() > exp) {
      localStorage.clear();
      return;
    }

    const avatarUrl = localStorage.getItem("avatar") || "https://i.pravatar.cc/40";
    const avatarLink = document.createElement("a");
    avatarLink.href = "user.html";
    avatarLink.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="w-10 h-10 rounded-full border-2 border-emerald-500" />`;

    loginBtnContainer.innerHTML = "";
    loginBtnContainer.appendChild(avatarLink);
  } catch (err) {
    console.error("Token inválido ou erro ao verificar expiração:", err);
    localStorage.clear();
  }
}

