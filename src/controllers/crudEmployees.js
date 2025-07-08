import axios from "axios";

let currentEditId = null;
const employeeURL = "http://localhost:3000/employees";

export async function getData() {
  const params = {
    is_active: true,
  };
  try {
    const resp = await axios.get(employeeURL, { params: params });

    const data = resp.data;

    return data.sort(function (a, b) {
      return new Date(b.created) - new Date(a.created);
    });
  } catch (error) {
    console.log(error);
    return "Algo salió mal";
  }
}

export async function sendData(formData) {
  try {
    const resp = await axios.post(employeeURL, formData);
    if (resp.ok) {
      alert("se creó correctamente");
    }
  } catch (error) {
    console.log(error);
    return "ocurrió un error";
  }
}

export function setEditId(id) {
  currentEditId = id;
}

export function clearEditId() {
  currentEditId = null;
}

export async function updateEmployee(formData) {
  if (!currentEditId) return alert("No hay un empleado seleccionado.");
  try {
    await axios.put(`${employeeURL}/${currentEditId}`, formData);
    alert("Empleado actualizado con éxito");
    clearEditId();
  } catch (error) {
    console.log(error);
    alert("Error al actualizar");
  }
}

export async function deleteEmployee(id) {
  const confirmed = confirm(
    "¿Estás seguro de que quieres eliminar este empleado?"
  );
  if (!confirmed) return;
  try {
    await axios.delete(`${employeeURL}/${id}`);
    alert("Empleado eliminado con éxito");
    location.reload(); // Recargar tabla
  } catch (error) {
    console.log(error);
    alert("Error al eliminar empleado");
  }
}

export async function editEmployee(id) {
  document.getElementById("container-form").hidden = false;
  document.getElementById("cancelForm_1").hidden = true;
  try {
    const resp = await axios.get(`${employeeURL}/${id}`);
    const data = resp.data;

    document.getElementById("grid-first-name").value = data.name;
    document.getElementById("grid-last-name").value = data.lastname;
    document.getElementById("grid-identification").value = data.identification;

    document.getElementById("sendForm").hidden = true;
    document.getElementById("btn-container").hidden = false;

    const textEdit = document.getElementById("edit-text");
    textEdit.hidden = false;
    textEdit.textContent = `Editando a ${data.name} - ${data.identification}`;

    setEditId(id);
  } catch (error) {
    console.log(error);
    alert("Error al obtener empleado");
  }
}
