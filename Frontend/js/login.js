const API_URL = "http://localhost";  // <-- corrigido
const API_PORTA = "3000";

async function handleLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("studentEmail").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch(`${API_URL}:${API_PORTA}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("isLoggedIn", "true");

                const payload = JSON.parse(atob(data.token.split('.')[1]));
                localStorage.setItem("userId", payload.user_id);
                localStorage.setItem("type_user", payload.type_user);

                // Redirecionar conforme o tipo de usuário
                if (payload.type_user === "admin") {
                    window.location.href = "adminpage.html";
                } else {
                    window.location.href = "Homepage.html";
                }
            } else {
                const error = await response.json();
                alert(error.message || "Erro ao fazer login.");
            }
        } catch (err) {
            console.error("Erro na requisição:", err);
            alert("Ocorreu um erro ao comunicar com o servidor.");
        }
    });
}

function updateLoginButton() {
    const token = localStorage.getItem("token");
    const loginBtn = document.querySelector('a[href="login.html"]');

    if (token && loginBtn) {
        loginBtn.textContent = "Perfil";
        loginBtn.setAttribute("href", "user.html");
        loginBtn.classList.add("font-semibold", "text-emerald-600");
    }
}

handleLoginForm();
updateLoginButton();
