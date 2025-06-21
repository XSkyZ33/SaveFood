async function fetchCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const res = await fetch('http://localhost:3000/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateLoginUI() {
  const loginBtnContainer = document.querySelector(".btn-access")?.parentNode;
  if (!loginBtnContainer) return;

  const token = localStorage.getItem("token");
  if (!token) {
    // Se não tiver token, deixa o botão padrão
    loginBtnContainer.innerHTML = `<a href="Login.html" class="btn-access">Acessar Conta</a>`;
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;

    if (Date.now() > exp) {
      localStorage.removeItem("token");
      localStorage.removeItem("avatar");
      loginBtnContainer.innerHTML = `<a href="Login.html" class="btn-access">Acessar Conta</a>`;
      return;
    }

    localStorage.removeItem("avatar");

    let avatarUrl = localStorage.getItem("avatar") || "https://www.gravatar.com/avatar/?d=mp&f=y";

    if (avatarUrl === "https://www.gravatar.com/avatar/?d=mp&f=y") {
      // tentar buscar do servidor caso não tenha avatar no localStorage
      const user = await fetchCurrentUser();
      if (user && user.avatar) {
        avatarUrl = user.avatar;
        localStorage.setItem("avatar", avatarUrl);
      }
    }

    // Agora substitui o conteúdo inteiro do container com o <a> novo com a imagem
    loginBtnContainer.innerHTML = `
      <a href="user.html" class="flex items-center" title="Perfil do Usuário">
        <img src="${avatarUrl}" alt="Avatar" class="w-10 h-10 rounded-full border-2 border-emerald-500" />
      </a>
    `;

  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("avatar");
    loginBtnContainer.innerHTML = `<a href="Login.html" class="btn-access">Acessar Conta</a>`;
  }
}


// Chamar a função quando o documento carregar
document.addEventListener("DOMContentLoaded", () => {
  updateLoginUI();
});
