/*
  Mini-ENT — logique de comptes et de session.
  Les comptes sont stockés dans le localStorage du navigateur.
  Il n'y a pas de vrai serveur derrière : chaque navigateur a sa propre
  liste de comptes. Pratique pour une démo ou un rendu de projet,
  mais ce n'est pas un système d'authentification sécurisé.
*/

const USERS_KEY = "ent_users_v1";
const SESSION_KEY = "ent_session_v1";

const DEFAULT_ADMIN = {
  id: "root",
  password: "Administrateur@123",
  role: "admin",
  name: "Administrateur",
};

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    const initial = [DEFAULT_ADMIN];
    localStorage.setItem(USERS_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    const users = JSON.parse(raw);
    // Le compte root ne doit jamais disparaître, même si le stockage est modifié à la main.
    if (!users.some((u) => u.id === "root")) users.unshift(DEFAULT_ADMIN);
    return users;
  } catch (e) {
    localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
    return [DEFAULT_ADMIN];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUser(id) {
  return getUsers().find((u) => u.id.toLowerCase() === id.toLowerCase());
}

function login(id, password) {
  const user = getUsers().find(
    (u) => u.id.toLowerCase() === id.toLowerCase() && u.password === password
  );
  if (!user) return null;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, role: user.role, name: user.name }));
  return user;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
}

function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// Redirige vers la bonne page tableau de bord selon le rôle.
function dashboardForRole(role) {
  if (role === "admin") return "admin.html";
  if (role === "professeur") return "professeur.html";
  return "eleve.html";
}

// À appeler en haut de chaque page protégée.
function requireRole(role) {
  const session = getSession();
  if (!session || session.role !== role) {
    window.location.href = "index.html";
    return null;
  }
  return session;
}

function createUser({ id, password, role, name }) {
  const users = getUsers();
  if (users.some((u) => u.id.toLowerCase() === id.toLowerCase())) {
    return { ok: false, error: "Cet identifiant existe déjà." };
  }
  users.push({ id, password, role, name });
  saveUsers(users);
  return { ok: true };
}

function deleteUser(id) {
  if (id.toLowerCase() === "root") {
    return { ok: false, error: "Le compte administrateur par défaut ne peut pas être supprimé." };
  }
  const users = getUsers().filter((u) => u.id.toLowerCase() !== id.toLowerCase());
  saveUsers(users);
  return { ok: true };
}

function roleLabel(role) {
  if (role === "admin") return "Administrateur";
  if (role === "professeur") return "Professeur";
  return "Élève";
}
