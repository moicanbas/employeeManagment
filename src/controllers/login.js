import axios from "axios";
const userURL = "http://localhost:3000/users";

export async function login({ email, password }) {
  try {
    const resp = await axios.get(userURL, {
      params: { email, password },
    });
    const users = resp.data;

    if (users.length === 0) {
      alert("Usuario o contraseña inválido");
      return false;
    }

    const user = users[0];
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isAuth", true);
    return true

  } catch (error) {
    console.log(error);
    alert("ocurrió un error inesperado");
  }
}
