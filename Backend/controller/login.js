const validUser = {
  email: "40210276",
  password: "1234",
  name: "Joana",
  avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e"
};


function handleLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("studentEmail").value;
    const password = document.getElementById("password").value;

    if (email === validUser.email && password === validUser.password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(validUser));
      window.location.href = "Homepage.html";
    } else {
      alert("Credenciais inválidas. Tente novamente.");
    }
  });
}

// --- NAVBAR UPDATE FUNCTION (para todas as páginas) ---
function updateLoginButton() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const loginBtn = document.querySelector('a[href="login.html"]');

  if (isLoggedIn && loginBtn) {
    loginBtn.textContent = "Perfil";
    loginBtn.setAttribute("href", "user.html");
    loginBtn.classList.add("font-semibold", "text-emerald-600");
  }
}

// --- AUTOEXECUTA nas páginas ---
handleLoginForm();
updateLoginButton();
