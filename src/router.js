import {
  getData,
  sendData,
  updateEmployee,
  clearEditId,
  editEmployee,
  deleteEmployee,
} from "./controllers/crudEmployees";
import { login } from "./controllers/login";

const routes = {
  "/": "/src/views/home.html",
  "/users": "/src/views/users.html",
  "/employee": "/src/views/managmentEmployee.html",
  "/login": "/src/views/login.html",
  "/notFound": "/src/views/404.html",
};

export async function renderRoute() {
  const user = JSON.parse(localStorage.getItem("user"));
  const path = location.pathname;
  const app = document.getElementById("app");
  const isAuth = localStorage.getItem("isAuth");

  const file = routes[path];

  if (!file) {
    location.href = "/notFound";
    return;
  }

  if (isAuth && path === "/login") {
    location.pathname = "/";
    return;
  }

  if (!isAuth && path !== "/login") {
    location.pathname = "/login";
    return;
  }

  try {
    const res = await fetch(file);
    const html = await res.text();

    app.innerHTML = html;
    if (path !== "/login")
      document.getElementById("principal-header").hidden = false;

    if (path === "/employee") {
      const employees = await getData();
      fillTable(employees);

      document.getElementById("sendForm").addEventListener("click", () => {
        const button = document.getElementById("sendForm");
        button.disabled = true;

        const name = document.getElementById("grid-first-name").value;
        const lastname = document.getElementById("grid-last-name").value;
        const identification = document.getElementById(
          "grid-identification"
        ).value;

        if (!name || !lastname || !identification) {
          alert("Todos los campos son requeridos");
          return;
        }

        const form = {
          name: name,
          lastname: lastname,
          identification: identification,
          created: new Date().toISOString(),
        };
        sendData(form);
        button.disabled = false;
      });

      document
        .getElementById("editForm")
        .addEventListener("click", async () => {
          const name = document.getElementById("grid-first-name").value;
          const lastname = document.getElementById("grid-last-name").value;
          const identification = document.getElementById(
            "grid-identification"
          ).value;

          if (!name || !lastname || !identification) {
            alert("Todos los campos son requeridos");
            return;
          }

          const form = {
            name,
            lastname,
            identification,
            created: new Date().toISOString(),
          };

          await updateEmployee(form);
          location.reload();
        });

      document.getElementById("cancelForm").addEventListener("click", () => {
        clearEditId();
        document.getElementById("grid-first-name").value = "";
        document.getElementById("grid-last-name").value = "";
        document.getElementById("grid-identification").value = "";

        document.getElementById("sendForm").hidden = false;
        document.getElementById("btn-container").hidden = true;
        document.getElementById("container-form").hidden = true;
        const textEdit = document.getElementById("edit-text");
        textEdit.hidden = true;
        textEdit.textContent = "";
      });

      document.getElementById("cancelForm_1").addEventListener("click", () => {
        document.getElementById("create-button").hidden = false;
        document.getElementById("container-form").hidden = true;
      });

      document.getElementById("search").addEventListener("change", (e) => {
        if (!e.target.value) {
          fillTable(employees);
        } else {
          const data = searchData(e.target.value, employees);
          fillTable(data);
        }
      });

      document.getElementById("create-button").addEventListener("click", () => {
        document.getElementById("create-button").hidden = true;
        document.getElementById("container-form").hidden = false;
        document.getElementById("cancelForm_1").hidden = false;
      });
    }
    if (path === "/login") {
      document.getElementById("principal-header").hidden = true;
      document.getElementById("loginForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const params = {
          email: email,
          password: password,
        };
        const login_ = login(params);
        if (login_) {
          location.href = "/";
        }
      });
    }
    if (path === "/") {
      if (user.role === "admin") {
        app.innerHTML = `<div class="container grid grid-cols-2 space-x-4 p-3">
            <a href="/employee">
              <div class="card bg-blue-200 h-24 w-full rounded-lg p-3">Employee</div>
            </a>
            <a href="/users" id="">
              <div class="card bg-blue-200 h-24 w-full rounded-lg p-3">Users</div>
            </a>
          </div>
          `;
      } else {
        app.innerHTML = `
        <div class="text-center">
          <span class="text-4xl font-bold">Hola de nuevo, ${user.name}</span>
        </div>
        <div class="container grid grid-cols-2 space-x-4 p-3">
            <a href="/employee">
              <div class="card bg-blue-200 h-24 w-full rounded-lg p-3">Employee</div>
            </a>
          </div>
          `;
      }
    }
    document.getElementById("logOut").addEventListener("click", () => {
      localStorage.removeItem("user");
      localStorage.removeItem("isAuth");
      location.href = "/login";
    });
  } catch (error) {
    console.log(error);
    app.innerHTML = "<h2>Error al cargar la vista</h2>";
  }
}

function searchData(campo, data) {
  return data.filter(
    (item) =>
      item.name.toLowerCase().includes(campo.toLowerCase()) ||
      item.identification.includes(campo)
  );
}

function setFunctions(tabla, clave, clase) {
  tabla.querySelectorAll(clase).forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      clave ? editEmployee(id) : deleteEmployee(id);
    });
  });
}

function fillTable(data) {
  const tbody = document.querySelector("#table-employee tbody");
  tbody.innerHTML = "";

  if (data.length === 0) {
    const fila = document.createElement("tr");
    fila.innerHTML = `<tr>No hay datos para mostrar</tr>`;
    tbody.appendChild(fila);
    return;
  }
  data.forEach((employee) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td class="text-center">${employee.name}</td>
      <td class="text-center">${employee.lastname}</td>
      <td class="text-center">${employee.identification}</td>
      <td class="text-center">${employee.created}</td>
      <td class="text-center">
        <button class="btn-editar m-1 rounded p-1 bg-emerald-300 cursor-pointer hover:bg-emerald-500 shadow-md shadow-cyan-200" data-id="${employee.id}">Editar</button>
        <button class="btn-eliminar m-1 rounded p-1 bg-red-300 cursor-pointer hover:bg-red-500" data-id="${employee.id}">Eliminar</button>
      </td>
    `;

    tbody.appendChild(fila);
  });

  setFunctions(tbody, "editar", ".btn-editar");
  setFunctions(tbody, false, ".btn-eliminar");
}
