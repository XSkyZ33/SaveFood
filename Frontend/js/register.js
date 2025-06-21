document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const imageInput = document.getElementById("profileImage");
    const file = imageInput.files[0];

    if (!name || !email || !password) {
      alert("Preencha todos os campos.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    if (file) {
      formData.append("image", file);
    }

    try {
      const response = await fetch("http://localhost:3000/users/register", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        alert("Usuário registrado com sucesso!");
        window.location.href = "Login.html";
      } else {
        alert(result.message || "Erro ao registrar.");
      }
    } catch (err) {
      console.error("Erro ao registrar:", err);
      alert("Erro ao registrar.");
    }
  });
});
